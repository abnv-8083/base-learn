"use client";

import { motion } from "framer-motion";
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  Dna, 
  Languages, 
  Globe2 
} from "lucide-react";
import { Badge } from "@repo/ui/components/badge";

const subjects = [
  { name: "Math", icon: Calculator, color: "from-blue-500 to-cyan-500", topics: "Calculus, Algebra, Geometry" },
  { name: "Physics", icon: Atom, color: "from-purple-500 to-indigo-500", topics: "Dynamics, Energy, Optics" },
  { name: "Chemistry", icon: FlaskConical, color: "from-pink-500 to-rose-500", topics: "Organic, Atoms, Reactions" },
  { name: "Biology", icon: Dna, color: "from-emerald-500 to-teal-500", topics: "Genetics, Cells, Ecology" },
  { name: "English", icon: Languages, color: "from-orange-500 to-yellow-500", topics: "Grammar, Literature, Writing" },
  { name: "Social Studies", icon: Globe2, color: "from-red-500 to-orange-500", topics: "History, Civics, Geography" },
];

export function SubjectCards() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-400 px-4 py-1">Our Subjects</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Master every concept with ease
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {subjects.map((subject, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="group relative h-64 perspective-1000"
            >
              <div className="relative w-full h-full transition-all duration-500 preserve-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${subject.color} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                    <subject.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 flex flex-col items-center justify-center text-center rotate-y-180">
                   <h3 className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-tighter">Topics</h3>
                   <p className="text-white font-medium text-sm leading-relaxed">
                     {subject.topics}
                   </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
