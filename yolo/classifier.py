# classifier.py (Updated for a specialized model)
from transformers import AutoProcessor, AutoModelForImageClassification
from PIL import Image
import numpy as np
import torch
import os

# --- Hugging Face Car Classifier Setup ---
MODEL_NAME = "fnayres/car-make-recognition-google-siglip-base-patch16-224"
print(f"Classifier: Loading specialized model '{MODEL_NAME}' from Hugging Face...")

# Use a try-except block to handle potential connection issues
try:
    processor = AutoProcessor.from_pretrained(MODEL_NAME)
    model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
    print("Classifier: Model and processor loaded successfully.")
    CLASSIFIER_ENABLED = True
except Exception as e:
    print(f"CRITICAL: Failed to load model from Hugging Face: {e}")
    print("Classification will be disabled.")
    CLASSIFIER_ENABLED = False


def classify_image(crop: np.ndarray) -> (str, float):
    """
    Takes a cropped image (from OpenCV) and classifies it using a specialized
    Hugging Face model for car make recognition.
    """
    if not CLASSIFIER_ENABLED:
        return "Classification disabled", 0.0

    # Convert OpenCV BGR image to PIL RGB image
    crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(crop_rgb)

    # Process the image
    inputs = processor(images=pil_image, return_tensors="pt")

    # Move to GPU if available
    if torch.cuda.is_available():
        inputs = inputs.to('cuda')
        model.to('cuda')

    # Perform inference
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    # Get the top prediction
    predicted_class_idx = logits.argmax(-1).item()
    label = model.config.id2label[predicted_class_idx]
    
    # Calculate confidence score from logits using softmax
    probabilities = torch.nn.functional.softmax(logits, dim=-1)
    confidence = probabilities[0][predicted_class_idx].item() * 100
    
    return label, confidence