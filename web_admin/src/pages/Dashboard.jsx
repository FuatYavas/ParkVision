import React from 'react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-100 min-h-screen">
                <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-semibold mb-2">Total Parking Lots</h3>
                        <p className="text-4xl font-bold text-blue-500">5</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-semibold mb-2">Active Reservations</h3>
                        <p className="text-4xl font-bold text-green-500">12</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-semibold mb-2">Total Users</h3>
                        <p className="text-4xl font-bold text-purple-500">128</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
