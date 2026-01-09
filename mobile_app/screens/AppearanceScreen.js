import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

const themeOptions = [
    { label: 'Sistem', value: 'system', icon: 'phone-portrait-outline' },
    { label: 'Açık', value: 'light', icon: 'sunny-outline' },
    { label: 'Koyu', value: 'dark', icon: 'moon-outline' },
];

export default function AppearanceScreen({ navigation }) {
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme) {
                setTheme(savedTheme);
            }
        } catch (error) {
            console.log('Failed to load theme settings:', error);
        }
    };

    const handleSelect = async (value) => {
        try {
            setTheme(value);
            await AsyncStorage.setItem(THEME_KEY, value);
            // In a real app with theming context, you would update the context here
        } catch (error) {
            console.log('Failed to save theme settings:', error);
            Alert.alert('Hata', 'Ayarlar kaydedilemedi.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Görünüm</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>TEMA SEÇİNİ</Text>
                <View style={styles.optionsContainer}>
                    {themeOptions.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionItem,
                                index === themeOptions.length - 1 && styles.lastOptionItem
                            ]}
                            onPress={() => handleSelect(option.value)}
                        >
                            <View style={styles.optionLeft}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={option.icon} size={22} color="#666" />
                                </View>
                                <Text style={styles.optionLabel}>{option.label}</Text>
                            </View>
                            {theme === option.value && (
                                <Ionicons name="checkmark-circle" size={24} color="#0066FF" />
                            )}
                        </TouchableOpacity>
                    ))}
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
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
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
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
    },
    optionsContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    lastOptionItem: {
        borderBottomWidth: 0,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionLabel: {
        fontSize: 16,
        color: '#333',
    },
});
