from graph import build_app
from graph_cars import build_car_app


def detect_query_type(query: str) -> str:
    """Determine if query is about apartments or cars"""
    query_lower = query.lower()

    # Car keywords
    car_keywords = ["car", "vehicle", "suv", "sedan", "truck", "honda", "toyota", "ford",
                    "drive", "mileage", "certified", "used car"]

    # Apartment keywords
    apt_keywords = ["apartment", "rental", "rent", "bedroom", "bath", "lease", "housing"]

    car_score = sum(1 for keyword in car_keywords if keyword in query_lower)
    apt_score = sum(1 for keyword in apt_keywords if keyword in query_lower)

    if car_score > apt_score:
        return "car"
    else:
        return "apartment"


if __name__ == "__main__":
    # Demo queries
    queries = [
        "find affordable 2b2b apartments under 2500 in Richardson TX",
        "best used Toyota SUV under 30k with low mileage"
    ]

    for user_query in queries:
        print(f"\n{'=' * 60}")
        print(f"QUERY: {user_query}")
        print(f"{'=' * 60}")

        query_type = detect_query_type(user_query)
        print(f"Detected type: {query_type.upper()}\n")

        if query_type == "car":
            app = build_car_app()
        else:
            app = build_app()

        out = app.invoke({"user_query": user_query})

        print("\n=== Top Listings (JSON) ===")
        import json

        print(json.dumps(out["top_listings"], indent=2))

        print("\n=== Reply (text) ===")
        print(out["reply"])