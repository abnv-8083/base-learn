"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { 
  Search, 
  PlayCircle, 
  Clock, 
  Star, 
  Users, 
  Filter, 
  Bookmark,
  ChevronRight,
  Play
} from "lucide-react";
import { motion } from "framer-motion";

const recordedClasses = [
  {
    id: 1,
    title: "Triangles & Congruence — Part 2",
    subject: "Math",
    instructor: "Dr. Elena Rossi",
    duration: "42:15",
    watched: "14:00",
    views: "1.2k",
    rating: 4.8,
    date: "March 12, 2026",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000",
    color: "bg-primary"
  },
  {
    id: 2,
    title: "Force & Laws of Motion",
    subject: "Physics",
    instructor: "Prof. James Wilson",
    duration: "55:30",
    watched: "0:00",
    views: "850",
    rating: 4.9,
    date: "March 10, 2026",
    thumbnail: "https://images.unsplash.com/photo-1635070040896-73604f762635?q=80&w=1000",
    color: "bg-indigo-600"
  },
  {
    id: 3,
    title: "Chemical Bonding Deep Dive",
    subject: "Chemistry",
    instructor: "Dr. Sarah Smith",
    duration: "48:20",
    watched: "48:20",
    views: "2.1k",
    rating: 4.7,
    date: "March 08, 2026",
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=1000",
    color: "bg-sky-500"
  },
  {
    id: 4,
    title: "Cell Division & Genetics",
    subject: "Biology",
    instructor: "Dr. Michael Chen",
    duration: "38:45",
    watched: "10:15",
    views: "920",
    rating: 4.6,
    date: "March 05, 2026",
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000",
    color: "bg-blue-400"
  }
];

export default function RecordedClasses() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <PlayCircle className="w-3 h-3 mr-2" />
             Recorded Library
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Watch <span className="text-gradient">Anytime</span></h1>
          <p className="text-slate-500 font-bold">Access 500+ high-quality recorded sessions.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Find a topic..." 
               className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold shadow-sm"
             />
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
             <Filter className="w-4 h-4 mr-2" />
             Filters
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
         {["All", "Math", "Science", "English", "Social"].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
               "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
               activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary-glow" : "text-slate-400 hover:text-primary hover:bg-primary/5"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {recordedClasses.map((classItem, i) => {
          const progress = (parseInt(classItem.watched.split(':')[0]) / parseInt(classItem.duration.split(':')[0])) * 100 || 0;
          return (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="soft-card group p-2 relative overflow-hidden flex flex-col border-2 border-transparent hover:border-primary/10">
                <div className="relative aspect-video rounded-2xl bg-slate-100 overflow-hidden shadow-sm">
                   <img 
                      src={classItem.thumbnail}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      alt={classItem.title}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                   
                   {/* Play Button Overlay */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                        <Play className="w-8 h-8 text-primary fill-primary/10 ml-1" />
                      </div>
                   </div>

                   <div className="absolute top-4 left-4">
                      <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30">
                         {classItem.subject}
                      </span>
                   </div>
                   
                   <div className="absolute bottom-4 right-4">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg border border-white/10 uppercase tracking-widest">
                         {classItem.duration}
                      </span>
                   </div>

                   {/* Progress Bar */}
                   {progress > 0 && (
                     <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                        <div 
                          className="h-full bg-primary shadow-lg shadow-primary-glow" 
                          style={{ width: `${progress}%` }}
                        />
                     </div>
                   )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                   <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight mb-4 group-hover:text-primary transition-colors">
                      {classItem.title}
                   </h3>
                   
                   <div className="flex items-center gap-6 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                         <Users className="w-4 h-4 text-primary" />
                         {classItem.views} Views
                      </div>
                      <div className="flex items-center gap-2">
                         <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                         {classItem.rating}
                      </div>
                   </div>

                   <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[8px] font-black text-primary">
                            {classItem.instructor.split(' ').map(n => n[0]).join('')}
                         </div>
                         <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
                            {classItem.instructor}
                         </div>
                      </div>
                      <button className="text-slate-300 hover:text-primary transition-all">
                         <Bookmark className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-20 text-center">
         <Button variant="outline" className="h-16 px-12 rounded-[2rem] border-slate-100 bg-white text-slate-400 hover:text-primary hover:border-primary/20 font-black uppercase tracking-widest text-[11px] shadow-sm active:scale-95 transition-all">
            Load More Sessions
         </Button>
      </div>
    </div>
  );
}
