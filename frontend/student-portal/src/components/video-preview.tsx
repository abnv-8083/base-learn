"use client";

import { motion } from "framer-motion";
import { Play, Star, Zap } from "lucide-react";

export function VideoPreview() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <div className="badge mb-6">
              <Zap className="w-3 h-3 mr-2 fill-primary" />
              Interactive Learning
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              See it for Yourself. <br/>
              <span className="text-gradient">3D Visualization.</span>
            </h2>
            <p className="text-lg text-slate-500 font-bold leading-relaxed mb-10 max-w-xl opacity-70">
              We don't just teach theories; we show you how they work with high-quality simulations and 3D models.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter text-gradient">4K</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Resolution</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter text-gradient">Low</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Latency</div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 primary-gradient blur-[100px] opacity-10 -rotate-12 scale-110" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary-glow/30 group cursor-pointer"
            >
              <img 
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop" 
                alt="Video Preview" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary-glow group-hover:scale-110 transition-transform duration-500">
                  <Play className="w-10 h-10 fill-current ml-1" />
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary border-2 border-white/20 shadow-lg" />
                  <div>
                    <div className="text-sm font-black text-white leading-tight">Physics Masterclass</div>
                    <div className="text-[10px] font-black text-white/60 tracking-widest uppercase mb-1">LIVE SESSION</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-black text-white">4.9/5</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
