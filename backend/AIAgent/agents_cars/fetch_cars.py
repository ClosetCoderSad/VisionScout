from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time, re, random
from typing import List, Dict, Any


def scrape_cars_com_inventory(parsed: dict) -> List[Dict[str, Any]]:
    """Scrape car listings from Cars.com using Selenium + BeautifulSoup."""

    chrome_options = Options()
    headless = True   # set to False for visual debugging

    if headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )

    driver = None
    try:
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )

        make = parsed.get("make", "Toyota")
        model = parsed.get("model", "")
        zipcode = parsed.get("zipcode", "75080")

        # ✅ Construct Cars.com URL dynamically
        make_str = (make or "").lower()
        model_str = (model or "").lower()
        url = f"https://www.cars.com/shopping/results/?makes[]={make_str}&models[]={model_str}&zip={zipcode}"

        #url = f"https://www.cars.com/shopping/results/?makes[]={make.lower()}&models[]={model.lower()}&zip={zipcode}"
        print(f"🔍 Loading Cars.com: {url}")
        driver.get(url)

        wait = WebDriverWait(driver, 30)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.vehicle-card")))

        # 🌀 Scroll gradually to load more results
        print("📜 Scrolling to load all results...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        scroll_rounds = 5
        for i in range(scroll_rounds):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                print(f"🟢 Scroll stopped early at round {i+1}.")
                break
            last_height = new_height
        time.sleep(2)

        # Extract HTML
        html = driver.page_source
        with open("cars_com_loaded.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("💾 Saved HTML -> cars_com_loaded.html")

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select("div.vehicle-card")

        if not cards:
            print("⚠️ No car cards found. Check cars_com_loaded.html for structure changes.")
            return []

        results = []
        for i, card in enumerate(cards[:200]):  # capture more cars after scroll
            try:
                # Title (year + make + model + trim)
                title_elem = card.select_one("h2.title")
                title = title_elem.get_text(strip=True) if title_elem else "Unknown Car"

                # Year
                year_match = re.search(r"(20\d{2})", title)
                year = int(year_match.group(1)) if year_match else None

                # Price
                price_elem = card.select_one("span.primary-price")
                price_text = price_elem.get_text(strip=True) if price_elem else None
                price = int(price_text.replace("$", "").replace(",", "")) if price_text and "$" in price_text else None

                # Mileage
                mileage_elem = card.select_one("div.mileage")
                mileage_text = mileage_elem.get_text(strip=True) if mileage_elem else None
                mileage_match = re.search(r"([\d,]+)", mileage_text or "")
                mileage = int(mileage_match.group(1).replace(",", "")) if mileage_match else None

                # Image
                img_elem = card.select_one("img")
                image_url = img_elem["src"] if img_elem and "src" in img_elem.attrs else None

                results.append({
                    "id": f"C-{random.randint(10000, 99999)}",
                    "source": "Cars.com",
                    "make": make,
                    "model": model,
                    "title": title,
                    "year": year,
                    "price": price,
                    "mileage": mileage,
                    "image_url": image_url,
                    "verified": True
                })
            except Exception as e:
                print(f"⚠️ Error parsing card {i}: {e}")
                continue

        # ✅ Filter by model name if provided
        model_filter = parsed.get("model")
        if model_filter:
            before = len(results)
            results = [
                r for r in results
                if r.get("title") and model_filter.lower() in r["title"].lower()
            ]
            print(f"✨ Filtered out {before - len(results)} non-{model_filter} listings")

        print(f"✅ Successfully scraped {len(results)} {make} {model_filter or ''} cars from Cars.com.")
        return results

    except Exception as e:
        print(f"❌ Selenium error: {e}")
        return []

    finally:
        if driver:
            driver.quit()


def normalize_car(record: Dict[str, Any]) -> Dict[str, Any]:
    if not record:
        return None
    return {**record, "source_weight": 0.95}


def fetch_all_car_sources(state: dict) -> dict:
    parsed = state["parsed"]
    print("🚗 Scraping Cars.com inventory...")
    raw_cars = scrape_cars_com_inventory(parsed)
    cars = [normalize_car(r) for r in raw_cars if r]
    print(f"→ Cars.com results: {len(cars)}")

    state["raw_listings"] = cars
    return state
