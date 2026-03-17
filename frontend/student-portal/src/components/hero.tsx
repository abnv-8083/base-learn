"use client";

import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/button";
import { PlayCircle, GraduationCap } from "lucide-react";
import Link from "next/link";

export function StudentHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-white py-20">
      {/* Soft Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[80px] opacity-60" />
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="badge mb-8">
            <GraduationCap className="w-4 h-4 mr-2" />
            Trusted by 15,000+ Students
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] text-slate-900 mb-8 tracking-tighter">
            Master Your School <br/> 
            <span className="text-gradient">The Smart Way.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-12 leading-relaxed font-semibold opacity-80">
            Personalized learning for Grade 8-10. Clear concepts, live help, and high scores—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl bg-primary text-white hover:opacity-90 shadow-xl shadow-primary-glow transition-all active:scale-95" asChild>
              <Link href="/sign-up">Start Learning Free</Link>
            </Button>
            <Button variant="ghost" size="lg" className="h-16 px-8 text-lg font-bold rounded-2xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-2">
              <PlayCircle className="w-6 h-6" />
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Floating Icons */}
        <div className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
           {[
             { label: "Live Classes", sub: "Daily Interactions" },
             { label: "Doubt Support", sub: "24/7 Assistance" },
             { label: "Mock Tests", sub: "Weekly Practice" },
             { label: "3D Visuals", sub: "Clear Concepts" }
           ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 + i * 0.1 }}
               className="p-6 soft-card !rounded-2xl border-primary/5"
             >
                <div className="text-primary font-black mb-1">{item.label}</div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{item.sub}</div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
