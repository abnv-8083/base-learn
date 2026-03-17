"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Which grades do you support?",
    answer: "We currently provide comprehensive curriculum for Grades 8, 9, and 10 across all major boards including CBSE and ICSE.",
  },
  {
    question: "How do live classes work?",
    answer: "Live classes are conducted by expert teachers with interactive tools. If you miss one, recordings are available instantly.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! You can explore the first few chapters of every subject absolutely free.",
  },
  {
    question: "Can I ask doubts during class?",
    answer: "Absolutely. Our live chat and dedicated 'Doubt Vault' ensure no question goes unanswered.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-slate-50/50" id="faq">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <div className="badge mb-4">Support</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-gradient">Common Questions</h2>
          <p className="text-slate-500 text-lg font-medium opacity-70">Everything you need to know to get started.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="soft-card !rounded-[2rem] overflow-hidden border-primary/5 shadow-sm">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-8 flex items-center justify-between text-left group hover:bg-primary/5 transition-colors"
              >
                <span className={`text-xl font-black tracking-tight transition-colors ${openIndex === i ? 'text-primary' : 'text-slate-800'}`}>
                  {faq.question}
                </span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg ${openIndex === i ? 'bg-primary text-white shadow-primary-glow rotate-45' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary shadow-none'}`}>
                  <Plus className="w-6 h-6" />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-slate-500 font-bold text-lg leading-relaxed opacity-80 bg-gradient-to-b from-primary/5 to-transparent">
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
