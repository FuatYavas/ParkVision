import { useState, useEffect, useRef, useCallback } from 'react';
import { mockParkingLots } from '../data/mockData';
import * as Notifications from 'expo-notifications';

/**
 * Custom hook to simulate real-time parking updates
 * Mimics CV module + WebSocket behavior with mock data
 */
export const useLiveParkingUpdates = (intervalMs = 5000, favorites = []) => {
    // Format lots for MapScreen compatibility
    const formatLot = (lot) => ({
        ...lot,
        occupancy: Math.round((lot.current_occupancy / lot.capacity) * 100),
        price: lot.hourly_rate,
        isOpen: lot.is_active,
        isReservable: true
    });

    const [parkingLots, setParkingLots] = useState(() => mockParkingLots.map(formatLot));
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const previousOccupancyRef = useRef({});
    const timerRef = useRef(null);

    // Initialize previous occupancy
    useEffect(() => {
        const initial = {};
        mockParkingLots.forEach(lot => {
            initial[lot.id] = lot.current_occupancy;
        });
        previousOccupancyRef.current = initial;
    }, []);

    // Random update function
    const updateParkingLots = useCallback(() => {
        setParkingLots(prevLots => {
            const updatedLots = [...prevLots];
            
            // Select 1-2 random parking lots to update
            const lotsToUpdate = Math.floor(Math.random() * 2) + 1;
            const lotIndices = [];
            
            while (lotIndices.length < lotsToUpdate) {
                const randomIndex = Math.floor(Math.random() * updatedLots.length);
                if (!lotIndices.includes(randomIndex)) {
                    lotIndices.push(randomIndex);
                }
            }

            // Update selected lots
            lotIndices.forEach(index => {
                const lot = updatedLots[index];
                const previousOccupancy = previousOccupancyRef.current[lot.id] || lot.current_occupancy;
                
                // Random change: ±5-15%
                const changePercent = (Math.random() * 0.1 + 0.05) * lot.capacity; // 5-15% of capacity
                const change = Math.floor((Math.random() > 0.5 ? 1 : -1) * changePercent);
                
                let newOccupancy = lot.current_occupancy + change;
                
                // Keep within bounds
                newOccupancy = Math.max(0, Math.min(lot.capacity, newOccupancy));
                
                // Update occupancy
                const newOccupancyRate = Math.round((newOccupancy / lot.capacity) * 100);
                updatedLots[index] = {
                    ...lot,
                    current_occupancy: newOccupancy,
                    occupancy: newOccupancyRate,
                    empty_spots: lot.capacity - newOccupancy,
                    last_updated: new Date().toISOString()
                };

                // Check if this lot is in favorites and occupancy decreased significantly
                if (favorites.includes(lot.id)) {
                    const previousRate = (previousOccupancy / lot.capacity) * 100;
                    const newRate = (newOccupancy / lot.capacity) * 100;
                    
                    // Notify if went from >70% to <60%
                    if (previousRate >= 70 && newRate < 60) {
                        sendParkingAvailableNotification(lot.name, newRate);
                    }
                }

                // Update previous occupancy
                previousOccupancyRef.current[lot.id] = newOccupancy;
            });

            setLastUpdate(new Date());
            return updatedLots;
        });
    }, [favorites]);

    // Send notification when parking becomes available
    const sendParkingAvailableNotification = async (lotName, occupancyRate) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🎉 Yer Açıldı!',
                    body: `${lotName} artık müsait! Doluluk: %${Math.round(occupancyRate)}`,
                    data: { type: 'parking_available', lotName }
                },
                trigger: null // Immediate
            });
        } catch (error) {
            console.log('Notification error:', error);
        }
    };

    // Start/stop timer
    useEffect(() => {
        timerRef.current = setInterval(updateParkingLots, intervalMs);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [intervalMs, updateParkingLots]);

    // Manual refresh
    const refresh = useCallback(() => {
        updateParkingLots();
    }, [updateParkingLots]);

    // Get occupancy percentage for a lot
    const getOccupancyRate = useCallback((lotId) => {
        const lot = parkingLots.find(l => l.id === lotId);
        return lot ? Math.round((lot.current_occupancy / lot.capacity) * 100) : 0;
    }, [parkingLots]);

    // Get time since last update
    const getTimeSinceUpdate = useCallback(() => {
        const diffSeconds = Math.floor((new Date() - lastUpdate) / 1000);
        if (diffSeconds < 60) return `${diffSeconds} saniye önce`;
        const diffMinutes = Math.floor(diffSeconds / 60);
        return `${diffMinutes} dakika önce`;
    }, [lastUpdate]);

    return {
        parkingLots,
        lastUpdate,
        refresh,
        getOccupancyRate,
        getTimeSinceUpdate
    };
};

export default useLiveParkingUpdates;
