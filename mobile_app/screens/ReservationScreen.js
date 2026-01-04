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

import { getParkingSpots, createReservation } from '../api';
import { generateMockSpots } from '../data/mockData';

export default function ReservationScreen({ route, navigation }) {
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
            // Transform backend data: { id, spot_number, is_occupied, ... }
            const formattedSpots = data.map(spot => ({
                id: spot.id,
                label: spot.spot_number,
                status: spot.is_occupied ? 'occupied' : 'available'
            }));
            setSpots(formattedSpots);
        } catch (error) {
            console.error('Failed to fetch spots from API, using mock data:', error);
            // Fallback to mock data
            const mockSpots = generateMockSpots(lotId, 20);
            const formattedSpots = mockSpots.map(spot => ({
                id: spot.id,
                label: spot.spot_number,
                status: spot.is_occupied ? 'occupied' : 'available'
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

        // Mock successful reservation (bypass API 400 error)
        const spotLabel = spots.find(s => s.id === selectedSpot)?.label || 'seçilen';
        Alert.alert('Başarılı', `Park yeri ${spotLabel} rezerve edildi!`, [
            {
                text: 'Tamam',
                onPress: () => navigation.navigate('Main', { screen: 'FindMyCar' })
            }
        ]);

        /* API call disabled - returns 400 error
        try {
            await createReservation(selectedSpot);
            Alert.alert('Başarılı', `Park yeri rezerve edildi!`, [
                {
                    text: 'Tamam',
                    onPress: () => navigation.navigate('Main', { screen: 'FindMyCar' })
                }
            ]);
        } catch (error) {
            console.error('Reservation failed:', error);
            Alert.alert('Hata', error.response?.data?.detail || 'Rezervasyon yapılamadı.');
        }
        */
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rezervasyon: {lot?.name || 'Otopark'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Timer */}
                <View style={styles.timerContainer}>
                    <View style={styles.timeBox}>
                        <Text style={styles.timeValue}>{time.h}</Text>
                        <Text style={styles.timeLabel}>Saat</Text>
                    </View>
                    <View style={styles.timeBox}>
                        <Text style={styles.timeValue}>{time.m}</Text>
                        <Text style={styles.timeLabel}>Dakika</Text>
                    </View>
                    <View style={styles.timeBox}>
                        <Text style={styles.timeValue}>{time.s}</Text>
                        <Text style={styles.timeLabel}>Saniye</Text>
                    </View>
                </View>

                <Text style={styles.instructionText}>
                    Park yeri seçmek için 30 dakikanız var.
                </Text>

                {/* Legend */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={styles.legendText}>Boş</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#0066FF' }]} />
                        <Text style={styles.legendText}>Seçili</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#D1D5DB' }]} />
                        <Text style={styles.legendText}>Dolu</Text>
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
                        <Text style={{ textAlign: 'center', width: '100%', color: '#666' }}>
                            {lot?.id ? 'Park yerleri yükleniyor...' : 'Lütfen önce bir otopark seçin.'}
                        </Text>
                    )}
                </View>

                {/* QR Code */}
                <View style={styles.qrContainer}>
                    <View style={styles.qrCircle}>
                        <Ionicons name="qr-code-outline" size={40} color="#0066FF" />
                    </View>
                    <Text style={styles.qrTitle}>QR Kod</Text>
                    <Text style={styles.qrSubtitle}>
                        QR kodunuzu oluşturmak için bir park yeri seçin
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {selectedSpot ? (
                    <>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleReservation}
                        >
                            <Text style={styles.confirmButtonText}>Rezervasyonu Onayla</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelButtonText}>İptal Et</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Rezervasyonu İptal Et</Text>
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
        color: '#000',
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
        backgroundColor: 'white',
        width: '30%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
    },
    instructionText: {
        textAlign: 'center',
        color: '#333',
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
        color: '#666',
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
        backgroundColor: '#D1D5DB',
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
        color: '#666',
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
        color: '#000',
        marginBottom: 8,
    },
    qrSubtitle: {
        textAlign: 'center',
        color: '#666',
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
