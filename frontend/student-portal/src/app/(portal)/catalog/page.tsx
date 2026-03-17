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
    <div className="space-y-16 animate-in fade-in duration-500">
      {/* Catalog Hero Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 md:px-12 py-16 md:py-20 shadow-2xl shadow-primary/20">
         <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-100" />
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
         <div className="relative z-10 max-w-2xl">
            <div className="badge !bg-white/10 !text-white border border-white/20 mb-8 backdrop-blur-md">
               <Sparkles className="w-3.5 h-3.5 mr-2" />
               New Recommendation
            </div>
            <h1 className="text-display md:text-6xl text-white mb-6 leading-tight">
               Master Your <br/> <span className="underline decoration-white/30 underline-offset-8">Future.</span>
            </h1>
            <p className="text-white/80 text-lg mb-10 leading-relaxed font-medium">
               Explore our curated collection of interactive courses designed to help you master tough concepts and top your class.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input 
                    type="text" 
                    placeholder="Search over 500+ classes..." 
                    className="w-full h-14 bg-white border-none rounded-btn pl-12 pr-4 text-foreground focus:outline-none focus:ring-4 focus:ring-white/20 transition-all font-semibold text-sm shadow-xl"
                  />
               </div>
               <Button size="lg" className="h-14 px-8 rounded-btn bg-foreground text-white font-bold hover:bg-black transition-all shadow-xl active:scale-95">
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
               <h2 className="text-3xl font-bold text-foreground tracking-tight">Featured Courses</h2>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="icon" className="rounded-lg border-border-main bg-white text-text-muted hover:text-primary transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5 rotate-180" />
               </Button>
               <Button variant="outline" size="icon" className="rounded-lg border-border-main bg-white text-text-muted hover:text-primary transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5" />
               </Button>
            </div>
         </div>

         <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10 px-2">
            {catalogCourses.filter(c => c.isFeatured).map((course, i) => (
               <motion.div 
                 key={course.id}
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
               >
                 <Card className="min-w-[320px] md:min-w-[420px] soft-card p-2 group border border-border-main hover:border-primary">
                    <div className="relative aspect-[16/9] rounded-lg bg-bg-soft overflow-hidden mb-6 shadow-sm">
                       <img 
                          src={`https://images.unsplash.com/photo-${[
                             '1635070041078-e363dbe005cb',
                             '1635070040896-73604f762635'
                          ][i % 2]}?q=80&w=1000&auto=format&fit=crop`}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                          alt={course.title}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                       <div className="absolute top-4 left-4">
                          <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30 text-[10px]">
                             {course.subject}
                          </span>
                       </div>
                    </div>
                    <div className="px-5 pb-5">
                       <h3 className="text-xl font-bold text-foreground mb-1 leading-tight tracking-tight group-hover:text-primary transition-colors">
                          {course.title}
                       </h3>
                       <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-8">{course.instructor}</p>
                       
                       <div className="grid grid-cols-3 gap-2 py-5 border-y border-border-soft mb-8">
                          <div className="flex flex-col items-center">
                             <div className="flex items-center gap-1 text-yellow-500 mb-0.5">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="text-xs font-bold">{course.rating}</span>
                             </div>
                             <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Rating</span>
                          </div>
                          <div className="flex flex-col items-center border-x border-border-soft">
                             <div className="flex items-center gap-1 text-foreground mb-0.5">
                                <Users className="w-3.5 h-3.5 text-text-muted" />
                                <span className="text-xs font-bold">{course.students}</span>
                             </div>
                             <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Enrolled</span>
                          </div>
                          <div className="flex flex-col items-center">
                             <div className="flex items-center gap-1 text-foreground mb-0.5">
                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                <span className="text-xs font-bold">{course.duration}</span>
                             </div>
                             <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Duration</span>
                          </div>
                       </div>

                       <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-foreground tracking-tight">{course.price}</div>
                          <Button className="rounded-btn px-6 h-11 bg-primary text-white font-bold shadow-md hover:bg-primary-dark active:scale-95 transition-all">
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
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-8 border-b border-border-soft">
            <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
               <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
                 <TrendingUp className="w-5 h-5 text-white" />
               </div>
               Explore All Classes
            </h2>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
               {["All", "Mathematics", "Science", "Languages", "Social", "Arts"].map((tag, i) => (
                 <button 
                   key={tag}
                   className={cn(
                     "px-5 py-2.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                     i === 0 ? "bg-primary border-primary text-white shadow-md shadow-primary/10" : "bg-white border-border-main text-text-muted hover:text-primary hover:border-primary/20 shadow-sm"
                   )}
                 >
                   {tag}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {catalogCourses.concat(catalogCourses).map((course, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: (i % 4) * 0.05 }}
               >
                 <Card className="soft-card p-1.5 group hover:border-primary border-border-main transition-all flex flex-col">
                    <div className="relative aspect-video rounded-md bg-bg-soft overflow-hidden mb-4 shadow-sm">
                       <img 
                          src={`https://images.unsplash.com/photo-${[
                             '1635070041078-e363dbe005cb',
                             '1635070040896-73604f762635',
                             '1603126857599-f6e157fa2fe6',
                             '1532094349884-543bc11b234d'
                          ][i % 4]}?q=80&w=1000&auto=format&fit=crop`}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                          alt={course.title}
                       />
                       <div className="absolute inset-0 bg-foreground/10 group-hover:bg-transparent transition-colors" />
                       <div className="absolute top-3 left-3">
                          <span className="badge !bg-white/90 !text-primary border-none shadow-sm text-[10px]">{course.subject}</span>
                       </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                       <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 leading-snug tracking-tight group-hover:text-primary transition-colors">
                          {course.title}
                       </h3>
                       <div className="flex items-center gap-2 mb-6">
                          <div className="w-5 h-5 rounded-md bg-primary-light flex items-center justify-center text-[7px] font-bold text-primary">
                             {course.instructor[0]}
                          </div>
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{course.instructor}</span>
                       </div>
                       <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-soft">
                          <div className="flex items-center gap-1 text-yellow-500 text-[11px] font-bold">
                             <Star className="w-3 h-3 fill-current" />
                             {course.rating}
                          </div>
                          <div className="text-sm font-bold text-foreground tracking-tight">{course.price}</div>
                       </div>
                    </div>
                 </Card>
               </motion.div>
            ))}
         </div>
         
         <div className="mt-12 flex justify-center">
            <Button variant="outline" className="h-12 px-10 rounded-btn border-border-main bg-white text-text-muted hover:text-primary hover:border-primary/20 font-bold text-xs shadow-sm active:scale-95 transition-all">
               Load More Courses
            </Button>
         </div>
      </section>
    </div>
  );
}
