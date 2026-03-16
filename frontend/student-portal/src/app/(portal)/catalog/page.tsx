"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { 
  Search, 
  Star, 
  Users, 
  Clock, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const catalogCourses = [
  {
    id: 101,
    title: "Advanced Algebraic Structures",
    subject: "Math",
    instructor: "Dr. Elena Rossi",
    rating: 4.9,
    students: "1,2k",
    chapters: 14,
    duration: "18h 30m",
    price: "Free",
    isFeatured: true,
    color: "bg-blue-500",
  },
  {
    id: 102,
    title: "Quantum Physics for Beginners",
    subject: "Physics",
    instructor: "Prof. James Wilson",
    rating: 4.8,
    students: "850",
    chapters: 12,
    duration: "15h 45m",
    price: "Premium",
    isFeatured: true,
    color: "bg-purple-500",
  },
  {
    id: 103,
    title: "Modern European History",
    subject: "Social",
    instructor: "Dr. Michael Chen",
    rating: 4.7,
    students: "2,1k",
    chapters: 20,
    duration: "24h",
    price: "Free",
    isFeatured: false,
    color: "bg-orange-500",
  },
  // More items could be added here
];

export default function CourseCatalog() {
  return (
    <div className="p-6 md:p-8">
      {/* Catalog Hero Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-900 px-10 py-16 mb-12">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
         <div className="relative z-10 max-w-2xl">
            <Badge className="mb-6 bg-blue-600/10 border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
               <Sparkles className="w-3.5 h-3.5 mr-2" />
               New Recommendation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1]">
               Expand your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">knowledge</span> horizons.
            </h1>
            <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
               Explore our curated collection of interactive courses designed to help you master tough concepts and top your class.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search over 500+ classes..." 
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
               </div>
               <Button size="lg" className="h-14 px-8 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all">
                  Search
               </Button>
            </div>
         </div>
      </section>

      {/* Featured Courses */}
      <section className="mb-16">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-2xl font-black text-white">Featured Courses</h2>
               <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Handpicked for your grade</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="icon" className="rounded-xl border-zinc-800 text-white hover:bg-zinc-900 disabled:opacity-20" disabled>
                  <ArrowRight className="w-4 h-4 rotate-180" />
               </Button>
               <Button variant="outline" size="icon" className="rounded-xl border-zinc-800 text-white hover:bg-zinc-900">
                  <ArrowRight className="w-4 h-4" />
               </Button>
            </div>
         </div>

         <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4">
            {catalogCourses.filter(c => c.isFeatured).map((course) => (
               <Card key={course.id} className="min-w-[320px] md:min-w-[400px] p-2 bg-zinc-950 border-zinc-900 group cursor-pointer hover:border-blue-500/50 transition-all duration-500">
                  <div className="relative aspect-[16/9] rounded-2xl bg-zinc-900 overflow-hidden mb-6">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                     <div className="absolute top-4 left-4">
                        <Badge className={`${course.color} text-white border-white/10 text-[10px] font-black uppercase tracking-widest py-1 px-3`}>
                           {course.subject}
                        </Badge>
                     </div>
                  </div>
                  <div className="px-4 pb-4">
                     <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {course.title}
                     </h3>
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">{course.instructor}</p>
                     
                     <div className="grid grid-cols-3 gap-2 py-4 border-y border-zinc-900 mb-8">
                        <div className="flex flex-col items-center">
                           <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-xs font-bold">{course.rating}</span>
                           </div>
                           <span className="text-[10px] font-bold text-zinc-600 uppercase">Rating</span>
                        </div>
                        <div className="flex flex-col items-center border-x border-zinc-900">
                           <div className="flex items-center gap-1.5 text-white mb-1">
                              <Users className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-xs font-bold">{course.students}</span>
                           </div>
                           <span className="text-[10px] font-bold text-zinc-600 uppercase">Enrolled</span>
                        </div>
                        <div className="flex flex-col items-center">
                           <div className="flex items-center gap-1.5 text-white mb-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-xs font-bold">{course.duration}</span>
                           </div>
                           <span className="text-[10px] font-bold text-zinc-600 uppercase">Duration</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="text-2xl font-black text-white">{course.price}</div>
                        <Button className="rounded-xl px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold h-11">
                           Enroll Now
                        </Button>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* Categories & Full Grid */}
      <section>
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-900">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
               <TrendingUp className="w-6 h-6 text-blue-500" />
               Explore All Classes
            </h2>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
               {["All", "Math", "Science", "Languages", "Social", "Arts"].map((tag) => (
                 <button 
                   key={tag}
                   className="px-6 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all whitespace-nowrap"
                 >
                   {tag}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {catalogCourses.map((course) => (
               <Card key={course.id} className="p-1 bg-zinc-950 border-zinc-900 group hover:border-zinc-700 transition-all flex flex-col">
                  <div className="relative aspect-video rounded-xl bg-zinc-900 overflow-hidden mb-4">
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                     <div className="absolute top-3 left-3">
                        <Badge className={`${course.color} text-[9px] font-black uppercase py-0.5 px-2`}>{course.subject}</Badge>
                     </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                     <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                        {course.title}
                     </h3>
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                           {course.instructor[0]}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">{course.instructor}</span>
                     </div>
                     <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-900">
                        <div className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-black">
                           <Star className="w-3 h-3 fill-current" />
                           {course.rating}
                        </div>
                        <div className="text-sm font-black text-white">{course.price}</div>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
         
         <div className="mt-16 text-center">
            <Button variant="outline" className="h-12 px-10 rounded-2xl border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold uppercase tracking-widest text-[11px]">
               Load More Courses
            </Button>
         </div>
      </section>
    </div>
  );
}
