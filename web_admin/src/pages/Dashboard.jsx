import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import api from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_parking_lots: 0,
        active_reservations: 0,
        total_users: 0,
        today_reservations: 0,
        total_spots: 0,
        occupied_spots: 0,
        available_spots: 0,
        occupancy_rate: 0,
        total_revenue: 0,
        today_revenue: 0
    });
    const [occupancyTrend, setOccupancyTrend] = useState([]);
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [parkingLotsStatus, setParkingLotsStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://localhost:8000/ws/admin-dashboard');
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            setWsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message:', data);
            
            // Anlık güncellemeler
            if (data.type === 'parking_update') {
                // Otopark durumunu güncelle
                fetchParkingLotsStatus();
            } else if (data.type === 'reservation_update') {
                // İstatistikleri güncelle
                fetchStats();
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected, reconnecting...');
            setWsConnected(false);
            // 3 saniye sonra yeniden bağlan
            setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
    };

    const fetchDashboardData = async () => {
        try {
            const [statsRes, occupancyRes, revenueRes, parkingRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/occupancy-trend?days=7'),
                api.get('/dashboard/revenue-trend?days=7'),
                api.get('/dashboard/parking-lots-status')
            ]);

            setStats(statsRes.data);
            setOccupancyTrend(occupancyRes.data);
            setRevenueTrend(revenueRes.data);
            setParkingLotsStatus(parkingRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsRes = await api.get('/dashboard/stats');
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchParkingLotsStatus = async () => {
        try {
            const parkingRes = await api.get('/dashboard/parking-lots-status');
            setParkingLotsStatus(parkingRes.data);
        } catch (error) {
            console.error('Error fetching parking lots status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-8 bg-gray-100 min-h-screen flex items-center justify-center">
                    <div className="text-2xl text-gray-600">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-100 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Dashboard</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">{wsConnected ? 'Canlı' : 'Bağlantı Kesildi'}</span>
                        </div>
                        <button 
                            onClick={fetchDashboardData}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            🔄 Yenile
                        </button>
                    </div>
                </div>

                {/* Ana İstatistikler */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Toplam Otopark</h3>
                        <p className="text-4xl font-bold text-blue-500">{stats.total_parking_lots}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Aktif Rezervasyon</h3>
                        <p className="text-4xl font-bold text-green-500">{stats.active_reservations}</p>
                        <p className="text-xs text-gray-500 mt-1">Bugün: {stats.today_reservations}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Toplam Kullanıcı</h3>
                        <p className="text-4xl font-bold text-purple-500">{stats.total_users}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Doluluk Oranı</h3>
                        <p className="text-4xl font-bold text-orange-500">{stats.occupancy_rate}%</p>
                        <p className="text-xs text-gray-500 mt-1">{stats.occupied_spots}/{stats.total_spots} spot</p>
                    </div>
                </div>

                {/* Gelir Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
                        <h3 className="text-lg font-semibold mb-2">Bugünkü Gelir</h3>
                        <p className="text-4xl font-bold">${stats.today_revenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow text-white">
                        <h3 className="text-lg font-semibold mb-2">Toplam Gelir</h3>
                        <p className="text-4xl font-bold">${stats.total_revenue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Grafikler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Rezervasyon Trend'i */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4">Son 7 Gün Rezervasyon Trendi</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={occupancyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="reservations" stroke="#8884d8" name="Rezervasyon" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gelir Trend'i */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4">Son 7 Gün Gelir Trendi</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#82ca9d" name="Gelir ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Otopark Durumları */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">Otopark Doluluk Durumu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parkingLotsStatus.map(lot => (
                            <div key={lot.id} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold text-lg mb-2">{lot.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">{lot.address}</p>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Dolu:</span>
                                    <span className="font-semibold">{lot.occupied_spots}/{lot.total_spots}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div 
                                        className={`h-4 rounded-full ${
                                            lot.occupancy_rate > 80 ? 'bg-red-500' : 
                                            lot.occupancy_rate > 50 ? 'bg-yellow-500' : 
                                            'bg-green-500'
                                        }`}
                                        style={{ width: `${lot.occupancy_rate}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right">%{lot.occupancy_rate}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
