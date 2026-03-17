"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Show } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary-glow">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 border-b-2 border-primary/10">Base Learn</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-10 text-base font-bold text-slate-500">
            <Link href="#subjects" className="hover:text-primary transition-colors relative group">
              Subjects
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors relative group">
              How it Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link href="#pricing" className="hover:text-primary transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          </div>
          
          <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
            <Show when="signed-out">
              <Link href="/sign-in" className="text-base font-bold text-slate-600 hover:text-primary transition-colors">Login</Link>
              <Button size="lg" className="h-11 bg-primary text-white font-bold px-8 hover:opacity-90 rounded-xl shadow-lg shadow-primary-glow transition-all active:scale-95" asChild>
                <Link href="/sign-up">Start Free</Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button size="lg" className="h-11 bg-primary text-white font-bold px-8 hover:opacity-90 rounded-xl shadow-lg shadow-primary-glow transition-all active:scale-95" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </Show>
          </div>
        </div>
      </div>
    </nav>
  );
}
