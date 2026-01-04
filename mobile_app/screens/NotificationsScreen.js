import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = 'notification_settings';

const defaultSettings = {
    pushEnabled: true,
    reservationReminders: true,
    parkingUpdates: true,
    promotions: false,
    priceAlerts: true,
    expiryWarnings: true,
    sound: true,
    vibration: true,
};

export default function NotificationsScreen({ navigation }) {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
            if (stored) {
                setSettings({ ...defaultSettings, ...JSON.parse(stored) });
            }
        } catch (error) {
            console.error('Ayarlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (newSettings) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error('Ayarlar kaydedilirken hata:', error);
            Alert.alert('Hata', 'Ayarlar kaydedilemedi.');
        }
    };

    const toggleSetting = (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        
        // Eğer ana bildirimler kapatılırsa, tüm alt ayarları da kapat
        if (key === 'pushEnabled' && !newSettings.pushEnabled) {
            newSettings.reservationReminders = false;
            newSettings.parkingUpdates = false;
            newSettings.promotions = false;
            newSettings.priceAlerts = false;
            newSettings.expiryWarnings = false;
        }
        
        saveSettings(newSettings);
    };

    const notificationCategories = [
        {
            title: 'GENEL',
            items: [
                {
                    key: 'pushEnabled',
                    icon: 'notifications',
                    label: 'Bildirimler',
                    description: 'Tüm bildirimleri aç/kapat',
                    isMain: true,
                },
            ],
        },
        {
            title: 'BİLDİRİM TÜRLERİ',
            items: [
                {
                    key: 'reservationReminders',
                    icon: 'calendar-outline',
                    label: 'Rezervasyon Hatırlatıcıları',
                    description: 'Rezervasyon başlamadan önce bildirim al',
                },
                {
                    key: 'expiryWarnings',
                    icon: 'time-outline',
                    label: 'Süre Dolum Uyarıları',
                    description: 'Park süreniz dolmadan önce uyarı al',
                },
                {
                    key: 'parkingUpdates',
                    icon: 'car-outline',
                    label: 'Park Durumu Güncellemeleri',
                    description: 'Favori otoparklarda yer açıldığında bildirim',
                },
                {
                    key: 'priceAlerts',
                    icon: 'pricetag-outline',
                    label: 'Fiyat Değişiklikleri',
                    description: 'Favori otoparklarda fiyat değiştiğinde bildirim',
                },
                {
                    key: 'promotions',
                    icon: 'megaphone-outline',
                    label: 'Kampanya ve Duyurular',
                    description: 'İndirimler ve özel tekliflerden haberdar ol',
                },
            ],
        },
        {
            title: 'BİLDİRİM AYARLARI',
            items: [
                {
                    key: 'sound',
                    icon: 'volume-high-outline',
                    label: 'Ses',
                    description: 'Bildirim sesi',
                },
                {
                    key: 'vibration',
                    icon: 'phone-portrait-outline',
                    label: 'Titreşim',
                    description: 'Bildirim titreşimi',
                },
            ],
        },
    ];

    const renderSettingItem = (item) => {
        const isDisabled = !settings.pushEnabled && !item.isMain;
        
        return (
            <View 
                key={item.key} 
                style={[styles.settingItem, isDisabled && styles.settingItemDisabled]}
            >
                <View style={[styles.iconContainer, item.isMain && styles.iconContainerMain]}>
                    <Ionicons 
                        name={item.icon} 
                        size={22} 
                        color={item.isMain ? '#0066FF' : (isDisabled ? '#CCC' : '#666')} 
                    />
                </View>
                <View style={styles.settingContent}>
                    <Text style={[styles.settingLabel, isDisabled && styles.textDisabled]}>
                        {item.label}
                    </Text>
                    <Text style={[styles.settingDescription, isDisabled && styles.textDisabled]}>
                        {item.description}
                    </Text>
                </View>
                <Switch
                    value={settings[item.key]}
                    onValueChange={() => toggleSetting(item.key)}
                    trackColor={{ false: '#E0E0E0', true: '#81C784' }}
                    thumbColor={settings[item.key] ? '#4CAF50' : '#f4f3f4'}
                    disabled={isDisabled}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Banner */}
                <View style={[
                    styles.statusBanner,
                    settings.pushEnabled ? styles.statusBannerEnabled : styles.statusBannerDisabled
                ]}>
                    <Ionicons 
                        name={settings.pushEnabled ? "notifications" : "notifications-off"} 
                        size={24} 
                        color={settings.pushEnabled ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                        styles.statusText,
                        { color: settings.pushEnabled ? "#4CAF50" : "#F44336" }
                    ]}>
                        {settings.pushEnabled 
                            ? "Bildirimler açık" 
                            : "Bildirimler kapalı"}
                    </Text>
                </View>

                {notificationCategories.map((category) => (
                    <View key={category.title} style={styles.section}>
                        <Text style={styles.sectionTitle}>{category.title}</Text>
                        <View style={styles.sectionContent}>
                            {category.items.map(renderSettingItem)}
                        </View>
                    </View>
                ))}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        Bildirim ayarlarını değiştirmek için cihazınızın sistem ayarlarından da 
                        uygulama bildirimlerini yönetebilirsiniz.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
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
        flex: 1,
        padding: 16,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    statusBannerEnabled: {
        backgroundColor: '#E8F5E9',
    },
    statusBannerDisabled: {
        backgroundColor: '#FFEBEE',
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginLeft: 4,
    },
    sectionContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingItemDisabled: {
        opacity: 0.5,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconContainerMain: {
        backgroundColor: '#E3F2FD',
    },
    settingContent: {
        flex: 1,
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        color: '#666',
    },
    textDisabled: {
        color: '#CCC',
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
