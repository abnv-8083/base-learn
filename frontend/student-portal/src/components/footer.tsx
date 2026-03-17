"use client";

import Link from "next/link";
import { Star } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 bg-slate-50 border-t border-slate-100 mt-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
             <Star className="w-5 h-5 text-white fill-white" />
           </div>
           <span className="text-xl font-black text-gradient">Base Learn</span>
        </div>
        <p className="text-slate-400 font-bold text-base">© 2026 Base Learn Edu. Built for future leaders.</p>
        <div className="flex gap-10 text-slate-500 font-bold text-base">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="#" className="hover:text-primary transition-colors">Security</Link>
        </div>
      </div>
    </footer>
  );
}
