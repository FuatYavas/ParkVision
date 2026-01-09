"""
Roboflow-based Parking Space Detector using Inference SDK
"""
import logging
from typing import List, Dict, Any
from dataclasses import dataclass

from inference_sdk import InferenceHTTPClient

from config import (
    ROBOFLOW_API_KEY,
    ROBOFLOW_PROJECT,
    CONFIDENCE_THRESHOLD
)

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """Represents a single parking space detection"""
    class_name: str  # Class detected by model
    confidence: float
    x: int  # center x
    y: int  # center y
    width: int
    height: int

    @property
    def is_empty(self) -> bool:
        """Check if the detected space is empty"""
        # Adjust based on your model's class names
        return self.class_name.lower() in ["empty", "available", "free", "space"]

    @property
    def is_occupied(self) -> bool:
        """Check if the detected space is occupied"""
        return not self.is_empty

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
    Parking space detector using Roboflow Inference SDK
    """

    def __init__(self, api_key: str = None):
        """
        Initialize the detector with Roboflow Inference client

        Args:
            api_key: Roboflow API key (uses config default if not provided)
        """
        self.api_key = api_key or ROBOFLOW_API_KEY
        self.confidence_threshold = CONFIDENCE_THRESHOLD
        
        # Initialize Inference client
        self.client = InferenceHTTPClient(
            api_url="https://detect.roboflow.com",
            api_key=self.api_key
        )
        
        logger.info(f"Initialized Roboflow Inference client for project: {ROBOFLOW_PROJECT}")

    def detect(self, image_path: str) -> List[Detection]:
        """
        Detect parking spaces in an image

        Args:
            image_path: Path to the image file

        Returns:
            List of Detection objects
        """
        try:
            # Run inference using the Inference SDK
            result = self.client.infer(image_path, model_id=ROBOFLOW_PROJECT)
            
            detections = []
            predictions = result.get("predictions", [])
            
            for pred in predictions:
                # Filter by confidence threshold
                if pred["confidence"] >= self.confidence_threshold:
                    detection = Detection(
                        class_name=pred["class"],
                        confidence=pred["confidence"],
                        x=int(pred["x"]),
                        y=int(pred["y"]),
                        width=int(pred["width"]),
                        height=int(pred["height"])
                    )
                    detections.append(detection)

            logger.info(f"Detected {len(detections)} parking spaces with confidence >= {self.confidence_threshold}")
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

    def visualize_detections(self, image_path: str, detections: List[Detection], output_path: str = None) -> str:
        """
        Draw bounding boxes on the image and save it

        Args:
            image_path: Path to the original image
            detections: List of Detection objects
            output_path: Path to save the result (default: adds _result suffix)

        Returns:
            Path to the saved image
        """
        import cv2
        import os

        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")

        # Draw each detection
        for det in detections:
            # Calculate bounding box corners
            x1 = int(det.x - det.width / 2)
            y1 = int(det.y - det.height / 2)
            x2 = int(det.x + det.width / 2)
            y2 = int(det.y + det.height / 2)

            # Color based on status (Green=empty, Red=occupied)
            color = (0, 255, 0) if det.is_empty else (0, 0, 255)

            # Draw rectangle
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

            # Draw label with confidence
            label = f"{det.class_name} {det.confidence:.2f}"
            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            
            # Draw label background
            cv2.rectangle(img, (x1, y1 - label_size[1] - 4), (x1 + label_size[0], y1), color, -1)
            
            # Draw label text
            cv2.putText(img, label, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # Generate output path if not provided
        if output_path is None:
            base, ext = os.path.splitext(image_path)
            output_path = f"{base}_result{ext}"

        # Save result
        cv2.imwrite(output_path, img)
        logger.info(f"Saved visualization to: {output_path}")

        return output_path
