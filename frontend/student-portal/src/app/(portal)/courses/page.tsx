"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { 
  Search, 
  Filter, 
  PlayCircle, 
  Clock, 
  BookOpen,
  MoreVertical,
  Bookmark
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
    color: "bg-blue-500",
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
    color: "bg-purple-500",
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
    color: "bg-pink-500",
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
    color: "bg-emerald-500",
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
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">My Courses</h1>
          <p className="text-zinc-500 font-medium text-sm">You are currently enrolled in 4 active courses.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               placeholder="Search my courses..." 
               className="w-full h-11 bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
             />
          </div>
          <Button variant="outline" className="h-11 rounded-2xl border-zinc-800 text-zinc-400 hover:text-white">
             <Filter className="w-4 h-4 mr-2" />
             Filters
          </Button>
        </div>
      </div>

      {/* Categories & Subjects */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit">
           {categories.map((cat) => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                 activeCategory === cat ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
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
                 "px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all",
                 selectedSubject === sub 
                   ? "bg-blue-600 border-blue-600 text-white" 
                   : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-white"
               )}
             >
               {sub}
             </button>
           ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="group p-1 bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all flex flex-col">
            <div className="relative aspect-[16/10] rounded-xl bg-zinc-800 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-14 h-14 text-white fill-white/20 scale-90 group-hover:scale-100 transition-transform" />
               </div>
               <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={cn("bg-zinc-900/80 border-white/10 text-white font-black text-[10px] uppercase tracking-widest", course.color.replace('bg-', 'text-'))}>
                    {course.subject}
                  </Badge>
                  {course.status === "Completed" && (
                     <Badge className="bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest border-none">
                        Completed
                     </Badge>
                  )}
               </div>
               <button className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 text-white hover:bg-black transition-colors backdrop-blur-md">
                  <Bookmark className="w-4 h-4" />
               </button>
            </div>

            <div className="p-5 flex-1 flex flex-col">
               <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                     {course.title}
                  </h3>
                  <button className="text-zinc-600 hover:text-white">
                     <MoreVertical className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                     {course.instructor.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                     <div className="text-xs font-bold text-white leading-none mb-1">{course.instructor}</div>
                     <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Instructor</div>
                  </div>
               </div>

               <div className="mt-auto space-y-4">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
                        <span className="text-zinc-500">Chapters: {course.chapters}</span>
                        <span className="text-white">{course.progress}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          className={cn("h-full", course.color)} 
                        />
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                     <div className="flex items-center gap-2 text-zinc-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">{course.lastAccessed}</span>
                     </div>
                     <Button size="sm" className={cn(
                        "rounded-xl font-black text-xs uppercase tracking-widest h-9 px-5",
                        course.status === "Completed" ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-blue-600 hover:bg-blue-500"
                     )}>
                        {course.status === "Completed" ? "Review" : "Continue"}
                     </Button>
                  </div>
               </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
         <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
               <BookOpen className="w-10 h-10 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">Try adjusting your filters or browse our catalog for new subjects.</p>
            <Button className="mt-8 rounded-2xl bg-white text-black font-bold h-12 shadow-xl shadow-white/5">
                Explore Catalog
            </Button>
         </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
