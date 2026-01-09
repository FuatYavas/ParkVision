import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cvDetectionImages } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

export default function ParkingDetailScreen({ route, navigation }) {
    const { colors, isDark } = useTheme();
    const lot = route.params?.lot || {
        name: 'Örnek Otopark',
        occupancy: 56,
        capacity: 100,
        price: 25,
        hourly_rate: 25,
        isOpen: true,
        is_active: true,
        image: null
    };

    const [lastUpdate, setLastUpdate] = useState(new Date());
    // Each parking lot has its own fixed CV detection image based on ID
    const cvImageIndex = (lot.id - 1) % cvDetectionImages.length;

    // Mock detection stats (in real app, these come from CV module)
    const emptyCount = 5;
    const occupiedCount = 7;
    const occupancyRate = Math.round((occupiedCount / (emptyCount + occupiedCount)) * 100);

    // Simulate periodic updates (only timestamp, image stays same)
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdate(new Date());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getTimeSinceUpdate = () => {
        return Math.floor((new Date() - lastUpdate) / 1000);
    };

    // Re-render every second to update time display
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{lot.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* CV Detection View */}
                <View style={[styles.cvContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.cvHeader, { backgroundColor: isDark ? '#1C3A57' : '#F0F7FF', borderBottomColor: colors.border }]}>
                        <View style={styles.cvTitleRow}>
                            <Ionicons name="videocam" size={20} color={colors.primary} />
                            <Text style={[styles.cvTitle, { color: colors.primary }]}>CV Algılama Görüntüsü</Text>
                        </View>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>CANLI</Text>
                        </View>
                    </View>

                    {/* CV Model Result Image - Fixed per parking lot */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={cvDetectionImages[cvImageIndex]}
                            style={styles.parkingImage}
                            resizeMode="cover"
                        />
                        
                        {/* Model info overlay */}
                        <View style={styles.modelInfoOverlay}>
                            <Text style={styles.modelInfoText}>YOLOv8 • Roboflow Detection</Text>
                        </View>
                    </View>

                    {/* Update Info */}
                    <View style={[styles.updateInfo, { backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB' }]}>
                        <Ionicons name="refresh" size={14} color={colors.textSecondary} />
                        <Text style={[styles.updateText, { color: colors.textSecondary }]}>
                            Son güncelleme: {getTimeSinceUpdate()} saniye önce
                        </Text>
                    </View>
                </View>

                {/* Legend */}
                <View style={[styles.legendCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.legendTitle, { color: colors.text }]}>Gösterge</Text>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { borderColor: '#22C55E' }]}>
                                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                            </View>
                            <Text style={[styles.legendText, { color: colors.text }]}>Boş ({emptyCount})</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { borderColor: '#EF4444' }]}>
                                <Ionicons name="car" size={16} color="#EF4444" />
                            </View>
                            <Text style={[styles.legendText, { color: colors.text }]}>Dolu ({occupiedCount})</Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <Ionicons name="analytics-outline" size={24} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{occupancyRate}%</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Doluluk</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <Ionicons name="car-outline" size={24} color="#22C55E" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{emptyCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Boş Alan</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <Ionicons name="cash-outline" size={24} color="#F59E0B" />
                        <Text style={[styles.statValue, { color: colors.text }]}>{lot.hourly_rate || lot.price}₺</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saat</Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconBg, { backgroundColor: isDark ? '#1C3A57' : '#F0F7FF' }]}>
                            <Ionicons name="location-outline" size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={2}>
                            {lot.address || 'Elazığ Merkez'}
                        </Text>
                    </View>
                    <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconBg, { backgroundColor: isDark ? '#1C3A57' : '#F0F7FF' }]}>
                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {lot.isOpen || lot.is_active ? '24 Saat Açık' : 'Kapalı'}
                        </Text>
                        <View style={[
                            styles.statusBadge, 
                            { backgroundColor: (lot.isOpen || lot.is_active) ? '#DCFCE7' : '#FEE2E2' }
                        ]}>
                            <View style={[
                                styles.statusDot, 
                                { backgroundColor: (lot.isOpen || lot.is_active) ? '#22C55E' : '#EF4444' }
                            ]} />
                            <Text style={[
                                styles.statusText,
                                { color: (lot.isOpen || lot.is_active) ? '#22C55E' : '#EF4444' }
                            ]}>
                                {(lot.isOpen || lot.is_active) ? 'Açık' : 'Kapalı'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Spacer for footer */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.navButton, { backgroundColor: isDark ? '#1C3A57' : '#E3F2FD' }]}
                    onPress={() => navigation.navigate('Navigation', { lot })}
                >
                    <Ionicons name="navigate-outline" size={20} color={colors.primary} />
                    <Text style={[styles.navButtonText, { color: colors.primary }]}>Yol Tarifi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.reserveButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Reservation', { lot })}
                >
                    <Ionicons name="calendar-outline" size={20} color="white" />
                    <Text style={styles.reserveButtonText}>Rezerve Et</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    scrollContent: {
        padding: 16,
    },
    cvContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cvHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F0F7FF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    cvTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cvTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0066FF',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    liveText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: IMAGE_HEIGHT,
    },
    parkingImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    modelInfoOverlay: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    modelInfoText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
    },
    updateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#F9FAFB',
        gap: 6,
    },
    updateText: {
        fontSize: 12,
    },
    legendCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    legendTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendBox: {
        width: 36,
        height: 36,
        borderWidth: 2,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    legendText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 24,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
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
        gap: 8,
    },
    navButtonText: {
        color: '#0066FF',
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
        gap: 8,
    },
    reserveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
