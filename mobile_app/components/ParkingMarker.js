import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

/**
 * Parking Marker Component
 * Simple and reliable marker design that works on Android
 */
export default function ParkingMarker({ lot, onPress, isCluster = false, pointCount = 0 }) {
    
    // Get color based on occupancy percentage
    const getColor = (occupancy) => {
        const occ = occupancy || 0;
        if (occ <= 40) return '#22C55E'; // Green - available
        if (occ <= 70) return '#F59E0B'; // Orange - moderate  
        return '#EF4444'; // Red - full
    };

    const color = getColor(lot.occupancy);

    // Cluster Marker
    if (isCluster) {
        return (
            <Marker
                coordinate={{
                    latitude: lot.latitude,
                    longitude: lot.longitude
                }}
                onPress={onPress}
                tracksViewChanges={false}
            >
                <View style={styles.clusterOuter}>
                    <View style={styles.clusterInner}>
                        <Ionicons name="car" size={16} color="#FFF" />
                        <Text style={styles.clusterCount}>{pointCount}</Text>
                    </View>
                </View>
            </Marker>
        );
    }

    // Regular Parking Marker
    return (
        <Marker
            coordinate={{
                latitude: lot.latitude,
                longitude: lot.longitude
            }}
            onPress={onPress}
            tracksViewChanges={false}
        >
            <View style={styles.container}>
                {/* Badge */}
                <View style={[styles.badge, { backgroundColor: color }]}>
                    <Ionicons name="car" size={12} color="#FFF" style={styles.icon} />
                    <Text style={styles.percentage}>{lot.occupancy || 0}%</Text>
                </View>
                {/* Arrow */}
                <View style={[styles.arrow, { borderTopColor: color }]} />
            </View>
        </Marker>
    );
}

const styles = StyleSheet.create({
    // Regular Marker
    container: {
        alignItems: 'center',
        width: 70,
        height: 50,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    icon: {
        marginRight: 3,
    },
    percentage: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderTopWidth: 8,
        borderStyle: 'solid',
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },
    
    // Cluster Marker
    clusterOuter: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clusterInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    clusterCount: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 2,
    },
});
