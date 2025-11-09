# shared_state.py
import threading

# This dictionary holds all our application's data.
detection_data = {
    "status": "initializing",
    "summary": {},
    "detections": {} 
}

# This holds the latest frame for the live GUI feed.
latest_annotated_frame = None

# The lock to ensure thread-safe access to the above variables.
lock = threading.Lock()