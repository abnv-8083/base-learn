"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Star,
  Info
} from "lucide-react";
import { motion } from "framer-motion";

const weekDays = [
  { day: "Mon", date: "16", current: true },
  { day: "Tue", date: "17" },
  { day: "Wed", date: "18" },
  { day: "Thu", date: "19" },
  { day: "Fri", date: "20" },
  { day: "Sat", date: "21" },
  { day: "Sun", date: "22" },
];

const sessions = [
  {
    id: 1,
    title: "Quadratic Equations — Level 2",
    time: "10:00 AM - 11:30 AM",
    subject: "Mathematics",
    instructor: "Dr. Elena Rossi",
    type: "Live Interactive",
    status: "Upcoming",
    color: "bg-primary",
  },
  {
    id: 2,
    title: "Electromagnetic Induction",
    time: "2:00 PM - 3:30 PM",
    subject: "Physics",
    instructor: "Prof. James Wilson",
    type: "Recorded Lab",
    status: "In 3 Hours",
    color: "bg-indigo-600",
  },
  {
    id: 3,
    title: "Organic Chemistry Revision",
    time: "5:00 PM - 6:00 PM",
    subject: "Chemistry",
    instructor: "Dr. Sarah Smith",
    type: "Live Doubt Session",
    status: "Later Today",
    color: "bg-sky-500",
  }
];

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState("16");

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <Calendar className="w-3 h-3 mr-2" />
             Personal Calendar
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">My <span className="text-gradient">Timeline</span></h1>
          <p className="text-slate-500 font-bold">Planned sessions and milestones for this week.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
              <button className="p-3 text-slate-400 hover:text-primary transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <div className="px-6 flex items-center font-black text-sm text-slate-900 uppercase tracking-widest">March 2026</div>
              <button className="p-3 text-slate-400 hover:text-primary transition-colors"><ChevronRight className="w-5 h-5" /></button>
           </div>
           <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all">Today</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {/* Week Selector */}
           <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-[2.5rem] shadow-sm">
              {weekDays.map((d, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedDate(d.date)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-3xl min-w-[70px] transition-all group",
                    selectedDate === d.date ? "bg-primary text-white shadow-xl shadow-primary-glow scale-110" : "hover:bg-slate-50"
                  )}
                >
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-widest",
                     selectedDate === d.date ? "text-white/70" : "text-slate-400 group-hover:text-primary"
                   )}>{d.day}</span>
                   <span className="text-xl font-black tracking-tighter">{d.date}</span>
                </button>
              ))}
           </div>

           {/* Timeline */}
           <div className="relative pl-12 space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                   {/* Timeline Marker */}
                   <div className={cn(
                      "absolute -left-12 top-0 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-xl z-10 transition-transform hover:scale-125",
                      session.status === "Upcoming" ? "bg-primary" : "bg-slate-200"
                   )}>
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                   </div>

                   <Card className="soft-card p-1 group border-2 border-transparent hover:border-primary/10 overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center">
                         <div className={cn("w-full md:w-48 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-50", session.color.replace('bg-', 'bg-') + "/5")}>
                            <div className={cn("text-xs font-black uppercase tracking-widest mb-1", session.color.replace('bg-', 'text-'))}>{session.subject}</div>
                            <div className="text-sm font-black text-slate-900 tracking-tight">{session.time.split(' - ')[0]}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Start Time</div>
                         </div>
                         
                         <div className="flex-1 p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                               <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                     <span className="badge !bg-slate-50 !text-slate-500 !px-3 font-black text-[9px] border-slate-100 uppercase tracking-widest">{session.type}</span>
                                     <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", session.status === "Upcoming" ? "text-primary" : "text-slate-400")}>{session.status}</span>
                                  </div>
                                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors">{session.title}</h3>
                                  <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-black text-primary text-[8px] border border-slate-200 uppercase">
                                           {session.instructor.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        {session.instructor}
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="flex items-center gap-3">
                                  <Button variant="outline" size="icon" className="w-12 h-12 rounded-2xl border-slate-100 hover:text-primary transition-all">
                                     <Info className="w-5 h-5" />
                                  </Button>
                                  <Button className={cn(
                                    "h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-3",
                                    session.status === "Upcoming" ? "bg-primary text-white shadow-primary-glow" : "bg-slate-900 text-white"
                                  )}>
                                     <Video className="w-4 h-4" />
                                     {session.status === "Upcoming" ? "Join Lobby" : "Watch Replay"}
                                  </Button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </Card>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-10 bg-slate-900 text-white relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
              <div className="relative z-10 space-y-8 w-full">
                 <div className="mx-auto w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl">
                    <TrendingUp className="w-12 h-12 text-blue-400" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter">Daily <br/> <span className="text-blue-400">Pace</span></h2>
                    <p className="text-slate-400 font-bold text-sm">You've finished 85% of goals today.</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-slate-400">Total Hours Today</span>
                       <span>4.5h / 6h</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-[75%] bg-blue-500 shadow-lg shadow-blue-500/50" />
                    </div>
                 </div>
                 <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors">Adjust Daily Goal</button>
              </div>
           </Card>

           <Card className="soft-card p-8 border-2 border-primary/5">
              <h3 className="font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                 <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                 Study Tip of the Day
              </h3>
              <p className="text-slate-500 font-bold italic leading-relaxed">
                 "Taking short 5-minute breaks every 30 minutes of deep work helps retain the memory of complex formulas for longer periods."
              </p>
              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>- Dr. Sarah Smith</span>
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
