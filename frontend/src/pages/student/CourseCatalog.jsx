import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CourseCatalog = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubject, setActiveSubject] = useState('All');

    // Mock Catalog Data
    const catalogData = [
        {
            id: 101,
            title: "Algebra Foundation Course",
            subject: "Math",
            subjectColor: "blue",
            instructor: "Dr. Sharma",
            duration: "12 hours",
            chapters: 10,
            rating: 4.8,
            students: 1250,
            price: "Free",
            popular: true
        },
        {
            id: 102,
            title: "Physics: Quantum Mechanics Guide",
            subject: "Science",
            subjectColor: "green",
            instructor: "Mr. Verma",
            duration: "8 hours",
            chapters: 6,
            rating: 4.9,
            students: 840,
            price: "Free",
            popular: false
        },
        {
            id: 103,
            title: "Mastering English Grammar",
            subject: "English",
            subjectColor: "orange",
            instructor: "Ms. Davis",
            duration: "15 hours",
            chapters: 20,
            rating: 4.7,
            students: 2100,
            price: "Premium",
            popular: true
        },
        {
            id: 104,
            title: "World History: Ancient Civilizations",
            subject: "Social Studies",
            subjectColor: "purple",
            instructor: "Prof. Singh",
            duration: "10 hours",
            chapters: 8,
            rating: 4.6,
            students: 530,
            price: "Free",
            popular: false
        }
    ];

    const subjects = ['All', 'Math', 'Science', 'English', 'Social Studies'];

    const filteredCatalog = catalogData.filter(course => {
        const matchesSubject = activeSubject === 'All' || course.subject === activeSubject;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSubject && matchesSearch;
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Hero / Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-4">Discover New Courses</h1>
                    <p className="text-blue-100 mb-6 text-lg">Enhance your skills with expert-led courses designed tailored for your academic goals.</p>
                    
                    <div className="relative max-w-md">
                        <i className="ph ph-magnifying-glass absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl"></i>
                        <input 
                            type="text" 
                            placeholder="Search by subject, topic, or instructor..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md"
                        />
                    </div>
                </div>
                {/* Abstract Decoration */}
                <i className="ph-fill ph-book-open absolute right-0 bottom-0 text-[180px] text-white opacity-10 transform translate-x-1/4 translate-y-1/4 rotate-12"></i>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Filters Sidebar */}
                <div className="lg:w-1/4 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2"><i className="ph ph-faders"></i> Filters</h3>
                            <button className="text-sm text-blue-600 font-semibold" onClick={() => { setActiveSubject('All'); setSearchQuery(''); }}>Clear</button>
                        </div>
                        
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Subjects</h4>
                            <div className="flex flex-col gap-2">
                                {subjects.map(sub => (
                                    <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name="subject_filter" 
                                            checked={activeSubject === sub}
                                            onChange={() => setActiveSubject(sub)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded-full cursor-pointer" 
                                        />
                                        <span className={`text-sm font-medium ${activeSubject === sub ? 'text-blue-700 font-bold' : 'text-gray-700 group-hover:text-blue-600'}`}>{sub}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Levels</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full cursor-pointer hover:bg-gray-200">Grade 8</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200 cursor-pointer">Grade 9</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full cursor-pointer hover:bg-gray-200">Grade 10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catalog Grid */}
                <div className="lg:w-3/4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Showing {filteredCatalog.length} Results</h2>
                        <select className="border-none bg-transparent text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer">
                            <option>Most Popular</option>
                            <option>Highest Rated</option>
                            <option>Newest</option>
                        </select>
                    </div>

                    {filteredCatalog.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredCatalog.map(course => (
                                <div key={course.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all flex flex-col h-full group overflow-hidden">
                                    <div className={`h-40 bg-${course.subjectColor}-100 relative p-4 flex items-start justify-between`}>
                                        <span className={`tag text-xs font-bold px-2 py-1 rounded bg-white text-${course.subjectColor}-800 shadow-sm uppercase tracking-wider`}>
                                            {course.subject}
                                        </span>
                                        {course.popular && (
                                            <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                Best Seller
                                            </span>
                                        )}
                                        {/* Play Hover Overlay */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                            <i className="ph-fill ph-play-circle text-5xl text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all shadow-xl rounded-full"></i>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 mb-4 mt-1">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=random`} alt={course.instructor} className="w-6 h-6 rounded-full border border-gray-200" />
                                            <span className="text-xs text-gray-600 font-medium">By {course.instructor}</span>
                                        </div>

                                        <div className="flex gap-4 text-xs text-gray-500 mb-6 font-medium">
                                            <div className="flex items-center gap-1"><i className="ph-fill ph-clock text-gray-400"></i> {course.duration}</div>
                                            <div className="flex items-center gap-1"><i className="ph-fill ph-book-open text-gray-400"></i> {course.chapters} Ch.</div>
                                            <div className="flex items-center gap-1"><i className="ph-fill ph-star text-yellow-500"></i> {course.rating}</div>
                                        </div>
                                        
                                        <div className="mt-auto border-t pt-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${course.price === 'Free' ? 'text-green-600' : 'text-gray-900'}`}>{course.price}</span>
                                                <span className="text-[10px] text-gray-400">{course.students.toLocaleString()} enrolled</span>
                                            </div>
                                            <Link 
                                                to={`/student/courses/${course.id}`} // Mock link to detail view
                                                className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                            >
                                                View Course
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border p-12 text-center flex flex-col items-center justify-center">
                            <i className="ph ph-magnifying-glass text-5xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-bold mb-2">No results found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCatalog;
