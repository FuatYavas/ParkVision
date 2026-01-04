"""
ParkVision CV Processor
Main processing pipeline for parking space detection
"""
import os
import sys
import time
import logging
import argparse
from pathlib import Path

import cv2

from config import (
    PROCESSING_INTERVAL,
    VIDEO_SOURCE,
    LOG_LEVEL,
    BACKEND_API_URL
)
from detector import ParkingDetector, Detection
from api_client import BackendClient
from streamer import VideoStreamer

# Setup logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ParkingProcessor:
    """
    Main processor for parking space detection and backend integration
    """

    def __init__(
        self,
        parking_lot_id: int = 1,
        source: str = None,
        backend_url: str = None
    ):
        """
        Initialize the processor

        Args:
            parking_lot_id: ID of the parking lot being monitored
            source: Video/image source (file path, URL, or camera index)
            backend_url: Backend API URL
        """
        self.parking_lot_id = parking_lot_id
        self.source = source or VIDEO_SOURCE
        self.backend_url = backend_url or BACKEND_API_URL

        # Initialize components
        logger.info("Initializing ParkVision CV Processor...")
        self.detector = ParkingDetector()
        self.api_client = BackendClient(base_url=self.backend_url)

        # State tracking
        self.last_status = None
        self.running = False

    def process_image(self, image_path: str) -> dict:
        """
        Process a single image and send results to backend

        Args:
            image_path: Path to the image file

        Returns:
            Detection summary
        """
        logger.info(f"Processing image: {image_path}")

        # Run detection
        detections = self.detector.detect(image_path)
        summary = self.detector.get_parking_summary(detections)

        # Send to backend
        success = self.api_client.update_parking_lot_status(
            parking_lot_id=self.parking_lot_id,
            total_spots=summary["total"],
            empty_spots=summary["empty"],
            occupied_spots=summary["occupied"],
            detections=[d.to_dict() for d in detections]
        )

        # Send WebSocket event
        if success:
            self.api_client.send_detection_event(
                parking_lot_id=self.parking_lot_id,
                event_type="status_update",
                data=summary
            )

        # Log results
        logger.info(
            f"Detection complete: {summary['empty']}/{summary['total']} spots empty "
            f"({summary['occupancy_rate']*100:.1f}% occupied)"
        )

        return {
            "success": success,
            "summary": summary,
            "detections": [d.to_dict() for d in detections]
        }

    def process_video(self, max_frames: int = None):
        """
        Process video stream continuously

        Args:
            max_frames: Maximum number of frames to process (None for infinite)
        """
        logger.info(f"Starting video processing from: {self.source}")

        # Determine source type
        source = self.source
        if source.isdigit():
            source = int(source)

        streamer = VideoStreamer(source)
        self.running = True
        frame_count = 0

        try:
            while self.running:
                frame = streamer.get_frame()
                if frame is None:
                    logger.warning("No frame received, retrying...")
                    time.sleep(1)
                    continue

                # Run detection on frame
                detections = self.detector.detect_from_frame(frame)
                summary = self.detector.get_parking_summary(detections)

                # Only update if status changed
                if self._status_changed(summary):
                    self.api_client.update_parking_lot_status(
                        parking_lot_id=self.parking_lot_id,
                        total_spots=summary["total"],
                        empty_spots=summary["empty"],
                        occupied_spots=summary["occupied"],
                        detections=[d.to_dict() for d in detections]
                    )
                    self.last_status = summary

                    # Broadcast via WebSocket
                    self.api_client.send_detection_event(
                        parking_lot_id=self.parking_lot_id,
                        event_type="status_update",
                        data=summary
                    )

                frame_count += 1
                if max_frames and frame_count >= max_frames:
                    break

                # Wait before next frame
                time.sleep(PROCESSING_INTERVAL)

        except KeyboardInterrupt:
            logger.info("Processing stopped by user")
        finally:
            streamer.release()
            self.running = False

    def _status_changed(self, new_summary: dict) -> bool:
        """Check if parking status has changed"""
        if self.last_status is None:
            return True

        return (
            self.last_status["empty"] != new_summary["empty"] or
            self.last_status["occupied"] != new_summary["occupied"]
        )

    def visualize_detections(
        self,
        image_path: str,
        output_path: str = None,
        show: bool = True
    ):
        """
        Visualize detections on an image

        Args:
            image_path: Path to input image
            output_path: Path to save output image (optional)
            show: Whether to display the image
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Could not load image: {image_path}")
            return

        # Run detection
        detections = self.detector.detect(image_path)

        # Draw detections
        for det in detections:
            # Calculate bounding box corners
            x1 = int(det.x - det.width / 2)
            y1 = int(det.y - det.height / 2)
            x2 = int(det.x + det.width / 2)
            y2 = int(det.y + det.height / 2)

            # Color based on status (green=empty, red=occupied)
            color = (0, 255, 0) if det.is_empty else (0, 0, 255)

            # Draw rectangle
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

            # Draw label
            label = f"{det.class_name} ({det.confidence:.2f})"
            cv2.putText(
                image, label, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2
            )

        # Add summary text
        summary = self.detector.get_parking_summary(detections)
        summary_text = f"Empty: {summary['empty']} | Occupied: {summary['occupied']} | Total: {summary['total']}"
        cv2.putText(
            image, summary_text, (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2
        )

        # Save if output path provided
        if output_path:
            cv2.imwrite(output_path, image)
            logger.info(f"Saved visualization to: {output_path}")

        # Show if requested
        if show:
            cv2.imshow("ParkVision Detection", image)
            cv2.waitKey(0)
            cv2.destroyAllWindows()

        return image


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="ParkVision CV Processor")
    parser.add_argument(
        "--mode", "-m",
        choices=["image", "video", "stream"],
        default="image",
        help="Processing mode"
    )
    parser.add_argument(
        "--source", "-s",
        type=str,
        help="Image/video path or camera index/URL"
    )
    parser.add_argument(
        "--parking-lot-id", "-p",
        type=int,
        default=1,
        help="Parking lot ID"
    )
    parser.add_argument(
        "--backend-url", "-b",
        type=str,
        default=BACKEND_API_URL,
        help="Backend API URL"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Output path for visualization"
    )
    parser.add_argument(
        "--visualize", "-v",
        action="store_true",
        help="Show visualization window"
    )

    args = parser.parse_args()

    # Initialize processor
    processor = ParkingProcessor(
        parking_lot_id=args.parking_lot_id,
        source=args.source,
        backend_url=args.backend_url
    )

    if args.mode == "image":
        if not args.source:
            logger.error("Image source required for image mode")
            sys.exit(1)

        if args.visualize or args.output:
            processor.visualize_detections(
                args.source,
                output_path=args.output,
                show=args.visualize
            )
        else:
            result = processor.process_image(args.source)
            print(f"\nResults: {result['summary']}")

    elif args.mode in ["video", "stream"]:
        processor.process_video()


if __name__ == "__main__":
    main()
