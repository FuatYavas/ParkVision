"""
Process parking images with Roboflow REST API
"""
import os
import requests
import base64
from PIL import Image, ImageDraw, ImageFont

# Roboflow configuration
API_KEY = "0Zmk2YMfrmOASiUGMQSG"
MODEL_ID = "car-parking-xutja/1"
API_URL = f"https://serverless.roboflow.com/{MODEL_ID}"

def process_image_with_model(image_path, output_path):
    """Process image with real Roboflow model via REST API"""
    print(f"Processing: {image_path}")
    
    # Upload image to Roboflow
    try:
        with open(image_path, 'rb') as f:
            response = requests.post(
                API_URL,
                params={"api_key": API_KEY},
                files={"file": f},
                timeout=30
            )
        
        if response.status_code != 200:
            print(f"✗ API Error: {response.status_code} - {response.text}")
            return False
            
        result = response.json()
        predictions = result.get('predictions', [])
        print(f"✓ Model found {len(predictions)} detections")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Draw bounding boxes
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    for pred in predictions:
        x = pred['x']
        y = pred['y']
        width = pred['width']
        height = pred['height']
        confidence = pred['confidence']
        class_name = pred['class']
        
        # Calculate box coordinates
        x1 = int(x - width / 2)
        y1 = int(y - height / 2)
        x2 = int(x + width / 2)
        y2 = int(y + height / 2)
        
        # Color based on class (CHECK OCCUPIED FIRST!)
        if 'occupied' in class_name.lower():
            color = (239, 68, 68)  # Red - DOLU
        else:
            color = (34, 197, 94)  # Green - BOŞ
        
        # Draw thick rectangle
        for i in range(3):
            draw.rectangle([x1+i, y1+i, x2-i, y2-i], outline=color)
        
        # Draw label
        label = f"{class_name} {confidence:.2f}"
        text_bbox = draw.textbbox((x1, y1 - 20), label, font=font)
        draw.rectangle([text_bbox[0]-2, text_bbox[1]-2, text_bbox[2]+2, text_bbox[3]+2], fill=color)
        draw.text((x1, y1 - 20), label, fill='white', font=font)
    
    # Save result
    img.save(output_path, quality=95)
    print(f"✓ Saved to: {output_path}")
    return True

def main():
    input_dir = "parkresim"
    output_dir = "mobile_app/assets/images"
    
    image_files = sorted([f for f in os.listdir(input_dir) if f.endswith('.jpg')])
    
    print(f"Found {len(image_files)} images to process")
    print("Using REAL Roboflow YOLOv8 model: car-parking-xutja/1")
    print("=" * 60)
    
    for i, filename in enumerate(image_files, 1):
        input_path = os.path.join(input_dir, filename)
        output_filename = f"cv_processed_{i}.jpg"
        output_path = os.path.join(output_dir, output_filename)
        
        success = process_image_with_model(input_path, output_path)
        print(f"Completed {i}/{len(image_files)}")
        print("-" * 60)

if __name__ == "__main__":
    main()
