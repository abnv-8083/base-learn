"use client";

import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Trophy, 
  Flame,
  Calendar,
  ChevronRight,
  Star,
  Activity,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function Progress() {
  const weeklyStats = [
    { label: "Study Hours", value: "32h", change: "+4h", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tasks Done", value: "24/28", change: "92%", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "XP Points", value: "12,450", change: "+1.2k", icon: Zap, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Accuracy", value: "88%", change: "+2%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <BarChart3 className="w-3 h-3 mr-2" />
             Personal Analytics
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">My <span className="text-gradient">Growth</span></h1>
          <p className="text-slate-500 font-bold">Deep insights into your learning patterns and board readiness.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
             <Calendar className="w-4 h-4 mr-2" />
             Weekly Report
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-glow hover:opacity-90 active:scale-95 transition-all">
             Share Achievements
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {weeklyStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="soft-card p-8 group border-2 border-transparent hover:border-primary/5">
              <div className="flex items-center justify-between mb-6">
                 <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                    <stat.icon className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    {stat.change}
                 </span>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Charts Area */}
        <div className="lg:col-span-8 space-y-10">
           {/* Subject Performance Heatgrid */}
           <Card className="soft-card p-10 relative overflow-hidden border-2 border-primary/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subject Readiness</h2>
                   <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                         <div className="w-2 h-2 rounded-full bg-primary" /> Ready
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase px-3">
                         <div className="w-2 h-2 rounded-full bg-slate-200" /> Focus
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { name: "Mathematics", value: 92, status: "Mastered" },
                     { name: "Physics", value: 84, status: "Improving" },
                     { name: "Chemistry", value: 72, status: "Normal" },
                     { name: "Biology", value: 88, status: "Stable" },
                   ].map((sub, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex justify-between items-center font-black">
                           <span className="text-sm text-slate-900 uppercase tracking-widest">{sub.name}</span>
                           <span className="text-lg text-primary tracking-tighter">{sub.value}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100/50 rounded-full border border-slate-100 overflow-hidden relative">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${sub.value}%` }}
                             transition={{ duration: 1.5, delay: i * 0.2 }}
                             className="absolute left-0 top-0 h-full primary-gradient shadow-lg" 
                           />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.status}</div>
                     </div>
                   ))}
                </div>
              </div>
           </Card>

           {/* Activity Heatmap Section */}
           <Card className="soft-card p-10">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Consistency</h2>
                 <div className="badge flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    12 Day Streak
                 </div>
              </div>
              
              <div className="grid grid-cols-7 gap-3">
                 {Array.from({ length: 35 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      className={`aspect-square rounded-lg border-2 border-transparent cursor-pointer transition-colors ${
                        Math.random() > 0.4 ? 'bg-primary/20 border-primary/20 hover:bg-primary' : 
                        Math.random() > 0.7 ? 'bg-primary border-primary hover:bg-primary shadow-lg shadow-primary-glow' : 
                        'bg-slate-50 hover:bg-slate-100'
                      }`} 
                    />
                 ))}
              </div>
              <div className="mt-10 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest">
                 <span>Less Studying</span>
                 <div className="flex gap-2">
                    {[0.1, 0.4, 0.7, 1].map((o, idx) => (
                       <div key={idx} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: o }} />
                    ))}
                 </div>
                 <span>Board Prep Mode</span>
              </div>
           </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-10 bg-slate-900 text-white relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[60px]" />
              <div className="relative z-10 space-y-8 w-full">
                 <div className="mx-auto w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl">
                    <Trophy className="w-12 h-12 text-blue-400" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter">Diamond <br/> <span className="text-blue-400">Class Rank</span></h2>
                    <p className="text-slate-400 font-bold text-sm">Top 2% of the entire platform</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-slate-400">Next Tier XP</span>
                       <span>850 / 2,000</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-[42.5%] bg-blue-500 shadow-lg shadow-blue-500/50" />
                    </div>
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    View Global Ranking
                 </Button>
              </div>
           </Card>

           <Card className="soft-card p-8 border-2 border-primary/5">
              <h3 className="font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                 <Activity className="w-5 h-5 text-emerald-500" />
                 Skill Mastery
              </h3>
              <div className="space-y-8">
                 {[
                   { skill: "Problem Solving", value: 92 },
                   { skill: "Theoretical Concepts", value: 78 },
                   { skill: "Time Management", value: 85 },
                   { skill: "Accuracy under Pressure", value: 64 },
                 ].map((skill, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest leading-none">
                         <span className="text-slate-500">{skill.skill}</span>
                         <span className="text-primary">{skill.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${skill.value}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
