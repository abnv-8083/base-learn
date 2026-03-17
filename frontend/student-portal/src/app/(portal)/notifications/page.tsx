"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  Bell, 
  BookOpen, 
  FlaskConical, 
  PenTool, 
  Trophy, 
  Calendar,
  Search,
  CheckCircle2,
  Trash2,
  Filter,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const notifications = [
  {
    id: 1,
    type: "Academic",
    title: "New Recorded Class Available",
    body: "Mathematics Chapter 5: Part 2 has been uploaded by Dr. Elena Rossi.",
    time: "2 hours ago",
    icon: BookOpen,
    color: "bg-blue-500",
    read: false
  },
  {
    id: 2,
    type: "Tests",
    title: "Test Results are Live!",
    body: "Your performance report for 'Algebraic Identities' is now available for review.",
    time: "5 hours ago",
    icon: FlaskConical,
    color: "bg-indigo-600",
    read: false
  },
  {
    id: 3,
    type: "Schedule",
    title: "Live Session Reminder",
    body: "Your Physics lab session starts in 1 hour. Get your notebooks ready!",
    time: "8 hours ago",
    icon: Calendar,
    color: "bg-sky-500",
    read: true
  },
  {
    id: 4,
    type: "Assignments",
    title: "Deadline Approaching",
    body: "Chemistry assignment 'Periodic Table Quiz' is due by midnight tonight.",
    time: "1 day ago",
    icon: PenTool,
    color: "bg-orange-500",
    read: true
  }
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <Bell className="w-3 h-3 mr-2" />
             Communication Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">My <span className="text-gradient">Alerts</span></h1>
          <p className="text-slate-500 font-bold">Stay updated with class schedules, tests, and grades.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
             Mark All as Read
          </Button>
          <Button variant="destructive" className="h-14 px-8 rounded-2xl bg-red-50 text-red-500 border-none font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
             <Trash2 className="w-4 h-4 mr-2" />
             Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-[2.5rem] w-fit shadow-sm overflow-x-auto no-scrollbar max-w-full">
              {["All", "Academic", "Tests", "Assignments", "System"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary-glow" : "text-slate-400 hover:text-primary"
                  )}
                >
                  {tab}
                </button>
              ))}
           </div>

           <div className="space-y-4">
             {notifications.map((notif, i) => (
               <motion.div
                 key={notif.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
               >
                 <Card className={cn(
                    "soft-card p-0 overflow-hidden border-2 transition-all hover:border-primary/10 group cursor-pointer",
                    notif.read ? "border-transparent bg-white/50" : "border-primary/5 bg-white"
                 )}>
                    <div className="flex flex-col md:flex-row items-center p-8 gap-8">
                       <div className={cn(
                          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110",
                          notif.color, "text-white"
                       )}>
                          <notif.icon className="w-7 h-7" />
                       </div>
                       
                       <div className="flex-1 space-y-2 text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                             <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                notif.read ? "text-slate-400" : "text-primary"
                             )}>{notif.type}</span>
                             <div className="hidden md:block w-1 h-1 rounded-full bg-slate-200" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notif.time}</span>
                          </div>
                          <h3 className={cn(
                             "text-xl font-black tracking-tight",
                             notif.read ? "text-slate-500" : "text-slate-900"
                          )}>{notif.title}</h3>
                          <p className="text-sm font-bold text-slate-400 leading-relaxed">{notif.body}</p>
                       </div>

                       <div className="flex items-center gap-4 shrink-0">
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_blue]" />}
                          <button className="p-3 rounded-2xl bg-slate-50 text-slate-300 hover:text-primary transition-all">
                             <ArrowRight className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-10 bg-slate-900 text-white relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
              <div className="relative z-10 space-y-8 w-full">
                 <div className="mx-auto w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl">
                    <Trophy className="w-12 h-12 text-blue-400" />
                 </div>
                 <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tighter">Stay <br/> <span className="text-blue-400">Focused</span></h2>
                    <p className="text-slate-400 font-bold text-sm leading-relaxed">Ensure push notifications are active for live session reminders.</p>
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-100 transition-all">
                    Enable Push Notifications
                 </Button>
              </div>
           </Card>

           <Card className="soft-card p-10 border-2 border-primary/5">
              <h3 className="font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 Preference Center
              </h3>
              <div className="space-y-6">
                 {[
                   { label: "Class Updates", active: true },
                   { label: "Test Results", active: true },
                   { label: "Doubt Replies", active: false },
                   { label: "Assignments", active: true },
                 ].map((pref, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{pref.label}</span>
                      <button className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        pref.active ? "bg-primary" : "bg-slate-200"
                      )}>
                         <div className={cn(
                           "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                           pref.active ? "left-7" : "left-1"
                         )} />
                      </button>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
