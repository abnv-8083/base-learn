"use client";

import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { PlayCircle, Users, Star, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-black">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge variant="outline" className="mb-6 border-purple-500/30 text-purple-400 bg-purple-500/10 px-4 py-1">
            ✨ Newly Launched: Advance AI Course
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Master Your Future with <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent italic">
              Industry Experts.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Access world-class education anywhere, anytime. Join 50,000+ students 
            learning from top professionals in tech, design, and business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="h-14 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-lg group">
              Start Learning Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 hover:bg-white/5 text-white rounded-full text-lg">
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white" />
              <span className="text-white font-medium">50K+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-white font-medium">4.9/5 Rating</span>
            </div>
            <div className="text-white font-bold text-xl tracking-widest">COURSERA</div>
            <div className="text-white font-bold text-xl tracking-widest">UDEMY</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
