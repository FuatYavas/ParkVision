import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getMyVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api';

const VEHICLE_TYPES = [
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'minivan', label: 'Minivan' },
    { value: 'motorcycle', label: 'Motosiklet' }
];

export default function VehiclesScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    // Form fields
    const [plateNumber, setPlateNumber] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [color, setColor] = useState('');
    const [vehicleType, setVehicleType] = useState('sedan');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await getMyVehicles();
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            Alert.alert('Hata', 'Araçlar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingVehicle(null);
        setPlateNumber('');
        setBrand('');
        setModel('');
        setColor('');
        setVehicleType('sedan');
        setModalVisible(true);
    };

    const openEditModal = (vehicle) => {
        setEditingVehicle(vehicle);
        setPlateNumber(vehicle.plate_number);
        setBrand(vehicle.brand);
        setModel(vehicle.model);
        setColor(vehicle.color);
        setVehicleType(vehicle.vehicle_type);
        setModalVisible(true);
    };

    const handleSaveVehicle = async () => {
        if (!plateNumber.trim() || !brand.trim() || !model.trim() || !color.trim()) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        try {
            const vehicleData = {
                plate_number: plateNumber.trim().toUpperCase(),
                brand: brand.trim(),
                model: model.trim(),
                color: color.trim(),
                vehicle_type: vehicleType
            };

            if (editingVehicle) {
                await updateVehicle(editingVehicle.id, vehicleData);
                Alert.alert('Başarılı', 'Araç başarıyla güncellendi');
            } else {
                await createVehicle(vehicleData);
                Alert.alert('Başarılı', 'Araç başarıyla eklendi');
            }

            setModalVisible(false);
            fetchVehicles();
        } catch (error) {
            console.error('Failed to save vehicle:', error);
            Alert.alert('Hata', error.response?.data?.detail || 'Araç kaydedilemedi');
        }
    };

    const handleDeleteVehicle = (vehicle) => {
        Alert.alert(
            'Aracı Sil',
            `${vehicle.brand} ${vehicle.model} aracını silmek istediğinizden emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVehicle(vehicle.id);
                            Alert.alert('Başarılı', 'Araç başarıyla silindi');
                            fetchVehicles();
                        } catch (error) {
                            console.error('Failed to delete vehicle:', error);
                            Alert.alert('Hata', 'Araç silinemedi');
                        }
                    }
                }
            ]
        );
    };

    const VehicleCard = ({ vehicle }) => (
        <View style={[styles.vehicleCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <View style={[styles.vehicleIconContainer, { backgroundColor: colors.iconBg }]}>
                <Ionicons name="car" size={32} color={colors.primary} />
            </View>
            <View style={styles.vehicleInfo}>
                <Text style={[styles.vehiclePlate, { color: colors.text }]}>{vehicle.plate_number}</Text>
                <Text style={[styles.vehicleDetails, { color: colors.textSecondary }]}>
                    {vehicle.brand} {vehicle.model}
                </Text>
                <Text style={[styles.vehicleColor, { color: colors.textSecondary }]}>{vehicle.color} • {vehicle.vehicle_type}</Text>
            </View>
            <View style={styles.vehicleActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: isDark ? '#333' : '#F5F5F5', borderRadius: 8 }]}
                    onPress={() => openEditModal(vehicle)}
                >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: isDark ? '#3E2723' : '#FFEBEE', borderRadius: 8 }]}
                    onPress={() => handleDeleteVehicle(vehicle)}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Araçlarım</Text>
                <TouchableOpacity onPress={openAddModal}>
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066FF" />
                </View>
            ) : vehicles.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="car-outline" size={64} color="#ccc" />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz araç eklenmedi</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                        <Text style={styles.addButtonText}>İlk Aracınızı Ekleyin</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {vehicles.map((vehicle) => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </ScrollView>
            )}

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, isDark && { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {editingVehicle ? 'Aracı Düzenle' : 'Araç Ekle'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Plaka</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={plateNumber}
                                    onChangeText={setPlateNumber}
                                    placeholder="örn: 34 ABC 123"
                                    placeholderTextColor={colors.textSecondary}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Marka</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={brand}
                                    onChangeText={setBrand}
                                    placeholder="örn: Toyota"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Model</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={model}
                                    onChangeText={setModel}
                                    placeholder="örn: Corolla"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Renk</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="örn: Beyaz"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Araç Tipi</Text>
                                <View style={styles.typeButtons}>
                                    {VEHICLE_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type.value}
                                            style={[
                                                styles.typeButton,
                                                { backgroundColor: colors.background, borderColor: colors.border },
                                                vehicleType === type.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                                            ]}
                                            onPress={() => setVehicleType(type.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.typeButtonText,
                                                    { color: colors.textSecondary },
                                                    vehicleType === type.value && styles.typeButtonTextActive
                                                ]}
                                            >
                                                {type.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.primary }]}
                            onPress={handleSaveVehicle}
                        >
                            <Text style={styles.saveButtonText}>
                                {editingVehicle ? 'Aracı Güncelle' : 'Araç Ekle'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#0066FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    vehicleCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    vehicleIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehiclePlate: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vehicleDetails: {
        fontSize: 14,
        marginBottom: 2,
    },
    vehicleColor: {
        fontSize: 12,
        color: '#999',
        textTransform: 'capitalize',
    },
    vehicleActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    typeButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    typeButtonActive: {
        backgroundColor: '#0066FF',
        borderColor: '#0066FF',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#0066FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
