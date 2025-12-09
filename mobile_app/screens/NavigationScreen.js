import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function NavigationScreen({ navigation }) {
    const initialRegion = {
        latitude: 41.0082,
        longitude: 28.9784,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    const handleSaveLocation = () => {
        // In a real app, save location logic here
        navigation.navigate('Main', { screen: 'FindMyCar' });
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
            >
                <Marker coordinate={{ latitude: 41.0082, longitude: 28.9784 }} />
            </MapView>

            <SafeAreaView style={styles.overlay}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Otoparka yönlendiriliyorsunuz</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoContent}>
                        <Text style={styles.timeText}>5 dk</Text>
                        <Text style={styles.distanceText}>1.2 km</Text>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=200&auto=format&fit=crop' }}
                        style={styles.miniMap}
                    />
                </View>

                {/* Bottom Button */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocation}>
                        <View style={styles.iconBg}>
                            <Text style={styles.iconText}>P</Text>
                        </View>
                        <Text style={styles.saveButtonText}>Aracımı Bul olarak kaydet</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: width,
        height: height,
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingBottom: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoContent: {
        flex: 1,
    },
    timeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    distanceText: {
        fontSize: 16,
        color: '#666',
    },
    miniMap: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    saveButton: {
        backgroundColor: '#0066FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    iconBg: {
        width: 24,
        height: 24,
        backgroundColor: 'white',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        color: '#0066FF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
