"use client";

import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  User, 
  Settings, 
  Trophy, 
  Star, 
  Users, 
  MapPin, 
  Calendar, 
  Camera,
  Edit3,
  Flame,
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const recentBadges = [
    { title: "Fast Learner", icon: Zap, color: "bg-blue-500" },
    { title: "Top Scholar", icon: Trophy, color: "bg-yellow-500" },
    { title: "Problem Solver", icon: Star, color: "bg-purple-500" },
    { title: "Daily Streak", icon: Flame, color: "bg-orange-500" },
    { title: "Board Prep", icon: CheckCircle2, color: "bg-emerald-500" },
    { title: "Helping Hand", icon: Users, color: "bg-sky-500" },
  ];

  return (
    <div className="p-0 space-y-0">
      {/* Banner & Header Area */}
      <div className="relative h-80 bg-slate-900 overflow-hidden">
         <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#3b82f6_0%,transparent_50%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#6366f1_0%,transparent_50%)]" />
         </div>
         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-24 relative z-10 pb-20">
         <div className="flex flex-col md:flex-row items-end gap-10 mb-16">
            <div className="relative">
               <div className="w-48 h-48 rounded-[4rem] bg-white border-8 border-white shadow-2xl flex items-center justify-center text-6xl font-black text-primary">
                  AA
               </div>
               <button className="absolute bottom-2 right-2 w-12 h-12 rounded-2xl bg-primary text-white shadow-xl flex items-center justify-center border-4 border-white hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
               </button>
            </div>
            
            <div className="flex-1 pb-4 text-center md:text-left">
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Abhinav A M</h1>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-primary" />
                     Oakridge International, Delhi
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-primary" />
                     Joined March 2026
                  </div>
                  <div className="badge !bg-emerald-50 !text-emerald-600 !px-4 !py-2 border-emerald-100 uppercase tracking-widest text-[9px]">Verified Scholar</div>
               </div>
            </div>

            <div className="flex gap-4 pb-4">
               <Button className="h-14 px-8 rounded-2xl bg-white border border-slate-100 text-slate-900 font-black shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-primary" />
                  Edit Profile
               </Button>
               <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black shadow-2xl hover:bg-black active:scale-95 transition-all">
                  Public View
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Total XP", value: "12.4k", icon: Zap, color: "text-blue-500" },
                    { label: "Tests Done", value: "48", icon: Trophy, color: "text-yellow-500" },
                    { label: "Courses", value: "12", icon: BookOpen, color: "text-primary" },
                  ].map((stat, i) => (
                    <Card key={i} className="soft-card p-10 flex flex-col items-center text-center group border-2 border-transparent hover:border-primary/5 transition-all">
                       <div className={cn("w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.color)}>
                          <stat.icon className="w-7 h-7" />
                       </div>
                       <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </Card>
                  ))}
               </div>

               <Card className="soft-card p-12 border-2 border-primary/5 relative overflow-hidden">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10 flex items-center justify-between">
                     Recent Achievements
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline">View All Badges</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                     {recentBadges.map((badge, i) => (
                        <motion.div 
                          key={i}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="flex flex-col items-center text-center p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 group"
                        >
                           <div className={cn("w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl mb-4 group-hover:rotate-12 transition-all", badge.color)}>
                              <badge.icon className="w-8 h-8" />
                           </div>
                           <span className="text-xs font-black text-slate-900 tracking-tight leading-none mb-1">{badge.title}</span>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Unlocked Mar {10 + i}</span>
                        </motion.div>
                     ))}
                  </div>
               </Card>

               <Card className="soft-card p-12">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Study Activity</h3>
                  <div className="space-y-8">
                     {[
                       { title: "Completed Geometry Mock Test", date: "Today, 10:24 AM", icon: CheckCircle2, color: "text-emerald-500" },
                       { title: "Started Organic Chemistry Revision", date: "Yesterday, 4:00 PM", icon: BookOpen, color: "text-primary" },
                       { title: "Achievement Unlocked: Top Scorer", date: "2 days ago", icon: Trophy, color: "text-yellow-500" },
                     ].map((item, i) => (
                       <div key={i} className="flex gap-6 group cursor-default">
                          <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100", item.color)}>
                             <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                             <div className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-primary transition-colors">{item.title}</div>
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.date}</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-10">
               <Card className="soft-card p-10 bg-slate-900 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
                  <div className="relative z-10 space-y-8">
                     <div className="badge !bg-white/10 !text-white border-white/20">Learning Power</div>
                     <div className="space-y-2">
                        <div className="text-5xl font-black text-white tracking-tighter">Level 24</div>
                        <p className="text-slate-400 font-bold text-sm">Platinum Scholar Grade</p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                           <span>Progress to Level 25</span>
                           <span>82%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full w-[82%] bg-primary shadow-lg shadow-primary-glow" />
                        </div>
                     </div>
                     <button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">View All Levels</button>
                  </div>
               </Card>

               <Card className="soft-card p-10 border-2 border-primary/5">
                  <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                     <TrendingUp className="w-5 h-5 text-primary" />
                     Subject Mastery
                  </h3>
                  <div className="space-y-8">
                     {[
                       { name: "Mathematics", val: 95 },
                       { name: "Science", val: 78 },
                       { name: "English", val: 88 },
                       { name: "Social Studies", val: 64 },
                     ].map((sub, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                             <span className="text-slate-500">{sub.name}</span>
                             <span className="text-slate-900">{sub.val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${sub.val}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
                  <Button variant="outline" className="w-full h-14 mt-10 rounded-2xl border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-primary transition-all">
                     Detailed Analysis
                     <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
