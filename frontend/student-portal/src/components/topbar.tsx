"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@repo/ui/components/button";

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-20 glass-panel flex items-center justify-between px-8 z-40 border-b border-border-soft">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-text-muted">
           <Menu className="w-6 h-6" />
        </Button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search Subjects, Lessons..." 
            className="w-full h-10 bg-bg-soft border border-border-main rounded-btn pl-11 pr-4 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="text-text-muted hover:text-primary relative rounded-lg hover:bg-primary-light transition-all">
             <Bell className="w-5 h-5" />
             <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-primary border-2 border-white" />
          </Button>
        </Link>
        
        <div className="h-8 w-px bg-border-main mx-2" />

         <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-foreground leading-none mb-1">{user?.firstName || "Student"}</div>
               <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">GRADE 10</div>
            </div>
           <div className="p-1 rounded-lg border border-border-main hover:border-primary/20 transition-all bg-white shadow-sm hover:shadow-md">
              <UserButton />
           </div>
        </div>
      </div>
    </header>
  );
}
