import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ParkingDetailScreen({ route, navigation }) {
    // Use params if available, otherwise mock data
    const lot = route.params?.lot || {
        name: 'İstinyePark AVM Otoparkı',
        occupancy: 56,
        capacity: 100,
        price: 25,
        isOpen: true,
        isReservable: true
    };

    const emptySpots = Math.floor(lot.capacity * (1 - lot.occupancy / 100));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{lot.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=2000&auto=format&fit=crop' }}
                    style={styles.image}
                />

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Doluluk Oranı</Text>
                        <Text style={styles.statValue}>{lot.occupancy}%</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Boş Alan</Text>
                        <Text style={styles.statValue}>{emptySpots}</Text>
                    </View>
                </View>

                <View style={styles.priceCard}>
                    <Text style={styles.statLabel}>Saatlik Fiyat</Text>
                    <Text style={styles.priceValue}>{lot.price}₺</Text>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                        </View>
                        <Text style={styles.infoLabel}>Açık/Kapalı Durumu</Text>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: lot.isOpen ? '#4CAF50' : '#F44336' }]} />
                            <Text style={[styles.statusText, { color: lot.isOpen ? '#4CAF50' : '#F44336' }]}>
                                {lot.isOpen ? 'Açık' : 'Kapalı'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoIconBg}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
                        </View>
                        <Text style={styles.infoLabel}>Rezervasyon Uygunluğu</Text>
                        <View style={styles.statusBadge}>
                            <View style={[styles.statusDot, { backgroundColor: lot.isReservable ? '#4CAF50' : '#F44336' }]} />
                            <Text style={[styles.statusText, { color: lot.isReservable ? '#4CAF50' : '#F44336' }]}>
                                {lot.isReservable ? 'Uygun' : 'Uygun Değil'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.reserveButton}
                    onPress={() => navigation.navigate('Reservation', { lot })}
                >
                    <Text style={styles.reserveButtonText}>Rezerve Et</Text>
                </TouchableOpacity>

                <View style={styles.footerButtonsRow}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Navigation', { lot })}
                    >
                        <Ionicons name="navigate-outline" size={20} color="#0066FF" />
                        <Text style={styles.secondaryButtonText}>Navigasyon</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Navigation', { lot })}
                    >
                        <Ionicons name="map-outline" size={20} color="#0066FF" />
                        <Text style={styles.secondaryButtonText}>Yol Tarifi</Text>
                    </TouchableOpacity>
                </View>
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
    scrollContent: {
        padding: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
    priceCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    priceValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 100, // Space for footer
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoIconBg: {
        width: 36,
        height: 36,
        backgroundColor: '#F5F7FA',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    reserveButton: {
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    reserveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 12,
    },
    secondaryButtonText: {
        marginLeft: 8,
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '600',
    },
});
