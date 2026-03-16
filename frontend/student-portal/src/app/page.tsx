import { StudentHero } from "@/components/hero";
import { StatsBar } from "@/components/stats";
import { SubjectCards } from "@/components/subjects";
import { HowItWorks } from "@/components/how-it-works";
import { VideoPreview } from "@/components/video-preview";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Button } from "@repo/ui/components/button";
import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Navbar Overlay */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="font-black text-2xl italic text-white leading-none">A</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">Antigravity</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Show when="signed-out">
              <Button variant="ghost" className="text-slate-500 hover:text-blue-600 font-bold" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black px-8 shadow-xl shadow-slate-200" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button className="h-12 rounded-xl bg-blue-600 text-white font-black px-8 hover:bg-blue-700 shadow-xl shadow-blue-200" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </Show>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        <StudentHero />
        <StatsBar />
        <SubjectCards />
        <HowItWorks />
        <VideoPreview />
        
        {/* Pricing/Packages Section */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20 text-white">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Flexible Learning Plans</h2>
              <p className="text-slate-400 text-lg">Invest in your future with our specialized grade packages</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {[8, 9, 10].map((grade) => (
                <div key={grade} className="group relative p-1">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-indigo-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-full p-10 rounded-[2.8rem] border border-slate-800 bg-slate-950 hover:border-blue-500 transition-all duration-500 flex flex-col">
                    <div className="mb-10">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 border border-slate-800">
                        <span className="text-2xl font-black text-blue-500">{grade}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">Grade {grade} Mastery</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white">₹4,999</span>
                        <span className="text-slate-500 font-bold">/year</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-5 mb-12 flex-grow">
                      {["Full Annual Syllabus", "1,000+ Practice Problems", "Live Weekly Workshops", "24/7 Doubt Resolution", "Parent Progress Report"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-4 text-slate-300 font-medium">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full h-16 rounded-2xl bg-white text-slate-950 font-black text-lg hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-black/20">
                      Enroll Grade {grade}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Testimonials />
        <FAQ />

        {/* Final CTA */}
        <section className="py-32 bg-white relative overflow-hidden">
           <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-blue-50 to-transparent pointer-events-none" />
           <div className="container mx-auto px-4 text-center relative z-10">
              <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter text-slate-900 leading-none">
                Don't just learn.<br/><span className="text-blue-600">Conquer.</span>
              </h2>
              <Button size="lg" className="h-20 px-16 text-2xl font-black rounded-3xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-2xl shadow-blue-200">
                 Start Now — It's Free
                 <ArrowRight className="ml-4 w-8 h-8" />
              </Button>
           </div>
        </section>
      </div>

      <footer className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <span className="font-black text-xl italic text-white leading-none">A</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">Antigravity</span>
          </div>
          <p className="text-slate-400 font-medium font-bold uppercase tracking-[0.2em] text-xs">© 2026 Antigravity Edu. High Score Guaranteed.</p>
          <div className="flex gap-8 text-slate-400 font-bold text-sm uppercase tracking-widest">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
