// Mock data for ParkVision app
// Elazığ locations for parking lots

export const mockParkingLots = [
    {
        id: 1,
        name: "Elazığ AVM Otoparkı",
        latitude: 38.6791,
        longitude: 39.2264,
        capacity: 150,
        current_occupancy: 120,
        hourly_rate: 15,
        is_active: true,
        address: "Sürsürü Mah. Hürriyet Cad. No:45, 23100 Elazığ Merkez/Elazığ",
        features: ['camera', 'security', 'covered'],
        rating: 4.5,
        distance: '0.5 km'
    },
    {
        id: 2,
        name: "Fırat Üniversitesi Otoparkı",
        latitude: 38.6753,
        longitude: 39.2215,
        capacity: 200,
        current_occupancy: 90,
        hourly_rate: 10,
        is_active: true,
        address: "Fırat Üniversitesi Kampüsü, 23119 Elazığ",
        features: ['camera', 'security'],
        rating: 4.2,
        distance: '2.1 km'
    },
    {
        id: 3,
        name: "Harput Kalesi Otopark",
        latitude: 38.6945,
        longitude: 39.2673,
        capacity: 80,
        current_occupancy: 25,
        hourly_rate: 12,
        is_active: true,
        address: "Harput Köyü, 23200 Elazığ",
        features: ['camera', 'outdoor'],
        rating: 4.7,
        distance: '4.8 km'
    },
    {
        id: 4,
        name: "Mavera AVM Otoparkı",
        latitude: 38.6805,
        longitude: 39.2195,
        capacity: 180,
        current_occupancy: 95,
        hourly_rate: 18,
        is_active: true,
        address: "Yıldızbağları Mah. Malatya Cad. No:12, 23100 Elazığ",
        features: ['camera', 'security', 'covered', 'ev_charging'],
        rating: 4.6,
        distance: '1.2 km'
    },
    {
        id: 5,
        name: "Devlet Hastanesi Otopark",
        latitude: 38.6718,
        longitude: 39.2112,
        capacity: 100,
        current_occupancy: 85,
        hourly_rate: 8,
        is_active: true,
        address: "Rızaiye Mah. Hastane Cad. No:1, 23100 Elazığ",
        features: ['camera', 'security', '24/7'],
        rating: 4.0,
        distance: '1.7 km'
    },
    {
        id: 6,
        name: "Park 23 AVM Otoparkı",
        latitude: 38.6842,
        longitude: 39.2301,
        capacity: 220,
        current_occupancy: 130,
        hourly_rate: 20,
        is_active: true,
        address: "İzzetpaşa Mah. Cumhuriyet Cad. No:78, 23100 Elazığ",
        features: ['camera', 'security', 'valet', 'covered'],
        rating: 4.8,
        distance: '0.8 km'
    },
    {
        id: 7,
        name: "Elazığ Otogarı Otoparkı",
        latitude: 38.6625,
        longitude: 39.2089,
        capacity: 150,
        current_occupancy: 70,
        hourly_rate: 10,
        is_active: true,
        address: "Otogar Meydanı, 23100 Elazığ Merkez/Elazığ",
        features: ['camera', 'security', '24/7'],
        rating: 3.9,
        distance: '3.2 km'
    },
    {
        id: 8,
        name: "Kent Meydanı Otoparkı",
        latitude: 38.6831,
        longitude: 39.2252,
        capacity: 120,
        current_occupancy: 55,
        hourly_rate: 12,
        is_active: true,
        address: "Kent Meydanı, Sürsürü Mah., 23100 Elazığ Merkez/Elazığ",
        features: ['camera', 'security', 'outdoor'],
        rating: 4.3,
        distance: '0.3 km'
    }
];

// Mock parking spots for each lot
export const generateMockSpots = (lotId, capacity = 20) => {
    const spots = [];
    const occupancyRate = mockParkingLots.find(lot => lot.id === lotId)?.current_occupancy /
        mockParkingLots.find(lot => lot.id === lotId)?.capacity || 0.5;

    for (let i = 1; i <= capacity; i++) {
        spots.push({
            id: `${lotId}-${i}`,
            spot_number: `A${i}`,
            parking_lot_id: lotId,
            is_occupied: Math.random() < occupancyRate,
            last_updated: new Date().toISOString()
        });
    }

    return spots;
};

// Mock reservations for current user
export const mockReservations = [
    {
        id: 1,
        spot_id: '1-15',
        spot_number: 'A15',
        parking_lot_id: 1,
        parking_lot_name: 'Elazığ AVM Otoparkı',
        start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
        end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
        status: 'active',
        price: 15
    },
    {
        id: 2,
        spot_id: '3-8',
        spot_number: 'A8',
        parking_lot_id: 3,
        parking_lot_name: 'Harput Kalesi Otopark',
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        end_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
        status: 'active',
        price: 12
    },
    {
        id: 3,
        spot_id: '6-42',
        spot_number: 'A42',
        parking_lot_id: 6,
        parking_lot_name: 'Park 23 AVM Otoparkı',
        start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        status: 'completed',
        price: 20
    }
];

// Kullanıcı konumuna göre dinamik otoparklar oluştur
const parkingNames = [
    "Merkez Otopark", "City Park", "Metro Otopark", "Plaza Otopark",
    "Belediye Otoparkı", "Hastane Otoparkı", "Çarşı Otopark", "Stadyum Otopark",
    "Terminal Otopark", "AVM Otoparkı", "İş Merkezi Otoparkı", "Kültür Merkezi Otopark"
];

const featuresOptions = [
    ['camera', 'security'],
    ['camera', 'security', 'covered'],
    ['camera', 'covered', 'ev_charging'],
    ['camera', 'security', 'wifi'],
    ['camera', 'outdoor'],
    ['camera', 'security', 'valet', 'covered']
];

export const generateDynamicParkingLots = (userLat, userLon, count = 8) => {
    const lots = [];

    for (let i = 0; i < count; i++) {
        // Kullanıcı etrafında rastgele konum (0.5-5 km yarıçapında)
        const distance = 0.005 + Math.random() * 0.045; // ~0.5km - 5km
        const angle = Math.random() * 2 * Math.PI;
        const lat = userLat + distance * Math.cos(angle);
        const lon = userLon + distance * Math.sin(angle);

        const capacity = 50 + Math.floor(Math.random() * 200);
        const occupancyRate = 0.3 + Math.random() * 0.6; // %30-90 doluluk

        lots.push({
            id: 100 + i,
            name: parkingNames[i % parkingNames.length],
            latitude: lat,
            longitude: lon,
            capacity: capacity,
            current_occupancy: Math.floor(capacity * occupancyRate),
            hourly_rate: 5 + Math.floor(Math.random() * 20),
            is_active: true,
            address: `Kullanıcı Yakını #${i + 1}`,
            features: featuresOptions[Math.floor(Math.random() * featuresOptions.length)],
            rating: (3.5 + Math.random() * 1.5).toFixed(1),
            distance: null // Dinamik hesaplanacak
        });
    }

    return lots;
};

export default {
    mockParkingLots,
    generateMockSpots,
    mockReservations,
    generateDynamicParkingLots
};
