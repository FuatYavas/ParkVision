import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';

const ParkingLots = () => {
    const [parkingLots, setParkingLots] = useState([]);
    const [newLot, setNewLot] = useState({ name: '', address: '', capacity: 0, hourly_rate: 0 });

    useEffect(() => {
        fetchParkingLots();
    }, []);

    const fetchParkingLots = async () => {
        try {
            const response = await api.get('/parking-lots/');
            setParkingLots(response.data);
        } catch (error) {
            console.error('Error fetching parking lots', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/parking-lots/', {
                ...newLot,
                latitude: 0, // Mock coords
                longitude: 0,
                is_active: true
            });
            fetchParkingLots();
            setNewLot({ name: '', address: '', capacity: 0, hourly_rate: 0 });
        } catch (error) {
            alert('Error creating parking lot');
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-100 min-h-screen">
                <h2 className="text-3xl font-bold mb-6">Parking Lots</h2>

                <div className="bg-white p-6 rounded shadow mb-8">
                    <h3 className="text-xl font-semibold mb-4">Add New Parking Lot</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Name" className="border p-2 rounded"
                            value={newLot.name} onChange={e => setNewLot({ ...newLot, name: e.target.value })}
                        />
                        <input
                            placeholder="Address" className="border p-2 rounded"
                            value={newLot.address} onChange={e => setNewLot({ ...newLot, address: e.target.value })}
                        />
                        <input
                            type="number" placeholder="Capacity" className="border p-2 rounded"
                            value={newLot.capacity} onChange={e => setNewLot({ ...newLot, capacity: parseInt(e.target.value) })}
                        />
                        <input
                            type="number" placeholder="Hourly Rate" className="border p-2 rounded"
                            value={newLot.hourly_rate} onChange={e => setNewLot({ ...newLot, hourly_rate: parseFloat(e.target.value) })}
                        />
                        <button className="bg-green-500 text-white p-2 rounded col-span-2">Create</button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {parkingLots.map(lot => (
                        <div key={lot.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{lot.name}</h3>
                                <p className="text-gray-600">{lot.address}</p>
                            </div>
                            <div className="text-right">
                                <p>{lot.capacity} spots</p>
                                <p>${lot.hourly_rate}/hr</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParkingLots;
