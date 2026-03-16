"use client";

import { StudentHero } from "@/components/hero";
import { StatsBar } from "@/components/stats";
import { SubjectCards } from "@/components/subjects";
import { Button } from "@repo/ui/components/button";
import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navbar Overlay */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-black text-xl italic text-white">B</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Base Learn</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 shadow-lg shadow-blue-500/20" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button className="rounded-xl bg-white text-black font-bold px-6 hover:bg-zinc-200" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </Show>
          </div>
        </div>
      </nav>

      <StudentHero />
      <StatsBar />
      <SubjectCards />

      {/* Pricing/Packages Section */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-zinc-400">Choose the plan that fits your academic goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[8, 9, 10].map((grade) => (
              <div key={grade} className="relative group p-8 rounded-3xl border border-zinc-900 bg-black hover:border-blue-500/50 transition-all duration-500">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-zinc-400 mb-2">Grade {grade}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">$49</span>
                    <span className="text-zinc-500">/year</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {["All Subjects Included", "500+ Video Lessons", "Live Doubt Classes", "Interactive Quizzes", "Parent Progress App"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-400">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold group-hover:bg-blue-600 group-hover:border-transparent transition-all">
                  Join Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-black relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full translate-y-1/2" />
         <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to ace your exams?</h2>
            <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
               Start Your Journey
               <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
         </div>
      </section>

      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-500 text-sm">
        <p>© 2026 Base Learn. All rights reserved.</p>
      </footer>
    </main>
  );
}
