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
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const features = [
        {
            icon: 'time-outline',
            title: 'Gerçek Zamanlı Doluluk',
            description: 'Park yeri müsaitliğini anlık olarak kontrol edin.'
        },
        {
            icon: 'calendar-outline',
            title: 'Kolay Rezervasyon',
            description: 'Birkaç dokunusla yerinizi önceden ayırtın.'
        },
        {
            icon: 'navigate-outline',
            title: 'Akıllı Navigasyon',
            description: 'Rezerve ettiğiniz yere adım adım yol tarifi alın.'
        }
    ];

    const handleGetStarted = () => {
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.iconGrid}>
                        <View style={styles.gridRow}>
                            <Ionicons name="map-outline" size={40} color="#003366" style={styles.gridIcon} />
                            <Ionicons name="calendar-outline" size={40} color="#003366" style={styles.gridIcon} />
                        </View>
                        <View style={styles.gridRow}>
                            <Ionicons name="navigate-outline" size={40} color="#003366" style={styles.gridIcon} />
                            <Ionicons name="car-outline" size={40} color="#003366" style={styles.gridIcon} />
                        </View>
                    </View>

                    <Text style={styles.title}>Akıllı Park Asistanınız</Text>
                    <Text style={styles.subtitle}>
                        Mükemmel park yerinizi kolayca bulun, rezerve edin ve navigasyonla ulaşın.
                    </Text>
                </View>

                {/* Features List (Hidden in main design but good for accessibility/alternative) */}
                {/* 
                <View style={styles.featuresList}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                            <Text style={styles.featureText}>{feature.title}</Text>
                        </View>
                    ))}
                </View>
                */}

                {/* Features Checklist */}
                <View style={styles.checklist}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.checklistItem}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#00D09C" />
                            <Text style={styles.checklistText}>{feature.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.skipButton} onPress={handleGetStarted}>
                        <Text style={styles.skipButtonText}>Atla</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
                        <Text style={styles.getStartedButtonText}>Başla</Text>
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
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 60,
    },
    iconGrid: {
        marginBottom: 40,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    gridIcon: {
        opacity: 0.8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#003366',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    checklist: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checklistText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    footer: {
        gap: 16,
        marginBottom: 20,
    },
    skipButton: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#003366',
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#003366',
        fontSize: 16,
        fontWeight: 'bold',
    },
    getStartedButton: {
        backgroundColor: '#003366',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    getStartedButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
