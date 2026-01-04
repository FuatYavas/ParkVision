"""
Roboflow-based Parking Space Detector
"""
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from roboflow import Roboflow

from config import (
    ROBOFLOW_API_KEY,
    ROBOFLOW_WORKSPACE,
    ROBOFLOW_PROJECT,
    ROBOFLOW_MODEL_VERSION,
    CONFIDENCE_THRESHOLD
)

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """Represents a single parking space detection"""
    class_name: str  # "empty" or "occupied"
    confidence: float
    x: int  # center x
    y: int  # center y
    width: int
    height: int

    @property
    def is_empty(self) -> bool:
        """Check if the detected space is empty"""
        # Model uses "-" for empty spaces (class_id: 0)
        return self.class_name == "-" or self.class_name.lower() in ["empty", "space-empty", "available", "free"]

    @property
    def is_occupied(self) -> bool:
        """Check if the detected space is occupied"""
        # Model uses "Parking Space..." for occupied spaces (class_id: 1)
        return (
            self.class_name.startswith("Parking Space") or
            self.class_name.lower() in ["occupied", "space-occupied", "taken", "car"]
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "class_name": self.class_name,
            "confidence": self.confidence,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "is_empty": self.is_empty
        }


class ParkingDetector:
    """
    Parking space detector using Roboflow model
    """

    def __init__(self, api_key: str = None, model_version: int = None):
        """
        Initialize the detector with Roboflow model

        Args:
            api_key: Roboflow API key (uses config default if not provided)
            model_version: Model version to use (uses config default if not provided)
        """
        self.api_key = api_key or ROBOFLOW_API_KEY
        self.model_version = model_version or ROBOFLOW_MODEL_VERSION
        self.model = None
        self.confidence_threshold = CONFIDENCE_THRESHOLD

        self._load_model()

    def _load_model(self):
        """Load the Roboflow model"""
        try:
            logger.info(f"Loading Roboflow model: {ROBOFLOW_WORKSPACE}/{ROBOFLOW_PROJECT}")

            rf = Roboflow(api_key=self.api_key)
            project = rf.workspace(ROBOFLOW_WORKSPACE).project(ROBOFLOW_PROJECT)
            self.model = project.version(self.model_version).model

            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise RuntimeError(f"Could not load Roboflow model: {e}")

    def detect(self, image_path: str) -> List[Detection]:
        """
        Detect parking spaces in an image

        Args:
            image_path: Path to the image file

        Returns:
            List of Detection objects
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")

        try:
            # Run inference
            result = self.model.predict(image_path, confidence=int(self.confidence_threshold * 100))
            predictions = result.json()

            detections = []
            for pred in predictions.get("predictions", []):
                detection = Detection(
                    class_name=pred["class"],
                    confidence=pred["confidence"],
                    x=int(pred["x"]),
                    y=int(pred["y"]),
                    width=int(pred["width"]),
                    height=int(pred["height"])
                )
                detections.append(detection)

            logger.info(f"Detected {len(detections)} parking spaces")
            return detections

        except Exception as e:
            logger.error(f"Detection failed: {e}")
            return []

    def detect_from_frame(self, frame) -> List[Detection]:
        """
        Detect parking spaces from a numpy array frame (OpenCV format)

        Args:
            frame: numpy array (BGR format from OpenCV)

        Returns:
            List of Detection objects
        """
        import cv2
        import tempfile
        import os

        if self.model is None:
            raise RuntimeError("Model not loaded")

        try:
            # Save frame to temporary file
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                tmp_path = tmp.name
                cv2.imwrite(tmp_path, frame)

            # Run detection
            detections = self.detect(tmp_path)

            # Clean up
            os.unlink(tmp_path)

            return detections

        except Exception as e:
            logger.error(f"Frame detection failed: {e}")
            return []

    def get_parking_summary(self, detections: List[Detection]) -> Dict[str, int]:
        """
        Get a summary of parking space status

        Args:
            detections: List of Detection objects

        Returns:
            Dictionary with counts of empty and occupied spaces
        """
        empty_count = sum(1 for d in detections if d.is_empty)
        occupied_count = sum(1 for d in detections if d.is_occupied)

        return {
            "total": len(detections),
            "empty": empty_count,
            "occupied": occupied_count,
            "occupancy_rate": occupied_count / len(detections) if detections else 0
        }
