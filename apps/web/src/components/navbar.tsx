"use client";

import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Show } from "@clerk/nextjs";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-purple-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Base Learn
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</Link>
          <Link href="#courses" className="text-sm text-zinc-400 hover:text-white transition-colors">Courses</Link>
          <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          
          <Show when="signed-out">
            <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </Show>
          
          <Show when="signed-in">
            <Button className="bg-white text-black font-semibold border-0" asChild>
              <Link href="http://localhost:3001/dashboard">Go to Student Portal</Link>
            </Button>
          </Show>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <Link href="#features" className="text-zinc-400 px-4 py-2 hover:bg-white/5 rounded-lg" onClick={() => setIsOpen(false)}>Features</Link>
          <Link href="#courses" className="text-zinc-400 px-4 py-2 hover:bg-white/5 rounded-lg" onClick={() => setIsOpen(false)}>Courses</Link>
          <Link href="#pricing" className="text-zinc-400 px-4 py-2 hover:bg-white/5 rounded-lg" onClick={() => setIsOpen(false)}>Pricing</Link>
          <hr className="border-white/10" />
          <Show when="signed-out">
            <Button variant="ghost" className="w-full text-zinc-400" asChild>
              <Link href="/sign-in" onClick={() => setIsOpen(false)}>Sign In</Link>
            </Button>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 border-0" asChild>
              <Link href="/sign-up" onClick={() => setIsOpen(false)}>Get Started</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <Button className="w-full bg-white text-black font-semibold border-0" asChild>
              <Link href="http://localhost:3001/dashboard" onClick={() => setIsOpen(false)}>Go to Student Portal</Link>
            </Button>
          </Show>
        </div>
      )}
    </nav>
  );
}
