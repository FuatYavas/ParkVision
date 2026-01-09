"""
ParkVision CV Module Configuration
"""
import os

# Roboflow API Configuration - ParkVision Project
# API key'den workspace otomatik çekilir, sadece proje ve model ID gerekli
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "0Zmk2YMfrmOASiUGMQSG")
ROBOFLOW_PROJECT = "car-parking-xutja/1"  # project_id/version formatında
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))  # 50%

# Backend API Configuration
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://backend:8000")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")  # Optional internal API key

# Processing Configuration
PROCESSING_INTERVAL = float(os.getenv("PROCESSING_INTERVAL", "2.0"))  # seconds

# Video/Image Source
VIDEO_SOURCE = os.getenv("VIDEO_SOURCE", "0")  # 0 for webcam, or file path/URL

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
