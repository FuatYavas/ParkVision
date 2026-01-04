import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppearanceScreen({ navigation }) {
    const systemTheme = useColorScheme(); // 'light' or 'dark'
    const [selectedTheme, setSelectedTheme] = useState('system');
    const [currentTheme, setCurrentTheme] = useState(systemTheme || 'light');

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        // Update current theme based on selection and system theme
        if (selectedTheme === 'system') {
            setCurrentTheme(systemTheme || 'light');
        } else {
            setCurrentTheme(selectedTheme);
        }
    }, [selectedTheme, systemTheme]);

    const loadThemePreference = async () => {
        try {
            const saved = await AsyncStorage.getItem('themePreference');
            if (saved) {
                setSelectedTheme(saved);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const handleThemeChange = async (themeId) => {
        setSelectedTheme(themeId);
        try {
            await AsyncStorage.setItem('themePreference', themeId);
            Alert.alert(
                'Theme Updated',
                `Theme changed to ${themeId === 'system' ? 'System Default' : themeId === 'light' ? 'Light' : 'Dark'}`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Failed to save theme preference:', error);
            Alert.alert('Error', 'Failed to save theme preference');
        }
    };

    const themes = [
        {
            id: 'light',
            name: 'Light',
            description: 'Always use light mode',
            icon: 'sunny-outline'
        },
        {
            id: 'dark',
            name: 'Dark',
            description: 'Always use dark mode',
            icon: 'moon-outline'
        },
        {
            id: 'system',
            name: 'System Default',
            description: `Automatically switch based on system settings (Currently: ${systemTheme || 'light'})`,
            icon: 'phone-portrait-outline'
        }
    ];

    const ThemeOption = ({ theme }) => (
        <TouchableOpacity
            style={[
                styles.themeCard,
                selectedTheme === theme.id && styles.themeCardSelected
            ]}
            onPress={() => handleThemeChange(theme.id)}
        >
            <View style={styles.themeCardLeft}>
                <View style={[
                    styles.iconContainer,
                    selectedTheme === theme.id && styles.iconContainerSelected
                ]}>
                    <Ionicons
                        name={theme.icon}
                        size={28}
                        color={selectedTheme === theme.id ? '#0066FF' : '#666'}
                    />
                </View>
                <View style={styles.themeInfo}>
                    <Text style={[
                        styles.themeName,
                        selectedTheme === theme.id && styles.themeNameSelected
                    ]}>
                        {theme.name}
                    </Text>
                    <Text style={styles.themeDescription}>{theme.description}</Text>
                </View>
            </View>
            {selectedTheme === theme.id && (
                <Ionicons name="checkmark-circle" size={24} color="#0066FF" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Appearance</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>THEME</Text>
                    {themes.map((theme) => (
                        <ThemeOption key={theme.id} theme={theme} />
                    ))}
                </View>

                {/* Current Theme Status */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Ionicons 
                            name={currentTheme === 'light' ? 'sunny' : 'moon'} 
                            size={24} 
                            color="#0066FF" 
                        />
                        <Text style={styles.statusTitle}>Current Theme</Text>
                    </View>
                    <Text style={styles.statusValue}>
                        {currentTheme === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </Text>
                    {selectedTheme === 'system' && (
                        <Text style={styles.statusNote}>
                            Following system theme: {systemTheme || 'light'}
                        </Text>
                    )}
                </View>

                <View style={styles.previewSection}>
                    <Text style={styles.sectionTitle}>PREVIEW</Text>
                    <View style={styles.previewCard}>
                        <View style={styles.previewHeader}>
                            <View style={styles.previewAvatar} />
                            <View style={styles.previewHeaderText}>
                                <View style={styles.previewLine} />
                                <View style={[styles.previewLine, { width: '60%', marginTop: 8 }]} />
                            </View>
                        </View>
                        <View style={styles.previewContent}>
                            <View style={[styles.previewLine, { width: '100%' }]} />
                            <View style={[styles.previewLine, { width: '90%', marginTop: 8 }]} />
                            <View style={[styles.previewLine, { width: '70%', marginTop: 8 }]} />
                        </View>
                        <View style={styles.previewButton}>
                            <View style={[styles.previewLine, { width: 100 }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#0066FF" />
                    <Text style={styles.infoText}>
                        Dark mode can help reduce eye strain in low-light environments and may save battery life on OLED screens. System Default automatically switches between light and dark based on your device settings.
                    </Text>
                </View>
            </ScrollView>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeCardSelected: {
        borderColor: '#0066FF',
        backgroundColor: '#F0F7FF',
    },
    themeCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#F5F7FA',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainerSelected: {
        backgroundColor: '#E3F2FD',
    },
    themeInfo: {
        flex: 1,
    },
    themeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    themeNameSelected: {
        color: '#0066FF',
    },
    themeDescription: {
        fontSize: 13,
        color: '#666',
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    statusValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0066FF',
        marginBottom: 4,
    },
    statusNote: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    previewSection: {
        marginBottom: 24,
    },
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    previewAvatar: {
        width: 48,
        height: 48,
        backgroundColor: '#E0E0E0',
        borderRadius: 24,
        marginRight: 12,
    },
    previewHeaderText: {
        flex: 1,
    },
    previewLine: {
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
    },
    previewContent: {
        marginBottom: 20,
    },
    previewButton: {
        padding: 12,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        alignItems: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});
