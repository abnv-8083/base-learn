"use client";

import { motion } from "framer-motion";
import { Search, PlayCircle, Trophy } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Choose Your Path",
      id: "01",
      description: "Select your grade and subjects you want to master.",
      icon: Search
    },
    {
      title: "Learn Interactively",
      id: "02",
      description: "Join live sessions and watch 3D visual modules.",
      icon: PlayCircle
    },
    {
      title: "Reach Your Goals",
      id: "03",
      description: "Ace your exams with personalized test series.",
      icon: Trophy
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <div className="badge mb-4">The Process</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-gradient">Your Path to Mastery</h2>
          <p className="text-slate-500 text-lg font-medium opacity-70">Your journey to academic excellence simplified.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary-glow/5 text-center flex flex-col items-center group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center mb-8 shadow-xl shadow-primary-glow transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                <step.icon className="w-10 h-10" />
              </div>
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Step {step.id}</div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 font-bold leading-relaxed opacity-70">{step.description}</p>
              
              {i < 2 && (
                <div className="hidden md:block absolute top-[20%] -right-8 w-16 h-0.5 bg-gradient-to-r from-primary/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
