import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    Alert,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function FindMyCarScreen({ route, navigation }) {
    const [userLocation, setUserLocation] = useState(null);
    const [showRoute, setShowRoute] = useState(false);
    const [walkingInfo, setWalkingInfo] = useState({ distance: 0, duration: 0 });
    const mapRef = React.useRef(null);

    // Get reservation data from params
    const reservation = route.params?.reservation;
    const parkingLot = reservation?.parkingLot || { name: 'Otopark', latitude: 38.6791, longitude: 39.2264 };
    const spotNumber = reservation?.spotNumber || 'A1';

    // Use actual parking location
    const parkedLocation = {
        latitude: parkingLot.latitude,
        longitude: parkingLot.longitude,
    };

    const initialRegion = {
        latitude: parkingLot.latitude,
        longitude: parkingLot.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation && showRoute) {
            const dist = getDistance(userLocation, parkedLocation);
            setWalkingInfo({
                distance: dist,
                duration: (dist / 5) * 60 // Assume 5 km/h walking speed
            });
        }
    }, [userLocation, showRoute]);

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const handleShowRoute = () => {
        setShowRoute(true);
        if (mapRef.current && userLocation) {
            mapRef.current.fitToCoordinates([
                userLocation,
                parkedLocation
            ], {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true
            });
        }
    };

    const openWalkingNavigation = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${parkedLocation.latitude},${parkedLocation.longitude}&travelmode=walking`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Hata', 'Harita uygulaması açılamadı');
        });
    };

    const formatDuration = (minutes) => {
        if (minutes < 1) return '< 1 dk';
        if (minutes < 60) return `${Math.round(minutes)} dk`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours} sa ${mins} dk`;
    };

    const formatDistance = (km) => {
        if (km < 1) return `${Math.round(km * 1000)} m`;
        return `${km.toFixed(1)} km`;
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Park Yeri Bulucum</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
            >
                {/* Parked Car Marker */}
                <Marker coordinate={parkedLocation}>
                    <View style={styles.markerContainer}>
                        <View style={styles.markerIconBg}>
                            <Ionicons name="car" size={20} color="white" />
                        </View>
                        <View style={styles.markerStem} />
                        <View style={styles.markerBase} />
                    </View>
                </Marker>

                {/* Walking Route Line */}
                {showRoute && userLocation && (
                    <Polyline
                        coordinates={[
                            userLocation,
                            parkedLocation
                        ]}
                        strokeColor="#4CAF50"
                        strokeWidth={4}
                        lineDashPattern={[10, 5]}
                    />
                )}
            </MapView>

            {/* Walking Info Card - Shows when route is active */}
            {showRoute && walkingInfo.distance > 0 && (
                <View style={styles.walkingInfoCard}>
                    <View style={styles.walkingInfoRow}>
                        <View style={styles.walkingInfoItem}>
                            <Ionicons name="walk" size={20} color="#4CAF50" />
                            <Text style={styles.walkingInfoValue}>{formatDistance(walkingInfo.distance)}</Text>
                        </View>
                        <View style={styles.walkingInfoDivider} />
                        <View style={styles.walkingInfoItem}>
                            <Ionicons name="time-outline" size={20} color="#0066FF" />
                            <Text style={styles.walkingInfoValue}>{formatDuration(walkingInfo.duration)}</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.bottomCard}>
                <View style={styles.locationInfo}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1590674899505-1c5c4195e969?q=80&w=200&auto=format&fit=crop' }}
                        style={styles.parkImage}
                    />
                    <View style={styles.textInfo}>
                        <Text style={styles.locationTitle}>{parkingLot.name}</Text>
                        <Text style={styles.spotInfo}>Park Yeri: {spotNumber}</Text>
                        <Text style={styles.timeInfo}>Park Edildi: Az önce</Text>
                    </View>
                </View>

                {!showRoute ? (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleShowRoute}
                    >
                        <Ionicons name="walk-outline" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>Rotayı Göster</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={openWalkingNavigation}
                    >
                        <Ionicons name="navigate" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>Google Maps ile Yürü</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => Alert.alert('Başarılı', 'Park konumu güncellendi.')}
                >
                    <Ionicons name="refresh-outline" size={20} color="#0066FF" />
                    <Text style={styles.secondaryButtonText}>Park Konumunu Güncelle</Text>
                </TouchableOpacity>
            </View>
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
    headerContainer: {
        backgroundColor: 'white',
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerIconBg: {
        width: 40,
        height: 40,
        backgroundColor: '#0066FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    markerStem: {
        width: 4,
        height: 20,
        backgroundColor: '#0066FF',
    },
    markerBase: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(0, 102, 255, 0.5)',
    },
    walkingInfoCard: {
        position: 'absolute',
        top: 100,
        left: 16,
        right: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    walkingInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    walkingInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    walkingInfoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 8,
    },
    walkingInfoDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E0E0E0',
    },
    bottomCard: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    locationInfo: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    parkImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    textInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    spotInfo: {
        fontSize: 14,
        color: '#0066FF',
        fontWeight: '600',
        marginBottom: 2,
    },
    timeInfo: {
        fontSize: 13,
        color: '#666',
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
        backgroundColor: '#F5F7FA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    secondaryButtonText: {
        color: '#0066FF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
