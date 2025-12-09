import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using local network IP address for Docker backend connection
// Make sure your phone and computer are on the same WiFi network  
// Current WiFi IP: 10.88.110.132 (updated 2025-12-09 20:03)
const API_URL = 'http://10.88.110.132:8000';

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
    const response = await api.get('/parking_lots/');
    return response.data;
};

export const getParkingSpots = async (lotId) => {
    const response = await api.get(`/parking_spots/${lotId}`);
    return response.data;
};

export const getNearbyParkingLots = async (latitude, longitude, radiusKm = 5) => {
    const response = await api.get('/parking_lots/nearby', {
        params: { latitude, longitude, radius_km: radiusKm },
    });
    return response.data;
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
    const response = await api.post('/save_location', location);
    return response.data;
};

export const reportSpotStatus = async (spotId, isOccupied, confidence = 0.8) => {
    const response = await api.post('/crowdsource/report', {
        spot_id: spotId,
        is_occupied: isOccupied,
        confidence,
    });
    return response.data;
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
    const response = await api.get('/statistics/occupancy');
    return response.data;
};

export default api;
