FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Environment variables (can be overridden)
ENV ROBOFLOW_API_KEY=""
ENV BACKEND_API_URL="http://backend:8000"
ENV PROCESSING_INTERVAL="2.0"
ENV CONFIDENCE_THRESHOLD="0.5"
ENV LOG_LEVEL="INFO"

# Default command - can be overridden for different modes
CMD ["python", "processor.py", "--mode", "image", "--source", "/app/test_images/parking.jpg"]
