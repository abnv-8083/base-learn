"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { 
  Search, 
  Filter, 
  PlayCircle, 
  Clock, 
  BookOpen,
  MoreVertical,
  Bookmark,
  Star,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";

const categories = ["All", "Enrolled", "Completed", "Bookmarked"];
const subjects = ["Math", "Physics", "Chemistry", "Biology", "English", "Social"];

const courses = [
  {
    id: 1,
    title: "Mathematics — Chapter 5: Polynomials",
    subject: "Math",
    instructor: "Dr. Sarah Smith",
    progress: 58,
    chapters: "7 of 12",
    lastAccessed: "2 days ago",
    status: "Enrolled",
    color: "bg-primary",
    lightColor: "bg-blue-50",
    textColor: "text-primary"
  },
  {
    id: 2,
    title: "Physics — Chapter 3: Laws of Motion",
    subject: "Physics",
    instructor: "Prof. James Wilson",
    progress: 100,
    chapters: "10 of 10",
    lastAccessed: "1 week ago",
    status: "Completed",
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600"
  },
  {
    id: 3,
    title: "Chemistry — Chapter 2: Periodic Table",
    subject: "Chemistry",
    instructor: "Dr. Elena Rossi",
    progress: 25,
    chapters: "3 of 12",
    lastAccessed: "5 hours ago",
    status: "Enrolled",
    color: "bg-sky-500",
    lightColor: "bg-sky-50",
    textColor: "text-sky-600"
  },
  {
    id: 4,
    title: "Biology — Chapter 4: Cell Structure",
    subject: "Biology",
    instructor: "Dr. Michael Chen",
    progress: 85,
    chapters: "9 of 11",
    lastAccessed: "Yesterday",
    status: "Enrolled",
    color: "bg-blue-400",
    lightColor: "bg-blue-50",
    textColor: "text-blue-500"
  },
];

export default function MyCourses() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === "All" || course.status === activeCategory;
    const matchesSubject = !selectedSubject || course.subject === selectedSubject;
    return matchesCategory && matchesSubject;
  });

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <GraduationCap className="w-3 h-3 mr-2" />
             My Learning Journey
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">My <span className="text-gradient">Courses</span></h1>
          <p className="text-slate-500 font-bold">You have 4 active courses in progress.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search my courses..." 
               className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold shadow-sm"
             />
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
             <Filter className="w-4 h-4 mr-2" />
             Filters
          </Button>
        </div>
      </div>

      {/* Categories & Subjects */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
           {categories.map((cat) => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                 activeCategory === cat ? "bg-primary text-white shadow-lg shadow-primary-glow" : "text-slate-400 hover:text-primary hover:bg-primary/5"
               )}
             >
               {cat}
             </button>
           ))}
        </div>

        <div className="flex flex-wrap gap-3">
           {subjects.map((sub) => (
             <button
               key={sub}
               onClick={() => setSelectedSubject(selectedSubject === sub ? null : sub)}
               className={cn(
                 "px-6 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                 selectedSubject === sub 
                   ? "bg-primary border-primary text-white shadow-lg shadow-primary-glow" 
                   : "bg-white border-slate-100 text-slate-400 hover:border-primary/20 hover:text-primary shadow-sm"
               )}
             >
               {sub}
             </button>
           ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="soft-card group p-2 relative overflow-hidden flex flex-col border-2 border-transparent hover:border-primary/10">
              <div className="relative aspect-[16/10] rounded-2xl bg-slate-100 overflow-hidden">
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
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                      <PlayCircle className="w-10 h-10 text-primary fill-primary/10" />
                    </div>
                 </div>
                 <div className="absolute top-4 left-4 flex gap-2">
                    <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30">
                       {course.subject}
                    </span>
                    {course.status === "Completed" && (
                       <span className="badge !bg-emerald-500 !text-white border-none shadow-lg shadow-emerald-500/20">
                          Completed
                       </span>
                    )}
                 </div>
                 <button className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/20 text-white hover:bg-white hover:text-primary transition-all backdrop-blur-md border border-white/20">
                    <Bookmark className="w-4 h-4" />
                 </button>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                 <div className="flex items-start justify-between gap-4 mb-6">
                    <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
                       {course.title}
                    </h3>
                    <button className="text-slate-300 hover:text-primary transition-colors shrink-0">
                       <MoreVertical className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-primary">
                       {course.instructor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                       <div className="text-xs font-black text-slate-900 leading-none mb-1">{course.instructor}</div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Instructor</div>
                    </div>
                 </div>

                 <div className="mt-auto space-y-6">
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Progress: {course.chapters}</span>
                          <span className="text-primary">{course.progress}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${course.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn("h-full", course.color, "shadow-lg shadow-primary-glow/20")} 
                          />
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-2.5 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{course.lastAccessed}</span>
                       </div>
                       <Button size="sm" className={cn(
                          "rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] h-10 px-6 transition-all active:scale-95 shadow-lg shadow-primary-glow",
                          course.status === "Completed" ? "bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-none" : "bg-primary text-white"
                       )}>
                          {course.status === "Completed" ? "Review" : "Continue"}
                       </Button>
                    </div>
                 </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
         <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 shadow-sm">
               <BookOpen className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No courses found</h3>
            <p className="text-slate-400 font-bold max-w-xs mx-auto">Try adjusting your filters or browse our catalog for new subjects.</p>
            <Button className="mt-10 rounded-2xl bg-primary text-white font-black h-14 px-10 shadow-xl shadow-primary-glow active:scale-95 transition-all">
                Explore Full Catalog
            </Button>
         </div>
      )}
    </div>
  );
}
