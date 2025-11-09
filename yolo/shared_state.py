# shared_state.py
import threading
import numpy as np

# The lock to ensure thread-safe access.
lock = threading.Lock()

# This dictionary holds all our application's data for the API.
detection_data = {
    "status": "INITIALIZING",  # Can be: CLASSIFYING_CAR, DETECTING_DENTS, ERROR
    "car_classification": {
        "label": None,
        "confidence": 0.0,
    },
    "dent_detections": []  # This will be a list of dictionaries for each dent
}

# This holds the latest frame for the live GUI feed.
# Initialize with a blank frame to prevent errors on startup.
latest_annotated_frame = np.zeros((720, 1280, 3), dtype=np.uint8)