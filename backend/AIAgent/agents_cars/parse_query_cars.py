import re
from typing import Dict, Any


def parse_car_query(state: dict) -> dict:
    """Parse user query for car requirements"""
    q = state["user_query"].lower()

    parsed: Dict[str, Any] = {
        "make": None,
        "model": None,
        "year_min": None,
        "year_max": None,
        "price_max": None,
        "mileage_max": None,
        "condition": "used",  # new, used, certified
        "body_type": None,  # sedan, suv, truck, etc.
        "original": state["user_query"]
    }

    # Extract price
    price_match = re.search(r'under\s+\$?(\d+)k?', q)
    if price_match:
        price = int(price_match.group(1))
        if price < 1000:  # Assume it's in thousands (e.g., "under 30k")
            price *= 1000
        parsed["price_max"] = price

    # Extract year
    year_match = re.search(r'(20\d{2})', q)
    if year_match:
        parsed["year_min"] = int(year_match.group(1))

    # Extract mileage
    mileage_match = re.search(r'under\s+(\d+)k?\s+miles', q)
    if mileage_match:
        parsed["mileage_max"] = int(mileage_match.group(1)) * 1000

    # Extract make/model (you can expand this)
    makes = ["toyota", "honda", "ford", "chevrolet", "tesla", "bmw", "mercedes", "audi"]
    for make in makes:
        if make in q:
            parsed["make"] = make.title()
            break

    # Extract body type
    body_types = ["sedan", "suv", "truck", "coupe", "hatchback", "van"]
    for body in body_types:
        if body in q:
            parsed["body_type"] = body
            break

    # Extract condition
    if "new" in q and "car" in q:
        parsed["condition"] = "new"
    elif "certified" in q or "cpo" in q:
        parsed["condition"] = "certified"

    state["parsed"] = parsed
    return state