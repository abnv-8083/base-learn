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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="badge mb-4">
             <Bell className="w-3.5 h-3.5 mr-2" />
             Communication Center
          </div>
          <h1 className="text-display mb-2">My <span className="text-gradient">Alerts</span></h1>
          <p className="text-text-muted font-medium">Stay updated with class schedules, tests, and grades.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-btn border-border-main bg-white text-text-muted font-semibold text-sm hover:bg-primary-light hover:text-primary transition-all">
             Mark All as Read
          </Button>
          <Button variant="destructive" className="h-11 px-6 rounded-btn bg-red-50 text-red-500 border-none font-semibold text-sm hover:bg-red-500 hover:text-white transition-all">
             <Trash2 className="w-4 h-4 mr-2" />
             Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center gap-2 p-1.5 bg-white border border-border-main rounded-xl w-fit shadow-sm overflow-x-auto no-scrollbar max-w-full">
              {["All", "Academic", "Tests", "Assignments", "System"].map((tab) => (
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

           <div className="space-y-4">
             {notifications.map((notif, i) => (
               <motion.div
                 key={notif.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.05 }}
               >
                 <Card className={cn(
                    "soft-card p-0 overflow-hidden border transition-all cursor-pointer",
                    notif.read ? "opacity-75 bg-white/50" : "border-primary/5 bg-white"
                 )}>
                    <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                       <div className={cn(
                          "w-14 h-14 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                          notif.color, "text-white"
                       )}>
                          <notif.icon className="w-6 h-6" />
                       </div>
                       
                       <div className="flex-1 space-y-1 text-center md:text-left">
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                             <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                notif.read ? "text-text-muted" : "text-primary"
                             )}>{notif.type}</span>
                             <div className="hidden md:block w-1 h-1 rounded-full bg-border-main" />
                             <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{notif.time}</span>
                          </div>
                          <h3 className={cn(
                             "text-lg font-semibold tracking-tight",
                             notif.read ? "text-text-muted" : "text-foreground"
                          )}>{notif.title}</h3>
                          <p className="text-sm text-text-muted leading-relaxed">{notif.body}</p>
                       </div>

                       <div className="flex items-center gap-4 shrink-0">
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,102,255,0.4)]" />}
                          <button className="p-2.5 rounded-lg bg-bg-soft text-text-muted hover:text-primary hover:bg-primary-light transition-all">
                             <ArrowRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="soft-card p-8 bg-foreground text-white relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
              <div className="relative z-10 space-y-6 w-full">
                 <div className="mx-auto w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xl">
                    <Trophy className="w-10 h-10 text-primary-light" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Stay Focused</h2>
                    <p className="text-primary-light/70 font-medium text-sm leading-relaxed">Ensure push notifications are active for live session reminders.</p>
                 </div>
                 <Button className="w-full h-11 rounded-btn bg-white text-foreground font-bold text-xs shadow-md hover:bg-primary-light transition-all">
                    Enable Push Notifications
                 </Button>
              </div>
           </Card>

           <Card className="soft-card p-8">
              <h3 className="font-bold text-foreground mb-6 tracking-tight flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 Preference Center
              </h3>
              <div className="space-y-5">
                 {[
                   { label: "Class Updates", active: true },
                   { label: "Test Results", active: true },
                   { label: "Doubt Replies", active: false },
                   { label: "Assignments", active: true },
                 ].map((pref, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{pref.label}</span>
                      <button className={cn(
                        "w-10 h-5 rounded-full transition-all relative",
                        pref.active ? "bg-primary" : "bg-border-main"
                      )}>
                         <div className={cn(
                           "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                           pref.active ? "left-5.5" : "left-0.5"
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
