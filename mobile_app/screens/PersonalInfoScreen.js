import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import { getCurrentUser, updateProfile, changePassword } from '../api';

export default function PersonalInfoScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    // Profile fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userData = await getCurrentUser();
            setFullName(userData.full_name || '');
            setEmail(userData.email || '');
            setPhone(userData.phone_number || '');
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            Alert.alert('Hata', 'Profil bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!fullName.trim()) {
            Alert.alert('Hata', 'Ad soyad gereklidir');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Hata', 'E-posta gereklidir');
            return;
        }

        try {
            setSaving(true);
            await updateProfile({
                full_name: fullName.trim(),
                email: email.trim(),
                phone_number: phone.trim() || null
            });
            Alert.alert('Başarılı', 'Profil başarıyla güncellendi');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to update profile:', error);
            Alert.alert('Hata', error.response?.data?.detail || 'Profil güncellenemedi');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm şifre alanlarını doldurun');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır');
            return;
        }

        try {
            setSaving(true);
            await changePassword(currentPassword, newPassword);
            Alert.alert('Başarılı', 'Şifre başarıyla değiştirildi', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setShowPasswordSection(false);
                    }
                }
            ]);
        } catch (error) {
            console.error('Failed to change password:', error);
            Alert.alert('Hata', error.response?.data?.detail || 'Şifre değiştirilemedi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Kişisel Bilgiler</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Profile Information Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROFİL BİLGİLERİ</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Ad Soyad</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Adınızı girin"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>E-posta</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="E-posta adresinizi girin"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Telefon Numarası</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Telefon numaranızı girin"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.disabledButton]}
                        onPress={handleSaveProfile}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Password Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ŞİFRE</Text>
                        <TouchableOpacity
                            onPress={() => setShowPasswordSection(!showPasswordSection)}
                        >
                            <Text style={[styles.changePasswordButton, { color: colors.primary }]}>
                                {showPasswordSection ? 'İptal' : 'Şifre Değiştir'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showPasswordSection && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Mevcut Şifre</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Mevcut şifrenizi girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Yeni Şifre</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Yeni şifrenizi girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Yeni Şifre Tekrar</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Yeni şifrenizi tekrar girin"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.changePasswordButton, { backgroundColor: colors.primary }, saving && styles.disabledButton]}
                                onPress={handleChangePassword}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Şifreyi Güncelle</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        letterSpacing: 1,
    },
    changePasswordButton: {
        fontSize: 14,
        color: '#0066FF',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    saveButton: {
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#999',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
