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
  Target
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="p-6 md:p-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            Good Morning, {user?.firstName || "Student"} 👋
          </h1>
          <p className="text-zinc-500 font-medium">Monday, March 16, 2026</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-3 rounded-2xl bg-orange-600/10 border border-orange-600/20 flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              <div>
                 <div className="text-lg font-black text-white leading-none">5 Days</div>
                 <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Current Streak</div>
              </div>
           </div>
           <Button className="h-12 px-6 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all">
              Resume Last Class
              <PlayCircle className="ml-2 w-5 h-5 fill-current" />
           </Button>
        </div>
      </div>

      {/* Progress Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {[
           { label: "Classes Watched", value: "12/15", sub: "This Week", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
           { label: "Assignment Score", value: "84%", sub: "Average", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
           { label: "Current Rank", value: "#7", sub: "In Your Class", icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" },
         ].map((stat, i) => (
           <Card key={i} className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                 <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                 </div>
                 <TrendingUp className="w-5 h-5 text-zinc-700" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                 <span className="w-1 h-1 rounded-full bg-zinc-800" />
                 <span className="text-[10px] font-bold text-zinc-600">{stat.sub}</span>
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-8">
          {/* Continue Learning */}
          <section>
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-blue-500" />
                  Continue Learning
               </h2>
               <Button variant="ghost" className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white">
                  View All
               </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { subject: "Mathematics", title: "Chapter 5: Quadratic Equations", progress: 72, color: "bg-blue-500" },
                 { subject: "Physics", title: "Chapter 3: Work & Energy", progress: 45, color: "bg-purple-500" }
               ].map((course, i) => (
                 <Card key={i} className="group p-1 bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
                    <div className="relative aspect-video rounded-xl bg-zinc-800 mb-4 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-12 h-12 text-white fill-white/20 scale-90 group-hover:scale-100 transition-transform" />
                       </div>
                       <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-lg bg-zinc-900/80 backdrop-blur text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                             {course.subject}
                          </span>
                       </div>
                    </div>
                    <div className="p-4">
                       <h3 className="font-bold text-white mb-4 line-clamp-1">{course.title}</h3>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                             <span className="text-zinc-500">Progress</span>
                             <span className="text-white">{course.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${course.progress}%` }}
                               className={`h-full ${course.color}`} 
                             />
                          </div>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
          </section>

          {/* Subject-wise Progress */}
          <section>
             <h2 className="text-xl font-bold text-white mb-6">Subject Progress</h2>
             <Card className="p-8 bg-zinc-900 border-zinc-800">
                <div className="space-y-6">
                   {[
                     { name: "Math", value: 72, color: "bg-blue-500" },
                     { name: "Physics", value: 88, color: "bg-purple-500" },
                     { name: "Chemistry", value: 65, color: "bg-pink-500" },
                     { name: "Biology", value: 90, color: "bg-emerald-500" },
                   ].map((sub, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-sm font-bold text-white">{sub.name}</span>
                           <span className="text-xs font-bold text-zinc-500">{sub.value}% complete</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${sub.value}%` }}
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
        <div className="lg:col-span-4 space-y-8">
           {/* Streak Calendar Placeholder */}
           <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="font-bold text-white mb-6 flex items-center justify-between">
                 Activity Heatmap
                 <Flame className="w-4 h-4 text-orange-500" />
              </h3>
              <div className="grid grid-cols-7 gap-1.5 opacity-50">
                 {Array.from({ length: 35 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-[3px] border border-zinc-800 ${
                        Math.random() > 0.6 ? 'bg-blue-600' : 
                        Math.random() > 0.8 ? 'bg-blue-400' : 'bg-zinc-800/50'
                      }`} 
                    />
                 ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                 <span>Less</span>
                 <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-[2px] bg-zinc-800" />
                    <div className="w-2 h-2 rounded-[2px] bg-blue-600/30" />
                    <div className="w-2 h-2 rounded-[2px] bg-blue-600" />
                 </div>
                 <span>More</span>
              </div>
           </Card>

           {/* Recent Badges */}
           <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="font-bold text-white mb-6">Recent Badges</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { name: "Quick Learner", color: "bg-yellow-500" },
                   { name: "Consistent", color: "bg-blue-500" },
                   { name: "Top Scorer", color: "bg-purple-500" },
                   { name: "Hustler", color: "bg-emerald-500" },
                 ].map((badge, i) => (
                   <div key={i} className="group relative aspect-square rounded-2xl bg-zinc-800 flex flex-col items-center justify-center p-4 text-center hover:bg-zinc-700 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-full ${badge.color} blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                      <Trophy className={`absolute w-8 h-8 ${badge.name === 'Top Scorer' ? 'text-yellow-500' : 'text-zinc-500'}`} />
                      <span className="mt-4 text-[10px] font-black text-zinc-400 uppercase tracking-tighter leading-tight">{badge.name}</span>
                   </div>
                 ))}
              </div>
              <Button className="w-full mt-6 bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 shadow-none">
                 View All Badges
              </Button>
           </Card>

           {/* Announcements */}
           <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h3 className="font-bold text-white mb-6">Announcements</h3>
              <div className="space-y-4">
                 {[
                   { title: "Live Math Session at 4 PM", time: "2h ago", imp: true },
                   { title: "Chemistry Mock Test is Live", time: "5h ago", imp: false },
                 ].map((notif, i) => (
                   <div key={i} className="flex gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${notif.imp ? 'bg-blue-500 shadow-[0_0_8px_blue]' : 'bg-zinc-700'}`} />
                      <div>
                         <div className="text-sm font-medium text-white leading-snug">{notif.title}</div>
                         <div className="text-[10px] font-bold text-zinc-600 uppercase mt-1">{notif.time}</div>
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
