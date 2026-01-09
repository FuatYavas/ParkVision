import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

import { mockParkingLots } from '../data/mockData';

const FAVORITES_KEY = 'favorite_parking_lots';

export default function FavoritesScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadFavorites();
        });
        return unsubscribe;
    }, [navigation]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const stored = await AsyncStorage.getItem(FAVORITES_KEY);
            if (stored) {
                const favoriteIds = JSON.parse(stored);
                // Match with mock data to get full parking lot info
                const favoriteLots = mockParkingLots.filter(lot => 
                    favoriteIds.includes(lot.id)
                );
                setFavorites(favoriteLots);
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Favoriler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (lotId) => {
        Alert.alert(
            'Favoriyi Kaldır',
            'Bu otoparkı favorilerinizden kaldırmak istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Kaldır',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const stored = await AsyncStorage.getItem(FAVORITES_KEY);
                            const favoriteIds = stored ? JSON.parse(stored) : [];
                            const updated = favoriteIds.filter(id => id !== lotId);
                            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
                            setFavorites(favorites.filter(lot => lot.id !== lotId));
                        } catch (error) {
                            console.error('Favori kaldırılırken hata:', error);
                        }
                    }
                }
            ]
        );
    };

    const getOccupancyColor = (lot) => {
        const occupancy = (lot.current_occupancy / lot.capacity) * 100;
        if (occupancy <= 40) return '#22C55E';
        if (occupancy <= 70) return '#F59E0B';
        return '#EF4444';
    };

    const getOccupancyText = (lot) => {
        const occupancy = Math.round((lot.current_occupancy / lot.capacity) * 100);
        if (occupancy <= 40) return 'Müsait';
        if (occupancy <= 70) return 'Orta';
        return 'Yoğun';
    };

    const getParkingImage = (type) => {
        const images = {
            historic: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=800',
            nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
            education: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800',
            shopping: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800',
            hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800',
            airport: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800',
            residential: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800',
            municipal: 'https://images.unsplash.com/photo-1590674899505-1c5c4195e969?q=80&w=800',
            default: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800'
        };
        return images[type] || images.default;
    };

    const renderFavoriteItem = ({ item }) => {
        const emptySpots = item.capacity - item.current_occupancy;
        const occupancy = Math.round((item.current_occupancy / item.capacity) * 100);

        return (
            <TouchableOpacity 
                style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}
                onPress={() => navigation.navigate('ParkingDetail', { lot: {
                    id: item.id,
                    name: item.name,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    occupancy: occupancy,
                    capacity: item.capacity,
                    price: item.hourly_rate,
                    isOpen: item.is_active,
                    isReservable: true,
                    features: item.features
                }})}
            >
                <Image 
                    source={{ uri: getParkingImage(item.type) }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                        <TouchableOpacity 
                            style={styles.favoriteButton}
                            onPress={() => removeFavorite(item.id)}
                        >
                            <Ionicons name="heart" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.cardAddress, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                    
                    <View style={styles.cardStats}>
                        <View style={styles.statItem}>
                            <View style={[styles.statusDot, { backgroundColor: getOccupancyColor(item) }]} />
                            <Text style={[styles.statText, { color: colors.textSecondary }]}>{getOccupancyText(item)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="car-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.statText, { color: colors.textSecondary }]}>{emptySpots} boş</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.hourly_rate}₺/sa</Text>
                        </View>
                    </View>

                    <View style={styles.cardActions}>
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                            onPress={() => navigation.navigate('Navigation', { lot: item })}
                        >
                            <Ionicons name="navigate-outline" size={18} color={colors.primary} />
                            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Yol Tarifi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.reserveButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('Reservation', { lot: {
                                id: item.id,
                                name: item.name,
                                latitude: item.latitude,
                                longitude: item.longitude
                            }})}
                        >
                            <Text style={styles.reserveButtonText}>Rezerve Et</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="heart-outline" size={64} color={colors.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz favori otopark yok</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Harita üzerinden otoparkları görüntüleyip favorilerinize ekleyebilirsiniz.
            </Text>
            <TouchableOpacity 
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Map')}
            >
                <Ionicons name="map-outline" size={20} color="white" />
                <Text style={styles.exploreButtonText}>Otoparkları Keşfet</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Favori Otoparklar</Text>
                <View style={{ width: 24 }} />
            </View>

            {favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                renderEmptyState()
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    favoriteButton: {
        padding: 4,
    },
    cardAddress: {
        fontSize: 13,
        marginBottom: 12,
    },
    cardStats: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statText: {
        fontSize: 13,
        marginLeft: 4,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#F0F7FF',
    },
    actionButtonText: {
        color: '#0066FF',
        fontWeight: '600',
        marginLeft: 6,
    },
    reserveButton: {
        backgroundColor: '#0066FF',
    },
    reserveButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0066FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
});
