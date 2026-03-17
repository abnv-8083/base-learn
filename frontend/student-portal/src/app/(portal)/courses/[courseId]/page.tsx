"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/utils";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Maximize, 
  CheckCircle2, 
  Lock,
  Clock,
  ChevronDown,
  FileText,
  MessageSquare,
  Info,
  PenLine,
  ArrowLeft,
  Settings,
  Share2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const chapters = [
  {
    title: "Unit 1: Number System",
    lessons: [
      { id: 1, title: "Introduction to Polynomials", duration: "12:45", status: "completed" },
      { id: 2, title: "Degree of a Polynomial", duration: "18:20", status: "current" },
      { id: 3, title: "Zeroes of a Polynomial", duration: "15:10", status: "locked" },
    ]
  },
  {
    title: "Unit 2: Algebraic Identities",
    lessons: [
      { id: 4, title: "Basic Identities Recap", duration: "22:00", status: "locked" },
      { id: 5, title: "Square of a Trinomial", duration: "19:30", status: "locked" },
    ]
  }
];

export default function CourseDetail({ params }: { params: { courseId: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 md:p-10 space-y-10">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-6">
        <Link 
          href="/courses" 
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all w-fit"
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to My Journey
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Polynomials Mastery</h1>
                <span className="badge !bg-primary/10 !text-primary border-primary/20">GRADE 9</span>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-primary text-xs shadow-sm">
                      SS
                   </div>
                   <div>
                      <div className="text-xs font-black text-slate-900 leading-none mb-1">Dr. Sarah Smith</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Senior Mentor</div>
                   </div>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                   <Clock className="w-4 h-4 text-primary" />
                   12 Lessons • 8h 45m total
                </div>
             </div>
          </div>
          
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-primary-glow/5 min-w-[320px]">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mastery Level</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full">58% COMPLETED</span>
             </div>
             <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "58%" }}
                  className="h-full primary-gradient shadow-lg" 
                />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* Enhanced Video Player */}
          <section className="relative aspect-video rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl shadow-primary-glow/20 group cursor-pointer">
             <img 
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                alt="Video Background"
             />
             
             {/* Center Play Button */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-500 group">
                   <Play className="w-10 h-10 text-white fill-current ml-1 group-hover:scale-110 transition-transform" />
                </div>
             </div>

             {/* Dynamic Video Controls */}
             <div className="absolute inset-x-6 bottom-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 pb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="space-y-6">
                   <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative group/progress">
                      <div className="absolute inset-y-0 left-0 w-[45%] bg-primary shadow-lg shadow-primary-glow" />
                      <div className="absolute top-1/2 left-[45%] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-0 group-hover/progress:scale-100 transition-transform" />
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                         <div className="flex items-center gap-6">
                            <SkipBack className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
                            <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center hover:bg-white/90 transition-all shadow-xl active:scale-95">
                               <Play className="w-5 h-5 text-primary fill-current ml-1" />
                            </button>
                            <SkipForward className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
                         </div>
                         <div className="flex items-center gap-4">
                            <Volume2 className="w-5 h-5 text-white/70" />
                            <div className="w-24 h-1.5 bg-white/20 rounded-full">
                               <div className="h-full w-2/3 bg-white" />
                            </div>
                         </div>
                         <div className="text-[10px] font-black text-white uppercase tracking-widest opacity-70">
                            08:24 / 18:20
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                         <button className="text-[10px] font-black text-white uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl border border-white/10 hover:bg-white hover:text-primary transition-all">
                            1.0X Speed
                         </button>
                         <Maximize className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* Tabbed Navigation */}
          <Tabs defaultValue="overview" className="w-full">
             <TabsList className="bg-white border border-slate-100 p-2 rounded-[2rem] w-fit shadow-sm">
                <TabsTrigger value="overview" className="rounded-2xl px-10 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-primary-glow border-none transition-all">
                   <Info className="w-4 h-4 mr-2" />
                   Overview
                </TabsTrigger>
                <TabsTrigger value="notes" className="rounded-2xl px-10 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-primary-glow border-none transition-all">
                   <PenLine className="w-4 h-4 mr-2" />
                   Notes
                </TabsTrigger>
                <TabsTrigger value="discussions" className="rounded-2xl px-10 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-primary-glow border-none transition-all">
                   <MessageSquare className="w-4 h-4 mr-2" />
                   Community
                </TabsTrigger>
             </TabsList>
             
             <TabsContent value="overview" className="pt-10">
                <Card className="soft-card p-10 relative overflow-hidden border-2 border-primary/5">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                   <div className="relative z-10 space-y-8">
                     <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">About this lesson</h2>
                        <p className="text-slate-500 leading-relaxed font-bold text-lg opacity-70">
                           In this chapter, we will dive deep into the world of Polynomials. Starting from the basic definitions, we will cover degrees, types of polynomials, and move towards advanced concepts like the remainder theorem and factor theorem.
                        </p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Learning Outcomes</h3>
                           <ul className="space-y-4">
                              {["Understand Degree of Polynomials", "Zeroes and Geometric meaning", "Division Algorithm for Classes"].map((item, i) => (
                                 <li key={i} className="flex items-center gap-4 text-sm text-slate-600 font-bold">
                                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                       <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    {item}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                   </div>
                </Card>
             </TabsContent>

             <TabsContent value="notes" className="pt-10">
                <Card className="soft-card p-10 bg-white">
                   <div className="flex items-center justify-between mb-10">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lesson Notes</h2>
                      <Button className="rounded-2xl bg-primary hover:opacity-90 text-white font-black h-12 shadow-xl shadow-primary-glow active:scale-95 transition-all text-[10px] uppercase tracking-widest px-8">
                         Add New Note
                      </Button>
                   </div>
                   <div className="space-y-6">
                      <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl group cursor-pointer hover:border-primary/20 transition-all">
                         <div className="flex items-center justify-between mb-4">
                            <span className="badge !bg-primary/10 !text-primary border-primary/20 !px-4 !py-2 uppercase font-black text-[10px]">Timestamp • 04:12</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2 hours ago</span>
                         </div>
                         <p className="text-slate-900 font-bold text-lg leading-relaxed">Important: The degree of a constant polynomial is zero.</p>
                      </div>
                   </div>
                </Card>
             </TabsContent>
          </Tabs>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-8 border-2 border-primary/5">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Curriculum</h2>
                 <span className="badge !bg-slate-50 !text-slate-400 !px-3 font-black">12 Lessons</span>
              </div>

              <div className="space-y-8">
                 {chapters.map((chapter, i) => (
                    <div key={i} className="space-y-6">
                       <div className="flex items-center justify-between group cursor-pointer border-b border-slate-50 pb-2">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] group-hover:text-primary transition-colors">{chapter.title}</h3>
                          <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                       </div>
                       <div className="space-y-3">
                          {chapter.lessons.map((lesson) => (
                             <div 
                               key={lesson.id} 
                               className={cn(
                                 "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group/lesson",
                                 lesson.status === "current" 
                                   ? "bg-primary border-primary shadow-xl shadow-primary-glow/20" 
                                   : "bg-white border-slate-50 hover:bg-slate-50 hover:border-slate-100 shadow-sm"
                               )}
                             >
                                <div className={cn(
                                   "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                   lesson.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                   lesson.status === "current" ? "bg-white/20 text-white border border-white/30" : "bg-slate-50 text-slate-300 border border-slate-100 group-hover/lesson:text-primary transition-colors"
                                )}>
                                   {lesson.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : 
                                    lesson.status === "locked" ? <Lock className="w-4 h-4" /> : 
                                    <Play className="w-5 h-5 fill-current ml-1" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className={cn(
                                      "text-sm font-black leading-tight mb-1 truncate tracking-tight",
                                      lesson.status === "current" ? "text-white" : "text-slate-900"
                                   )}>
                                      {lesson.id}. {lesson.title}
                                   </div>
                                   <div className={cn(
                                      "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                                      lesson.status === "current" ? "text-white/60" : "text-slate-400"
                                   )}>
                                      <Clock className="w-3 h-3" />
                                      {lesson.duration}
                                   </div>
                                 </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="space-y-4 mt-12 pt-8 border-t border-slate-50">
                 <Button className="w-full h-14 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 font-black uppercase tracking-widest text-[10px] space-x-3 shadow-sm transition-all group">
                    <FileText className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                    <span>Resource Bundle.zip</span>
                 </Button>
                 <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] space-x-3 shadow-xl active:scale-95 transition-all">
                    <Share2 className="w-5 h-5" />
                    <span>Invite Study Buddy</span>
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
