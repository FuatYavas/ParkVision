import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState({
        reservationReminders: true,
        parkingExpiring: true,
        specialOffers: false,
        nearbyAvailability: true,
        priceDrops: false,
        appUpdates: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const NotificationItem = ({ icon, title, description, value, onToggle }) => (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={22} color="#0066FF" />
                </View>
                <View style={styles.itemText}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemDescription}>{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#E0E0E0', true: '#0066FF' }}
                thumbColor="#fff"
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Parking Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PARKING NOTIFICATIONS</Text>
                    <View style={styles.sectionContent}>
                        <NotificationItem
                            icon="time-outline"
                            title="Reservation Reminders"
                            description="Get notified before your reservation time"
                            value={notifications.reservationReminders}
                            onToggle={() => toggleNotification('reservationReminders')}
                        />
                        <NotificationItem
                            icon="alert-circle-outline"
                            title="Parking Expiring"
                            description="Alert when parking time is about to expire"
                            value={notifications.parkingExpiring}
                            onToggle={() => toggleNotification('parkingExpiring')}
                        />
                        <NotificationItem
                            icon="location-outline"
                            title="Nearby Availability"
                            description="Notify about available spots near you"
                            value={notifications.nearbyAvailability}
                            onToggle={() => toggleNotification('nearbyAvailability')}
                        />
                    </View>
                </View>

                {/* Promotional Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROMOTIONAL</Text>
                    <View style={styles.sectionContent}>
                        <NotificationItem
                            icon="pricetag-outline"
                            title="Special Offers"
                            description="Receive exclusive deals and discounts"
                            value={notifications.specialOffers}
                            onToggle={() => toggleNotification('specialOffers')}
                        />
                        <NotificationItem
                            icon="trending-down-outline"
                            title="Price Drops"
                            description="Get alerted about price reductions"
                            value={notifications.priceDrops}
                            onToggle={() => toggleNotification('priceDrops')}
                        />
                    </View>
                </View>

                {/* App Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>APP NOTIFICATIONS</Text>
                    <View style={styles.sectionContent}>
                        <NotificationItem
                            icon="download-outline"
                            title="App Updates"
                            description="Stay informed about new features"
                            value={notifications.appUpdates}
                            onToggle={() => toggleNotification('appUpdates')}
                        />
                    </View>
                </View>

                {/* Notification Channels */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NOTIFICATION CHANNELS</Text>
                    <View style={styles.sectionContent}>
                        <NotificationItem
                            icon="notifications-outline"
                            title="Push Notifications"
                            description="Receive notifications on your device"
                            value={notifications.pushNotifications}
                            onToggle={() => toggleNotification('pushNotifications')}
                        />
                        <NotificationItem
                            icon="mail-outline"
                            title="Email Notifications"
                            description="Receive updates via email"
                            value={notifications.emailNotifications}
                            onToggle={() => toggleNotification('emailNotifications')}
                        />
                        <NotificationItem
                            icon="chatbubble-outline"
                            title="SMS Notifications"
                            description="Receive text messages for important updates"
                            value={notifications.smsNotifications}
                            onToggle={() => toggleNotification('smsNotifications')}
                        />
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#0066FF" />
                    <Text style={styles.infoText}>
                        You can manage these preferences anytime. Critical notifications like payment confirmations will always be sent.
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
    sectionContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#E3F2FD',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemText: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 13,
        color: '#666',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});

