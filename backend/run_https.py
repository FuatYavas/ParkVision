"""
Run FastAPI backend with HTTPS using a self-signed certificate.
This allows Expo Go to connect without needing ngrok.

Note: For Docker deployment, use docker-compose.yml instead.
This script is for local development only.
"""
import uvicorn
import os

if __name__ == "__main__":
    # Check if SSL certificates exist, if not, create them
    cert_file = "cert.pem"
    key_file = "key.pem"

    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("SSL certificates not found. Creating self-signed certificates...")
        print("\nRun this command first:")
        print("openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365 -subj \"/CN=192.168.1.110\"")
        print("\nThen run this script again.")
        exit(1)

    print("Starting ParkVision API with HTTPS...")
    print("Backend will be available at: https://192.168.1.110:8000")
    print("\nNote: You'll see SSL warnings in browsers - this is normal for self-signed certificates.")
    print("Press CTRL+C to stop the server.\n")

    uvicorn.run(
        "app.main:app",  # Updated to use new app structure
        host="0.0.0.0",
        port=8000,
        ssl_keyfile=key_file,
        ssl_certfile=cert_file,
        reload=True
    )
