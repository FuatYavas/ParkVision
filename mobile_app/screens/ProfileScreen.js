import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../context/ThemeContext';
import { getCurrentUser } from '../api';

export default function ProfileScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [user, setUser] = useState({
        full_name: 'Loading...',
        email: 'Loading...'
    });
    const [profileImage, setProfileImage] = useState(null);
    const [settings, setSettings] = useState({
        theme: 'system',
        language: 'tr'
    });

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUserProfile();
            loadProfileImage();
            loadSettings();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchUserProfile = async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.log('Failed to fetch user profile:', error);
        }
    };

    const loadProfileImage = async () => {
        try {
            const savedImage = await AsyncStorage.getItem('profile_image');
            if (savedImage) {
                setProfileImage(savedImage);
            }
        } catch (error) {
            console.log('Failed to load profile image:', error);
        }
    };

    const handleImageSelection = () => {
        Alert.alert(
            'Profil Fotoğrafı',
            'Fotoğrafınızı değiştirmek için bir yöntem seçin',
            [
                {
                    text: 'Kamera',
                    onPress: takePhoto
                },
                {
                    text: 'Galeri',
                    onPress: pickImage
                },
                {
                    text: 'İptal',
                    style: 'cancel'
                }
            ]
        );
    };

    const pickImage = async () => {
        // Galeri izni iste
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermeniz gerekiyor.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            saveProfileImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        // Kamera izni iste
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Kamera kullanmak için izin vermeniz gerekiyor.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            saveProfileImage(result.assets[0].uri);
        }
    };

    const saveProfileImage = async (uri) => {
        try {
            setProfileImage(uri);
            await AsyncStorage.setItem('profile_image', uri);
        } catch (error) {
            console.log('Failed to save profile image:', error);
        }
    };



    const loadSettings = async () => {
        try {
            const theme = await AsyncStorage.getItem('app_theme') || 'system';
            const language = await AsyncStorage.getItem('app_language') || 'tr';
            setSettings({ theme, language });
        } catch (error) {
            console.log('Failed to load settings:', error);
        }
    };

    // Listen to focus to reload settings (in case changed in AppearanceScreen via context)
    // Note: Since we use context, the UI updates automatically, but we might want to refresh the text label
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadSettings();
        });
        return unsubscribe;
    }, [navigation]);

    const getThemeLabel = (value) => {
        switch (value) {
            case 'light': return 'Açık';
            case 'dark': return 'Koyu';
            default: return 'Sistem';
        }
    };

    const getLanguageLabel = (value) => {
        switch (value) {
            case 'en': return 'English';
            default: return 'Türkçe';
        }
    };

    const menuItems = [
        {
            title: 'HESAP',
            items: [
                { icon: 'person-outline', label: 'Kişisel Bilgiler', route: 'PersonalInfo', active: true },
                { icon: 'car-outline', label: 'Araçlarım', route: 'Vehicles', active: true },
            ]
        },
        {
            title: 'AKTİVİTE',
            items: [
                { icon: 'time-outline', label: 'Rezervasyon Geçmişi', route: 'MyReservations', active: true },
                { icon: 'heart-outline', label: 'Favori Otoparklar', route: 'Favorites', active: true },
            ]
        },
        {
            title: 'AYARLAR',
            items: [
                { icon: 'notifications-outline', label: 'Bildirimler', route: 'Notifications', active: true },
                { icon: 'moon-outline', label: 'Görünüm', value: getThemeLabel(settings.theme), route: 'Appearance', active: true },
                { icon: 'globe-outline', label: 'Dil', value: getLanguageLabel(settings.language), route: 'Language', active: true },
            ]
        }
    ];

    const handleMenuItemPress = (item) => {
        if (item.active) {
            navigation.navigate(item.route);
        } else {
            Alert.alert('Yakında', `${item.label} özelliği henüz kullanıma açılmadı.`);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('token');
                            navigation.replace('Login');
                        } catch (error) {
                            console.error('Failed to logout:', error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
                <TouchableOpacity onPress={() => navigation.navigate('PersonalInfo')}>
                    <Text style={styles.editButton}>Düzenle</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Info */}
                <View style={styles.profileInfo}>
                    <TouchableOpacity onPress={handleImageSelection} style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
                            style={styles.avatar}
                        />
                        <View style={styles.cameraIconContainer}>
                            <Ionicons name="camera" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.name, { color: colors.text }]}>{user.full_name}</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
                </View>

                {/* Quick Actions */}
                <TouchableOpacity
                    style={[styles.searchParkingButton, { backgroundColor: colors.cardHighlight }]}
                    onPress={() => navigation.navigate('Map')}
                >
                    <View style={[styles.searchParkingIcon, { backgroundColor: colors.card }]}>
                        <Ionicons name="search" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.searchParkingTextContainer}>
                        <Text style={[styles.searchParkingTitle, { color: colors.primary }]}>Otopark Ara</Text>
                        <Text style={[styles.searchParkingSubtitle, { color: colors.textSecondary }]}>Yakınındaki otoparkları keşfet</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>

                {/* Menu Items */}
                {menuItems.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[
                                        styles.menuItem,
                                        itemIndex === section.items.length - 1 && styles.lastMenuItem,
                                        !item.active && styles.menuItemDisabled,
                                        { borderBottomColor: colors.divider }
                                    ]}
                                    onPress={() => handleMenuItemPress(item)}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[
                                            styles.iconBg,
                                            !item.active && styles.iconBgDisabled,
                                            { backgroundColor: item.active ? colors.iconBg : colors.divider }
                                        ]}>
                                            <Ionicons
                                                name={item.icon}
                                                size={20}
                                                color={item.active ? colors.primary : colors.textSecondary}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.menuItemLabel,
                                            !item.active && styles.menuItemLabelDisabled,
                                            { color: item.active ? colors.text : colors.textSecondary }
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    <View style={styles.menuItemRight}>
                                        {item.value && <Text style={[styles.menuItemValue, { color: colors.textSecondary }]}>{item.value}</Text>}
                                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.dangerBg }]} onPress={handleLogout}>
                    <Text style={[styles.logoutButtonText, { color: colors.danger }]}>Çıkış Yap</Text>
                </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F5F7FA',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    editButton: {
        fontSize: 16,
        color: '#0066FF',
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 0,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'white',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0066FF',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
    },
    sectionContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBg: {
        width: 36,
        height: 36,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemLabel: {
        fontSize: 16,
        color: '#333',
    },
    menuItemDisabled: {
        opacity: 0.5,
    },
    menuItemLabelDisabled: {
        color: '#999',
    },
    iconBgDisabled: {
        backgroundColor: '#F0F0F0',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemValue: {
        fontSize: 14,
        color: '#999',
        marginRight: 8,
    },
    logoutButton: {
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    logoutButtonText: {
        color: '#F44336',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchParkingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    searchParkingIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'white',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    searchParkingTextContainer: {
        flex: 1,
    },
    searchParkingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0066FF',
        marginBottom: 2,
    },
    searchParkingSubtitle: {
        fontSize: 12,
        color: '#666',
    },
});
