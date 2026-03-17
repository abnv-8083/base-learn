"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  FolderOpen, 
  Search, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Filter,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Share2,
  Lock,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

const materials = [
  {
    id: 1,
    title: "Class 10 Math — Formula Cheat Sheet",
    subject: "Math",
    type: "PDF",
    size: "1.2 MB",
    downloads: "2.4k",
    premium: false,
    date: "Mar 15, 2026",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400"
  },
  {
    id: 2,
    title: "Force & Laws of Motion Hand-drawn Notes",
    subject: "Physics",
    type: "Image Bundle",
    size: "15.5 MB",
    downloads: "850",
    premium: true,
    date: "Mar 12, 2026",
    thumbnail: "https://images.unsplash.com/photo-1635070040896-73604f762635?q=80&w=400"
  },
  {
    id: 3,
    title: "10-Year Previous Papers (Chemistry)",
    subject: "Chemistry",
    type: "PDF",
    size: "4.2 MB",
    downloads: "3.1k",
    premium: true,
    date: "Mar 08, 2026",
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=400"
  },
  {
    id: 4,
    title: "Active/Passive Voice Worksheets",
    subject: "English",
    type: "Doc",
    size: "650 KB",
    downloads: "1.2k",
    premium: false,
    date: "Mar 05, 2026",
    thumbnail: "https://images.unsplash.com/photo-1544648151-683ee760ba29?q=80&w=400"
  }
];

export default function Materials() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="badge mb-4">
             <FolderOpen className="w-3 h-3 mr-2" />
             Study Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">Vault of <span className="text-gradient">Success</span></h1>
          <p className="text-slate-500 font-bold">Downloadable notes, formulas, and previous years' board papers.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search materials..." 
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
        <div className="lg:col-span-8 space-y-10">
           <div className="flex items-center gap-2 p-2 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
              {["All", "Notes", "Formulas", "Papers", "Quizzes"].map((tab) => (
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

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {materials.map((file, i) => (
               <motion.div
                 key={file.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1 }}
               >
                 <Card className="soft-card group p-2 relative overflow-hidden flex flex-col border-2 border-transparent hover:border-primary/5">
                    <div className="relative aspect-[16/10] rounded-2xl bg-slate-100 overflow-hidden shadow-sm">
                       <img 
                          src={file.thumbnail}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                          alt={file.title}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                       
                       <div className="absolute top-4 left-4">
                          <span className="badge !bg-white/20 !text-white backdrop-blur-md border border-white/30">
                             {file.subject}
                          </span>
                       </div>

                       {file.premium && (
                         <div className="absolute top-4 right-4 text-primary bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 shadow-lg">
                            <Lock className="w-4 h-4" />
                         </div>
                       )}

                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="h-14 w-14 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                             <Download className="w-6 h-6" />
                          </button>
                       </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                       <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
                             {file.title}
                          </h3>
                       </div>

                       <div className="flex items-center gap-6 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          <div className="flex items-center gap-2">
                             <FileText className="w-4 h-4 text-primary" />
                             {file.type}
                          </div>
                          <div className="flex items-center gap-2">
                             <DownloadsIcon className="w-4 h-4" />
                             {file.downloads} Downloads
                          </div>
                       </div>

                       <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{file.size}</div>
                          <div className="flex items-center gap-4">
                             <button className="text-slate-300 hover:text-primary transition-all p-2 rounded-xl">
                                <Bookmark className="w-5 h-5" />
                             </button>
                             <button className="text-slate-300 hover:text-primary transition-all p-2 rounded-xl">
                                <Share2 className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <Card className="soft-card p-10 bg-slate-900 text-white relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
              <div className="relative z-10 space-y-8 w-full">
                 <div className="mx-auto w-24 h-24 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl">
                    <Star className="w-12 h-12 text-blue-400" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter">Premium <br/> <span className="text-blue-400">Vault</span></h2>
                    <p className="text-slate-400 font-bold text-sm">Access board-topper's handwritten notes.</p>
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-glow hover:opacity-90 active:scale-95 transition-all">
                    Upgrade to Unlock
                 </Button>
              </div>
           </Card>

           <Card className="soft-card p-8 border-2 border-primary/5">
              <h3 className="font-black text-slate-900 mb-8 tracking-tight">Recent Activity</h3>
              <div className="space-y-6">
                 {[
                   { title: "You downloaded MCQ Set #4", time: "2h ago", icon: Download },
                   { title: "Chemistry notes was updated", time: "5h ago", icon: TrendingUp },
                 ].map((act, i) => (
                   <div key={i} className="flex gap-4 group cursor-default">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary transition-all group-hover:border-primary">
                         <act.icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
                      </div>
                      <div>
                         <div className="text-[11px] font-black text-slate-900 tracking-tight leading-snug">{act.title}</div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{act.time}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

function DownloadsIcon(props: any) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
