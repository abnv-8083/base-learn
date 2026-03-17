"use client";

import { motion } from "framer-motion";
import { Plus, Minus, Triangle, Square, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";

const subjects = [
  {
    name: "Mathematics",
    description: "Calculus, Algebra & Geometry",
    icon: Triangle,
    color: "bg-primary",
    lightColor: "bg-primary/5",
    textColor: "text-primary"
  },
  {
    name: "Science",
    description: "Physics, Chemistry & Biology",
    icon: Circle,
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    textColor: "text-indigo-600"
  },
  {
    name: "English",
    description: "Literature & Grammar",
    icon: Square,
    color: "bg-sky-500",
    lightColor: "bg-sky-50",
    textColor: "text-sky-600"
  },
  {
    name: "Social Studies",
    description: "History & Geography",
    icon: Plus,
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    textColor: "text-blue-600"
  }
];

export function SubjectCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {subjects.map((subject, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="soft-card p-10 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-primary/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
          
          <div className={`w-16 h-16 rounded-2xl ${subject.lightColor} flex items-center justify-center mb-8 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <subject.icon className={`w-9 h-9 ${subject.textColor}`} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 relative z-10 tracking-tight">{subject.name}</h3>
          <p className="text-slate-500 font-bold mb-10 relative z-10 opacity-70">
            {subject.description}
          </p>
          <Link 
            href="/courses" 
            className={`inline-flex items-center text-xs font-black uppercase tracking-widest ${subject.textColor} hover:translate-x-2 transition-transform relative z-10`}
          >
            Explore Course
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
