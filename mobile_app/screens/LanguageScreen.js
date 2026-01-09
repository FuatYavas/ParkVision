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
import { useTheme } from '../context/ThemeContext';

const LANGUAGE_KEY = 'app_language';

const languageOptions = [
    { label: 'Türkçe', value: 'tr', flag: '🇹🇷' },
    { label: 'English', value: 'en', flag: '🇬🇧' },
];

export default function LanguageScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [language, setLanguage] = useState('tr');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (savedLanguage) {
                setLanguage(savedLanguage);
            }
        } catch (error) {
            console.log('Failed to load language settings:', error);
        }
    };

    const handleSelect = async (value) => {
        try {
            setLanguage(value);
            await AsyncStorage.setItem(LANGUAGE_KEY, value);
            // In a real app with i18n, you would change the locale here
        } catch (error) {
            console.log('Failed to save language settings:', error);
            Alert.alert('Hata', 'Ayarlar kaydedilemedi.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Dil</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DİL SEÇİNİ</Text>
                <View style={[styles.optionsContainer, { backgroundColor: colors.card }]}>
                    {languageOptions.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionItem,
                                { borderBottomColor: colors.border },
                                index === languageOptions.length - 1 && styles.lastOptionItem
                            ]}
                            onPress={() => handleSelect(option.value)}
                        >
                            <View style={styles.optionLeft}>
                                <Text style={styles.flag}>{option.flag}</Text>
                                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                            </View>
                            {language === option.value && (
                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info Note */}
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Dil değişikliği uygulamanın bazı bölümlerinde hemen etkili olmayabilir. Tam değişiklik için uygulamayı yeniden başlatmanız gerekebilir.
                    </Text>
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
        marginBottom: 24,
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
    flag: {
        fontSize: 24,
        marginRight: 12,
    },
    optionLabel: {
        fontSize: 16,
        color: '#333',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        marginLeft: 12,
        lineHeight: 18,
    },
});
