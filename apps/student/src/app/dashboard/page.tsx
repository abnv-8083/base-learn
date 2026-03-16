"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { GraduationCap, BookOpen, Trophy, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
          Welcome back, {user?.firstName || "Student"}! 👋
        </h1>
        <p className="text-zinc-500 mt-2">Ready to continue your learning journey today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Courses", value: "4", icon: BookOpen, color: "text-blue-500" },
          { label: "Completed", value: "12", icon: GraduationCap, color: "text-emerald-500" },
          { label: "XP Points", value: "2,450", icon: Trophy, color: "text-yellow-500" },
          { label: "Hours Learnt", value: "42", icon: Clock, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-zinc-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 bg-zinc-900 border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-6">Continue Learning</h2>
          <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-between">
                <div>
                   <div className="font-bold text-white">Mathematics</div>
                   <div className="text-sm text-zinc-500">Chapter 5: Quadratic Equations</div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500">Resume</Button>
             </div>
             {/* Placeholder for more */}
          </div>
        </Card>

        <Card className="p-8 bg-zinc-900 border-zinc-800">
           <h2 className="text-xl font-bold text-white mb-6">Daily Goal</h2>
           <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="91.1" className="text-blue-500" />
                 </svg>
                 <span className="absolute text-2xl font-black text-white">75%</span>
              </div>
              <p className="mt-4 text-zinc-400 font-medium">Almost there! 1 more class to go.</p>
           </div>
        </Card>
      </div>
    </div>
  );
}
