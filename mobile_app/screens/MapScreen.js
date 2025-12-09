import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

import { getParkingLots } from '../api';
import { mockParkingLots } from '../data/mockData';

// ... imports remain the same

export default function MapScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [parkingLots, setParkingLots] = useState([]);
    const [selectedLot, setSelectedLot] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const mapRef = React.useRef(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                Alert.alert(
                    'Konum İzni Gerekli',
                    'Konumunuzu görmek için konum izni vermeniz gerekiyor.',
                    [{ text: 'Tamam' }]
                );
                setHasLocationPermission(false);
                return;
            }

            setHasLocationPermission(true);

            try {
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                setLocation(currentLocation);
            } catch (error) {
                console.error('Error getting location:', error);
            }
        })();

        // Load mock data immediately for better UX
        loadMockData();
        // Disable API fetch - using only mock data for Elazığ
        // fetchParkingLots();
    }, []);

    const loadMockData = () => {
        const formattedLots = mockParkingLots.map(lot => ({
            id: lot.id,
            name: lot.name,
            latitude: lot.latitude,
            longitude: lot.longitude,
            occupancy: Math.round((lot.current_occupancy / lot.capacity) * 100) || 0,
            price: lot.hourly_rate || 0,
            distance: lot.distance,
            rating: lot.rating,
            isOpen: lot.is_active,
            features: lot.features
        }));
        setParkingLots(formattedLots);
    };

    const fetchParkingLots = async () => {
        try {
            // Try to fetch from API
            const lots = await getParkingLots();
            // Transform backend data
            const formattedLots = lots.map(lot => ({
                id: lot.id,
                name: lot.name,
                latitude: lot.latitude,
                longitude: lot.longitude,
                occupancy: Math.round((lot.current_occupancy / lot.capacity) * 100) || 0,
                price: lot.hourly_rate || 0,
                distance: 'Unknown',
                rating: 4.5,
                isOpen: lot.is_active,
                features: ['camera']
            }));
            console.log('API data loaded:', formattedLots.length, 'lots');
            setParkingLots(formattedLots);
        } catch (error) {
            console.log('Using mock data (API unavailable)');
            // Mock data already loaded, no need to reload
        }
    };

    const getMarkerColor = (occupancy) => {
        if (occupancy >= 90) return '#FF5252'; // Red
        if (occupancy >= 50) return '#FFC107'; // Yellow
        return '#4CAF50'; // Green
    };

    const centerOnUserLocation = async () => {
        if (!hasLocationPermission) {
            Alert.alert(
                'Konum İzni Yok',
                'Konumunuzu görmek için ayarlardan konum iznini açmanız gerekiyor.'
            );
            return;
        }

        try {
            // Get fresh location
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            setLocation(currentLocation);

            // Animate map to user location
            if (mapRef.current && currentLocation) {
                mapRef.current.animateToRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Hata', 'Konum alınamadı. Lütfen tekrar deneyin.');
        }
    };

    const initialRegion = {
        latitude: 38.6791,  // Elazığ center
        longitude: 39.2264,  // Elazığ center
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onPress={() => setSelectedLot(null)}
            >
                {parkingLots.map((lot) => (
                    <Marker
                        key={lot.id}
                        coordinate={{ latitude: lot.latitude, longitude: lot.longitude }}
                        onPress={() => setSelectedLot(lot)}
                    >
                        <View style={styles.markerContainer}>
                            <View style={[styles.markerBubble, { backgroundColor: getMarkerColor(lot.occupancy) }]}>
                                <Text style={styles.markerText}>{lot.occupancy}%</Text>
                            </View>
                            <Text style={[styles.markerLabel, { color: getMarkerColor(lot.occupancy) }]}>P</Text>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Location Button */}
            <TouchableOpacity
                style={[
                    styles.locationButton,
                    { bottom: selectedLot ? 320 : 40 }
                ]}
                onPress={centerOnUserLocation}
            >
                <Ionicons name="locate" size={24} color="#0066FF" />
            </TouchableOpacity>

            {/* Top Bar */}
            <SafeAreaView style={styles.topContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Yakındaki otoparkları ara"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    <TouchableOpacity style={styles.filterChip}>
                        <Ionicons name="options-outline" size={16} color="#333" />
                        <Text style={styles.filterText}>Filtrele</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Ionicons name="cash-outline" size={16} color="#333" />
                        <Text style={styles.filterText}>Fiyat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Ionicons name="resize-outline" size={16} color="#333" />
                        <Text style={styles.filterText}>Mesafe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Ionicons name="home-outline" size={16} color="#333" />
                        <Text style={styles.filterText}>Özellikler</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* Bottom Card */}
            {selectedLot && (
                <View style={styles.bottomCardContainer}>
                    <View style={styles.dragHandle} />

                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{selectedLot.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FFC107" />
                            <Text style={styles.ratingText}>{selectedLot.rating}</Text>
                        </View>
                    </View>

                    <View style={styles.cardDetails}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Mesafe</Text>
                            <Text style={styles.detailValue}>{selectedLot.distance}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Ucret Bilgisi</Text>
                            <Text style={styles.detailValue}>{selectedLot.price}TL/saat</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Özellikler</Text>
                            <View style={styles.featuresRow}>
                                <Ionicons name="wifi-outline" size={16} color="#666" style={{ marginRight: 4 }} />
                                <Ionicons name="videocam-outline" size={16} color="#666" />
                            </View>
                        </View>
                    </View>

                    <View style={styles.occupancyContainer}>
                        <View style={styles.occupancyHeader}>
                            <Text style={styles.occupancyLabel}>Doluluk</Text>
                            <Text style={[styles.occupancyValue, { color: getMarkerColor(selectedLot.occupancy) }]}>
                                {selectedLot.occupancy}% Dolu
                            </Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${selectedLot.occupancy}%`,
                                        backgroundColor: getMarkerColor(selectedLot.occupancy)
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => navigation.navigate('Navigation')}
                        >
                            <Ionicons name="navigate-outline" size={20} color="#333" />
                            <Text style={styles.navButtonText}>Navigasyon</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.reserveButton}
                            onPress={() => navigation.navigate('ParkingDetail', { lot: selectedLot })}
                        >
                            <Ionicons name="calendar-outline" size={20} color="white" />
                            <Text style={styles.reserveButtonText}>Rezerve Et</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    locationButton: {
        position: 'absolute',
        right: 16,
        backgroundColor: 'white',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    topContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 0 : 40,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filtersContainer: {
        flexGrow: 0,
    },
    filtersContent: {
        paddingVertical: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    filterText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerBubble: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    markerText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    markerLabel: {
        fontSize: 24,
        fontWeight: '900',
    },
    bottomCardContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    featuresRow: {
        flexDirection: 'row',
    },
    occupancyContainer: {
        marginBottom: 24,
    },
    occupancyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    occupancyLabel: {
        fontSize: 14,
        color: '#666',
    },
    occupancyValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
    },
    navButtonText: {
        marginLeft: 8,
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    reserveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 12,
    },
    reserveButtonText: {
        marginLeft: 8,
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
