"""
Simple test script for ParkVision CV Module
Tests the Roboflow model connection and detection
"""
import sys
from detector import ParkingDetector


def test_model_connection():
    """Test if the Roboflow model can be loaded"""
    print("Testing Roboflow model connection...")
    try:
        detector = ParkingDetector()
        print("Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Failed to load model: {e}")
        return False


def test_detection(image_path: str):
    """Test detection on a sample image"""
    print(f"\nTesting detection on: {image_path}")

    try:
        detector = ParkingDetector()
        detections = detector.detect(image_path)
        summary = detector.get_parking_summary(detections)

        print(f"\n--- Detection Results ---")
        print(f"Total spots detected: {summary['total']}")
        print(f"Empty spots: {summary['empty']}")
        print(f"Occupied spots: {summary['occupied']}")
        print(f"Occupancy rate: {summary['occupancy_rate']*100:.1f}%")

        print(f"\n--- Individual Detections ---")
        for i, det in enumerate(detections, 1):
            status = "EMPTY" if det.is_empty else "OCCUPIED"
            print(f"  {i}. {status} (confidence: {det.confidence:.2f}) at ({det.x}, {det.y})")

        # Visualize and save result
        print(f"\n--- Saving Visualization ---")
        output_path = detector.visualize_detections(image_path, detections)
        print(f"✅ Result saved to: {output_path}")

        return True

    except Exception as e:
        print(f"Detection failed: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_detection.py <image_path>")
        print("\nRunning model connection test only...")
        test_model_connection()
        return

    image_path = sys.argv[1]

    # Test model connection
    if not test_model_connection():
        sys.exit(1)

    # Test detection
    if not test_detection(image_path):
        sys.exit(1)

    print("\nAll tests passed!")


if __name__ == "__main__":
    main()
