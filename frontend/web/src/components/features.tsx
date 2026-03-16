"use client";

import { motion } from "framer-motion";
import { 
  Rocket, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Smartphone, 
  MessageSquare 
} from "lucide-react";

const features = [
  {
    title: "Fast Learning",
    description: "Accelerate your career with our ultra-optimized learning paths designed for efficiency.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  {
    title: "Industry Experts",
    description: "Learn from top professionals currently working at FAANG and Fortune 500 companies.",
    icon: Rocket,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Global Community",
    description: "Connect with thousands of learners worldwide and share your progress and insights.",
    icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Mobile Friendly",
    description: "Access your courses on the go with our fully responsive and seamless mobile experience.",
    icon: Smartphone,
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    title: "Secure Platform",
    description: "Your data and progress are safe with our enterprise-grade security and encryption.",
    icon: ShieldCheck,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  },
  {
    title: "24/7 Support",
    description: "Get help whenever you need it from our dedicated support team and active community.",
    icon: MessageSquare,
    color: "text-red-500",
    bg: "bg-red-500/10"
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to <span className="text-purple-500">Succeed</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Our platform is built to provide the best learning experience with 
            cutting-edge features and professional content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
