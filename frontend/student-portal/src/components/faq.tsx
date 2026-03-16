"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Is there a free trial available?",
    answer: "Yes! You can start learning for free with access to sample videos and practice tests for every subject.",
  },
  {
    question: "Which grades do you cover?",
    answer: "We currently provide comprehensive curriculum-based content for Grade 8, 9, and 10 students.",
  },
  {
    question: "Are the classes live or recorded?",
    answer: "Both! We provide a vast library of high-quality recorded lessons and regular live doubt-clearing sessions.",
  },
  {
    question: "Can I use Antigravity on my tablet?",
    answer: "Absolutely. Our platform is fully responsive and works perfectly on smartphones, tablets, and laptops.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 text-center mb-16 tracking-tight">Common Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className={`rounded-3xl border transition-all duration-300 ${openIndex === i ? "border-blue-500 bg-blue-50/30" : "border-slate-100 bg-slate-50/50"}`}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left"
              >
                <span className="text-xl font-black text-slate-800">{faq.question}</span>
                <div className={`p-2 rounded-xl ${openIndex === i ? "bg-blue-600 text-white" : "bg-white text-slate-400 border border-slate-100"}`}>
                  {openIndex === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 pt-0 text-slate-600 leading-loose text-lg font-medium">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
