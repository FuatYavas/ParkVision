import React, { useState, useEffect, useRef } from 'react';
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
    Alert,
    Modal,
    PanResponder,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useLiveParkingUpdates from '../hooks/useLiveParkingUpdates';
import { useTheme } from '../context/ThemeContext';
import { generateDynamicParkingLots } from '../data/mockData';

const { width } = Dimensions.get('window');
const FAVORITES_KEY = 'favorite_parking_lots';

// Dark map style for night mode
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }]
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }]
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }]
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }]
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }]
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }]
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }]
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }]
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }]
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }]
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }]
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }]
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }]
    }
];

// Helper function to get marker color based on occupancy
const getMarkerColor = (occupancy) => {
    const occ = occupancy || 0;
    if (occ <= 40) return '#22C55E'; // Green
    if (occ <= 70) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
};

export default function MapScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [location, setLocation] = useState(null);
    const [selectedLot, setSelectedLot] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [filters, setFilters] = useState({
        maxPrice: null,
        maxDistance: null,
        features: [],
        sortBy: 'distance' // distance, price, occupancy
    });
    const [activeModal, setActiveModal] = useState(null); // 'price', 'distance', 'features', 'sort'
    const [favorites, setFavorites] = useState([]);
    const [dynamicLots, setDynamicLots] = useState([]); // Kullanıcı konumuna göre dinamik otoparklar
    const mapRef = React.useRef(null);
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    // Use live parking updates hook
    const { parkingLots, lastUpdate, refresh, getOccupancyRate, getTimeSinceUpdate } = useLiveParkingUpdates(5000, favorites);
    const [allParkingLots, setAllParkingLots] = useState(parkingLots);

    // Update allParkingLots when parkingLots change (static + dynamic)
    useEffect(() => {
        // Static otoparklar + dinamik otoparkları birleştir
        setAllParkingLots([...parkingLots, ...dynamicLots]);
        
        // Animate marker pulse on update
        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.2,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();
    }, [parkingLots, dynamicLots]); // dynamicLots değişince de güncelle

    // Swipe-to-dismiss için Animated value
    const panY = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Sadece aşağı kaydırma için aktif
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                // Sadece aşağı kaydırmaya izin ver
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // 100px'den fazla kaydırıldıysa kapat
                if (gestureState.dy > 100) {
                    Animated.timing(panY, {
                        toValue: 400,
                        duration: 200,
                        useNativeDriver: true
                    }).start(() => {
                        setSelectedLot(null);
                        panY.setValue(0);
                    });
                } else {
                    // Geri yay
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

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

                // Kullanıcı konumuna göre dinamik otoparklar oluştur
                const dynamicLots = generateDynamicParkingLots(
                    currentLocation.coords.latitude,
                    currentLocation.coords.longitude,
                    8 // 8 rastgele otopark
                );

                // Dinamik otoparkları state'e kaydet (bir kere)
                setDynamicLots(dynamicLots);
            } catch (error) {
                console.error('Error getting location:', error);
            }
        })();

        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem(FAVORITES_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Favoriler yüklenirken hata:', error);
        }
    };

    const toggleFavorite = async (lotId) => {
        try {
            let updatedFavorites;
            if (favorites.includes(lotId)) {
                updatedFavorites = favorites.filter(id => id !== lotId);
            } else {
                updatedFavorites = [...favorites, lotId];
            }
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
        } catch (error) {
            console.error('Favori güncellenirken hata:', error);
        }
    };

    // Filter and search parking lots (computed value)
    const getFilteredParkingLots = () => {
        let filtered = [...allParkingLots];

        // Apply search
        if (searchQuery.trim()) {
            filtered = filtered.filter(lot =>
                lot.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply price filter
        if (filters.maxPrice) {
            filtered = filtered.filter(lot => lot.price <= filters.maxPrice);
        }

        // Apply distance filter - use distanceValue for accurate filtering
        if (filters.maxDistance) {
            filtered = filtered.filter(lot => {
                // distanceValue zaten sayısal olarak hesaplanmış
                if (lot.distanceValue !== undefined && !isNaN(lot.distanceValue)) {
                    return lot.distanceValue <= filters.maxDistance;
                }
                // Fallback: string'den parse et
                let dist;
                if (typeof lot.distance === 'string') {
                    // "500 m" veya "2.1 km" formatını parse et
                    const match = lot.distance.match(/([\d.]+)\s*(m|km)?/i);
                    if (match) {
                        dist = parseFloat(match[1]);
                        if (match[2] && match[2].toLowerCase() === 'm') {
                            dist = dist / 1000; // metreyi km'ye çevir
                        }
                    }
                } else {
                    dist = parseFloat(lot.distance);
                }
                return !isNaN(dist) && dist <= filters.maxDistance;
            });
        }

        // Apply features filter
        if (filters.features.length > 0) {
            filtered = filtered.filter(lot =>
                filters.features.every(feature =>
                    lot.features && lot.features.includes(feature)
                )
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price':
                    return a.price - b.price;
                case 'occupancy':
                    return a.occupancy - b.occupancy;
                case 'distance':
                default:
                    const distA = parseFloat(a.distance) || 999;
                    const distB = parseFloat(b.distance) || 999;
                    return distA - distB;
            }
        });

        return filtered;
    };

    // Apply filters when search or filters change
    const displayedParkingLots = getFilteredParkingLots();

    const handlePriceFilter = () => {
        setActiveModal('price');
    };

    const handleDistanceFilter = () => {
        setActiveModal('distance');
    };

    const handleFeaturesFilter = () => {
        setActiveModal('features');
    };

    const handleMainFilter = () => {
        setActiveModal('sort');
    };

    const toggleFeature = (feature) => {
        const currentFeatures = filters.features;
        if (currentFeatures.includes(feature)) {
            setFilters({
                ...filters,
                features: currentFeatures.filter(f => f !== feature)
            });
        } else {
            setFilters({
                ...filters,
                features: [...currentFeatures, feature]
            });
        }
    };

    const renderPriceModal = () => (
        <Modal
            visible={activeModal === 'price'}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setActiveModal(null)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setActiveModal(null)}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Fiyat Filtresi</Text>
                        <TouchableOpacity onPress={() => setActiveModal(null)}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {[
                            { label: 'Tümü', value: null },
                            { label: '10₺ ve altı', value: 10 },
                            { label: '20₺ ve altı', value: 20 },
                            { label: '30₺ ve altı', value: 30 },
                            { label: '50₺ ve altı', value: 50 }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.label}
                                style={styles.optionRow}
                                onPress={() => {
                                    setFilters({ ...filters, maxPrice: option.value });
                                    setActiveModal(null);
                                }}
                            >
                                <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                                {filters.maxPrice === option.value && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.clearButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => {
                            setFilters({ ...filters, maxPrice: null });
                            setActiveModal(null);
                        }}
                    >
                        <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Temizle</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderDistanceModal = () => (
        <Modal
            visible={activeModal === 'distance'}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setActiveModal(null)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setActiveModal(null)}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Mesafe Filtresi</Text>
                        <TouchableOpacity onPress={() => setActiveModal(null)}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {[
                            { label: 'Tümü', value: null },
                            { label: '1 km içinde', value: 1 },
                            { label: '3 km içinde', value: 3 },
                            { label: '5 km içinde', value: 5 },
                            { label: '10 km içinde', value: 10 }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.label}
                                style={styles.optionRow}
                                onPress={() => {
                                    setFilters({ ...filters, maxDistance: option.value });
                                    setActiveModal(null);
                                }}
                            >
                                <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                                {filters.maxDistance === option.value && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.clearButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                        onPress={() => {
                            setFilters({ ...filters, maxDistance: null });
                            setActiveModal(null);
                        }}
                    >
                        <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Temizle</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderFeaturesModal = () => (
        <Modal
            visible={activeModal === 'features'}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setActiveModal(null)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setActiveModal(null)}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Özellikler</Text>
                        <TouchableOpacity onPress={() => setActiveModal(null)}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {[
                            { label: 'Güvenlik Kamerası', value: 'camera', icon: 'videocam-outline' },
                            { label: 'WiFi', value: 'wifi', icon: 'wifi-outline' },
                            { label: 'Elektrikli Araç Şarjı', value: 'ev_charging', icon: 'flash-outline' },
                            { label: 'Kapalı Alan', value: 'covered', icon: 'home-outline' }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.optionRow}
                                onPress={() => toggleFeature(option.value)}
                            >
                                <View style={styles.optionLeft}>
                                    <Ionicons name={option.icon} size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                                    <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                                </View>
                                {filters.features.includes(option.value) ? (
                                    <Ionicons name="checkbox" size={24} color={colors.primary} />
                                ) : (
                                    <Ionicons name="square-outline" size={24} color={colors.border} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.clearButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                            onPress={() => {
                                setFilters({ ...filters, features: [] });
                            }}
                        >
                            <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Temizle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => setActiveModal(null)}
                        >
                            <Text style={styles.applyButtonText}>Uygula</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderSortModal = () => (
        <Modal
            visible={activeModal === 'sort'}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setActiveModal(null)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setActiveModal(null)}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Sıralama ve Filtreler</Text>
                        <TouchableOpacity onPress={() => setActiveModal(null)}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SIRALAMA</Text>
                        {[
                            { label: 'Mesafeye Göre', value: 'distance', icon: 'navigate-outline' },
                            { label: 'Fiyata Göre', value: 'price', icon: 'cash-outline' },
                            { label: 'Doluluk Oranına Göre', value: 'occupancy', icon: 'car-outline' }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.optionRow}
                                onPress={() => {
                                    setFilters({ ...filters, sortBy: option.value });
                                }}
                            >
                                <View style={styles.optionLeft}>
                                    <Ionicons name={option.icon} size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                                    <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                                </View>
                                {filters.sortBy === option.value && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.clearAllButton}
                            onPress={() => {
                                setFilters({ maxPrice: null, maxDistance: null, features: [], sortBy: 'distance' });
                                setSearchQuery('');
                                setActiveModal(null);
                            }}
                        >
                            <Ionicons name="trash-outline" size={20} color="#F44336" style={{ marginRight: 8 }} />
                            <Text style={styles.clearAllButtonText}>Tüm Filtreleri Temizle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => setActiveModal(null)}
                        >
                            <Text style={styles.applyButtonText}>Uygula</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onPress={() => setSelectedLot(null)}
                customMapStyle={isDark ? darkMapStyle : []}
            >
                {displayedParkingLots.map((lot) => (
                    <Marker
                        key={`lot-${lot.id}`}
                        coordinate={{
                            latitude: lot.latitude,
                            longitude: lot.longitude
                        }}
                        pinColor={getMarkerColor(lot.occupancy)}
                        title={lot.name}
                        description={`Doluluk: ${lot.occupancy}% | Fiyat: ${lot.price}₺/saat`}
                        onPress={() => setSelectedLot(lot)}
                    />
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
                <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Yakındaki otoparkları ara"
                        placeholderTextColor={colors.textSecondary}
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
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            (filters.maxPrice || filters.maxDistance || filters.features.length > 0) && styles.filterChipActive
                        ]}
                        onPress={handleMainFilter}
                    >
                        <Ionicons name="options-outline" size={16} color={
                            (filters.maxPrice || filters.maxDistance || filters.features.length > 0) ? colors.primary : colors.text
                        } />
                        <Text style={[
                            styles.filterText,
                            { color: colors.text },
                            (filters.maxPrice || filters.maxDistance || filters.features.length > 0) && styles.filterTextActive
                        ]}>Filtrele</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            filters.maxPrice && styles.filterChipActive
                        ]}
                        onPress={handlePriceFilter}
                    >
                        <Ionicons name="cash-outline" size={16} color={filters.maxPrice ? colors.primary : colors.text} />
                        <Text style={[
                            styles.filterText,
                            { color: colors.text },
                            filters.maxPrice && styles.filterTextActive
                        ]}>
                            {filters.maxPrice ? `${filters.maxPrice}₺ altı` : 'Fiyat'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            filters.maxDistance && styles.filterChipActive
                        ]}
                        onPress={handleDistanceFilter}
                    >
                        <Ionicons name="resize-outline" size={16} color={filters.maxDistance ? colors.primary : colors.text} />
                        <Text style={[
                            styles.filterText,
                            { color: colors.text },
                            filters.maxDistance && styles.filterTextActive
                        ]}>
                            {filters.maxDistance ? `${filters.maxDistance} km` : 'Mesafe'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            filters.features.length > 0 && styles.filterChipActive
                        ]}
                        onPress={handleFeaturesFilter}
                    >
                        <Ionicons name="home-outline" size={16} color={filters.features.length > 0 ? colors.primary : colors.text} />
                        <Text style={[
                            styles.filterText,
                            { color: colors.text },
                            filters.features.length > 0 && styles.filterTextActive
                        ]}>
                            {filters.features.length > 0 ? `${filters.features.length} özellik` : 'Özellikler'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Results count */}
                {searchQuery.trim() || filters.maxPrice || filters.maxDistance || filters.features.length > 0 ? (
                    <View style={[styles.resultsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                            {displayedParkingLots.length} otopark bulundu
                        </Text>
                        {(filters.maxPrice || filters.maxDistance || filters.features.length > 0 || searchQuery.trim()) && (
                            <TouchableOpacity
                                onPress={() => {
                                    setFilters({ maxPrice: null, maxDistance: null, features: [], sortBy: 'distance' });
                                    setSearchQuery('');
                                }}
                            >
                                <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Temizle</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : null}
            </SafeAreaView>

            {/* Modals */}
            {renderPriceModal()}
            {renderDistanceModal()}
            {renderFeaturesModal()}
            {renderSortModal()}

            {/* Bottom Card */}
            {selectedLot && (
                <Animated.View
                    style={[
                        styles.bottomCardContainer,
                        { backgroundColor: colors.card, transform: [{ translateY: panY }] }
                    ]}
                    {...panResponder.panHandlers}
                >
                    <TouchableOpacity
                        style={styles.dragHandle}
                        onPress={() => setSelectedLot(null)}
                    >
                        <View style={styles.dragHandleBar} />
                    </TouchableOpacity>

                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{selectedLot.name}</Text>
                        <View style={styles.cardHeaderRight}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedLot(null)}
                            >
                                <Ionicons name="close" size={22} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.favoriteIconButton}
                                onPress={() => toggleFavorite(selectedLot.id)}
                            >
                                <Ionicons
                                    name={favorites.includes(selectedLot.id) ? "heart" : "heart-outline"}
                                    size={22}
                                    color={favorites.includes(selectedLot.id) ? "#EF4444" : colors.textSecondary}
                                />
                            </TouchableOpacity>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color="#FFC107" />
                                <Text style={[styles.ratingText, { color: colors.text }]}>{selectedLot.rating}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.cardDetails}>
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Mesafe</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{selectedLot.distance}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Ücret Bilgisi</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{selectedLot.price}₺/saat</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Özellikler</Text>
                            <View style={styles.featuresRow}>
                                <Ionicons name="wifi-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                                <Ionicons name="videocam-outline" size={16} color={colors.textSecondary} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.occupancyContainer}>
                        <View style={styles.occupancyHeader}>
                            <Text style={[styles.occupancyLabel, { color: colors.textSecondary }]}>Doluluk</Text>
                            <Text style={[styles.occupancyValue, { color: getMarkerColor(selectedLot.occupancy) }]}>
                                {selectedLot.occupancy}% Dolu
                            </Text>
                        </View>
                        <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}>
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
                            style={[styles.navButton, { backgroundColor: isDark ? '#1C1C1E' : '#E3F2FD' }]}
                            onPress={() => navigation.navigate('Navigation')}
                        >
                            <Ionicons name="navigate-outline" size={20} color={colors.primary} />
                            <Text style={[styles.navButtonText, { color: colors.text }]}>Navigasyon</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.reserveButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('ParkingDetail', { lot: selectedLot })}
                        >
                            <Ionicons name="calendar-outline" size={20} color="white" />
                            <Text style={styles.reserveButtonText}>Rezerve Et</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
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
        borderWidth: 1,
        borderColor: '#E0E0E0',
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
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    filterChipActive: {
        backgroundColor: '#E3F2FD',
        borderColor: '#0066FF',
        borderWidth: 1.5,
    },
    filterTextActive: {
        color: '#0066FF',
        fontWeight: '600',
    },
    resultsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    resultsText: {
        fontSize: 14,
        fontWeight: '500',
    },
    clearFiltersText: {
        fontSize: 14,
        color: '#0066FF',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        letterSpacing: 1,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionText: {
        fontSize: 16,
    },
    clearButton: {
        margin: 20,
        marginTop: 0,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#0066FF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 20,
    },
    clearAllButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F44336',
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    dragHandle: {
        alignSelf: 'center',
        marginBottom: 16,
        padding: 8,
    },
    dragHandleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
    },
    closeButton: {
        padding: 4,
        marginRight: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favoriteIconButton: {
        padding: 4,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: 'bold',
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
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
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
    liveUpdateContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 10,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    liveIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    liveUpdateText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '500',
    },
    refreshButton: {
        padding: 4,
    },
});