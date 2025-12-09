import React from 'react';
import Sidebar from '../components/Sidebar';

const Cameras = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-100 min-h-screen">
                <h2 className="text-3xl font-bold mb-6">Cameras</h2>
                <div className="bg-white p-6 rounded shadow">
                    <p>Camera management interface coming soon.</p>
                    {/* List cameras and stream URLs here */}
                </div>
            </div>
        </div>
    );
};

export default Cameras;
