"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  PlayCircle, 
  Calendar, 
  PenTool, 
  FlaskConical, 
  BarChart3, 
  Trophy, 
  MessageSquare, 
  FolderOpen, 
  Settings,
  Star,
  User,
  Compass
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Catalog", href: "/catalog", icon: Compass },
  { name: "Recordings", href: "/recorded-classes", icon: PlayCircle },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Assignments", href: "/assignments", icon: PenTool },
  { name: "Tests", href: "/tests", icon: FlaskConical },
  { name: "Progress", href: "/progress", icon: BarChart3 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Doubts", href: "/doubts", icon: MessageSquare },
  { name: "Resources", href: "/materials", icon: FolderOpen },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-slate-100 hidden lg:flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary-glow">
          <Star className="w-6 h-6 text-white fill-white" />
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-900 border-b-2 border-primary/5">Base Learn</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary-glow" 
                  : "text-slate-500 hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors duration-300",
                isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
              )} />
              {item.name}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 relative overflow-hidden group/upgrade">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover/upgrade:scale-150 transition-transform duration-700" />
          <p className="badge mb-3">Premium</p>
          <p className="text-base font-bold text-slate-900 mb-2">Unlock Pro Features</p>
          <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">Access 3D simulations and elite mentorship.</p>
          <Button className="w-full h-12 bg-primary text-white text-sm font-black shadow-lg shadow-primary-glow transition-all active:scale-95">
            GO PREMIUM
          </Button>
        </div>
      </div>
    </aside>
  );
}
