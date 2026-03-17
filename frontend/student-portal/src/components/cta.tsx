"use client";

import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/button";

export function FinalCTA() {
  return (
    <section className="py-24 container mx-auto px-6">
      <div className="primary-gradient p-16 md:p-24 rounded-[3rem] text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-7xl font-black text-white mb-8">Ready to Level Up?</h2>
          <p className="text-blue-100 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium opacity-90">
            Join 15,000+ students already mastering their school topics with Base Learn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="w-auto h-16 px-10 bg-white text-primary text-lg font-black hover:bg-slate-50 rounded-2xl shadow-2xl transition-all active:scale-95">
              Get Started for Free
            </Button>
            <div className="text-blue-100 font-bold text-base">No credit card required</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
