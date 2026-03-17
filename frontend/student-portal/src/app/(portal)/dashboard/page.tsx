"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Clock, 
  Flame, 
  PlayCircle,
  TrendingUp,
  ChevronRight,
  Target,
  Zap,
  Calendar,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useUser();

  const stats = [
    { label: "Classes Watched", value: "12/15", sub: "This Week", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Assignment Score", value: "84%", sub: "Average", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Current Rank", value: "#7", sub: "In Your Class", icon: Trophy, color: "text-sky-600", bg: "bg-sky-50" },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-2">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <div className="badge mb-4">
             <Star className="w-3 h-3 mr-2 fill-primary" />
             Student Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            Good Morning, <span className="text-gradient">{user?.firstName || "Student"}</span> 👋
          </h1>
          <p className="text-slate-500 font-bold flex items-center gap-2">
             <Calendar className="w-4 h-4" />
             March 16, 2026 — Weekly Progress
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4"
        >
           <div className="px-6 py-4 rounded-[2rem] bg-white border border-slate-100 flex items-center gap-4 shadow-xl shadow-primary-glow/5 group cursor-pointer hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              </div>
              <div>
                 <div className="text-xl font-black text-slate-900 leading-none">5 Days</div>
                 <div className="text-xs font-black text-orange-500 uppercase tracking-widest mt-1">Current Streak</div>
              </div>
           </div>
           
           <Button className="h-16 px-8 rounded-3xl bg-primary text-white font-black hover:opacity-90 transition-all shadow-xl shadow-primary-glow active:scale-95">
              Resume Last Class
              <PlayCircle className="ml-3 w-6 h-6 fill-white/20" />
           </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {stats.map((stat, i) => (
           <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
           >
             <Card className="soft-card p-1">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                     <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-7 h-7" />
                     </div>
                     <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        +12% Trend
                     </div>
                  </div>
                  <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{stat.value}</div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</span>
                     <div className="w-1 h-1 rounded-full bg-slate-200" />
                     <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">{stat.sub}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-50 relative overflow-hidden rounded-b-3xl">
                   <div className={`absolute left-0 top-0 h-full ${stat.color.replace('text', 'bg')} opacity-20 w-[70%]`} />
                </div>
             </Card>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-10">
          {/* Continue Learning */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white fill-white" />
                  </div>
                  Ready to Continue?
               </h2>
               <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform border-b-2 border-primary/10 pb-1">
                  Browse Catalog
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { subject: "Mathematics", title: "Chapter 5: Quadratic Equations", progress: 72, color: "bg-primary" },
                 { subject: "Physics", title: "Chapter 3: Work & Energy", progress: 45, color: "bg-indigo-600" }
               ].map((course, i) => (
                 <Card key={i} className="soft-card group p-2 relative overflow-hidden">
                    <div className="relative aspect-[16/10] rounded-2xl bg-slate-100 mb-6 overflow-hidden">
                       <img 
                          src={`https://images.unsplash.com/photo-${i === 0 ? '1635070041078-e363dbe005cb' : '1635070040896-73604f762635'}?q=80&w=1000&auto=format&fit=crop`}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                          alt={course.title}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                            <PlayCircle className="w-8 h-8 text-primary fill-primary/10" />
                          </div>
                       </div>
                       <div className="absolute top-4 left-4">
                          <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30">
                             {course.subject}
                          </span>
                       </div>
                    </div>
                    <div className="px-6 pb-6">
                       <h3 className="font-black text-xl text-slate-900 mb-8 line-clamp-1 tracking-tight">{course.title}</h3>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                             <span className="text-slate-400">Course Progress</span>
                             <span className="text-primary">{course.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${course.progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${course.color} shadow-lg shadow-primary-glow/20`} 
                             />
                          </div>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
          </section>

          {/* Subject-wise Progress Card */}
          <section>
             <h2 className="text-2xl font-black text-slate-900 mb-8 px-2 tracking-tight">Focus Areas</h2>
             <Card className="soft-card p-10 relative overflow-hidden border-2 border-primary/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                <div className="space-y-8 relative z-10">
                   {[
                     { name: "Mathematics", value: 72, color: "bg-primary" },
                     { name: "Physics", value: 88, color: "bg-indigo-600" },
                     { name: "Chemistry", value: 65, color: "bg-sky-500" },
                     { name: "Biology", value: 90, color: "bg-blue-400" },
                   ].map((sub, i) => (
                     <div key={i} className="space-y-3 group/row">
                        <div className="flex justify-between items-end">
                           <span className="text-base font-black text-slate-900 group-hover/row:text-primary transition-colors">{sub.name}</span>
                           <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{sub.value}% COMPLETED</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: `${sub.value}%` }}
                             viewport={{ once: true }}
                             transition={{ duration: 1, delay: i * 0.1 }}
                             className={`h-full ${sub.color}`} 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
          </section>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 space-y-10">
           {/* Activity Heatmap */}
           <Card className="soft-card p-8">
              <h3 className="font-black text-slate-900 mb-8 flex items-center justify-between tracking-tight">
                 Activity Tracker
                 <Flame className="w-5 h-5 text-orange-500" />
              </h3>
              <div className="grid grid-cols-7 gap-2">
                 {Array.from({ length: 35 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.2 }}
                      className={`aspect-square rounded-[4px] cursor-help ${
                        Math.random() > 0.6 ? 'bg-primary' : 
                        Math.random() > 0.8 ? 'bg-primary/40' : 'bg-slate-100'
                      }`} 
                    />
                 ))}
              </div>
              <div className="mt-8 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest">
                 <span>Less</span>
                 <div className="flex gap-1.5 px-2">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/40" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-primary" />
                 </div>
                 <span>More</span>
              </div>
           </Card>

           {/* Recent Badges */}
           <Card className="soft-card p-8 bg-gradient-to-br from-white to-slate-50">
              <h3 className="font-black text-slate-900 mb-8 tracking-tight">Learning Milestones</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { name: "Quick Learner", color: "bg-yellow-100 text-yellow-600" },
                   { name: "Consistent", color: "bg-blue-100 text-blue-600" },
                   { name: "Top Scorer", color: "bg-indigo-100 text-indigo-600" },
                   { name: "Hustler", color: "bg-sky-100 text-sky-600" },
                 ].map((badge, i) => (
                   <div key={i} className="group relative aspect-square rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center p-4 text-center hover:border-primary/20 hover:shadow-md transition-all cursor-pointer">
                      <div className={`w-12 h-12 rounded-full ${badge.color.split(' ')[0]} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                        <Trophy className={`w-6 h-6 ${badge.color.split(' ')[1]}`} />
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-tight opacity-70">{badge.name}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 hover:text-primary hover:border-primary/20 transition-all">
                 View Achievements
              </button>
           </Card>

           {/* Announcements */}
           <Card className="soft-card p-8 border-2 border-primary/5">
              <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Latest Alerts
              </h3>
              <div className="space-y-6">
                 {[
                   { title: "Live Math Session at 4 PM", time: "2h ago", imp: true },
                   { title: "Chemistry Mock Test is Live", time: "5h ago", imp: false },
                 ].map((notif, i) => (
                   <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${notif.imp ? 'bg-primary' : 'bg-slate-200'}`} />
                      <div>
                         <div className="text-sm font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">{notif.title}</div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{notif.time}</div>
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
