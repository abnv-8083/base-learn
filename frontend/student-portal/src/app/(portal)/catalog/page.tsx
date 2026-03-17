"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { 
  Search, 
  Star, 
  Users, 
  Clock, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  ChevronRight
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
    color: "bg-primary",
    lightColor: "bg-blue-50",
    textColor: "text-primary"
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
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600"
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
    color: "bg-sky-500",
    lightColor: "bg-sky-50",
    textColor: "text-sky-600"
  },
];

export default function CourseCatalog() {
  return (
    <div className="p-6 md:p-10 space-y-16">
      {/* Catalog Hero Banner */}
      <section className="relative overflow-hidden rounded-[3rem] primary-gradient px-12 py-20 shadow-2xl shadow-primary-glow/20">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
         <div className="relative z-10 max-w-2xl">
            <div className="badge !bg-white/20 !text-white border border-white/30 mb-8 backdrop-blur-md">
               <Sparkles className="w-3.5 h-3.5 mr-2" />
               New Recommendation
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
               Master Your <br/> <span className="underline decoration-white/30 underline-offset-8">Future.</span>
            </h1>
            <p className="text-blue-50 text-xl mb-12 leading-relaxed font-bold opacity-80">
               Explore our curated collection of interactive courses designed to help you master tough concepts and top your class.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input 
                    type="text" 
                    placeholder="Search over 500+ classes..." 
                    className="w-full h-16 bg-white border-none rounded-2xl pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all font-black text-sm shadow-xl"
                  />
               </div>
               <Button size="lg" className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all shadow-2xl active:scale-95">
                  Find Classes
               </Button>
            </div>
         </div>
      </section>

      {/* Featured Courses */}
      <section>
         <div className="flex items-center justify-between mb-10 px-2">
            <div>
               <div className="badge mb-3">Editor's Choice</div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Featured Courses</h2>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" size="icon" className="rounded-2xl border-slate-100 bg-white text-slate-400 hover:text-primary transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5 rotate-180" />
               </Button>
               <Button variant="outline" size="icon" className="rounded-2xl border-slate-100 bg-white text-slate-400 hover:text-primary transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5" />
               </Button>
            </div>
         </div>

         <div className="flex gap-10 overflow-x-auto no-scrollbar pb-10 px-2">
            {catalogCourses.filter(c => c.isFeatured).map((course, i) => (
               <motion.div 
                 key={course.id}
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
               >
                 <Card className="min-w-[320px] md:min-w-[440px] soft-card p-2 group border-2 border-transparent hover:border-primary/10">
                    <div className="relative aspect-[16/9] rounded-[1.5rem] bg-slate-100 overflow-hidden mb-8 shadow-sm">
                       <img 
                          src={`https://images.unsplash.com/photo-${[
                             '1635070041078-e363dbe005cb',
                             '1635070040896-73604f762635'
                          ][i % 2]}?q=80&w=1000&auto=format&fit=crop`}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                          alt={course.title}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                       <div className="absolute top-5 left-5">
                          <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30">
                             {course.subject}
                          </span>
                       </div>
                    </div>
                    <div className="px-6 pb-6">
                       <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
                          {course.title}
                       </h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">{course.instructor}</p>
                       
                       <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50 mb-10">
                          <div className="flex flex-col items-center">
                             <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black">{course.rating}</span>
                             </div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rating</span>
                          </div>
                          <div className="flex flex-col items-center border-x border-slate-50">
                             <div className="flex items-center gap-1.5 text-slate-900 mb-1">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-black">{course.students}</span>
                             </div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Enrolled</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <div className="flex items-center gap-1.5 text-slate-900 mb-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-black">{course.duration}</span>
                             </div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Duration</span>
                          </div>
                       </div>

                       <div className="flex items-center justify-between">
                          <div className="text-3xl font-black text-slate-900 tracking-tighter">{course.price}</div>
                          <Button className="rounded-2xl px-8 h-12 bg-primary text-white font-black shadow-lg shadow-primary-glow hover:opacity-90 active:scale-95 transition-all">
                             Enroll Now
                          </Button>
                       </div>
                    </div>
                 </Card>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Grid View */}
      <section>
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-10 border-b border-slate-50">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
               <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary-glow">
                 <TrendingUp className="w-6 h-6 text-white" />
               </div>
               Explore All Classes
            </h2>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
               {["All", "Mathematics", "Science", "Languages", "Social", "Arts"].map((tag, i) => (
                 <button 
                   key={tag}
                   className={cn(
                     "px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                     i === 0 ? "bg-primary border-primary text-white shadow-lg shadow-primary-glow" : "bg-white border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 shadow-sm"
                   )}
                 >
                   {tag}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {catalogCourses.concat(catalogCourses).map((course, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: (i % 4) * 0.1 }}
               >
                 <Card className="soft-card p-1 group hover:border-primary/10 border-transparent border-2 transition-all flex flex-col">
                    <div className="relative aspect-video rounded-2xl bg-slate-50 overflow-hidden mb-4 shadow-sm">
                       <img 
                          src={`https://images.unsplash.com/photo-${[
                             '1635070041078-e363dbe005cb',
                             '1635070040896-73604f762635',
                             '1603126857599-f6e157fa2fe6',
                             '1532094349884-543bc11b234d'
                          ][i % 4]}?q=80&w=1000&auto=format&fit=crop`}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                          alt={course.title}
                       />
                       <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                       <div className="absolute top-4 left-4">
                          <span className="badge !bg-white/90 !text-primary border-none shadow-sm">{course.subject}</span>
                       </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                       <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-2 leading-[1.2] tracking-tight group-hover:text-primary transition-colors">
                          {course.title}
                       </h3>
                       <div className="flex items-center gap-3 mb-8">
                          <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[8px] font-black text-primary">
                             {course.instructor[0]}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.instructor}</span>
                       </div>
                       <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                          <div className="flex items-center gap-1.5 text-yellow-500 text-[11px] font-black">
                             <Star className="w-3.5 h-3.5 fill-current" />
                             {course.rating}
                          </div>
                          <div className="text-base font-black text-slate-900 tracking-tighter">{course.price}</div>
                       </div>
                    </div>
                 </Card>
               </motion.div>
            ))}
         </div>
         
         <div className="mt-20 text-center">
            <Button variant="outline" className="h-16 px-12 rounded-[2rem] border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 font-black uppercase tracking-widest text-[11px] shadow-sm active:scale-95 transition-all">
               Load More Courses
            </Button>
         </div>
      </section>
    </div>
  );
}
