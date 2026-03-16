import React from 'react';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b flex items-center gap-3 cursor-pointer">
                    <i className="ph-fill ph-book-open text-3xl text-purple-600"></i>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Base Learn</span>
                </div>
                <div className="p-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Faculty Dept. Portal</span>
                    <nav className="flex flex-col gap-1">
                        <Link to="/faculty" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-purple-50 text-purple-700 font-semibold">
                            <i className="ph ph-squares-four text-lg"></i> Dashboard
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-users-three text-lg"></i> Directory
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-calendar text-lg"></i> Master Schedule
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-file-text text-lg"></i> Resource Planning
                        </Link>
                    </nav>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white border-b px-8 flex items-center justify-between shrink-0">
                    <h1 className="font-bold text-lg text-gray-800">Faculty Department Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-500 hover:text-purple-600 transition"><i className="ph ph-bell text-xl"></i></button>
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">F</div>
                    </div>
                </header>
                
                {/* Content Area */}
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Status Module */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Active Faculty Members</h3>
                                <p className="text-sm text-gray-500">Currently leading courses</p>
                            </div>
                            <span className="text-3xl font-bold tracking-tight text-purple-600">84</span>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Upcoming Reviews</h3>
                                <p className="text-sm text-gray-500">Instructor evaluations this term</p>
                            </div>
                            <span className="text-3xl font-bold tracking-tight text-orange-500">12</span>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                        <h2 className="font-bold text-lg mb-4 text-gray-800">Department Wide Notices</h2>
                        <div className="space-y-4">
                            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                                <h4 className="font-semibold text-gray-800">Curriculum Update required for Fall Semester</h4>
                                <p className="text-sm text-gray-500 mb-2 mt-1">Please ensure all class materials are updated according to the new standard by August 15th.</p>
                                <span className="text-xs font-bold text-purple-600">Action Required</span>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                                <h4 className="font-semibold text-gray-800">Monthly Faculty Meeting</h4>
                                <p className="text-sm text-gray-500 mb-2 mt-1">Join us via Zoom on Friday at 2:00 PM EST for the department all-hands.</p>
                                <span className="text-xs font-bold text-gray-400">Scheduled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacultyDashboard;
