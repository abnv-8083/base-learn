"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, Trophy } from "lucide-react";

const steps = [
  {
    title: "Sign Up",
    description: "Create your account in seconds and join our learning community.",
    icon: UserPlus,
    color: "bg-blue-500",
  },
  {
    title: "Pick Subject",
    description: "Choose from our wide range of grade-specific comprehensive courses.",
    icon: BookOpen,
    color: "bg-indigo-500",
  },
  {
    title: "Watch & Score",
    description: "Learn with 3D visuals, take quizzes, and watch your grades soar.",
    icon: Trophy,
    color: "bg-blue-600",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-20 tracking-tight">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 max-w-5xl mx-auto relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-1 bg-slate-100 -z-10" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center"
            >
              <div className={`w-[120px] h-[120px] rounded-full ${step.color} shadow-2xl shadow-blue-200 flex items-center justify-center mb-8 relative border-8 border-white`}>
                <step.icon className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center font-black text-blue-600 text-lg">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4">{step.title}</h3>
              <p className="text-slate-500 leading-loose max-w-[250px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
