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

export default function MyReservationsScreen({ navigation }) {
    const [reservations, setReservations] = useState([
        // Mock active reservation
        {
            id: 1,
            parkingLotName: 'Elazığ AVM Otoparkı',
            spotNumber: 'A5',
            startTime: new Date(), // Now
            endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 mins from now  
            price: 15,
            status: 'active',
            latitude: 38.6791,
            longitude: 39.2264
        }
    ]);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const diff = new Date(endTime) - now;

        if (diff <= 0) return 'Süresi Doldu';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleCancelReservation = (reservationId) => {
        Alert.alert(
            'Rezervasyonu Iptal Et',
            'Bu rezervasyonu iptal etmek istediginizden emin misiniz?',
            [
                { text: 'Hayir', style: 'cancel' },
                {
                    text: 'Evet, Iptal Et',
                    style: 'destructive',
                    onPress: () => {
                        setReservations(reservations.filter(r => r.id !== reservationId));
                        Alert.alert('Basarili', 'Rezervasyon iptal edildi.');
                    }
                }
            ]
        );
    };

    const handleViewOnMap = (reservation) => {
        navigation.navigate('Main', {
            screen: 'FindMyCar',
            params: {
                reservation: {
                    parkingLot: {
                        name: reservation.parkingLotName,
                        latitude: reservation.latitude,
                        longitude: reservation.longitude
                    },
                    spotNumber: reservation.spotNumber,
                    timestamp: reservation.startTime.toISOString()
                }
            }
        });
    };

    const activeReservations = reservations.filter(r => r.status === 'active');
    const pastReservations = reservations.filter(r => r.status !== 'active');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Rezervasyonlarim</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeReservations.length === 0 && pastReservations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>Henuz Rezervasyon Yok</Text>
                        <Text style={styles.emptyText}>
                            Haritadan bir otopark seçerek rezervasyon yapabilirsiniz.
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('Map')}
                        >
                            <Text style={styles.browseButtonText}>Otopark Ara</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Active Reservations */}
                        {activeReservations.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>AKTIF REZERVASYONLAR</Text>
                                {activeReservations.map((reservation) => (
                                    <View key={reservation.id} style={styles.reservationCard}>
                                        <View style={styles.cardHeader}>
                                            <View>
                                                <Text style={styles.parkingName}>{reservation.parkingLotName}</Text>
                                                <Text style={styles.spotNumber}>Park Yeri: {reservation.spotNumber}</Text>
                                            </View>
                                            <View style={styles.statusBadge}>
                                                <View style={styles.statusDot} />
                                                <Text style={styles.statusText}>Aktif</Text>
                                            </View>
                                        </View>

                                        <View style={styles.timerContainer}>
                                            <Ionicons name="time-outline" size={20} color="#0066FF" />
                                            <Text style={styles.timerLabel}>Kalan Sure:</Text>
                                            <Text style={styles.timerValue}>{getTimeRemaining(reservation.endTime)}</Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Text style={styles.infoLabel}>Ucret</Text>
                                                <Text style={styles.infoValue}>{reservation.price}TL/saat</Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Text style={styles.infoLabel}>Baslangic</Text>
                                                <Text style={styles.infoValue}>
                                                    {new Date(reservation.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Text style={styles.infoLabel}>Bitis</Text>
                                                <Text style={styles.infoValue}>
                                                    {new Date(reservation.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.cardActions}>
                                            <TouchableOpacity
                                                style={styles.mapButton}
                                                onPress={() => handleViewOnMap(reservation)}
                                            >
                                                <Ionicons name="map-outline" size={18} color="#0066FF" />
                                                <Text style={styles.mapButtonText}>Haritada Gor</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={() => handleCancelReservation(reservation.id)}
                                            >
                                                <Ionicons name="close-circle-outline" size={18} color="#F44336" />
                                                <Text style={styles.cancelButtonText}>Iptal Et</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Past Reservations */}
                        {pastReservations.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>GECMIS REZERVASYONLAR</Text>
                                {pastReservations.map((reservation) => (
                                    <View key={reservation.id} style={[styles.reservationCard, styles.pastCard]}>
                                        <Text style={styles.parkingName}>{reservation.parkingLotName}</Text>
                                        <Text style={styles.spotNumber}>Park Yeri: {reservation.spotNumber}</Text>
                                        <Text style={styles.pastDate}>
                                            {new Date(reservation.startTime).toLocaleDateString('tr-TR')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 16,
    },
    emptyState: {
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
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 32,
    },
    browseButton: {
        backgroundColor: '#0066FF',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
    },
    browseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        marginBottom: 12,
        letterSpacing: 1,
    },
    reservationCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    parkingName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    spotNumber: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    timerLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        marginRight: 8,
    },
    timerValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0066FF',
        flex: 1,
        textAlign: 'right',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    mapButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 12,
    },
    mapButtonText: {
        marginLeft: 6,
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '600',
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 12,
    },
    cancelButtonText: {
        marginLeft: 6,
        color: '#F44336',
        fontSize: 14,
        fontWeight: '600',
    },
    pastCard: {
        opacity: 0.7,
    },
    pastDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
});
