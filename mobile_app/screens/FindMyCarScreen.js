import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function FindMyCarScreen({ route, navigation }) {
    const [location, setLocation] = useState(null);

    // Get reservation data from params
    const reservation = route.params?.reservation;
    const parkingLot = reservation?.parkingLot || { name: 'Otopark', latitude: 38.6791, longitude: 39.2264 };
    const spotNumber = reservation?.spotNumber || 'A1';

    // Use actual parking location
    const parkedLocation = {
        latitude: parkingLot.latitude,
        longitude: parkingLot.longitude,
    };

    const initialRegion = {
        latitude: parkingLot.latitude,
        longitude: parkingLot.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Park Yeri Bulucum</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <MapView
                style={styles.map}
                initialRegion={initialRegion}
            >
                <Marker coordinate={parkedLocation}>
                    <View style={styles.markerContainer}>
                        <View style={styles.markerIconBg}>
                            <Ionicons name="car" size={20} color="white" />
                        </View>
                        <View style={styles.markerStem} />
                        <View style={styles.markerBase} />
                    </View>
                </Marker>
            </MapView>

            <View style={styles.bottomCard}>
                <View style={styles.locationInfo}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1590674899505-1c5c4195e969?q=80&w=200&auto=format&fit=crop' }}
                        style={styles.parkImage}
                    />
                    <View style={styles.textInfo}>
                        <Text style={styles.locationTitle}>{parkingLot.name} - Park Yeri: {spotNumber}</Text>
                        <Text style={styles.timeInfo}>Park Edildi: Az önce</Text>
                        <TouchableOpacity style={styles.photoLink}>
                            <Ionicons name="camera-outline" size={16} color="#0066FF" />
                            <Text style={styles.photoLinkText}>Fotografi Gor</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => Alert.alert('Yol Tarifi', 'Yürüyüş rotası oluşturuluyor...')}
                >
                    <Text style={styles.primaryButtonText}>Bana Yuruyus Yol Tarifi Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => Alert.alert('Konum Güncelle', 'Park konumu güncellendi.')}
                >
                    <Text style={styles.secondaryButtonText}>Park Konumunu Guncelle</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        backgroundColor: 'white',
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerIconBg: {
        width: 40,
        height: 40,
        backgroundColor: '#0066FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    markerStem: {
        width: 4,
        height: 20,
        backgroundColor: '#0066FF',
    },
    markerBase: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(0, 102, 255, 0.5)',
    },
    bottomCard: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    locationInfo: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    parkImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    textInfo: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    timeInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    photoLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    photoLinkText: {
        marginLeft: 4,
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#F5F7FA',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
