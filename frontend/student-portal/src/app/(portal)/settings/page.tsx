"use client";

import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { 
  User, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  Palette, 
  Globe, 
  LogOut,
  Camera,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Lock,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Account");

  const menuItems = [
    { id: "Account", icon: User, label: "Account Settings", sub: "Profile, Emails, Security" },
    { id: "Notifications", icon: Bell, label: "Notifications", sub: "App, Email, SMS" },
    { id: "Appearance", icon: Palette, label: "Design & Look", sub: "Theme, Colors, Font" },
    { id: "Subscription", icon: CreditCard, label: "My Plan", sub: "Billing, Legacy Account" },
    { id: "Privacy", icon: ShieldCheck, label: "Privacy", sub: "Leaderboard, Visibility" },
    { id: "Language", icon: Globe, label: "Language", sub: "System Language" }
  ];

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div>
        <div className="badge mb-4">
           <Settings className="w-3 h-3 mr-2" />
           System Configuration
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">My <span className="text-gradient">Space</span></h1>
        <p className="text-slate-500 font-bold">Customize your portal experience and manage security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           {menuItems.map((item) => (
             <button 
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={cn(
                 "w-full text-left p-6 rounded-[2rem] border-2 transition-all group flex items-center justify-between",
                 activeTab === item.id 
                   ? "bg-white border-primary shadow-xl shadow-primary-glow/10 translate-x-3" 
                   : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50"
               )}
             >
                <div className="flex items-center gap-5">
                   <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                      activeTab === item.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary"
                   )}>
                      <item.icon className="w-6 h-6" />
                   </div>
                   <div>
                      <div className={cn(
                        "text-sm font-black tracking-tight",
                        activeTab === item.id ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
                      )}>{item.label}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{item.sub}</div>
                   </div>
                </div>
                {activeTab === item.id && <ChevronRight className="w-5 h-5 text-primary" />}
             </button>
           ))}

           <div className="pt-10">
              <button className="w-full p-6 rounded-[2rem] border-2 border-transparent hover:border-red-100 hover:bg-red-50/50 transition-all flex items-center gap-5 group">
                 <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                    <LogOut className="w-6 h-6" />
                 </div>
                 <div className="text-left font-black text-sm text-red-500 tracking-tight uppercase tracking-widest">Sign Out Account</div>
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
           <Card className="soft-card p-12 border-2 border-primary/5 min-h-[600px]">
              {activeTab === "Account" && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-12"
                 >
                    <div className="flex flex-col md:flex-row items-center gap-10">
                       <div className="relative group">
                          <div className="w-32 h-32 rounded-[3.5rem] bg-slate-100 border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black text-primary">
                             AA
                          </div>
                          <button className="absolute bottom-0 right-0 w-10 h-10 rounded-2xl bg-primary text-white shadow-xl flex items-center justify-center border-4 border-white hover:scale-110 transition-transform">
                             <Camera className="w-5 h-5" />
                          </button>
                       </div>
                       <div className="space-y-2 text-center md:text-left">
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Abhinav A M</h2>
                          <div className="flex items-center gap-4 justify-center md:justify-start">
                             <span className="badge !bg-primary/5 !text-primary !px-4">Grade 10</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID: #BL-1029</span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Display Name</label>
                          <input 
                            type="text" 
                            defaultValue="Abhinav A M"
                            className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] px-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm"
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
                          <div className="relative">
                             <input 
                               type="email" 
                               defaultValue="abhinav@example.com"
                               disabled
                               className="w-full h-16 bg-slate-100 border border-slate-100 rounded-[1.5rem] px-6 text-sm font-bold text-slate-400 focus:outline-none cursor-not-allowed pr-14 shadow-sm"
                             />
                             <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 flex justify-end gap-6">
                       <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">Discard Changes</Button>
                       <Button className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-glow">Save Profile</Button>
                    </div>
                 </motion.div>
              )}

              {activeTab === "Appearance" && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-12"
                 >
                    <div className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight">Theme Mode</h2>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { id: 'light', icon: Sun, name: 'Light' },
                            { id: 'dark', icon: Moon, name: 'Dark' },
                            { id: 'system', icon: Monitor, name: 'System' }
                          ].map((t) => (
                             <button key={t.id} className={cn(
                               "p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                               t.id === 'light' ? "bg-white border-primary shadow-xl shadow-primary-glow/10" : "bg-slate-50 border-transparent hover:border-slate-100"
                             )}>
                                <div className={cn(
                                   "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                   t.id === 'light' ? "bg-primary text-white" : "bg-white text-slate-400 group-hover:text-primary"
                                )}>
                                   <t.icon className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest group-hover:text-slate-900">{t.name}</div>
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal Accent</h2>
                       <div className="flex gap-4">
                          {['blue', 'indigo', 'purple', 'emerald', 'amber'].map((color) => (
                             <button 
                               key={color} 
                               className={cn(
                                 "w-12 h-12 rounded-2xl transition-all shadow-sm hover:scale-110 active:scale-95",
                                 color === 'blue' ? "bg-blue-600 ring-4 ring-blue-100 ring-offset-4" :
                                 color === 'indigo' ? "bg-indigo-600" :
                                 color === 'purple' ? "bg-purple-600" :
                                 color === 'emerald' ? "bg-emerald-600" : "bg-amber-600"
                               )}
                             />
                          ))}
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === "Subscription" && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-10"
                 >
                    <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                       <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                          <div className="space-y-4">
                             <div className="badge flex items-center gap-2 !bg-white/10 !text-white border-white/20">
                                <Zap className="w-4 h-4 fill-primary" />
                                PREMIUM PRO
                             </div>
                             <h3 className="text-4xl font-black tracking-tighter">Gold Scholar <br/> <span className="text-blue-400">Monthly</span></h3>
                             <p className="text-slate-400 font-medium">Renews on April 16, 2026 for ₹499/mo</p>
                          </div>
                          <Button className="h-16 px-10 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-slate-100 active:scale-95 transition-all">Manage Billing</Button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Card className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                             <Monitor className="w-7 h-7" />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900 mb-1">Board Mastery Pack</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Add-on</p>
                          </div>
                       </Card>
                       <Card className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                             <ShieldCheck className="w-7 h-7" />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900 mb-1">Elite Mentorship</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Add-on</p>
                          </div>
                       </Card>
                    </div>
                 </motion.div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
}
