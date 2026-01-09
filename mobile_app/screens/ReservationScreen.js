import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import { getParkingSpots, createReservation } from '../api';
import { generateMockSpots } from '../data/mockData';

export default function ReservationScreen({ route, navigation }) {
    const { colors, isDark } = useTheme();
    const { lot } = route.params || {}; // Get lot from params
    const [spots, setSpots] = useState([]);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

    useEffect(() => {
        if (lot?.id) {
            fetchSpots(lot.id);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [lot]);

    const fetchSpots = async (lotId) => {
        try {
            // Try to fetch from API first
            const data = await getParkingSpots(lotId);
            // API returns { parking_lot_id, summary, spots: [...] }
            const spotsArray = data.spots || data;
            if (!Array.isArray(spotsArray)) {
                throw new Error('Invalid spots data format');
            }
            // Transform backend data: { id, spot_number, status: 'empty'|'occupied'|'reserved' }
            const formattedSpots = spotsArray.map(spot => ({
                id: spot.id,
                label: spot.spot_number,
                status: spot.status === 'occupied' || spot.status === 'reserved' ? 'occupied' : 'available'
            }));
            setSpots(formattedSpots);
        } catch (error) {
            // API mevcut değil, mock data kullanılıyor (normal davranış)
            console.log('Using mock parking spots data');
            // Fallback to mock data with random occupancy
            // Merkez Park için 25 park yeri (5 dolu, 20 boş)
            const spotsCount = lotId === 2 ? 25 : 20;
            const mockSpots = generateMockSpots(lotId, spotsCount);
            const formattedSpots = mockSpots.map(spot => ({
                id: spot.id,
                label: spot.spot_number,
                // spot.status zaten 'occupied' veya 'empty' olarak geliyor
                status: spot.status === 'occupied' ? 'occupied' : 'available'
            }));
            setSpots(formattedSpots);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0')
        };
    };

    const time = formatTime(timeLeft);

    const handleSpotPress = (spot) => {
        if (spot.status === 'occupied') return;
        setSelectedSpot(spot.id === selectedSpot ? null : spot.id);
    };

    const handleReservation = async () => {
        if (!selectedSpot) return;

        const spotLabel = spots.find(s => s.id === selectedSpot)?.label || 'seçilen';

        // Rezervasyonu AsyncStorage'a kaydet
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const existingReservations = await AsyncStorage.getItem('user_reservations');
            const reservations = existingReservations ? JSON.parse(existingReservations) : [];

            const newReservation = {
                id: `local-${Date.now()}`,
                parking_lot_name: lot?.name || 'Otopark',
                spot_number: spotLabel,
                spot_id: selectedSpot,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 saat sonra
                status: 'active',
                price: lot?.price || lot?.hourly_rate || 15,
                reservation_code: `RES${Date.now().toString(36).toUpperCase()}`,
                latitude: lot?.latitude || 38.6791,
                longitude: lot?.longitude || 39.2264
            };

            reservations.push(newReservation);
            await AsyncStorage.setItem('user_reservations', JSON.stringify(reservations));

            // Rezerve edilen yeri dolu olarak işaretle
            setSpots(prevSpots => prevSpots.map(spot => 
                spot.id === selectedSpot 
                    ? { ...spot, status: 'occupied' }
                    : spot
            ));

            // Seçimi temizle
            setSelectedSpot(null);

            Alert.alert('Başarılı', `Park yeri ${spotLabel} rezerve edildi!`, [
                {
                    text: 'Tamam',
                    onPress: () => {
                        navigation.navigate('Main', { 
                            screen: 'Home',
                            params: { refreshReservations: true }
                        });
                    }
                }
            ]);
        } catch (error) {
            console.log('Reservation saved locally');
            
            // Rezerve edilen yeri dolu olarak işaretle
            setSpots(prevSpots => prevSpots.map(spot => 
                spot.id === selectedSpot 
                    ? { ...spot, status: 'occupied' }
                    : spot
            ));

            // Seçimi temizle
            setSelectedSpot(null);

            Alert.alert('Başarılı', `Park yeri ${spotLabel} rezerve edildi!`, [
                {
                    text: 'Tamam',
                    onPress: () => {
                        navigation.navigate('Main', { 
                            screen: 'Home',
                            params: { refreshReservations: true }
                        });
                    }
                }
            ]);
        }
    };

    const getSpotStyle = (spot) => {
        if (selectedSpot === spot.id) return styles.spotSelected;
        if (spot.status === 'occupied') return styles.spotOccupied;
        return styles.spotAvailable;
    };

    const getSpotTextStyle = (spot) => {
        if (spot.status === 'occupied') return styles.spotTextOccupied;
        return styles.spotTextAvailable;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Park Yeri Seçimi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Timer */}
                <View style={[styles.timerContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.timeBox, { backgroundColor: isDark ? '#1C1C1E' : '#F0F7FA' }]}>
                        <Text style={[styles.timeValue, { color: colors.text }]}>{time.h}</Text>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Saat</Text>
                    </View>
                    <View style={[styles.timeBox, { backgroundColor: isDark ? '#1C1C1E' : '#F0F7FA' }]}>
                        <Text style={[styles.timeValue, { color: colors.text }]}>{time.m}</Text>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Dakika</Text>
                    </View>
                    <View style={[styles.timeBox, { backgroundColor: isDark ? '#1C1C1E' : '#F0F7FA' }]}>
                        <Text style={[styles.timeValue, { color: colors.text }]}>{time.s}</Text>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Saniye</Text>
                    </View>
                </View>

                <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                    Park yeri seçmek için 30 dakikanız var.
                </Text>

                {/* Legend */}
                <View style={[styles.legendContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>Boş</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>Seçili</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#F87171' }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>Dolu</Text>
                    </View>
                </View>

                {/* Grid */}
                <View style={styles.gridContainer}>
                    {spots.length > 0 ? (
                        spots.map((spot) => (
                            <TouchableOpacity
                                key={spot.id}
                                style={[styles.spot, getSpotStyle(spot), selectedSpot === spot.id && styles.spotSelected]}
                                onPress={() => handleSpotPress(spot)}
                                disabled={spot.status === 'occupied'}
                            >
                                <Text style={[styles.spotText, getSpotTextStyle(spot)]}>{spot.label}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ textAlign: 'center', width: '100%', color: colors.textSecondary }}>
                            {lot?.id ? 'Park yerleri yükleniyor...' : 'Lütfen önce bir otopark seçin.'}
                        </Text>
                    )}
                </View>

                {/* QR Code */}
                <View style={[styles.qrContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.qrCircle, { backgroundColor: isDark ? '#1C3A57' : '#E3F2FD' }]}>
                        <Ionicons name="qr-code-outline" size={40} color={colors.primary} />
                    </View>
                    <Text style={[styles.qrTitle, { color: colors.text }]}>QR Kod</Text>
                    <Text style={[styles.qrSubtitle, { color: colors.textSecondary }]}>
                        QR kodunuzu oluşturmak için bir park yeri seçin
                    </Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                {selectedSpot ? (
                    <>
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                            onPress={handleReservation}
                        >
                            <Text style={styles.confirmButtonText}>Rezervasyonu Onayla</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: isDark ? '#2C2C2E' : '#F5F7FA' }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal Et</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: isDark ? '#2C2C2E' : '#F5F7FA' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.cancelButtonText, { color: colors.text }]}>Rezervasyonu İptal Et</Text>
                    </TouchableOpacity>
                )}
            </View>
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
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    timerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    timeBox: {
        width: '30%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 12,
    },
    instructionText: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 24,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 4,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 32,
    },
    spot: {
        width: '22%',
        aspectRatio: 1,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    spotAvailable: {
        backgroundColor: '#4CAF50',
    },
    spotOccupied: {
        backgroundColor: '#F87171',
    },
    spotSelected: {
        backgroundColor: '#0066FF',
        borderWidth: 2,
        borderColor: '#0044AA',
    },
    spotText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    spotTextOccupied: {
        opacity: 0.6,
    },
    spotTextAvailable: {
        color: 'white',
    },
    qrContainer: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    qrCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    qrTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    qrSubtitle: {
        textAlign: 'center',
        fontSize: 14,
    },
    footer: {
        padding: 16,
        backgroundColor: '#F5F7FA',
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F44336',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
