import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
];

export default function NavigationScreen({ route, navigation }) {
    const { colors, isDark } = useTheme();
    const { lot } = route.params || {};
    const [userLocation, setUserLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState({
        distance: 0,
        duration: 0
    });
    const mapRef = useRef(null);

    // Default parking lot if not provided
    const destination = lot || {
        name: 'Elazığ AVM Otoparkı',
        latitude: 38.6791,
        longitude: 39.2264
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        // Calculate distance when user location changes
        if (userLocation) {
            const dist = getDistance(userLocation, destination);
            setRouteInfo({
                distance: dist,
                duration: (dist / 40) * 60 // Assume 40 km/h average speed
            });
        }
    }, [userLocation]);

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('İzin Gerekli', 'Konum izni verilmedi.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
            
            setUserLocation(coords);

            // Fit map to show both user and destination
            if (mapRef.current) {
                setTimeout(() => {
                    mapRef.current.fitToCoordinates([
                        coords,
                        { latitude: destination.latitude, longitude: destination.longitude }
                    ], {
                        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                        animated: true
                    });
                }, 500);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            // Fallback to Elazığ center
            setUserLocation({
                latitude: 38.6753,
                longitude: 39.2215
            });
        }
    };

    const handleSaveLocation = () => {
        navigation.navigate('Main', { 
            screen: 'FindMyCar',
            params: {
                reservation: {
                    parkingLot: destination,
                    spotNumber: 'A1'
                }
            }
        });
    };

    const openExternalNavigation = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Hata', 'Harita uygulaması açılamadı');
        });
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${Math.round(minutes)} dk`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours} sa ${mins} dk`;
    };

    const formatDistance = (km) => {
        if (km < 1) {
            return `${Math.round(km * 1000)} m`;
        }
        return `${km.toFixed(1)} km`;
    };

    const initialRegion = userLocation ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                followsUserLocation={false}
                showsMyLocationButton={false}
            >
                {/* Destination Marker */}
                <Marker 
                    coordinate={{ 
                        latitude: destination.latitude, 
                        longitude: destination.longitude 
                    }}
                    title={destination.name}
                >
                    <View style={styles.destinationMarker}>
                        <View style={styles.markerIcon}>
                            <Ionicons name="car" size={20} color="white" />
                        </View>
                        <View style={styles.markerPointer} />
                    </View>
                </Marker>

                {/* Simple Route Line */}
                {userLocation && (
                    <Polyline
                        coordinates={[
                            userLocation,
                            { latitude: destination.latitude, longitude: destination.longitude }
                        ]}
                        strokeColor="#0066FF"
                        strokeWidth={4}
                        lineDashPattern={[1]}
                    />
                )}
            </MapView>

            <SafeAreaView style={styles.overlay}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                        {destination.name}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Route Info Card */}
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <View style={styles.routeInfoContainer}>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={24} color={colors.primary} />
                            <Text style={[styles.timeText, { color: colors.text }]}>
                                {routeInfo.duration > 0 
                                    ? formatDuration(routeInfo.duration) 
                                    : 'Hesaplanıyor...'}
                            </Text>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Tahmini Süre</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.infoItem}>
                            <Ionicons name="navigate-outline" size={24} color="#4CAF50" />
                            <Text style={[styles.distanceText, { color: colors.text }]}>
                                {routeInfo.distance > 0 
                                    ? formatDistance(routeInfo.distance) 
                                    : 'Hesaplanıyor...'}
                            </Text>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Mesafe</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Buttons */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity 
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]} 
                        onPress={openExternalNavigation}
                    >
                        <Ionicons name="navigate" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>Google Maps ile Aç</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.secondaryButton, { backgroundColor: isDark ? '#1C1C1E' : '#F5F7FA' }]} 
                        onPress={handleSaveLocation}
                    >
                        <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
                        <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Park Konumunu Kaydet</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

// Helper function to calculate distance (Haversine formula)
const getDistance = (loc1, loc2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: width,
        height: height,
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingBottom: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    infoCard: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 20,
        padding: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    routeInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 60,
        backgroundColor: '#E0E0E0',
    },
    timeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    distanceText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    infoLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    bottomContainer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    primaryButton: {
        backgroundColor: '#0066FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    secondaryButton: {
        backgroundColor: '#F5F5F5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    secondaryButtonText: {
        color: '#0066FF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    destinationMarker: {
        alignItems: 'center',
    },
    markerIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F44336',
        borderWidth: 3,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    markerPointer: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#F44336',
        marginTop: -1,
    },
});
