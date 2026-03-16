"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
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
  GraduationCap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Recorded Classes", href: "/recorded-classes", icon: PlayCircle },
  { name: "Live Schedule", href: "/schedule", icon: Calendar },
  { name: "Assignments", href: "/assignments", icon: PenTool },
  { name: "Tests & Quizzes", href: "/tests", icon: FlaskConical },
  { name: "My Progress", href: "/progress", icon: BarChart3 },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Doubt Forum", href: "/doubts", icon: MessageSquare },
  { name: "Study Materials", href: "/materials", icon: FolderOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-zinc-950 border-r border-zinc-900 overflow-y-auto no-scrollbar hidden lg:flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-white italic">Base Learn</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : "text-zinc-500 group-hover:text-white"
              )} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-zinc-900 mt-auto">
        <div className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Upgrade Program</p>
          <p className="text-sm font-medium text-white mb-4">Get access to professional mentorship and live classes.</p>
          <button className="w-full py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors">
            GO PREMIUM
          </button>
        </div>
      </div>
    </aside>
  );
}
