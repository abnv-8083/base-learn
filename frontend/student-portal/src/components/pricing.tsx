"use client";

import { Button } from "@repo/ui/components/button";

export function Pricing() {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden bg-white">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="container mx-auto px-6 text-center">
        <div className="badge mb-4">Membership</div>
        <h2 className="text-4xl md:text-6xl font-black mb-20 text-gradient">Simple Pricing for Students</h2>
        
        <div className="max-w-md mx-auto soft-card p-12 border-2 border-primary/10 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-black rounded-full uppercase tracking-widest">Most Popular</div>
          <div className="text-slate-900 font-black mb-8">
            <span className="text-6xl">₹4,999</span>
            <span className="text-slate-400 text-lg font-bold">/YR</span>
          </div>
          <ul className="space-y-6 mb-12 text-left">
            {[
              "Full Syllabus Access",
              "24/7 Priority Support",
              "Personalized Test Series",
              "AI Mock Board Exams"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600 font-bold">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <Button size="lg" className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary-glow transition-all active:scale-95">
            Enroll Now
          </Button>
        </div>
      </div>
    </section>
  );
}
