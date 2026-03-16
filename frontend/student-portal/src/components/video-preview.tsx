"use client";

import { Play } from "lucide-react";
import { motion } from "framer-motion";

export function VideoPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">See it in action</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
            Watch how we make complex concepts simple with high-quality visual learning.
          </p>
        </div>

        <div className="max-w-6xl mx-auto relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-100 border-8 border-white shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xl relative"
              >
                <div className="absolute -inset-4 bg-white/20 rounded-full animate-ping" />
                <Play className="w-10 h-10 md:w-14 md:h-14 fill-blue-600 ml-2" />
              </motion.button>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pointer-events-none">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white font-bold text-sm md:text-base">
                Linear Equations in Two Variables
              </div>
              <div className="text-white/80 font-black tracking-widest text-xs uppercase">
                Free Sample Lesson
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
