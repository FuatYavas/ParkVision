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
import { useTheme } from '../context/ThemeContext';

const themeOptions = [
    { label: 'Sistem', value: 'system', icon: 'phone-portrait-outline' },
    { label: 'Açık', value: 'light', icon: 'sunny-outline' },
    { label: 'Koyu', value: 'dark', icon: 'moon-outline' },
];

export default function AppearanceScreen({ navigation }) {
    const { themeType, setTheme, colors, isDark } = useTheme();

    const handleSelect = (value) => {
        setTheme(value);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Görünüm</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>TEMA SEÇİNİ</Text>
                <View style={[styles.optionsContainer, { backgroundColor: colors.card }]}>
                    {themeOptions.map((option, index) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionItem,
                                index === themeOptions.length - 1 && styles.lastOptionItem,
                                { borderBottomColor: colors.border }
                            ]}
                            onPress={() => handleSelect(option.value)}
                        >
                            <View style={styles.optionLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name={option.icon} size={22} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                            </View>
                            {themeType === option.value && (
                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
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
