import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MyCourses = () => {
    const [activeTab, setActiveTab] = useState('Enrolled');
    
    // Mock Data
    const courses = [
        {
            id: 1,
            title: "Mathematics — Chapter 5: Polynomials",
            subject: "Math",
            subjectColor: "blue",
            instructor: "Dr. Sharma",
            progress: 58,
            chapterProgress: "Chapter 7 of 12",
            lastAccessed: "2 days ago",
            status: "Enrolled"
        },
        {
            id: 2,
            title: "Physics — Laws of Motion",
            subject: "Science",
            subjectColor: "green",
            instructor: "Mr. Verma",
            progress: 100,
            chapterProgress: "Chapter 10 of 10",
            lastAccessed: "1 week ago",
            status: "Completed"
        },
        {
            id: 3,
            title: "English Grammar Mastery",
            subject: "English",
            subjectColor: "orange",
            instructor: "Ms. Davis",
            progress: 12,
            chapterProgress: "Chapter 2 of 15",
            lastAccessed: "Today",
            status: "Enrolled"
        }
    ];

    const filteredCourses = activeTab === 'All' 
        ? courses 
        : courses.filter(c => c.status === activeTab);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">My Courses</h1>
                    <p className="text-gray-500">Pick up exactly where you left off.</p>
                </div>
                <div className="flex gap-2">
                    {/* Sort Dropdown */}
                    <select className="border rounded-lg px-4 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Recently Accessed</option>
                        <option>Most Progress</option>
                        <option>A - Z</option>
                    </select>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex bg-white rounded-lg shadow-sm border p-2 mb-2">
                {['All', 'Enrolled', 'Completed', 'Bookmarked'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${activeTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <div key={course.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                            {/* Card Header/Thumbnail */}
                            <div className={`h-32 bg-${course.subjectColor}-100 relative group-cursor-pointer`}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 transition-opacity">
                                    <i className="ph-fill ph-play-circle text-5xl text-white drop-shadow-md"></i>
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <span className={`tag text-[10px] font-bold px-2 py-1 rounded bg-${course.subjectColor}-100 text-${course.subjectColor}-800 w-max mb-3 uppercase tracking-wider`}>
                                    {course.subject}
                                </span>
                                
                                <h3 className="font-bold text-gray-900 min-h-[48px] line-clamp-2 leading-tight mb-2">
                                    {course.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=random`} alt={course.instructor} className="w-6 h-6 rounded-full" />
                                    <span className="text-xs text-gray-600 font-medium">{course.instructor}</span>
                                </div>
                                
                                <div className="mt-auto">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                                        <span>{course.chapterProgress}</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                                        <div className={`bg-${course.subjectColor}-500 h-1.5 rounded-full`} style={{ width: `${course.progress}%` }}></div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-xs text-gray-400">Accessed {course.lastAccessed}</span>
                                        <Link 
                                            to={`/student/courses/${course.id}`}
                                            className="text-blue-600 text-sm font-bold hover:underline"
                                        >
                                            {course.progress === 100 ? 'Review' : 'Continue'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-2xl border p-12 text-center flex flex-col items-center justify-center h-64">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                        📁
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">Looks like you don't have any courses in this category yet. Start exploring the catalog.</p>
                    <Link to="/student/catalog" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                        Explore Catalog
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
