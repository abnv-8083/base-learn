import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const CourseDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('Overview');
    
    // Mock Course Data
    const course = {
        title: "Mathematics — Chapter 5: Polynomials",
        subject: "Math",
        subjectColor: "blue",
        grade: "Grade 9",
        instructor: "Dr. Sharma",
        students: 1540,
        progress: 58,
        chapters: [
            { id: 1, title: "Introduction to Polynomials", duration: "12:45", status: "completed" },
            { id: 2, title: "Degree of a Polynomial", duration: "08:20", status: "completed" },
            { id: 3, title: "Zeroes of a Polynomial", duration: "15:10", status: "current" },
            { id: 4, title: "Remainder Theorem", duration: "20:05", status: "locked" },
            { id: 5, title: "Factor Theorem", duration: "18:30", status: "locked" },
            { id: 6, title: "Algebraic Identities - Part 1", duration: "25:00", status: "locked" },
        ]
    };

    return (
        <div className="-mx-8 -my-8 h-[calc(100vh-80px)] overflow-hidden flex flex-col bg-gray-50">
            {/* Zen Mode Header */}
            <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0 h-16 shadow-sm z-10 w-full relative">
                <div className="flex items-center gap-4">
                    <Link to="/student/courses" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                        <i className="ph ph-arrow-left"></i>
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500 font-semibold hover:text-blue-600 cursor-pointer transition">Home</span>
                            <i className="ph ph-caret-right text-xs text-gray-400"></i>
                            <span className="text-xs text-gray-500 font-semibold hover:text-blue-600 cursor-pointer transition">My Courses</span>
                            <i className="ph ph-caret-right text-xs text-gray-400"></i>
                            <span className="text-xs text-gray-800 font-bold">{course.subject}</span>
                        </div>
                        <h1 className="font-bold text-lg leading-none">{course.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-800 mb-1">{course.progress}% Completed</span>
                        <div className="w-32 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full shadow-sm" style={{ width: `${course.progress}%` }}></div>
                        </div>
                    </div>
                    
                    <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <i className="ph-fill ph-check-circle"></i> View Certificate
                    </button>
                </div>
            </header>

            {/* Main Split Layout */}
            <div className="flex-1 flex overflow-hidden w-full relative">
                {/* Left Side: Video Player & Tabs */}
                <div className="flex-1 flex flex-col overflow-y-auto w-full relative">
                    {/* Video Player */}
                    <div className="bg-black relative group shrink-0 w-full aspect-video" style={{ minHeight: '400px', maxHeight: '70vh' }}>
                        {/* Placeholder for Video */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-gray-900">
                             <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl cursor-pointer hover:scale-110 transition glow">
                                <i className="ph-fill ph-play text-3xl ml-1"></i>
                             </div>
                             <h2 className="text-2xl font-bold mb-2">Zeroes of a Polynomial</h2>
                             <p className="text-gray-400 text-sm">Chapter 3 • 15:10</p>
                        </div>
                        
                        {/* Fake Controls via Hover */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer relative">
                                <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full w-1/3"></div>
                                <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                            </div>
                            <div className="flex justify-between items-center text-white">
                                <div className="flex items-center gap-4">
                                    <button className="hover:text-blue-400"><i className="ph-fill ph-pause text-xl"></i></button>
                                    <button className="hover:text-blue-400"><i className="ph-fill ph-skip-forward text-xl"></i></button>
                                    <span className="text-xs font-semibold font-mono">05:01 / 15:10</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="hover:text-blue-400"><i className="ph-fill ph-speaker-high text-xl"></i></button>
                                    <button className="hover:text-blue-400 px-2 py-0.5 border border-white/50 rounded text-xs font-bold">1.5x</button>
                                    <button className="hover:text-blue-400"><i className="ph-fill ph-sliders-horizontal text-xl"></i></button>
                                    <button className="hover:text-blue-400"><i className="ph-fill ph-corners-out text-xl"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar Below Video */}
                    <div className="bg-white border-b px-6 py-2 flex justify-between items-center shrink-0 w-full relative">
                        <div className="flex gap-2">
                             <button className="text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition">
                                <i className="ph ph-note-pencil text-lg"></i> Take Notes
                            </button>
                            <button className="text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition">
                                <i className="ph ph-chat-teardrop text-lg"></i> Ask Doubt
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button className="text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition">
                                <i className="ph ph-arrow-left"></i> Previous
                            </button>
                            <button className="bg-blue-600 text-white text-sm font-bold flex items-center gap-2 px-6 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition">
                                Next Chapter <i className="ph ph-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Tabs Area */}
                    <div className="flex-1 w-full bg-white relative">
                        <div className="border-b px-6 flex gap-8 w-full">
                            {['Overview', 'Notes', 'Discussions', 'Resources'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 font-bold text-sm border-b-2 transition ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-6 max-w-4xl">
                            {activeTab === 'Overview' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold text-lg mb-2">About this course</h3>
                                        <p className="text-gray-600 leading-relaxed text-sm">
                                            Dive deep into the fascinating world of Polynomials. This chapter covers the fundamental concepts, operations, and theorems related to polynomial expressions in one variable, preparing you thoroughly for your Class 9 finals and building a robust foundation for higher mathematics.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=random`} alt={course.instructor} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <h4 className="font-bold text-gray-900">{course.instructor}</h4>
                                            <p className="text-xs text-gray-500 font-semibold">Senior Mathematics Faculty • 12 years experience</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {activeTab === 'Notes' && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-64 shadow-inner relative">
                                    <p className="text-yellow-800 font-mono text-sm opacity-50"># Start typing your notes here...</p>
                                    <textarea className="w-full h-full bg-transparent resize-none focus:outline-none absolute inset-0 p-4 text-sm"></textarea>
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Chapter List Sidebar */}
                <div className="w-[320px] bg-white border-l shrink-0 flex flex-col relative z-20 h-full overflow-hidden shadow-xl lg:shadow-none">
                    <div className="p-4 border-b bg-gray-50 flex items-center justify-between sticky top-0 z-10 w-full">
                        <h3 className="font-bold text-gray-800">Course Content</h3>
                        <span className="text-xs font-semibold text-gray-500 px-2 py-1 bg-gray-200 rounded">{course.chapters.length} Chapters</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto w-full">
                        <div className="flex flex-col w-full">
                            {course.chapters.map((ch, idx) => (
                                <div 
                                    key={ch.id} 
                                    className={`w-full flex gap-3 p-4 border-b cursor-pointer transition ${ch.status === 'current' ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'} ${ch.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <div className="shrink-0 mt-1">
                                        {ch.status === 'completed' && <i className="ph-fill ph-check-circle text-green-500 text-lg"></i>}
                                        {ch.status === 'current' && <i className="ph-fill ph-play-circle text-blue-600 text-lg"></i>}
                                        {ch.status === 'locked' && <i className="ph-fill ph-lock-key text-gray-400 text-lg"></i>}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className={`text-sm font-semibold mb-1 leading-tight ${ch.status === 'current' ? 'text-blue-900' : 'text-gray-800'}`}>
                                            {idx + 1}. {ch.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <i className="ph-fill ph-video-camera"></i> {ch.duration}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
