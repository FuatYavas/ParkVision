import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const features = [
        {
            icon: 'time',
            title: 'Gerçek Zamanlı Doluluk',
            color: '#22C55E'
        },
        {
            icon: 'calendar',
            title: 'Kolay Rezervasyon',
            color: '#0EA5E9'
        },
        {
            icon: 'navigate',
            title: 'Akıllı Navigasyon',
            color: '#8B5CF6'
        }
    ];

    const handleGetStarted = () => {
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Skip Button */}
            <TouchableOpacity 
                style={styles.skipButton} 
                onPress={handleGetStarted}
            >
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>Atla</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                {/* Hero Section */}
                <Animated.View 
                    style={[
                        styles.heroSection,
                        { 
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* App Icon/Logo Area */}
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="car-sport" size={48} color="white" />
                        </View>
                        <View style={[styles.logoPulse, { borderColor: colors.primary }]} />
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>
                        Akıllı Park Asistanınız
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Mükemmel park yerinizi kolayca bulun,{'\n'}rezerve edin ve navigasyonla ulaşın.
                    </Text>
                </Animated.View>

                {/* Features */}
                <Animated.View 
                    style={[
                        styles.featuresContainer,
                        { opacity: fadeAnim }
                    ]}
                >
                    {features.map((feature, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.featureCard,
                                { 
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                    transform: [{
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [30 * (index + 1), 0]
                                        })
                                    }]
                                }
                            ]}
                        >
                            <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                                <Ionicons name={feature.icon} size={28} color={feature.color} />
                            </View>
                            <Text style={[styles.featureTitle, { color: colors.text }]}>
                                {feature.title}
                            </Text>
                        </Animated.View>
                    ))}
                </Animated.View>
            </View>

            {/* CTA Button */}
            <Animated.View 
                style={[
                    styles.footer,
                    { opacity: fadeAnim }
                ]}
            >
                <TouchableOpacity 
                    style={[
                        styles.ctaButton, 
                        { 
                            backgroundColor: colors.primary,
                        }
                    ]} 
                    onPress={handleGetStarted}
                    activeOpacity={0.9}
                >
                    <Text style={styles.ctaText}>Hemen Başla</Text>
                    <Ionicons name="arrow-forward" size={22} color="white" />
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 24,
        right: 24,
        padding: 12,
        paddingHorizontal: 16,
        zIndex: 10,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        justifyContent: 'space-between',
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#0066FF',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    logoPulse: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        opacity: 0.2,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
        opacity: 0.7,
    },
    featuresContainer: {
        marginTop: 60,
        gap: 16,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    footer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 20,
    },
    ctaButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 18,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#0066FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    ctaText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
});
