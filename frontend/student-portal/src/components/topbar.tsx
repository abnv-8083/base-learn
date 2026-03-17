"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-20 glass-panel flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-slate-400">
           <Menu className="w-6 h-6" />
        </Button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search Subjects, Lessons..." 
            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary relative rounded-xl hover:bg-primary/5 transition-all">
             <Bell className="w-5 h-5" />
             <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-white" />
          </Button>
        </Link>
        
        <div className="h-8 w-px bg-slate-100 mx-2" />

         <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
               <div className="text-base font-black text-slate-900 leading-none mb-1">{user?.firstName || "Student"}</div>
               <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">GRADE 10</div>
            </div>
           <div className="p-1 rounded-xl border border-slate-100 hover:border-primary/20 transition-all bg-white shadow-sm hover:shadow-md">
              <UserButton />
           </div>
        </div>
      </div>
    </header>
  );
}
