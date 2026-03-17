"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Aditya Verma",
    grade: "Grade 10",
    text: "Base Learn changed the way I look at Math. The 3D concepts and live sessions made even the hardest topics seem easy. I scored 98% in my finals!",
    avatar: "https://i.pravatar.cc/150?u=aditya",
  },
  {
    name: "Sneha Kapoor",
    grade: "Grade 9",
    text: "The mentors here are amazing. They don't just teach; they inspire. The doubt sessions were a lifesaver for my Science projects.",
    avatar: "https://i.pravatar.cc/150?u=sneha",
  },
  {
    name: "Rahul Sharma",
    grade: "Grade 10",
    text: "I used to struggle with English literature, but the storytelling approach used here made me fall in love with the subject. Highly recommended!",
    avatar: "https://i.pravatar.cc/150?u=rahul",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="badge mb-4">Success Stories</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-gradient">Loved by Students</h2>
          <p className="text-slate-500 text-lg font-medium opacity-70">Real stories from our successful learning community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="soft-card p-10 relative flex flex-col group border-primary/5"
            >
              <Quote className="absolute top-8 right-10 w-12 h-12 text-primary/5 group-hover:text-primary/10 transition-colors" />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-600 italic leading-relaxed mb-10 flex-grow font-bold text-lg opacity-80 group-hover:opacity-100 transition-opacity">"{item.text}"</p>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl overflow-hidden border-2 border-primary/20 shadow-lg">
                  <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 leading-tight mb-1">{item.name}</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{item.grade}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
