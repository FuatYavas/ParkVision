// Mock data for ParkVision app
// Elazığ locations for parking lots

// CV detection sample images from Roboflow model
// These are real YOLOv8 model outputs with bounding boxes
export const cvDetectionImages = [
    require('../assets/images/cv_processed_1.jpg'),
    require('../assets/images/cv_processed_2.jpg'),
    require('../assets/images/cv_processed_3.jpg'),
    require('../assets/images/cv_processed_4.jpg'),
    require('../assets/images/cv_processed_5.jpg'),
];

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
        distance: '0.5 km',
        image: require('../assets/images/parking1.jpg'),
        total_spots: 150,
        empty_spots: 30,
        last_updated: new Date().toISOString()
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
        distance: '2.1 km',
        image: require('../assets/images/parking2.jpg'),
        total_spots: 200,
        empty_spots: 110,
        last_updated: new Date().toISOString()
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
        distance: '4.8 km',
        image: require('../assets/images/parking3.jpg'),
        total_spots: 80,
        empty_spots: 55,
        last_updated: new Date().toISOString()
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
        distance: '1.2 km',
        image: require('../assets/images/parking4.jpg'),
        total_spots: 180,
        empty_spots: 85,
        last_updated: new Date().toISOString()
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
        distance: '1.7 km',
        image: require('../assets/images/parking5.jpg'),
        total_spots: 100,
        empty_spots: 15,
        last_updated: new Date().toISOString()
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
        distance: '0.8 km',
        image: require('../assets/images/parking6.jpg'),
        total_spots: 220,
        empty_spots: 90,
        last_updated: new Date().toISOString()
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
        distance: '3.2 km',
        image: require('../assets/images/parking7.jpg'),
        total_spots: 150,
        empty_spots: 80,
        last_updated: new Date().toISOString()
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
        distance: '0.3 km',
        image: require('../assets/images/parking8.jpg'),
        total_spots: 120,
        empty_spots: 65,
        last_updated: new Date().toISOString()
    }
];

// Mock parking spots for each lot with CV-like detection data
export const generateMockSpots = (lotId, spotsCount = 20) => {
    const spots = [];
    const lot = mockParkingLots.find(l => l.id === lotId);
    const occupancyRate = lot ? (lot.current_occupancy / lot.capacity) : 0.5;

    // Generate spots in grid pattern (simulating real parking lot layout)
    const rows = Math.ceil(Math.sqrt(spotsCount));
    const cols = Math.ceil(spotsCount / rows);

    for (let i = 0; i < spotsCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        
        spots.push({
            id: `${lotId}-${i + 1}`,
            spot_number: `${String.fromCharCode(65 + row)}${col + 1}`, // A1, A2, B1, B2...
            parking_lot_id: lotId,
            status: Math.random() < occupancyRate ? 'occupied' : 'empty',
            // Simulated CV detection data
            x: 50 + (col * 80), // Grid coordinates
            y: 50 + (row * 60),
            width: 70,
            height: 50,
            confidence: 0.5 + Math.random() * 0.4, // 0.5-0.9 confidence
            class_name: Math.random() < occupancyRate ? 'occupied' : 'empty',
            last_updated: new Date().toISOString()
        });
    }

    return spots;
};

// Add spots to each parking lot (CV detection simulation)
mockParkingLots.forEach(lot => {
    lot.spots = generateMockSpots(lot.id, 24);
});

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

export default {
    mockParkingLots,
    generateMockSpots,
    mockReservations
};
