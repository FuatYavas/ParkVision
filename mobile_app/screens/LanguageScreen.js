import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageScreen({ navigation }) {
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const languages = [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇬🇧'
        },
        {
            code: 'tr',
            name: 'Turkish',
            nativeName: 'Türkçe',
            flag: '🇹🇷'
        }
    ];

    const LanguageOption = ({ language }) => (
        <TouchableOpacity
            style={[
                styles.languageCard,
                selectedLanguage === language.code && styles.languageCardSelected
            ]}
            onPress={() => setSelectedLanguage(language.code)}
        >
            <View style={styles.languageLeft}>
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.languageInfo}>
                    <Text style={[
                        styles.languageName,
                        selectedLanguage === language.code && styles.languageNameSelected
                    ]}>
                        {language.name}
                    </Text>
                    <Text style={styles.languageNative}>{language.nativeName}</Text>
                </View>
            </View>
            {selectedLanguage === language.code && (
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
                <Text style={styles.headerTitle}>Language</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SELECT LANGUAGE</Text>
                    {languages.map((language) => (
                        <LanguageOption key={language.code} language={language} />
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#0066FF" />
                    <Text style={styles.infoText}>
                        The app will restart to apply the new language. Your data will be preserved.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => {
                        // In a real app, this would change the language
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.applyButtonText}>Apply Language</Text>
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
    languageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    languageCardSelected: {
        borderColor: '#0066FF',
        backgroundColor: '#F0F7FF',
    },
    languageLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    flag: {
        fontSize: 32,
        marginRight: 16,
    },
    languageInfo: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    languageNameSelected: {
        color: '#0066FF',
    },
    languageNative: {
        fontSize: 14,
        color: '#666',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    applyButton: {
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

