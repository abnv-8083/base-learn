"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  PenTool, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Filter,
  ArrowRight,
  TrendingUp,
  Search,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const assignments = [
  {
    id: 1,
    title: "Quadratic Equations Problem Set",
    subject: "Math",
    due: "Due in 2 days",
    dueDate: "March 18, 2026",
    status: "Pending",
    instructor: "Dr. Elena Rossi",
    type: "PDF Upload",
    priority: "High",
    color: "bg-primary",
    lightColor: "bg-blue-50"
  },
  {
    id: 2,
    title: "Force & Pressure Lab Report",
    subject: "Physics",
    due: "Due in 5 days",
    dueDate: "March 21, 2026",
    status: "Pending",
    instructor: "Prof. James Wilson",
    type: "Text Submission",
    priority: "Medium",
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50"
  },
  {
    id: 3,
    title: "Periodic Table Quiz",
    subject: "Chemistry",
    due: "Yesterday",
    dueDate: "March 15, 2026",
    status: "Overdue",
    instructor: "Dr. Sarah Smith",
    type: "MCQ",
    priority: "Critical",
    color: "bg-orange-600",
    lightColor: "bg-orange-50"
  },
  {
    id: 4,
    title: "Plant Cell Structure Diagram",
    subject: "Biology",
    due: "Graded",
    dueDate: "March 10, 2026",
    status: "Graded",
    score: "92/100",
    instructor: "Dr. Michael Chen",
    type: "Image Upload",
    priority: "Low",
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50"
  }
];

export default function Assignments() {
  const [activeTab, setActiveTab] = useState("Pending");

  const filteredAssignments = assignments.filter(a => {
    if (activeTab === "All") return true;
    if (activeTab === "Overdue") return a.status === "Overdue";
    if (activeTab === "Graded") return a.status === "Graded";
    return a.status === "Pending";
  });

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <PenTool className="w-3 h-3 mr-2" />
             My Assignments
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Practice <span className="text-gradient">Perfect</span></h1>
          <p className="text-slate-500 font-bold">Sharpen your skills with curated tasks.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search assignments..." 
               className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold shadow-sm"
             />
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all shadow-sm">
             <Filter className="w-4 h-4 mr-2" />
             Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
             {["Pending", "Submitted", "Graded", "Overdue"].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                   "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                   activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary-glow" : "text-slate-400 hover:text-primary hover:bg-primary/5"
                 )}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="space-y-6">
            {filteredAssignments.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="soft-card p-0 overflow-hidden group border-2 border-transparent hover:border-primary/5">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className={cn("w-2 md:w-3 shrink-0", a.color)} />
                    <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                             <span className={cn("badge", a.color.replace('bg-', 'bg-') + "/10", a.color.replace('bg-', 'text-'))}>{a.subject}</span>
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <FileText className="w-3 h-3" />
                                {a.type}
                             </div>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{a.title}</h3>
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[8px] font-black text-primary">
                                   {a.instructor.split(' ').map(n => n[0]).join('')}
                                </div>
                                {a.instructor}
                             </div>
                             <div className={cn(
                               "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                               a.status === "Overdue" ? "text-red-500" : "text-slate-400"
                             )}>
                                <Clock className="w-4 h-4" />
                                {a.due}
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 shrink-0">
                          {a.status === "Graded" ? (
                             <div className="text-right">
                                <div className="text-2xl font-black text-primary tracking-tighter">{a.score}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</div>
                             </div>
                          ) : (
                             <Button className={cn(
                               "h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                               a.status === "Overdue" ? "bg-red-500 text-white" : "bg-primary text-white"
                             )}>
                                {a.status === "Overdue" ? "Submit Late" : "Begin Task"}
                                <ArrowRight className="ml-3 w-4 h-4" />
                             </Button>
                          )}
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-10 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[60px]" />
              <div className="relative z-10 space-y-8">
                 <div className="badge !bg-white/10 !text-white border-white/20">Learning Aura</div>
                 <h2 className="text-4xl font-black tracking-tighter leading-none">Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Efficiency</span></h2>
                 <div className="flex items-end gap-2">
                    <div className="text-6xl font-black tracking-tighter">8.4</div>
                    <div className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] pb-3">Score Avg</div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                       <span>Submission Rate</span>
                       <span>92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full w-[92%] bg-gradient-to-r from-blue-500 to-sky-400 shadow-lg shadow-blue-500/50" />
                    </div>
                 </div>
                 <button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 mt-4">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    View Progress Analytics
                 </button>
              </div>
           </Card>

           <Card className="soft-card p-8 border-2 border-primary/5">
              <h3 className="font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-orange-500" />
                 Important Deadlines
              </h3>
              <div className="space-y-6">
                 {[
                   { title: "Weekly Math Challenge", date: "Mar 18", color: "bg-blue-500" },
                   { title: "Science Term Paper", date: "Mar 22", color: "bg-indigo-500" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className={cn("w-1.5 h-8 rounded-full", item.color)} />
                         <div>
                            <div className="text-xs font-black text-slate-900 leading-none group-hover:text-primary transition-colors">{item.title}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Submit By {item.date}</div>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
