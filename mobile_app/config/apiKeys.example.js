/**
 * API Keys Configuration
 * 
 * IMPORTANT: 
 * 1. Copy this file to 'apiKeys.js'
 * 2. Replace placeholder values with your actual API keys
 * 3. NEVER commit apiKeys.js to version control
 * 
 * To get Google Maps API Key:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create a new project or select existing
 * 3. Enable: Maps SDK for Android, Maps SDK for iOS, Directions API
 * 4. Create credentials → API Key
 */

// Google Maps API Key
// Required for: MapView, Directions, Geocoding
export const GOOGLE_MAPS_APIKEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

// Backend API URL
// Update this to match your server's IP address
export const API_BASE_URL = 'http://YOUR_SERVER_IP:8000';
