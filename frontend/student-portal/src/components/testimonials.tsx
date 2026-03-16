"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Arjun Sharma",
    role: "Grade 10 Student",
    quote: "Antigravity changed the way I look at Math. The 3D visualizations made complex geometry feel like a breeze!",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Sneha Reddy",
    role: "Grade 9 Student",
    quote: "The streak system keeps me motivated every day. I've never been more consistent with my studies.",
    rating: 5,
    avatar: "S",
  },
  {
    name: "Rahul Verma",
    role: "Grade 8 Student",
    quote: "Best platform for science! The chemistry experiments shown in video are just amazing and easy to understand.",
    rating: 4,
    avatar: "R",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 text-center mb-16 tracking-tight">Loved by Students</h2>
        
        <div className="flex gap-8 animate-marquee">
          {testimonials.concat(testimonials).map((item, i) => (
            <div key={i} className="flex-shrink-0 w-[400px] p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, star) => (
                  <Star key={star} className={`w-5 h-5 ${star < item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                ))}
              </div>
              
              <Quote className="w-10 h-10 text-blue-100 mb-4" />
              <p className="text-slate-600 text-lg font-medium leading-[1.8] mb-8 italic">
                "{item.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="font-black text-slate-900">{item.name}</h4>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
