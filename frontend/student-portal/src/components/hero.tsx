"use client";

import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/button";
import { GraduationCap, Rocket, PlayCircle } from "lucide-react";

export function StudentHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white py-20">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-indigo-100/50 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="px-5 py-2 rounded-full border border-blue-100 bg-blue-50/50 backdrop-blur-md text-sm font-semibold text-blue-600 flex items-center gap-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Trusted by 12,000+ Students
            </div>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-slate-900">
            Learn. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Score.</span> Repeat.
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12 leading-relaxed">
            Master Grade 8, 9, and 10 with interactive concepts, live classes, and a gamified learning journey designed for excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-200 group border-none">
              Start Learning Free
              <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-semibold rounded-2xl border-slate-200 hover:bg-slate-50 transition-all duration-300 group text-slate-700">
              Watch Demo
              <PlayCircle className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform text-blue-500" />
            </Button>
          </div>
        </motion.div>

        {/* Dynamic Subject Icons */}
        <div className="mt-28 flex justify-center gap-12 md:gap-24">
           {[
             { name: "Math", icon: GraduationCap, color: "text-blue-500" },
             { name: "Science", icon: Rocket, color: "text-indigo-500" },
             { name: "English", icon: GraduationCap, color: "text-blue-400" },
             { name: "Social", icon: Rocket, color: "text-indigo-400" }
           ].map((item, i) => (
             <motion.div 
               key={i}
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
               className="flex flex-col items-center gap-3"
             >
               <div className={`p-4 rounded-2xl bg-white shadow-lg shadow-blue-100/50 ${item.color}`}>
                <item.icon className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-slate-400">{item.name}</span>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
