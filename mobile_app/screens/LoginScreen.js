import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { login } from '../api';

export default function LoginScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleForgotPassword = () => {
        if (!email) {
            Alert.alert('Email Gerekli', 'Lütfen email adresinizi girin.');
            return;
        }
        Alert.alert(
            'Şifre Sıfırlama',
            `${email} adresine şifre sıfırlama linki gönderildi.\n\nNot: Bu özellik demo modunda çalışmaktadır.`,
            [{ text: 'Tamam' }]
        );
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        try {
            await login(email, password);
            navigation.replace('Main');
        } catch (error) {
            console.error('Login failed:', error);

            let errorMessage = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
            } else if (error.response) {
                errorMessage = error.response.data?.detail || 'Giriş yapılamadı. Email veya şifre hatalı.';
            }

            Alert.alert('Hata', errorMessage);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                        <Text style={styles.logoText}>P</Text>
                    </View>
                </View>

                {/* Header */}
                <Text style={[styles.title, { color: colors.text }]}>Giriş Yap</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Devam etmek için giriş yapın.</Text>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                        placeholder="email@adresiniz.com"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Şifre</Text>
                    <View style={[styles.passwordContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.passwordInput, { color: colors.text }]}
                            placeholder="Şifrenizi girin"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={24}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Şifremi Unuttum?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.primary }]} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Hesabın yok mu? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={[styles.registerText, { color: colors.primary }]}>Kayıt ol</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoBox: {
        width: 60,
        height: 60,
        backgroundColor: '#0066FF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#000',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#0066FF',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#0066FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#666',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
    },
    googleIcon: {
        marginRight: 12,
    },
    googleButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#22C55E',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    demoIcon: {
        marginRight: 12,
    },
    demoButtonText: {
        color: '#22C55E',
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    registerText: {
        color: '#0066FF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
