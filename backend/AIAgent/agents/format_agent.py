# agents/format_agent.py
from typing import List, Dict, Any

def _fmt_card(item: Dict[str, Any]) -> str:
    fields = [
        f"🏠 {item.get('address', 'N/A')}",
        f"• Score: {item.get('trust_score', '-')}",
        f"• Price: ${item.get('price', '-')}",
        f"• Beds/Baths: {item.get('beds', '-')} / {item.get('baths', '-')}",
        f"• SqFt: {item.get('sqft', '-')}",
        f"• Type: {item.get('type', '-')}",
        f"• Image: {item.get('image_url', '') or 'No image available'}"
    ]
    return "\n".join(fields)

def format_response(state: dict) -> dict:
    top: List[Dict[str, Any]] = state["top_listings"]
    parsed = state.get("parsed", {})

    if not top:
        state["reply"] = "I couldn’t find matching listings. Try changing city/price/bed-bath."
        return state

    city = parsed.get("city", "the selected area")
    beds = parsed.get("beds")
    baths = parsed.get("baths")

    # dynamic header generation
    header_parts = []
    if beds and baths:
        header_parts.append(f"{beds}B{baths}B")
    header_parts.append("apartments")
    header_parts.append(f"in {city}")
    header_text = " ".join(header_parts)

    cards = "\n\n".join(_fmt_card(t) for t in top)
    state["reply"] = f"Here are the top {len(top)} {header_text} (ranked by trust score):\n\n{cards}"
    return state
