"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Search, Bell, Menu, LayoutGrid } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-20 bg-black/50 backdrop-blur-xl border-b border-zinc-900 flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400">
           <Menu className="w-6 h-6" />
        </Button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search classes, notes, or tutors..." 
            className="w-full h-11 bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-500 font-bold uppercase">
             /
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white relative">
           <Bell className="w-5 h-5" />
           <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-black" />
        </Button>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
           <LayoutGrid className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-px bg-zinc-800 mx-2" />

        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white leading-none mb-1">{user?.firstName || "Student"}</div>
              <div className="text-xs font-medium text-zinc-500">Grade 10 • Beta</div>
           </div>
           <UserButton />
        </div>
      </div>
    </header>
  );
}
