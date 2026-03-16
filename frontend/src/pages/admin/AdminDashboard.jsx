import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b flex items-center gap-3 cursor-pointer">
                    <i className="ph-fill ph-book-open text-3xl text-blue-600"></i>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Base Learn</span>
                </div>
                <div className="p-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Admin Portal</span>
                    <nav className="flex flex-col gap-1">
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                            <i className="ph ph-squares-four text-lg"></i> Dashboard
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-users text-lg"></i> Manage Users
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-books text-lg"></i> Course Catalog
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-chart-line-up text-lg"></i> Reports & Analytics
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-gear text-lg"></i> System Settings
                        </Link>
                    </nav>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white border-b px-8 flex items-center justify-between shrink-0">
                    <h1 className="font-bold text-lg text-gray-800">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-500 hover:text-blue-600 transition"><i className="ph ph-bell text-xl"></i></button>
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">A</div>
                    </div>
                </header>
                
                {/* Content Area */}
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl"><i className="ph-fill ph-users"></i></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Total Students</p>
                                <h3 className="text-2xl font-bold text-gray-900">12,450</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-2xl"><i className="ph-fill ph-chalkboard-teacher"></i></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Instructors</p>
                                <h3 className="text-2xl font-bold text-gray-900">142</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl"><i className="ph-fill ph-books"></i></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Active Courses</p>
                                <h3 className="text-2xl font-bold text-gray-900">324</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl"><i className="ph-fill ph-currency-dollar"></i></div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Monthly Revenue</p>
                                <h3 className="text-2xl font-bold text-gray-900">$42.5k</h3>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                        <h2 className="font-bold text-lg mb-4 text-gray-800">Recent User Signups</h2>
                        <div className="text-center text-gray-500 mt-20">
                            <i className="ph ph-folder-open text-5xl text-gray-300 mb-2"></i>
                            <p>Data visualization will appear here.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
