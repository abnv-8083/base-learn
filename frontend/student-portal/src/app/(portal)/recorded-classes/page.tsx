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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="badge mb-4">
             <PlayCircle className="w-3.5 h-3.5 mr-2" />
             Recorded Library
          </div>
          <h1 className="text-display mb-1">Watch <span className="text-gradient">Anytime</span></h1>
          <p className="text-text-muted font-medium">Access 500+ high-quality recorded sessions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
             <input 
               type="text" 
               placeholder="Find a topic..." 
               className="w-full h-11 bg-white border border-border-main rounded-btn pl-11 pr-4 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium shadow-sm"
             />
          </div>
          <Button variant="outline" className="h-11 px-5 rounded-btn border-border-main bg-white text-text-muted font-semibold text-sm hover:bg-primary-light hover:text-primary transition-all">
             <Filter className="w-4 h-4 mr-2" />
             Filters
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-border-main rounded-xl w-fit shadow-sm">
         {["All", "Math", "Science", "English", "Social"].map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={cn(
                "px-6 py-2 rounded-lg text-xs font-semibold transition-all duration-300",
                activeTab === tab ? "bg-primary text-white shadow-md shadow-primary/10" : "text-text-muted hover:text-primary hover:bg-primary-light"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recordedClasses.map((classItem, i) => {
          const progress = (parseInt(classItem.watched.split(':')[0]) / parseInt(classItem.duration.split(':')[0])) * 100 || 0;
          return (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="soft-card group p-2 relative overflow-hidden flex flex-col border border-border-main transition-all hover:border-primary">
                <div className="relative aspect-video rounded-lg bg-bg-soft overflow-hidden shadow-sm">
                   <img 
                      src={classItem.thumbnail}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                      alt={classItem.title}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent group-hover:from-foreground/90 transition-all" />
                   
                   {/* Play Button Overlay */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                        <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                      </div>
                   </div>

                   <div className="absolute top-3 left-3">
                      <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30 text-[10px] px-2 py-0.5">
                         {classItem.subject}
                      </span>
                   </div>
                   
                   <div className="absolute bottom-3 right-3">
                      <span className="bg-foreground/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 tracking-wide">
                         {classItem.duration}
                      </span>
                   </div>

                   {/* Progress Bar */}
                   {progress > 0 && (
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div 
                           className="h-full bg-primary shadow-[0_0_8px_rgba(0,102,255,0.6)]" 
                           style={{ width: `${progress}%` }}
                        />
                     </div>
                   )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                   <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-snug tracking-tight mb-3 group-hover:text-primary transition-colors">
                      {classItem.title}
                   </h3>
                   
                   <div className="flex items-center gap-4 mb-6 text-[11px] font-semibold text-text-muted tracking-wide">
                      <div className="flex items-center gap-1.5">
                         <Users className="w-3.5 h-3.5 text-primary" />
                         {classItem.views} Views
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                         {classItem.rating}
                      </div>
                   </div>

                   <div className="mt-auto pt-4 border-t border-border-soft flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                         <div className="w-7 h-7 rounded-md bg-primary-light flex items-center justify-center text-[9px] font-bold text-primary">
                            {classItem.instructor.split(' ').map(n => n[0]).join('')}
                         </div>
                         <div className="text-[11px] font-bold text-foreground tracking-tight leading-none">
                            {classItem.instructor}
                         </div>
                      </div>
                      <button className="text-text-muted hover:text-primary transition-all">
                         <Bookmark className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
         <Button variant="outline" className="h-12 px-10 rounded-btn border-border-main bg-white text-text-muted hover:text-primary hover:border-primary/20 font-bold text-sm shadow-sm active:scale-95 transition-all">
            Load More Sessions
         </Button>
      </div>
    </div>
  );
}
