"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  LayoutDashboard,
  Atom,
  PenTool,
  FlaskConical,
  Globe,
  Users
} from "lucide-react";
import Link from "next/link";

const grades = [
  { id: 8, label: "Grade 8", desc: "Foundation & Basics", icon: BookOpen },
  { id: 9, label: "Grade 9", desc: "Core Concept Mastery", icon: Atom },
  { id: 10, label: "Grade 10", desc: "Board Exam Preparation", icon: GraduationCap }
];

const subjects = [
  { id: "math", name: "Mathematics", icon: PenTool, color: "bg-blue-500" },
  { id: "physics", name: "Physics", icon: FlaskConical, color: "bg-indigo-600" },
  { id: "chem", name: "Chemistry", icon: Zap, color: "bg-amber-500" },
  { id: "bio", name: "Biology", icon: Target, color: "bg-emerald-500" },
  { id: "eng", name: "English", icon: Globe, color: "bg-sky-400" },
  { id: "social", name: "Social Studies", icon: Users, color: "bg-orange-500" }
];

const goals = [
  { id: "boards", title: "Score 90%+ in Boards", desc: "Personalized revision plans for top grades.", icon: TrophyIcon },
  { id: "concepts", title: "Understand Tough Concepts", desc: "3D visual modules for deep learning.", icon: BrainIcon },
  { id: "fast", title: "Finish Syllabus Fast", desc: "Condensed modules for quick coverage.", icon: Zap },
  { id: "top", title: "Top the Class", desc: "Elite test series and competitive ranking.", icon: Star }
];

function TrophyIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function BrainIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0V15.5A2.5 2.5 0 0 1 9.5 13H12" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 5 0V15.5A2.5 2.5 0 0 0 14.5 13H12" />
      <path d="M8 9h8" />
      <path d="M8 12h8" />
    </svg>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-outfit overflow-hidden">
      {/* Header / Progress */}
      <div className="p-8 md:p-12 flex items-center justify-between max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary-glow">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 border-b-2 border-primary/5">Base Learn</span>
         </div>
         
         <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  step === s ? "w-12 bg-primary shadow-lg shadow-primary-glow" : 
                  step > s ? "w-8 bg-emerald-500" : "w-4 bg-slate-200"
                )} 
              />
            ))}
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
         </div>

         <div className="max-w-4xl w-full">
            <AnimatePresence mode="wait">
               {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12 text-center"
                  >
                     <div className="space-y-4">
                        <div className="badge mx-auto">Step 1 of 4</div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Choose Your <span className="text-gradient">Grade</span></h1>
                        <p className="text-slate-500 text-lg font-bold">Which grade are you currently in?</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {grades.map((g) => (
                           <button 
                             key={g.id}
                             onClick={() => setSelectedGrade(g.id)}
                             className={cn(
                               "soft-card p-10 flex flex-col items-center gap-6 group transition-all duration-500 border-4",
                               selectedGrade === g.id ? "border-primary shadow-2xl scale-105" : "border-transparent hover:border-slate-100"
                             )}
                           >
                              <div className={cn(
                                "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500",
                                selectedGrade === g.id ? "bg-primary text-white shadow-xl shadow-primary-glow rotate-6" : "bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary"
                              )}>
                                 <g.icon className="w-10 h-10" />
                              </div>
                              <div>
                                 <div className="text-2xl font-black text-slate-900 mb-2">{g.label}</div>
                                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{g.desc}</div>
                              </div>
                              {selectedGrade === g.id && (
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-4 border-white shadow-lg">
                                   <CheckCircle2 className="w-4 h-4" />
                                </div>
                              )}
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}

               {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12 text-center"
                  >
                     <div className="space-y-4">
                        <div className="badge mx-auto">Step 2 of 4</div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Pick Your <span className="text-gradient">Subjects</span></h1>
                        <p className="text-slate-500 text-lg font-bold">Select the ones you want to focus on. You can change these later.</p>
                     </div>

                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((s) => {
                           const isSelected = selectedSubjects.includes(s.id);
                           return (
                             <button 
                               key={s.id}
                               onClick={() => toggleSubject(s.id)}
                               className={cn(
                                 "soft-card p-8 flex items-center gap-6 transition-all duration-500 border-2 text-left",
                                 isSelected ? "border-primary shadow-xl scale-105" : "border-transparent hover:border-slate-100"
                               )}
                             >
                                <div className={cn(
                                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                  isSelected ? s.color + " text-white shadow-lg" : "bg-slate-50 text-slate-300"
                                )}>
                                   <s.icon className="w-7 h-7" />
                                </div>
                                <div>
                                   <div className="text-lg font-black text-slate-900 leading-none mb-2">{s.name}</div>
                                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery Pack</div>
                                </div>
                                {isSelected && (
                                  <div className="ml-auto w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                                     <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                )}
                             </button>
                           );
                        })}
                     </div>
                  </motion.div>
               )}

               {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12 text-center"
                  >
                     <div className="space-y-4">
                        <div className="badge mx-auto">Step 3 of 4</div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Set Your <span className="text-gradient">Goal</span></h1>
                        <p className="text-slate-500 text-lg font-bold">What's your primary aim this academic year?</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {goals.map((g) => (
                           <button 
                             key={g.id}
                             onClick={() => setSelectedGoal(g.id)}
                             className={cn(
                               "soft-card p-10 flex flex-col items-center gap-6 text-center transition-all duration-500 border-2",
                               selectedGoal === g.id ? "border-primary shadow-2xl scale-105" : "border-transparent hover:border-slate-100"
                             )}
                           >
                              <div className={cn(
                                "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all",
                                selectedGoal === g.id ? "bg-primary text-white shadow-xl shadow-primary-glow" : "bg-slate-50 text-primary/40"
                              )}>
                                 <g.icon className="w-10 h-10" />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 mb-3">{g.title}</h3>
                                 <p className="text-slate-500 font-bold leading-relaxed">{g.desc}</p>
                              </div>
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}

               {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-12 text-center"
                  >
                     <div className="mx-auto w-32 h-32 rounded-[3.5rem] primary-gradient flex items-center justify-center shadow-2xl animate-bounce">
                        <CheckCircle2 className="w-16 h-16 text-white" />
                     </div>
                     <div className="space-y-4">
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">All <span className="text-gradient">Set!</span></h1>
                        <p className="text-slate-500 text-xl font-bold max-w-lg mx-auto leading-relaxed">
                           Your portal is being personalized based on your Grade {selectedGrade} preferences. Let's start your journey to success.
                        </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
                        {[
                          { icon: LayoutDashboard, label: "Smart Dashboard" },
                          { icon: Zap, label: "Daily Streaks" },
                          { icon: TrophyIcon, label: "Skill Badges" }
                        ].map((feat, i) => (
                           <div key={i} className="flex flex-col items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                                 <feat.icon className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{feat.label}</span>
                           </div>
                        ))}
                     </div>

                     <Link href="/dashboard" className="block w-full max-w-sm mx-auto">
                        <Button className="w-full h-20 rounded-[2.5rem] bg-slate-900 text-white text-lg font-black shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-4">
                           Enter Your Dashboard
                           <ArrowRight className="w-6 h-6 text-primary" />
                        </Button>
                     </Link>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </main>

      {/* Footer Navigation */}
      {step < 4 && (
         <div className="p-8 md:p-12 border-t border-slate-100 flex items-center justify-between max-w-7xl mx-auto w-full">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={cn(
                "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                step === 1 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-primary"
              )}
            >
               Go Back
            </button>
            <Button 
               onClick={nextStep}
               disabled={(step === 1 && !selectedGrade) || (step === 2 && selectedSubjects.length === 0) || (step === 3 && !selectedGoal)}
               className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary-glow hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
               {step === 3 ? "Complete Onboarding" : "Next Step"}
               <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
         </div>
      )}
    </div>
  );
}
