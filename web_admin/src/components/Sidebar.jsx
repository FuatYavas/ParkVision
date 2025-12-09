import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="w-64 bg-gray-800 text-white h-screen p-4">
            <h1 className="text-2xl font-bold mb-8">ParkVision Admin</h1>
            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link to="/dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/parking-lots" className="block p-2 hover:bg-gray-700 rounded">Parking Lots</Link>
                    </li>
                    <li>
                        <Link to="/cameras" className="block p-2 hover:bg-gray-700 rounded">Cameras</Link>
                    </li>
                </ul>
            </nav>
            <button
                onClick={handleLogout}
                className="mt-auto w-full bg-red-500 p-2 rounded hover:bg-red-600 absolute bottom-4 left-4 right-4 w-56"
            >
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
