"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  Trophy, 
  Crown, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Flame,
  Star,
  Zap,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const topThree = [
  { id: 2, name: "Sneha M.", rank: 2, xp: "14,820", avatar: "S", aura: "Silver", color: "text-slate-400" },
  { id: 1, name: "Arjun K.", rank: 1, xp: "16,450", avatar: "A", aura: "Gold", color: "text-yellow-500" },
  { id: 3, name: "Rahul S.", rank: 3, xp: "13,100", avatar: "R", aura: "Bronze", color: "text-amber-700" },
];

const fullRankings = [
  { rank: 4, name: "Ananya P.", grade: "Grade 9", xp: "12,900", streak: "15 Days", badges: 12 },
  { rank: 5, name: "Vikram R.", grade: "Grade 10", xp: "12,450", streak: "24 Days", badges: 10 },
  { rank: 6, name: "Priya V.", grade: "Grade 9", xp: "11,800", streak: "8 Days", badges: 15 },
  { rank: 7, name: "Abhinav A.", grade: "Grade 10", xp: "11,200", streak: "5 Days", badges: 8, isCurrent: true },
  { rank: 8, name: "Meera K.", grade: "Grade 9", xp: "10,950", streak: "12 Days", badges: 9 },
  { rank: 9, name: "Zayn M.", grade: "Grade 10", xp: "10,200", streak: "3 Days", badges: 4 },
];

export default function Leaderboard() {
  const [scope, setScope] = useState("Class");

  return (
    <div className="p-6 md:p-10 space-y-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <Trophy className="w-3 h-3 mr-2" />
             Hall of Scholars
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Climb the <span className="text-gradient">Ladder</span></h1>
          <p className="text-slate-500 font-bold">Compete with the best students across India.</p>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
           {["Class", "School", "Network"].map((s) => (
             <button
               key={s}
               onClick={() => setScope(s)}
               className={cn(
                 "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                 scope === s ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-primary"
               )}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-10 max-w-5xl mx-auto px-4">
        {topThree.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className={cn(
              "relative flex flex-col items-center",
              user.rank === 1 ? "order-2 md:-translate-y-12" : user.rank === 2 ? "order-1" : "order-3"
            )}
          >
            {user.rank === 1 && (
               <motion.div 
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="absolute -top-12 left-1/2 -translate-x-1/2"
               >
                  <Crown className="w-10 h-10 text-yellow-500 fill-yellow-500 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
               </motion.div>
            )}
            
            <div className={cn(
               "w-32 h-32 rounded-[3.5rem] bg-white border-4 flex items-center justify-center text-4xl font-black mb-8 shadow-2xl transition-transform hover:scale-110",
               user.rank === 1 ? "border-yellow-400 border-dashed" : user.rank === 2 ? "border-slate-300" : "border-amber-700"
            )}>
               <div className={cn("w-full h-full rounded-[3.2rem] flex items-center justify-center bg-slate-50", user.color)}>
                  {user.avatar}
               </div>
               <div className={cn(
                  "absolute -bottom-4 right-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg",
                  user.rank === 1 ? "bg-yellow-500" : user.rank === 2 ? "bg-slate-400" : "bg-amber-700"
               )}>
                  {user.rank}
               </div>
            </div>

            <div className="text-center space-y-2">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h3>
               <div className="badge !px-6 !py-2 !bg-primary/5 !text-primary border-primary/20 flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-primary" />
                  {user.xp} XP
               </div>
            </div>

            {/* Pedestal Shadow/Effect */}
            <div className={cn(
               "absolute -z-10 bottom-0 w-full h-32 rounded-full opacity-20 blur-[60px]",
               user.rank === 1 ? "bg-yellow-500" : "bg-primary"
            )} />
          </motion.div>
        ))}
      </div>

      {/* Rankings Table */}
      <Card className="soft-card p-2 overflow-hidden border-2 border-primary/5 max-w-6xl mx-auto shadow-2xl shadow-primary-glow/5">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Streak</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">XP Points</th>
                  </tr>
               </thead>
               <tbody>
                  {fullRankings.map((user, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className={cn(
                        "group transition-all hover:bg-slate-50/50 cursor-default",
                        user.isCurrent && "bg-primary/[0.03] border-y border-primary/10"
                      )}
                    >
                       <td className="px-8 py-6">
                          <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                             user.isCurrent ? "bg-primary text-white" : "text-slate-400"
                          )}>
                             #{user.rank}
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-primary text-xs shadow-sm">
                                {user.name[0]}
                             </div>
                             <div>
                                <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                                   {user.name}
                                   {user.isCurrent && <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded-full">YOU</span>}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                   Joined 3 Months Ago
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className="badge !bg-slate-100/50 !text-slate-500 !px-3 font-black text-[10px]">{user.grade}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-orange-500 font-black text-xs">
                             <Flame className="w-4 h-4 fill-current" />
                             {user.streak}
                          </div>
                      </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end">
                             <div className="text-sm font-black text-slate-900">{user.xp} XP</div>
                             <div className="flex items-center gap-1.5 mt-1">
                                {[1, 2, 3].map(b => (
                                   <div key={b} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                ))}
                             </div>
                          </div>
                       </td>
                    </motion.tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      <div className="text-center py-10">
         <button className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3 mx-auto hover:gap-5 transition-all">
            Show Full Leaderboard
            <ChevronRight className="w-4 h-4" />
         </button>
      </div>

      {/* Floating Action Button for Rank */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-10 right-10 z-[60]"
      >
         <button className="primary-gradient text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 group hover:scale-105 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
               <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-left pr-8">
               <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Your Position</div>
               <div className="text-2xl font-black tracking-tighter">Rank #7 <span className="text-sm opacity-60 ml-2">/ 12,000+</span></div>
            </div>
         </button>
      </motion.div>
    </div>
  );
}
