"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  FlaskConical, 
  Timer, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Play,
  History,
  Target,
  ChevronRight,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

const tests = [
  {
    id: 1,
    title: "Unit Test: Algebraic Identities",
    subject: "Math",
    type: "MCQ + Descriptive",
    duration: "45 Mins",
    marks: "50 Marks",
    date: "Scheduled: Today, 4:00 PM",
    status: "Upcoming",
    color: "bg-primary"
  },
  {
    id: 2,
    title: "Chapter Quiz: Laws of Motion",
    subject: "Physics",
    type: "MCQ",
    duration: "20 Mins",
    marks: "25 Marks",
    date: "Scheduled: tomorrow, 10:00 AM",
    status: "Upcoming",
    color: "bg-indigo-600"
  },
  {
    id: 3,
    title: "Monthly Mock Test: Science",
    subject: "Chemistry",
    type: "Full Syllabus",
    duration: "120 Mins",
    marks: "100 Marks",
    date: "March 12, 2026",
    status: "Completed",
    score: "88/100",
    color: "bg-sky-500"
  },
  {
    id: 4,
    title: "English Grammar Proficiency",
    subject: "English",
    type: "Practice",
    duration: "30 Mins",
    marks: "Practice",
    date: "Available Anytime",
    status: "Practice",
    color: "bg-blue-400"
  }
];

export default function Tests() {
  const [activeTab, setActiveTab] = useState("Upcoming");

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <FlaskConical className="w-3 h-3 mr-2" />
             Assessment Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Crack the <span className="text-gradient">Board</span></h1>
          <p className="text-slate-500 font-bold">Real-time tests designed to boost your ranking.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
             <Play className="w-4 h-4 mr-3 fill-current" />
             Quick Practice
          </Button>
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
             <History className="w-4 h-4 mr-2" />
             Test History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
             {["Upcoming", "In Progress", "Completed", "Practice"].map((tab) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tests.filter(t => t.status === activeTab || activeTab === "Upcoming").map((test, i) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="soft-card p-8 group border-2 border-transparent hover:border-primary/10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", test.color)}>
                        <FlaskConical className="w-6 h-6" />
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{test.subject}</div>
                        <div className="text-xs font-bold text-slate-900">{test.type}</div>
                     </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">{test.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-10 py-6 border-y border-slate-50">
                     <div className="flex items-center gap-3">
                        <Timer className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{test.duration}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{test.marks}</span>
                     </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timing</span>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.05em] leading-none">{test.date}</span>
                     </div>
                     
                     {test.status === "Completed" ? (
                        <div className="text-right">
                           <div className="text-2xl font-black text-primary tracking-tighter">{test.score}</div>
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Scored</div>
                        </div>
                     ) : (
                        <Button className="h-11 px-6 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-glow group-hover:scale-105 transition-transform">
                           Start Test
                        </Button>
                     )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-10 bg-gradient-to-br from-white to-slate-50 border-2 border-primary/5">
              <div className="space-y-8">
                 <div className="p-4 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                       <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Ranked Achievement</div>
                       <div className="text-sm font-black text-slate-900 leading-tight">Silver Tier in Physics</div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                       <TrendingUp className="w-5 h-5 text-primary" />
                       Recent Performance
                    </h3>
                    <div className="space-y-4">
                       {[
                         { sub: "Math Mock", score: "94%", trend: "up" },
                         { sub: "Science Quiz", score: "78%", trend: "down" },
                         { sub: "English Proficiency", score: "88%", trend: "up" },
                       ].map((stat, i) => (
                         <div key={i} className="flex items-center justify-between group">
                            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{stat.sub}</span>
                            <div className="flex items-center gap-3">
                               <span className="text-sm font-black text-slate-900">{stat.score}</span>
                               <div className={cn(
                                 "w-1.5 h-1.5 rounded-full",
                                 stat.trend === "up" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"
                               )} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <Button className="w-full h-14 rounded-2xl bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                    Full Report Card
                 </Button>
              </div>
           </Card>

           <Card className="soft-card p-8 border-2 border-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
              <h3 className="font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-red-500" />
                 Testing Protocol
              </h3>
              <ul className="space-y-4">
                 {[
                   "Ensure stable internet connection",
                   "Camera may be required for board prep",
                   "Zen mode will be activated automatically",
                   "Results are shared with guardians"
                 ].map((tip, i) => (
                   <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-400 group cursor-default">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0 group-hover:bg-primary transition-colors" />
                      {tip}
                   </li>
                 ))}
              </ul>
           </Card>
        </div>
      </div>
    </div>
  );
}
