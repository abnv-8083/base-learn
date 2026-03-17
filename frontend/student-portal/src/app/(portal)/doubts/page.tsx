"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  ThumbsUp, 
  MessageCircle, 
  CheckCircle2, 
  User, 
  Filter,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

const doubts = [
  {
    id: 1,
    title: "How to solve quadratic equations using completing square method?",
    description: "I'm confused about why we add (b/2)² to both sides. Can someone explain the intuition behind it?",
    subject: "Math",
    chapter: "Quadratic Equations",
    user: "Arjun K.",
    grade: "Grade 9",
    upvotes: 24,
    replies: 12,
    resolved: true,
    time: "2h ago",
    instructorReplied: true
  },
  {
    id: 2,
    title: "Difference between Speed and Velocity in Circular Motion?",
    description: "Is velocity constant if speed is constant in uniform circular motion? This part of the chapter is slightly tricky.",
    subject: "Physics",
    chapter: "Motion",
    user: "Sneha M.",
    grade: "Grade 10",
    upvotes: 18,
    replies: 5,
    resolved: false,
    time: "5h ago",
    instructorReplied: false
  },
  {
    id: 3,
    title: "Formula for Sodium Bicarbonate decomposition?",
    description: "I need the exact balanced equation for heating baking soda in a dry test tube. Help appreciated!",
    subject: "Chemistry",
    chapter: "Acid Bases & Salts",
    user: "Rahul S.",
    grade: "Grade 10",
    upvotes: 8,
    replies: 3,
    resolved: false,
    time: "1d ago",
    instructorReplied: true
  }
];

export default function Doubts() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <MessageSquare className="w-3 h-3 mr-2" />
             Doubt Resolution Forum
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Get <span className="text-gradient">Answers</span></h1>
          <p className="text-slate-500 font-bold">Ask anything! Our community of experts and mentors is here to help.</p>
        </div>
        
        <Button className="h-16 px-10 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center gap-3">
           <Plus className="w-5 h-5 text-primary" />
           Post a New Doubt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Feed */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center gap-6 p-2 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm mb-6">
              <div className="relative flex-1 px-4">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search previous questions..." 
                   className="w-full h-14 bg-transparent border-none pl-10 text-sm text-slate-900 focus:outline-none font-bold"
                 />
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <button className="px-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
                 <Filter className="w-4 h-4" />
                 Filter
              </button>
           </div>

           <div className="space-y-6">
             {doubts.map((doubt, i) => (
               <motion.div
                 key={doubt.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
               >
                 <Card className="soft-card p-8 group border-2 border-transparent hover:border-primary/5 cursor-pointer">
                    <div className="flex items-start justify-between gap-6 mb-6">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="badge !bg-primary/5 !text-primary border-primary/20">{doubt.subject}</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doubt.chapter}</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-colors">{doubt.title}</h3>
                          <p className="text-slate-500 font-bold text-sm line-clamp-2">{doubt.description}</p>
                       </div>
                       
                       <div className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-[72px]">
                          <button className="text-primary hover:scale-110 transition-transform">
                             <ThumbsUp className="w-6 h-6 fill-primary/10" />
                          </button>
                          <span className="text-sm font-black text-slate-900">{doubt.upvotes}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-primary text-[10px] shadow-sm">
                                {doubt.user[0]}
                             </div>
                             <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{doubt.user}</div>
                          </div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doubt.time}</div>
                       </div>
                       
                       <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <MessageCircle className="w-4 h-4" />
                             {doubt.replies} Replies
                          </div>

                          {doubt.instructorReplied && (
                            <div className="badge !bg-emerald-50 !text-emerald-600 border-emerald-100 flex items-center gap-1.5 font-black text-[9px]">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                               MENTOR RESPONDED
                            </div>
                          )}

                          {doubt.resolved ? (
                             <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 className="w-5 h-5" />
                             </div>
                          ) : (
                             <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                          )}
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Categories / Stats Sidebar */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-10 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight leading-none">Your <br/> <span className="text-primary">Doubt Stats</span></h2>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-lg">
                       <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <div className="text-4xl font-black tracking-tighter text-white">12</div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Asked</div>
                    </div>
                    <div>
                       <div className="text-4xl font-black tracking-tighter text-emerald-400">08</div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Resolved</div>
                    </div>
                 </div>

                 <div className="space-y-4 pt-10 border-t border-white/5">
                    <p className="text-xs font-bold text-slate-400">Mentors typically reply in <span className="text-white">Under 2 Hours</span></p>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-[85%] bg-primary shadow-lg shadow-primary-glow" />
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="soft-card p-8 border-2 border-primary/5">
              <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Browse Topics</h3>
              <div className="space-y-4">
                 {["Trigonometry", "Organic Chemistry", "Electrostatics", "Shakespeare", "French Revolution"].map((topic, i) => (
                   <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all group">
                      <span className="text-sm font-black text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest leading-none">{topic}</span>
                      <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 group-hover:text-primary" />
                   </button>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
