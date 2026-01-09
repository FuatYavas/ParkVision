import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using local network IP address for Docker backend connection
// Make sure your phone and computer are on the same WiFi network
// For development, use localhost if testing on same machine
// For physical device testing, use your computer's local IP
// Physical Device: Use your computer's WiFi IP address
const API_URL = __DEV__
    ? 'http://10.57.224.70:8000'  // Physical Device -> Computer's Ethernet/WiFi IP (updated 2026-01-09)
    : 'http://localhost:8000';  // For production

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 second timeout
    headers: {
        'User-Agent': 'ParkVisionMobileApp/1.0'
    }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - server took too long to respond');
        } else if (error.message === 'Network Error') {
            console.error('Network Error - Cannot connect to server at', API_URL);
            console.error('Make sure:');
            console.error('1. Backend server is running on', API_URL);
            console.error('2. Your device/emulator can reach this IP address');
            console.error('3. Firewall is not blocking the connection');
        }
        return Promise.reject(error);
    }
);

// Add auth token to requests if available
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    // OAuth2 token endpoint requires application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await api.post('/token', params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    await AsyncStorage.setItem('token', response.data.access_token);
    return response.data;
};

export const register = async (email, password, fullName) => {
    const response = await api.post('/register', {
        email,
        password,
        full_name: fullName,
        role: 'driver',
    });
    await AsyncStorage.setItem('token', response.data.access_token);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/users/profile/password', {
        current_password: currentPassword,
        new_password: newPassword
    });
    return response.data;
};

export const getParkingLots = async () => {
    const response = await api.get('/parking-lots/');
    return response.data;
};

export const getParkingSpots = async (lotId) => {
    // Using CV detection endpoint to get parking spots with real-time status
    const response = await api.get(`/cv/parking-lots/${lotId}/detections`);
    return response.data;
};

export const getNearbyParkingLots = async (latitude, longitude, radiusKm = 5) => {
    // TODO: Backend doesn't have nearby endpoint yet, using all parking lots
    // Filter client-side based on coordinates
    const response = await api.get('/parking-lots/');
    const allLots = response.data;

    // Calculate distance and filter
    const nearbyLots = allLots.filter(lot => {
        if (!lot.latitude || !lot.longitude) return false;
        const distance = calculateDistance(latitude, longitude, lot.latitude, lot.longitude);
        return distance <= radiusKm;
    });

    return nearbyLots;
};

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const createReservation = async (spotId, durationMinutes = 60) => {
    const response = await api.post('/reservations/', {
        spot_id: spotId,
        duration_minutes: durationMinutes,
    });
    return response.data;
};

export const getMyReservations = async () => {
    const response = await api.get('/reservations/my');
    return response.data;
};

export const cancelReservation = async (reservationId) => {
    const response = await api.post(`/reservations/${reservationId}/cancel`);
    return response.data;
};

export const saveLocation = async (location) => {
    // TODO: Backend endpoint not implemented yet
    console.log('saveLocation called with:', location);
    return { success: true, message: 'Location saved locally (backend endpoint pending)' };
};

export const reportSpotStatus = async (spotId, isOccupied, confidence = 0.8) => {
    // TODO: Crowdsourcing endpoint not implemented yet
    // Using CV spot update endpoint as alternative
    try {
        const response = await api.put(`/cv/parking-spots/${spotId}/status`, {
            status: isOccupied ? 'occupied' : 'empty',
            confidence: confidence
        });
        return response.data;
    } catch (error) {
        console.log('reportSpotStatus error:', error.message);
        return { success: false, message: 'Failed to report spot status' };
    }
};

export const getMyVehicles = async () => {
    const response = await api.get('/users/vehicles');
    return response.data;
};

export const createVehicle = async (vehicleData) => {
    const response = await api.post('/users/vehicles', vehicleData);
    return response.data;
};

export const updateVehicle = async (vehicleId, vehicleData) => {
    const response = await api.put(`/users/vehicles/${vehicleId}`, vehicleData);
    return response.data;
};

export const deleteVehicle = async (vehicleId) => {
    const response = await api.delete(`/users/vehicles/${vehicleId}`);
    return response.data;
};

export const getOccupancyStatistics = async () => {
    // TODO: Statistics endpoint not implemented yet
    // Calculate from current parking lot data as workaround
    try {
        const parkingLots = await getParkingLots();
        const stats = {
            total_lots: parkingLots.length,
            total_capacity: parkingLots.reduce((sum, lot) => sum + (lot.capacity || 0), 0),
            average_occupancy: 0, // Would need real-time data from CV
            timestamp: new Date().toISOString()
        };
        return stats;
    } catch (error) {
        console.log('getOccupancyStatistics error:', error.message);
        return { total_lots: 0, total_capacity: 0, average_occupancy: 0 };
    }
};

export default api;
