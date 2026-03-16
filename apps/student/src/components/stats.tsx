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
    <section className="py-12 bg-zinc-950 border-y border-zinc-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center md:border-r last:border-0 border-zinc-800">
              <div className="mb-4 p-3 rounded-full bg-zinc-900 border border-zinc-800">
                <stat.icon className="w-6 h-6 text-blue-500" />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-4xl font-black text-white mb-1"
              >
                {stat.value}
              </motion.div>
              <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
