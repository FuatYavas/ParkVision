import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FavoritesScreen({ navigation }) {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem('favorites');
            if (stored) {
                setFavorites(JSON.parse(stored));
            } else {
                // Mock data for demonstration
                setFavorites([
                    {
                        id: 1,
                        name: 'City Center Parking',
                        address: '123 Main Street, Downtown',
                        distance: '2.5 km',
                        price: 5.0,
                        rating: 4.5,
                        occupancy: 65
                    },
                    {
                        id: 2,
                        name: 'Shopping Mall Parking',
                        address: '789 Mall Road',
                        distance: '1.2 km',
                        price: 4.0,
                        rating: 4.8,
                        occupancy: 45
                    }
                ]);
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
    };

    const saveFavorites = async (newFavorites) => {
        try {
            await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    };

    const handleRemoveFavorite = (id) => {
        Alert.alert(
            'Remove Favorite',
            'Are you sure you want to remove this parking lot from favorites?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const updated = favorites.filter(f => f.id !== id);
                        saveFavorites(updated);
                    }
                }
            ]
        );
    };

    const getOccupancyColor = (occupancy) => {
        if (occupancy >= 90) return '#F44336';
        if (occupancy >= 70) return '#FF9800';
        if (occupancy >= 50) return '#FFC107';
        return '#4CAF50';
    };

    const FavoriteCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Main', {
                screen: 'Map',
                params: { selectedLotId: item.id }
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="location" size={24} color="#0066FF" />
                </View>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleRemoveFavorite(item.id)}
                >
                    <Ionicons name="heart" size={24} color="#F44336" />
                </TouchableOpacity>
            </View>

            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>

            <View style={styles.details}>
                <View style={styles.detailItem}>
                    <Ionicons name="navigate-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.distance}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.price}₺/h</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="star" size={16} color="#FFC107" />
                    <Text style={styles.detailText}>{item.rating}</Text>
                </View>
            </View>

            <View style={styles.occupancyContainer}>
                <View style={styles.occupancyHeader}>
                    <Text style={styles.occupancyLabel}>Occupancy</Text>
                    <Text style={[styles.occupancyValue, { color: getOccupancyColor(item.occupancy) }]}>
                        {item.occupancy}%
                    </Text>
                </View>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${item.occupancy}%`,
                                backgroundColor: getOccupancyColor(item.occupancy)
                            }
                        ]}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate('Main', {
                    screen: 'Map',
                    params: { selectedLotId: item.id }
                })}
            >
                <Text style={styles.viewButtonText}>View on Map</Text>
                <Ionicons name="arrow-forward" size={18} color="#0066FF" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favorite Spots</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                        <Text style={styles.emptyText}>
                            Add parking spots to your favorites for quick access
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('Main', { screen: 'Map' })}
                        >
                            <Text style={styles.browseButtonText}>Browse Parking Lots</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.countText}>{favorites.length} favorite parking lot{favorites.length > 1 ? 's' : ''}</Text>
                        {favorites.map((item) => (
                            <FavoriteCard key={item.id} item={item} />
                        ))}
                    </>
                )}
            </ScrollView>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    countText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 32,
    },
    browseButton: {
        backgroundColor: '#0066FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        padding: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    details: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    occupancyContainer: {
        marginBottom: 16,
    },
    occupancyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    occupancyLabel: {
        fontSize: 12,
        color: '#666',
    },
    occupancyValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0066FF',
    },
});

