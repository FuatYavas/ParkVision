import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeType, setThemeType] = useState('system'); // 'light', 'dark', 'system'

    // Load saved theme on mount
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('app_theme');
            if (savedTheme) {
                setThemeType(savedTheme);
            }
        } catch (error) {
            console.log('Failed to load theme:', error);
        }
    };

    const setTheme = async (type) => {
        try {
            setThemeType(type);
            await AsyncStorage.setItem('app_theme', type);
        } catch (error) {
            console.log('Failed to save theme:', error);
        }
    };

    // Determine the actual active theme (light or dark)
    const activeTheme = themeType === 'system' ? systemScheme : themeType;
    const isDark = activeTheme === 'dark';

    // Define Colors
    const colors = {
        background: isDark ? '#121212' : '#F5F7FA',
        card: isDark ? '#1E1E1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#AAAAAA' : '#666666',
        border: isDark ? '#333333' : '#E5E5E5',
        primary: '#0066FF',
        divider: isDark ? '#2C2C2C' : '#F0F0F0',
        danger: '#F44336',
        success: '#4CAF50',
        cardHighlight: isDark ? '#2C2C2C' : '#E3F2FD',
        iconBg: isDark ? '#333333' : '#E3F2FD',
        dangerBg: isDark ? '#3E2723' : '#FFEBEE',
    };

    return (
        <ThemeContext.Provider value={{ themeType, setTheme, isDark, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
