import React from 'react';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b flex items-center gap-3 cursor-pointer">
                    <i className="ph-fill ph-book-open text-3xl text-orange-600"></i>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Base Learn</span>
                </div>
                <div className="p-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Instructor Portal</span>
                    <nav className="flex flex-col gap-1">
                        <Link to="/instructor" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-orange-50 text-orange-700 font-semibold">
                            <i className="ph ph-squares-four text-lg"></i> Overview
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-video-camera text-lg"></i> My Content
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-users text-lg"></i> Students
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-chart-line-up text-lg"></i> Engagement Metrics
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold transition">
                            <i className="ph ph-chat-teardrop text-lg"></i> Q&A Forum
                        </Link>
                    </nav>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white border-b px-8 flex items-center justify-between shrink-0">
                    <h1 className="font-bold text-lg text-gray-800">Instructor Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-500 hover:text-orange-600 transition"><i className="ph ph-bell text-xl"></i></button>
                        <img src="https://ui-avatars.com/api/?name=Instructor&background=random" alt="Profile" className="w-8 h-8 rounded-full shadow-sm" />
                    </div>
                </header>
                
                {/* Content Area */}
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-4"><i className="ph-fill ph-users"></i></div>
                            <h3 className="text-2xl font-bold text-gray-900">4,250</h3>
                            <p className="text-sm font-semibold text-gray-500">Total Enrollment</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4"><i className="ph-fill ph-star"></i></div>
                            <h3 className="text-2xl font-bold text-gray-900">4.8 / 5.0</h3>
                            <p className="text-sm font-semibold text-gray-500">Average Rating</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl mb-4"><i className="ph-fill ph-clock"></i></div>
                            <h3 className="text-2xl font-bold text-gray-900">120 hrs</h3>
                            <p className="text-sm font-semibold text-gray-500">Content Watched (This Week)</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-bold text-lg mb-4 text-gray-800">My Published Courses</h2>
                            <ul className="divide-y">
                                <li className="py-4 flex justify-between items-center group">
                                    <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition">Introduction to React</div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">1,200 Enrolled</span>
                                </li>
                                <li className="py-4 flex justify-between items-center group">
                                    <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition">Advanced JavaScript Patterns</div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">850 Enrolled</span>
                                </li>
                                <li className="py-4 flex justify-between items-center group">
                                    <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition">Web Performance Optimization</div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">2,200 Enrolled</span>
                                </li>
                            </ul>
                            <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-bold text-gray-500 hover:border-blue-500 hover:text-blue-500 transition">
                                + Create New Course
                            </button>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-bold text-lg mb-4 text-gray-800">Recent Q&A</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="font-semibold text-sm mb-1 text-gray-800">"Why do we use useEffect with an empty array?"</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Student • Intro to React</span>
                                        <button className="text-orange-600 font-bold hover:underline">Reply Now</button>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="font-semibold text-sm mb-1 text-gray-800">"Can you explain React Context API again?"</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Student • Adv JS Patterns</span>
                                        <button className="text-orange-600 font-bold hover:underline">Reply Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InstructorDashboard;
