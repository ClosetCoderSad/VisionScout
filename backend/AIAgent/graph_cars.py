import os
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

from agents_cars.parse_query_cars import parse_car_query
from agents_cars.fetch_cars import fetch_all_car_sources
from agents_cars.merge_score_cars import merge_and_score_cars
from agents_cars.format_cars import format_car_response
from dotenv import load_dotenv

load_dotenv()


class CarAgentState(TypedDict):
    user_query: str
    parsed: Dict[str, Any]
    raw_listings: List[Dict[str, Any]]
    canonical_listings: List[Dict[str, Any]]
    top_listings: List[Dict[str, Any]]
    reply: str


def build_car_app():
    graph = StateGraph(CarAgentState)

    graph.add_node("parse_query", parse_car_query)
    graph.add_node("fetch", fetch_all_car_sources)
    graph.add_node("merge_score", merge_and_score_cars)
    graph.add_node("format", format_car_response)

    graph.set_entry_point("parse_query")
    graph.add_edge("parse_query", "fetch")
    graph.add_edge("fetch", "merge_score")
    graph.add_edge("merge_score", "format")
    graph.add_edge("format", END)

    return graph.compile()