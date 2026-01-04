"""
ParkVision CV Module Configuration
"""
import os

# Roboflow API Configuration
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "u3Zw1v8EkVB6S2Qd8JrL")
ROBOFLOW_WORKSPACE = "mohammed-jasim-voeo3"
ROBOFLOW_PROJECT = "parking-space-iudkx"
ROBOFLOW_MODEL_VERSION = 1  # Default version, can be changed

# Backend API Configuration
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")  # Optional internal API key

# Processing Configuration
PROCESSING_INTERVAL = float(os.getenv("PROCESSING_INTERVAL", "2.0"))  # seconds
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))  # 50%

# Video/Image Source
VIDEO_SOURCE = os.getenv("VIDEO_SOURCE", "0")  # 0 for webcam, or file path/URL

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
