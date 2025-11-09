import os
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

from agents.parse_query import parse_query
from agents.fetch_agent import fetch_all_sources
from agents.merge_score import merge_and_score
from agents.format_agent import format_response
from dotenv import load_dotenv
load_dotenv()


class AgentState(TypedDict):
    user_query: str
    parsed: Dict[str, Any]
    raw_listings: List[Dict[str, Any]]
    canonical_listings: List[Dict[str, Any]]
    top_listings: List[Dict[str, Any]]
    reply: str

def build_app():
    graph = StateGraph(AgentState)

    graph.add_node("parse_query", parse_query)
    graph.add_node("fetch", fetch_all_sources)
    graph.add_node("merge_score", merge_and_score)
    graph.add_node("format", format_response)

    graph.set_entry_point("parse_query")
    graph.add_edge("parse_query", "fetch")
    graph.add_edge("fetch", "merge_score")
    graph.add_edge("merge_score", "format")
    graph.add_edge("format", END)

    return graph.compile()
