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
    <section className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 px-4 py-1 font-bold">Our Subjects</Badge>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            Master every concept
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {subjects.map((subject, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -12 }}
              className="group relative h-72 perspective-1000"
            >
              <div className="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center gap-6">
                  <div className={`p-5 rounded-3xl bg-gradient-to-br ${subject.color} shadow-lg shadow-black/10`}>
                    <subject.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">{subject.name}</h3>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rounded-[2.5rem] bg-slate-900 p-8 flex flex-col items-center justify-center text-center rotate-y-180">
                   <h3 className="text-xs font-black text-blue-400 mb-4 uppercase tracking-[0.2em]">Syllabus</h3>
                   <p className="text-white font-medium text-sm leading-loose">
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
