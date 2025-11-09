import re
from typing import List, Dict, Any


def _extract_model(item: Dict[str, Any]) -> str:
    """
    Try to extract model name from the title if it's missing.
    Example: "2021 Toyota RAV4 LE" → "RAV4"
    """
    model = item.get("model")
    if model:  # already exists
        return model

    title = item.get("title", "")
    make = item.get("make", "")
    if not title or not make:
        return ""

    # Regex to capture word(s) after the make
    match = re.search(rf"{make}\s+([A-Za-z0-9\-]+)", title)
    return match.group(1) if match else ""


def _fmt_car_card(item: Dict[str, Any]) -> str:
    """Format a single car listing into a readable card."""
    year = item.get('year', 'N/A')
    make = item.get('make', '')
    model = _extract_model(item)
    car_name = f"{year} {make} {model}".strip()

    fields = [
        f"🚗 {car_name}",
        f"• Score: {item.get('final_score', '-')}",
        f"• Price: ${item.get('price', 0):,}" if item.get('price') else "• Price: N/A",
        f"• Mileage: {item.get('mileage', 0):,} miles" if item.get('mileage') else "• Mileage: N/A",
        f"• Condition: {item.get('condition', '-') or '-'}",
        f"• Body Type: {item.get('body_type', '-') or '-'}",
        f"• Image: {item.get('image_url', '') or 'No image available'}"
    ]
    return "\n".join(fields)


def format_car_response(state: dict) -> dict:
    """
    Generate a reply text summarizing top car listings.
    Expects state = {"top_listings": [...], "parsed": {...}}
    """
    top: List[Dict[str, Any]] = state.get("top_listings", [])
    parsed = state.get("parsed", {})

    if not top:
        state["reply"] = "I couldn't find matching cars. Try adjusting your criteria."
        return state

    # Build header (e.g., "Toyota SUV vehicles")
    make = parsed.get("make", "")
    body_type = parsed.get("body_type", "")
    header_parts = [part for part in [make, body_type, "vehicles"] if part]
    header_text = " ".join(header_parts).strip()

    # Format all top listings
    cards = "\n\n".join(_fmt_car_card(item) for item in top)

    # Create final reply
    state["reply"] = f"Here are the top {len(top)} {header_text} (ranked by score):\n\n{cards}"
    return state
