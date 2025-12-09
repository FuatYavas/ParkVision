import time
from detector import YOLODetector
from streamer import VideoStreamer

def main():
    detector = YOLODetector("yolov8n.pt")
    streamer = VideoStreamer(0) # Use 0 for webcam or provide URL

    try:
        while True:
            frame = streamer.get_frame()
            if frame is None:
                break
            
            detections = detector.detect(frame)
            print(f"Detections: {detections}")
            
            # Here we would update the backend via API or direct DB access
            
            time.sleep(1) # Process every second
    except KeyboardInterrupt:
        pass
    finally:
        streamer.release()

if __name__ == "__main__":
    main()
