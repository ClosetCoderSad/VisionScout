from typing import List, Dict, Any


def _compute_trust(record: Dict[str, Any]) -> float:
    score = 0.0

    if record.get("verified"):
        score += 0.2
    if record.get("price"):
        score += 0.2
    if record.get("year"):
        score += 0.15
    if record.get("mileage") is not None:
        score += 0.15
    if record.get("make"):
        score += 0.15
    if record.get("image_url"):
        score += 0.15

    return round(min(score, 1.0), 3)


def _compute_relevance(record: Dict[str, Any], parsed: dict) -> float:
    score = 0.0

    # Make match
    if parsed.get("make") and record.get("make"):
        if parsed["make"].lower() == record["make"].lower():
            score += 0.3

    # Body type match
    if parsed.get("body_type") and record.get("body_type"):
        if parsed["body_type"].lower() == record["body_type"].lower():
            score += 0.2

    # Price match
    max_price = parsed.get("price_max") or 50000
    price = record.get("price")
    if price:
        if price <= max_price * 0.8:
            score += 0.3
        elif price <= max_price:
            score += 0.2

    return min(score, 1.0)


def _compute_value(record: Dict[str, Any]) -> float:
    """Age and mileage consideration"""
    year = record.get("year")
    mileage = record.get("mileage")

    score = 0.5  # default

    # Newer is better
    if year:
        if year >= 2022:
            score += 0.3
        elif year >= 2020:
            score += 0.2
        elif year >= 2018:
            score += 0.1

    # Lower mileage is better
    if mileage is not None:
        if mileage < 30000:
            score += 0.2
        elif mileage < 60000:
            score += 0.1
        elif mileage > 100000:
            score -= 0.2

    return max(0.0, min(score, 1.0))


def merge_and_score_cars(state: dict) -> dict:
    raw = state["raw_listings"]
    parsed = state["parsed"]

    for r in raw:
        r["trust_score"] = _compute_trust(r)
        r["relevance_score"] = _compute_relevance(r, parsed)
        r["value_score"] = _compute_value(r)

        r["final_score"] = round(
            0.35 * r["trust_score"] +
            0.40 * r["relevance_score"] +
            0.25 * r["value_score"],
            3
        )

    filtered = [r for r in raw if r["trust_score"] >= 0.4]

    out = []
    for r in filtered:
        # Apply filters
        if parsed.get("price_max") and r.get("price") and r["price"] > parsed["price_max"]:
            continue
        if parsed.get("mileage_max") and r.get("mileage") and r["mileage"] > parsed["mileage_max"]:
            continue
        out.append(r)

    out_sorted = sorted(out, key=lambda x: x["final_score"], reverse=True)
    state["canonical_listings"] = out_sorted
    state["top_listings"] = out_sorted[:5]

    print(f"✅ Ranked: {len(out_sorted)} cars, showing top {len(state['top_listings'])}")
    return state