from typing import List, Dict, Any


def _compute_trust(record: Dict[str, Any]) -> float:
    score = 0.0

    # Core completeness
    if record.get("verified"):
        score += 0.2
    if record.get("price"):
        score += 0.15
    if record.get("beds"):
        score += 0.1
    if record.get("baths"):
        score += 0.1
    if record.get("sqft"):
        score += 0.1
    if record.get("image_url"):
        score += 0.05

    # Price scoring (more granular)
    price = record.get("price")
    if isinstance(price, (int, float)):
        if price < 1000:
            score += 0.15
        elif price < 1500:
            score += 0.12
        elif price < 2000:
            score += 0.08
        elif price < 2500:
            score += 0.05
        elif price < 3000:
            score += 0.02

    # Value scoring: price per sqft (lower is better)
    sqft = record.get("sqft")
    if price and sqft and sqft > 0:
        price_per_sqft = price / sqft
        if price_per_sqft < 1.0:
            score += 0.08
        elif price_per_sqft < 1.5:
            score += 0.05
        elif price_per_sqft < 2.0:
            score += 0.02

    # Source weight
    score += 0.2 * record.get("source_weight", 0.7)

    return round(min(score, 1.0), 3)


def _compute_relevance(record: Dict[str, Any], parsed: dict) -> float:
    """How well does this match the user's query?"""
    score = 0.0

    # Exact bed/bath match
    parsed_beds = parsed.get("beds")
    record_beds = record.get("beds")

    if parsed_beds and record_beds:  # Both must exist
        if parsed_beds == record_beds:
            score += 0.3
        elif record_beds >= parsed_beds:
            score += 0.15

    parsed_baths = parsed.get("baths")
    record_baths = record.get("baths")

    if parsed_baths and record_baths:  # Both must exist
        if parsed_baths == record_baths:
            score += 0.2
        elif record_baths >= parsed_baths:
            score += 0.1

    # Price match
    max_price = parsed.get("max_price") or 2500
    price = record.get("price")

    if price:  # Only if price exists
        if price <= max_price * 0.8:
            score += 0.3  # well under budget
        elif price <= max_price:
            score += 0.2  # within budget

    return min(score, 1.0)


def _compute_value(record: Dict[str, Any]) -> float:
    """Overall value proposition"""
    price = record.get("price")
    sqft = record.get("sqft")

    if not price or not sqft or sqft == 0:
        return 0.5

    price_per_sqft = price / sqft

    # Lower price/sqft = better value
    if price_per_sqft < 0.8:
        return 1.0
    elif price_per_sqft < 1.2:
        return 0.8
    elif price_per_sqft < 1.5:
        return 0.6
    elif price_per_sqft < 2.0:
        return 0.4
    else:
        return 0.2


def merge_and_score(state: dict) -> dict:
    raw = state["raw_listings"]
    parsed = state["parsed"]

    # Compute multiple scores
    for r in raw:
        r["trust_score"] = _compute_trust(r)
        r["relevance_score"] = _compute_relevance(r, parsed)
        r["value_score"] = _compute_value(r)

        # Weighted composite score
        r["final_score"] = round(
            0.4 * r["trust_score"] +
            0.35 * r["relevance_score"] +
            0.25 * r["value_score"],
            3
        )

    # Filter and sort by final_score
    filtered = [r for r in raw if r["trust_score"] >= 0.5]

    out = []
    for r in filtered:
        if parsed.get("city") and parsed["city"].lower() not in (r.get("city") or "").lower():
            continue
        if parsed.get("beds") and r.get("beds") and r["beds"] < parsed["beds"]:
            continue
        out.append(r)

    out_sorted = sorted(out, key=lambda x: x["final_score"], reverse=True)
    state["canonical_listings"] = out_sorted
    state["top_listings"] = out_sorted[:3]

    print(f"✅ Ranked: {len(out_sorted)} listings, showing top {len(state['top_listings'])}")
    return state