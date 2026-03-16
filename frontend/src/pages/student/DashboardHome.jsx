import React from 'react';
import { useOutletContext } from 'react-router-dom';

const DashboardHome = () => {
    const { user } = useOutletContext();
    const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Student';

    return (
        <>
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Welcome back, {firstName}! 👋</h1>
                    <p>You have completed 75% of your weekly goals. Keep it up!</p>
                </div>
                <img src="https://img.icons8.com/fluency/96/000000/learning.png" alt="Learning" style={{ width: '80px' }} />
            </div>
            
            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon-wrapper blue"><i className="ph-fill ph-book"></i></div>
                    <div><span className="stat-label">Enrolled</span><span className="stat-value">6</span></div>
                </div>
                <div className="stat-card">
                    <div className="icon-wrapper green"><i className="ph-fill ph-check-circle"></i></div>
                    <div><span className="stat-label">Completed</span><span className="stat-value">12</span></div>
                </div>
                <div className="stat-card">
                    <div className="icon-wrapper orange"><i className="ph-fill ph-clock"></i></div>
                    <div><span className="stat-label">Hours Spent</span><span className="stat-value">48h</span></div>
                </div>
                <div className="stat-card">
                    <div className="icon-wrapper purple"><i className="ph-fill ph-certificate"></i></div>
                    <div><span className="stat-label">Certificates</span><span className="stat-value">3</span></div>
                </div>
            </div>
            
            <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Main Content Area (Spans 2 columns) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Continue Learning */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="section-header flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Continue Learning</h2>
                            <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">View All</a>
                        </div>
                        
                        <div className="course-list flex flex-col gap-4">
                            <div className="course-item flex gap-4 p-4 border rounded-xl hover:bg-gray-50 transition cursor-pointer">
                                <div className="course-img skeleton w-28 h-24 rounded-lg flex-shrink-0"></div>
                                <div className="course-details flex-1 flex flex-col justify-center">
                                    <div className="course-meta flex gap-2 items-center mb-1">
                                        <span className="tag text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">Science</span>
                                        <span className="text-xs text-gray-500">Lesson 5 of 12</span>
                                    </div>
                                    <h3 className="font-bold mb-2">Physics - Laws of Motion</h3>
                                    <div className="progress-container w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div className="progress-fill bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                                    </div>
                                    <div className="course-footer flex justify-between text-xs text-gray-500">
                                        <span>40% Complete</span>
                                        <button className="text-blue-600 font-bold hover:underline">Resume</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Upcoming Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="section-header flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Upcoming Tasks</h2>
                            <button className="icon-btn text-base hover:bg-gray-100 p-2 rounded-full transition"><i className="ph ph-plus"></i></button>
                        </div>
                        
                        <div className="task-list flex flex-col gap-3">
                            <div className="task-item flex gap-4 p-4 border rounded-xl hover:shadow-md transition cursor-pointer">
                                <div className="task-icon w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 flex-shrink-0"><i className="ph-fill ph-file-text text-2xl"></i></div>
                                <div className="task-details flex-1">
                                    <h4 className="font-semibold text-base">Algebra Assignment 2</h4>
                                    <p className="text-sm text-gray-500">Mathematics • Due Tomorrow</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold">High</span>
                                </div>
                            </div>
                            <div className="task-item flex gap-4 p-4 border rounded-xl hover:shadow-md transition cursor-pointer">
                                <div className="task-icon w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 flex-shrink-0"><i className="ph-fill ph-pencil-simple text-2xl"></i></div>
                                <div className="task-details flex-1">
                                    <h4 className="font-semibold text-base">Weekly Science Quiz</h4>
                                    <p className="text-sm text-gray-500">Physics • Friday, 5:00 PM</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">Med</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel (Spans 1 column) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Streak Calendar */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🔥</span>
                            <h3 className="font-bold text-lg">5-Day Streak!</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">You're on a roll. Keep learning every day to build your streak.</p>
                        <div className="flex gap-1 justify-between mt-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-bold ${i < 5 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {i < 5 ? <i className="ph-fill ph-check"></i> : null}
                                    </div>
                                    <span className="text-xs text-gray-400 font-semibold">{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Badges */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                         <div className="section-header flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Recent Badges</h3>
                            <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">All</a>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center text-center gap-2 w-1/3 group cursor-pointer">
                                <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                                    <i className="ph-fill ph-medal"></i>
                                </div>
                                <span className="text-xs font-semibold text-gray-700 line-clamp-2">Perfect Week</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 w-1/3 group cursor-pointer">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                                    <i className="ph-fill ph-brain"></i>
                                </div>
                                <span className="text-xs font-semibold text-gray-700 line-clamp-2">Math Whiz</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 w-1/3 group cursor-pointer opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                <div className="w-14 h-14 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    <i className="ph-fill ph-rocket"></i>
                                </div>
                                <span className="text-xs font-semibold text-gray-500 line-clamp-2">Fast Learner</span>
                            </div>
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="font-bold text-lg mb-4">Announcements</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Live Doubt Session Tomorrow</p>
                                    <p className="text-xs text-gray-500 mt-1">Join Ms. Davis for a live review of Quadratic Equations.</p>
                                    <span className="text-xs text-blue-600 font-semibold mt-1 inline-block">10:00 AM EST</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0"></div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Final Exam Schedule Posted</p>
                                    <p className="text-xs text-gray-500 mt-1">Check the calendar to see your final exam timeline.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardHome;
