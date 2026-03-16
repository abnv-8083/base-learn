"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/tabs";
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
  ArrowLeft
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
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
    <div className="min-h-screen bg-black text-white px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
           <Link href="/courses" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to My Courses
           </Link>
           <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black">Mathematics — Polynomials</h1>
              <Badge className="bg-blue-600 text-white border-none text-[10px] font-black uppercase py-0.5 px-3">Grade 9</Badge>
           </div>
           <div className="flex items-center gap-4 text-zinc-500">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-zinc-800" />
                 <span className="text-xs font-bold text-zinc-400">Dr. Sarah Smith</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="text-xs font-bold">12 Lessons • 8h 45m total</span>
           </div>
        </div>
        
        <div className="w-full md:w-64 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
           <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase text-zinc-500">Overall Progress</span>
              <span className="text-sm font-black text-white">58%</span>
           </div>
           <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-[58%] bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Video Player & Tabs */}
        <div className="lg:col-span-8 space-y-8">
          <section className="relative aspect-video rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl group">
             {/* Fake Video Content */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                   <Play className="w-10 h-10 text-blue-500 fill-current ml-1" />
                </div>
             </div>

             {/* Video Controls Overlay */}
             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="space-y-4">
                   <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer relative group/progress">
                      <div className="absolute inset-y-0 left-0 w-[45%] bg-blue-500" />
                      <div className="absolute top-1/2 left-[45%] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-4">
                            <SkipBack className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer transition-colors" />
                            <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-zinc-200 transition-colors">
                               {isPlaying ? <Pause className="w-5 h-5 text-black fill-current" /> : <Play className="w-5 h-5 text-black fill-current ml-1" />}
                            </button>
                            <SkipForward className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer transition-colors" />
                         </div>
                         <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-white" />
                            <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                               <div className="h-full w-2/3 bg-white" />
                            </div>
                         </div>
                         <div className="text-xs font-bold text-white tracking-widest uppercase">
                            08:24 / 18:20
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <Button variant="ghost" size="sm" className="text-[10px] font-black text-white hover:bg-white/10 uppercase tracking-widest border border-white/10 rounded-lg">
                            1.0x
                         </Button>
                         <Maximize className="w-5 h-5 text-white hover:text-blue-400 cursor-pointer transition-colors" />
                      </div>
                   </div>
                </div>
             </div>
          </section>

          <Tabs defaultValue="overview" className="w-full">
             <TabsList className="bg-zinc-950 border border-zinc-900 p-1 rounded-2xl w-full justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger value="overview" className="rounded-xl px-8 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                   <Info className="w-3.5 h-3.5 mr-2" />
                   Overview
                </TabsTrigger>
                <TabsTrigger value="notes" className="rounded-xl px-8 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                   <PenLine className="w-3.5 h-3.5 mr-2" />
                   Notes
                </TabsTrigger>
                <TabsTrigger value="discussions" className="rounded-xl px-8 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                   <MessageSquare className="w-3.5 h-3.5 mr-2" />
                   Discussions
                </TabsTrigger>
             </TabsList>
             
             <TabsContent value="overview" className="pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Card className="p-8 bg-zinc-950 border-zinc-900">
                   <h2 className="text-xl font-black text-white mb-4">About this course</h2>
                   <p className="text-zinc-400 leading-relaxed font-medium mb-8">
                      In this chapter, we will dive deep into the world of Polynomials. Starting from the basic definitions, we will cover degrees, types of polynomials, and move towards advanced concepts like the remainder theorem and factor theorem.
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <h3 className="text-sm font-black text-white uppercase tracking-widest">What you'll learn</h3>
                         <ul className="space-y-3">
                            {["Understand Degree of Polynomials", "Zeroes and their Geometric meaning", "Division Algorithm for Polynomials"].map((item, i) => (
                               <li key={i} className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                  {item}
                               </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </Card>
             </TabsContent>

             <TabsContent value="notes" className="pt-8">
                <Card className="p-8 bg-zinc-950 border-zinc-900">
                   <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-black text-white">Your Notes</h2>
                      <Button className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold h-10">
                         Create New Note
                      </Button>
                   </div>
                   <div className="space-y-4">
                      <Card className="p-4 bg-zinc-900 border-zinc-800">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Timestamp • 04:12</span>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">2 hours ago</span>
                         </div>
                         <p className="text-sm text-white font-medium">Important: The degree of a constant polynomial is zero.</p>
                      </Card>
                   </div>
                </Card>
             </TabsContent>
          </Tabs>
        </div>

        {/* Right: Chapter List */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="p-6 bg-zinc-950 border-zinc-900 sticky top-[6rem]">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-white">Course Content</h2>
                 <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 text-[10px] font-black">12 Lessons</Badge>
              </div>

              <div className="space-y-6">
                 {chapters.map((chapter, i) => (
                    <div key={i} className="space-y-4">
                       <div className="flex items-center justify-between group cursor-pointer">
                          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{chapter.title}</h3>
                          <ChevronDown className="w-4 h-4 text-zinc-700" />
                       </div>
                       <div className="space-y-2">
                          {chapter.lessons.map((lesson) => (
                             <div 
                               key={lesson.id} 
                               className={cn(
                                 "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group/lesson",
                                 lesson.status === "current" 
                                   ? "bg-blue-600/10 border-blue-600/30 ring-1 ring-blue-600/20" 
                                   : "bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700"
                               )}
                             >
                                <div className={cn(
                                   "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                   lesson.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                                   lesson.status === "current" ? "bg-white text-black" : "bg-zinc-900 text-zinc-700"
                                )}>
                                   {lesson.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : 
                                    lesson.status === "locked" ? <Lock className="w-3.5 h-3.5" /> : 
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className={cn(
                                      "text-xs font-bold leading-tight mb-1 truncate",
                                      lesson.status === "current" ? "text-white" : "text-zinc-400 group-hover/lesson:text-white"
                                   )}>
                                      {lesson.title}
                                   </div>
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600">
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

              <Button className="w-full mt-10 h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800 font-bold uppercase tracking-widest text-[10px] space-x-2">
                 <FileText className="w-4 h-4 text-zinc-500" />
                 <span>Download Course Resources</span>
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
