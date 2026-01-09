import React, { useEffect, useRef, useState } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { registerForPushNotificationsAsync, addNotificationReceivedListener, addNotificationResponseReceivedListener } from './services/notificationService';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MapScreen from './screens/MapScreen';
import ReservationScreen from './screens/ReservationScreen';
import MyReservationsScreen from './screens/MyReservationsScreen';
import FindMyCarScreen from './screens/FindMyCarScreen';
import ParkingDetailScreen from './screens/ParkingDetailScreen';
import NavigationScreen from './screens/NavigationScreen';
import ProfileScreen from './screens/ProfileScreen';
import PersonalInfoScreen from './screens/PersonalInfoScreen';
import VehiclesScreen from './screens/VehiclesScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AppearanceScreen from './screens/AppearanceScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';

// Expo Go'da push notification uyarılarını gizle (LogBox için)
LogBox.ignoreLogs([
  'expo-notifications',
  'Android Push notifications',
  'functionality is not fully supported in Expo Go',
]);

// Console'daki ERROR ve WARN mesajlarını da filtrele
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('expo-notifications') ||
    message.includes('Android Push notifications') ||
    message.includes('functionality is not fully supported')
  ) {
    return; // Bu mesajları gösterme
  }
  originalError(...args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('expo-notifications') ||
    message.includes('functionality is not fully supported') ||
    message.includes('development build')
  ) {
    return; // Bu mesajları gösterme
  }
  originalWarn(...args);
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'FindMyCar') {
            iconName = focused ? 'car' : 'car-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false, tabBarLabel: 'Harita' }} />
      <Tab.Screen
        name="Reservations"
        component={MyReservationsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Rezervasyonlarım'
        }}
      />
      <Tab.Screen
        name="FindMyCar"
        component={FindMyCarScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Arabam'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reservation"
          component={ReservationScreen}
          options={{
            title: 'Park Yeri Seçimi',
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="ParkingDetail"
          component={ParkingDetailScreen}
          options={{
            title: 'Otopark Detayı',
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="Navigation"
          component={NavigationScreen}
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="PersonalInfo"
          component={PersonalInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Vehicles"
          component={VehiclesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyReservations"
          component={MyReservationsScreen}
          options={{ title: 'Reservation History' }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Appearance"
          component={AppearanceScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Push notification token'ı al (Expo Go'da çalışmaz, sadece dev build'de)
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          // TODO: Token'ı backend'e gönder
        }
      })
      .catch(error => {
        // Expo Go veya emulator'da push notification token alınamaz - bu normal
      });

    // Bildirim geldiğinde listener
    notificationListener.current = addNotificationReceivedListener(notification => {
      // Bildirim alındı
    });

    // Bildirime tıklandığında listener
    responseListener.current = addNotificationResponseReceivedListener(response => {
      console.log('Bildirime tıklandı:', response);
      // TODO: Notification data'ya göre navigation yap
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
