# agents/fetch_agent.py
import os, random
from typing import List, Dict, Any
import requests

# -----------------------------------------------------------
# GLOBAL SETTINGS
# -----------------------------------------------------------
SOURCE_WEIGHTS = {
    "Zillow": 0.95,
    "Other": 0.70
}

# -----------------------------------------------------------
# HELPERS
# -----------------------------------------------------------
def _headers(host: str) -> Dict[str, str]:
    return {
        "x-rapidapi-key": os.getenv("RAPIDAPI_KEY", ""),
        "x-rapidapi-host": host
    }

# -----------------------------------------------------------
# ZILLOW (RapidAPI)
# -----------------------------------------------------------
def fetch_from_zillow(parsed: dict) -> List[Dict[str, Any]]:
    """Fetch property listings from Zillow via RapidAPI."""
    host = os.getenv("ZILLOW_RAPIDAPI_HOST")
    url = f"https://{host}/propertyExtendedSearch"

    params = {
        "location": f"{parsed.get('city','')}, {parsed.get('region','')}".strip(", "),
        "status_type": "ForRent",
        "home_type": "Apartments, Condos, Townhomes, Houses",
        "beds_min": parsed.get("beds") or 1,
        "baths_min": parsed.get("baths") or 1,
        "rentMinPrice": 0,
        "sortSelection": "priorityscore"
    }

    try:
        r = requests.get(url, headers=_headers(host), params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print("⚠️ Zillow fetch error:", e)
        return []

    results = data.get("props") or data.get("results") or []
    out = []
    for p in results:
        out.append({
            "id": p.get("zpid") or f"Z-{random.randint(1000, 9999)}",
            "source": "Zillow",
            "address": p.get("address"),
            "city": parsed.get("city"),  # fallback
            "region": parsed.get("region"),  # fallback
            "price": p.get("price"),
            "beds": p.get("bedrooms"),
            "baths": p.get("bathrooms"),
            "sqft": p.get("livingArea"),
            "type": (p.get("propertyType") or "apartment").lower(),
            "image_url": p.get("imgSrc"),
            "verified": bool(p.get("zpid"))
        })

    return out

# -----------------------------------------------------------
# NORMALIZE + AGGREGATE
# -----------------------------------------------------------
def normalize(record: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": record.get("id"),
        "source": record.get("source", "Zillow"),
        "address": record.get("address"),
        "city": record.get("city"),
        "region": record.get("region"),
        "price": record.get("price"),
        "beds": record.get("beds"),
        "baths": record.get("baths"),
        "sqft": record.get("sqft"),
        "type": record.get("type", "apartment"),
        "image_url": record.get("image_url"),
        "verified": bool(record.get("verified", False)),
        "source_weight": SOURCE_WEIGHTS.get(record.get("source", "Zillow"), 0.7)
    }

# -----------------------------------------------------------
# MAIN FETCH PIPELINE
# -----------------------------------------------------------
def fetch_all_sources(state: dict) -> dict:
    parsed = state["parsed"]

    print(f"🔎 Fetching Zillow listings for {parsed.get('city')}, {parsed.get('region')} ...")
    zillow = [normalize(r) for r in fetch_from_zillow(parsed)]
    print(f"→ Zillow results: {len(zillow)}")

    state["raw_listings"] = zillow
    return state
