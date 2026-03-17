"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Clock, Trophy } from "lucide-react";

export function StatsBar() {
  const stats = [
    { label: "Active Students", value: "15,000+", icon: Users },
    { label: "Live Classes", value: "500+", icon: Clock },
    { label: "Course Modules", value: "1,200+", icon: BookOpen },
    { label: "Success Rate", value: "98.5%", icon: Trophy }
  ];

  return (
    <div className="soft-card p-2 md:p-8 max-w-6xl mx-auto border-primary/5 shadow-2xl shadow-primary-glow/20 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative z-10">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-6 text-center group/stat">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 transition-all group-hover/stat:scale-110 group-hover/stat:bg-primary/10 duration-300">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
