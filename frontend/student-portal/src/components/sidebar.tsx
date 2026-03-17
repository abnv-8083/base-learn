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
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-border-main hidden lg:flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/10">
          <Star className="w-6 h-6 text-white fill-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">Base Learn</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-text-muted hover:text-primary hover:bg-primary-light"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors duration-200",
                isActive ? "text-white" : "text-text-muted group-hover:text-primary"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-6 rounded-card bg-bg-soft border border-border-main relative overflow-hidden group/upgrade">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover/upgrade:scale-150 transition-transform duration-700" />
          <p className="badge mb-3">Premium</p>
          <p className="text-sm font-bold text-foreground mb-1">Unlock Pro Features</p>
          <p className="text-xs font-medium text-text-muted mb-6 leading-relaxed">Access 3D simulations and elite mentorship.</p>
          <Button className="w-full h-10 bg-primary text-white text-xs font-bold rounded-btn shadow-md hover:bg-primary-dark transition-all active:scale-95">
            GO PREMIUM
          </Button>
        </div>
      </div>
    </aside>
  );
}
