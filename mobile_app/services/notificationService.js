import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// Bildirim davranışını yapılandır
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Push notification izinlerini kontrol eder
 * NOT: Expo Go'da uzaktan push notification çalışmaz (SDK 53+)
 * Sadece local notifications (zamanlanmış bildirimler) çalışır
 * @returns {Promise<string|null>} Token (Expo Go'da null döner)
 */
export async function registerForPushNotificationsAsync() {
    let token = null;

    // Android 13+ için her platformda izin iste (Local notifications için)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        Alert.alert(
            'Bildirim İzni Gerekli',
            'Bildirimler için lütfen ayarlardan izin verin.'
        );
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        // Expo Go'da push token alınamaz (SDK 53+)
        // Development build gerekli, şimdilik local notifications kullanıyoruz
        console.log('✓ Bildirim izni alındı (Local notifications aktif)');
        return 'local-notifications-only';
    } else {
        console.log('✓ Emulator - Local notifications aktif');
        return 'emulator-token';
    }

    return token;
}

/**
 * Anında bildirim gönderir (test için)
 * @param {Object} notificationContent - Bildirim içeriği
 */
export async function schedulePushNotification(notificationContent) {
    const { title, body, data } = notificationContent;

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title || 'ParkVision',
                body: body || 'Yeni bildirim',
                data: data || {},
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                channelId: 'default', // Android için kanal ID'si zorunlu
            },
            trigger: null, // Anında göster (null = hemen)
        });
        console.log('Bildirim planlandı/gönderildi');
    } catch (error) {
        console.error('Bildirim gönderilemedi:', error);
        throw error; // Hatayı yukarı fırlat ki UI'da yakalayabilelim
    }
}

/**
 * Zamanlanmış bildirim gönderir
 * @param {Object} notificationContent - Bildirim içeriği
 * @param {number} seconds - Kaç saniye sonra gösterilecek
 */
export async function scheduleNotification(notificationContent, seconds = 3600) {
    const { title, body, data } = notificationContent;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title || 'ParkVision',
            body: body || 'Hatırlatma',
            data: data || {},
            sound: true,
        },
        trigger: { seconds },
    });
}

/**
 * Rezervasyon hatırlatıcısı zamanla
 * @param {string} parkingLotName - Otopark adı
 * @param {string} spotNumber - Park yeri numarası
 * @param {Date} reservationTime - Rezervasyon zamanı
 */
export async function scheduleReservationReminder(parkingLotName, spotNumber, reservationTime) {
    const now = new Date();
    const reservationDate = new Date(reservationTime);
    const timeDiff = (reservationDate - now) / 1000; // saniyeye çevir

    // 15 dakika önceden hatırlatma
    const reminderTime = timeDiff - (15 * 60);

    if (reminderTime > 0) {
        await scheduleNotification({
            title: '🚗 Rezervasyon Hatırlatması',
            body: `${parkingLotName} - ${spotNumber} numaralı park yeriniz 15 dakika sonra başlıyor.`,
            data: { type: 'reservation_reminder', parkingLotName, spotNumber }
        }, reminderTime);
    }
}

/**
 * Park süresi dolum uyarısı
 * @param {string} parkingLotName - Otopark adı
 * @param {number} minutesLeft - Kalan dakika
 */
export async function scheduleParkingExpiryWarning(parkingLotName, minutesLeft = 15) {
    await schedulePushNotification({
        title: '⏰ Park Süresi Dolmak Üzere',
        body: `${parkingLotName} - Park süreniz ${minutesLeft} dakika sonra dolacak.`,
        data: { type: 'parking_expiry', parkingLotName }
    });
}

/**
 * Favori otoparkta yer açıldı bildirimi
 * @param {string} parkingLotName - Otopark adı
 * @param {number} availableSpots - Boş yer sayısı
 */
export async function notifyFavoriteParkingAvailable(parkingLotName, availableSpots) {
    await schedulePushNotification({
        title: '🅿️ Favori Otoparkınızda Yer Açıldı',
        body: `${parkingLotName} otoparkında ${availableSpots} boş yer var!`,
        data: { type: 'favorite_available', parkingLotName }
    });
}

/**
 * Tüm zamanlanmış bildirimleri iptal et
 */
export async function cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Gelen bildirimi dinle
 * @param {Function} callback - Bildirim geldiğinde çalışacak fonksiyon
 * @returns {Subscription} Subscription objesi
 */
export function addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Bildirime tıklandığında dinle
 * @param {Function} callback - Bildirime tıklandığında çalışacak fonksiyon
 * @returns {Subscription} Subscription objesi
 */
export function addNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}
