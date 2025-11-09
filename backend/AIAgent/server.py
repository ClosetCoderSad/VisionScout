from flask import Flask, request, jsonify
from flask_cors import CORS
from graph import build_app
from graph_cars import build_car_app

app = Flask(__name__)
CORS(app)  # allow frontend to access backend

def detect_query_type(query: str) -> str:
    query_lower = query.lower()
    car_keywords = ["car", "vehicle", "suv", "sedan", "truck", "honda", "toyota", "ford", "drive", "mileage", "certified", "used car"]
    apt_keywords = ["apartment", "rental", "rent", "bedroom", "bath", "lease", "housing"]
    car_score = sum(1 for keyword in car_keywords if keyword in query_lower)
    apt_score = sum(1 for keyword in apt_keywords if keyword in query_lower)
    return "car" if car_score > apt_score else "apartment"

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("query", "")

    if not user_query:
        return jsonify({"error": "Missing 'query' field"}), 400

    query_type = detect_query_type(user_query)

    # Run appropriate agent
    if query_type == "car":
        app_graph = build_car_app()
    else:
        app_graph = build_app()

    print(f"⚙️ Running {query_type} agent for: {user_query}")
    result = app_graph.invoke({"user_query": user_query})

    # Return JSON for frontend
    return jsonify({
        "type": query_type,
        "reply": result.get("reply", ""),
        "listings": result.get("top_listings", [])
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
