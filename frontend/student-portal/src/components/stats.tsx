"use client";

import { motion } from "framer-motion";
import { Users, Video, TrendingUp } from "lucide-react";

const stats = [
  { label: "Students", value: "12,000+", icon: Users },
  { label: "Recorded Classes", value: "500+", icon: Video },
  { label: "Score Improvement", value: "95%", icon: TrendingUp },
];

export function StatsBar() {
  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center md:border-r last:border-0 border-slate-100">
              <div className="mb-4 p-4 rounded-3xl bg-blue-50 text-blue-600">
                <stat.icon className="w-8 h-8" />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-5xl font-black text-slate-900 mb-2"
              >
                {stat.value}
              </motion.div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
