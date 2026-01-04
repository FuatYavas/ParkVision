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

import { getCurrentUser } from '../api';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState({
        full_name: 'Loading...',
        email: 'Loading...'
    });

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUserProfile();
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

    const menuItems = [
        {
            title: 'HESAP',
            items: [
                { icon: 'person-outline', label: 'Kişisel Bilgiler', route: 'PersonalInfo', active: true },
                { icon: 'car-outline', label: 'Araçlarım', route: 'Vehicles', active: true },
                { icon: 'card-outline', label: 'Ödeme Yöntemleri', route: 'Payment', active: false },
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
                { icon: 'notifications-outline', label: 'Bildirimler', route: 'Notifications', active: false },
                { icon: 'moon-outline', label: 'Görünüm', value: 'Sistem', route: 'Appearance', active: false },
                { icon: 'globe-outline', label: 'Dil', value: 'Türkçe', route: 'Language', active: false },
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
                <TouchableOpacity onPress={() => navigation.navigate('PersonalInfo')}>
                    <Text style={styles.editButton}>Düzenle</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Info */}
                <View style={styles.profileInfo}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{user.full_name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                </View>

                {/* Menu Items */}
                {menuItems.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[
                                        styles.menuItem,
                                        itemIndex === section.items.length - 1 && styles.lastMenuItem,
                                        !item.active && styles.menuItemDisabled
                                    ]}
                                    onPress={() => handleMenuItemPress(item)}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconBg, !item.active && styles.iconBgDisabled]}>
                                            <Ionicons
                                                name={item.icon}
                                                size={20}
                                                color={item.active ? "#0066FF" : "#999"}
                                            />
                                        </View>
                                        <Text style={[styles.menuItemLabel, !item.active && styles.menuItemLabelDisabled]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    <View style={styles.menuItemRight}>
                                        {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                                        <Ionicons name="chevron-forward" size={20} color="#999" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
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
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 4,
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
});
