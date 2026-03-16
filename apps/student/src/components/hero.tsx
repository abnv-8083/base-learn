"use client";

import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/button";
import { GraduationCap, Rocket, PlayCircle } from "lucide-react";

export function StudentHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black py-20">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600/20 blur-[128px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 blur-[128px] rounded-full animate-pulse delay-1000" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-sm font-medium text-zinc-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Trusted by 12,000+ Students
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            Learn. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-x">Score.</span> Repeat.
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed">
            Master Grade 8, 9, and 10 with interactive 3D concepts, live classes, and a gamified learning journey designed for top results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] group">
              Start Learning Free
              <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-semibold rounded-2xl border-zinc-800 hover:bg-zinc-900 transition-all duration-300 group">
              Watch Demo
              <PlayCircle className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform text-zinc-500" />
            </Button>
          </div>
        </motion.div>

        {/* Dynamic Subject Icons */}
        <div className="mt-20 flex justify-center gap-8 md:gap-16 opacity-40">
           {[
             { name: "Math", icon: GraduationCap },
             { name: "Science", icon: Rocket },
             { name: "English", icon: GraduationCap },
             { name: "Social", icon: Rocket }
           ].map((item, i) => (
             <motion.div 
               key={i}
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
               className="flex flex-col items-center gap-2"
             >
               <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
               <span className="text-xs uppercase tracking-widest font-bold">{item.name}</span>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
