import re
from typing import Dict, Any

def _extract_bed_bath(text: str):
    text_l = text.lower().replace(" ", "")
    m = re.search(r"(\d+)b(\d+)b", text_l)
    if m:
        return int(m.group(1)), int(m.group(2))
    bed = None
    bath = None
    m2 = re.search(r"(\d+)\s*(bed|bedroom|br)", text.lower())
    if m2: bed = int(m2.group(1))
    m3 = re.search(r"(\d+)\s*(bath|ba|bathroom)", text.lower())
    if m3: bath = int(m3.group(1))
    return bed, bath

def _extract_city_state(text: str):
    m = re.search(r"in\s+([A-Za-z\s]+?),\s*([A-Za-z]{2,})", text, re.IGNORECASE)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    m2 = re.search(r"in\s+([A-Za-z\s]+?)\s+([A-Za-z]{2,})$", text, re.IGNORECASE)
    if m2:
        return m2.group(1).strip(), m2.group(2).strip()
    m3 = re.search(r"([A-Za-z\s]+?)\s+([A-Za-z]{2,})$", text, re.IGNORECASE)
    if m3:
        return m3.group(1).strip(), m3.group(2).strip()
    return None, None

def parse_query(state: dict) -> dict:
    q = state["user_query"]
    beds, baths = _extract_bed_bath(q)
    city, region = _extract_city_state(q)

    if city: city = city.title()
    if region: region = region.title()
    if city and not region:
        region = "TX"

    parsed: Dict[str, Any] = {
        "beds": beds,
        "baths": baths,
        "city": city,
        "region": region,
        "max_price": None,
        "property_type": "apartment",
        "original": q,
    }
    state["parsed"] = parsed
    return state
