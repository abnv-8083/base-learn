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
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <div className="badge mb-4">
             <GraduationCap className="w-3.5 h-3.5 mr-2" />
             My Learning Journey
          </div>
          <h1 className="text-display mb-1">My <span className="text-gradient">Courses</span></h1>
          <p className="text-text-muted font-medium">You have 4 active courses in progress.</p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
             <input 
               type="text" 
               placeholder="Search my courses..." 
               className="w-full h-11 bg-white border border-border-main rounded-btn pl-12 pr-4 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium shadow-sm"
             />
          </div>
          <Button variant="outline" className="h-11 px-6 rounded-btn border-border-main bg-white text-text-muted font-bold text-[10px] uppercase tracking-widest hover:bg-primary-light hover:text-primary transition-all shadow-sm">
             <Filter className="w-3.5 h-3.5 mr-2" />
             Filters
          </Button>
        </div>
      </div>

      {/* Categories & Subjects */}
      <div className="space-y-6">
        <div className="flex items-center gap-1.5 p-1.5 bg-bg-soft border border-border-main rounded-lg w-fit shadow-sm">
           {categories.map((cat) => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                 activeCategory === cat ? "bg-white text-primary shadow-sm border border-border-main" : "text-text-muted hover:text-primary hover:bg-primary-light"
               )}
             >
               {cat}
             </button>
           ))}
        </div>

        <div className="flex flex-wrap gap-2">
           {subjects.map((sub) => (
             <button
               key={sub}
               onClick={() => setSelectedSubject(selectedSubject === sub ? null : sub)}
               className={cn(
                 "px-5 py-2 rounded-btn border text-[10px] font-bold uppercase tracking-wider transition-all",
                 selectedSubject === sub 
                   ? "bg-primary border-primary text-white shadow-md shadow-primary/10" 
                   : "bg-white border-border-main text-text-muted hover:border-primary/20 hover:text-primary shadow-sm"
               )}
             >
               {sub}
             </button>
           ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="soft-card group p-1.5 relative overflow-hidden flex flex-col border border-border-main hover:border-primary">
              <div className="relative aspect-[16/10] rounded-md bg-bg-soft overflow-hidden">
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
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                      <PlayCircle className="w-8 h-8 text-primary fill-primary/10" />
                    </div>
                 </div>
                 <div className="absolute top-3 left-3 flex gap-2">
                    <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30 text-[10px]">
                       {course.subject}
                    </span>
                    {course.status === "Completed" && (
                       <span className="badge !bg-emerald-500 !text-white border-none shadow-md shadow-emerald-500/10 text-[10px]">
                          Completed
                       </span>
                    )}
                 </div>
                 <button className="absolute top-3 right-3 p-2 rounded-md bg-white/20 text-white hover:bg-white hover:text-primary transition-all backdrop-blur-md border border-white/20">
                    <Bookmark className="w-4 h-4" />
                 </button>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                 <div className="flex items-start justify-between gap-4 mb-5">
                    <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
                       {course.title}
                    </h3>
                    <button className="text-text-muted hover:text-primary transition-colors shrink-0">
                       <MoreVertical className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-[8px] font-bold text-primary">
                       {course.instructor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                       <div className="text-[11px] font-bold text-foreground leading-none mb-1">{course.instructor}</div>
                       <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-none">Instructor</div>
                    </div>
                 </div>

                 <div className="mt-auto space-y-5">
                    <div className="space-y-2.5">
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-text-muted">Progress: {course.chapters}</span>
                          <span className="text-primary">{course.progress}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-border-soft rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${course.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn("h-full", course.color.includes('primary') ? 'bg-primary' : course.color, "shadow-sm shadow-primary/10")} 
                          />
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-border-soft">
                       <div className="flex items-center gap-2 text-text-muted">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{course.lastAccessed}</span>
                       </div>
                       <Button size="sm" className={cn(
                          "rounded-btn font-bold text-[10px] uppercase tracking-widest h-9 px-5 transition-all active:scale-95 shadow-md shadow-primary/10",
                          course.status === "Completed" ? "bg-bg-soft text-text-muted hover:bg-border-soft shadow-none" : "bg-primary text-white hover:bg-primary-dark"
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
         <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-xl bg-bg-soft border border-border-main flex items-center justify-center mb-6 shadow-sm">
               <BookOpen className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">No courses found</h3>
            <p className="text-text-muted font-medium max-w-xs mx-auto text-sm">Try adjusting your filters or browse our catalog for new subjects.</p>
            <Button className="mt-8 rounded-btn bg-primary text-white font-bold h-12 px-8 shadow-lg shadow-primary/10 active:scale-95 transition-all">
                Explore Full Catalog
            </Button>
         </div>
      )}
    </div>
  );
}
