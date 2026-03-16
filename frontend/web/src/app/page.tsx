import { Hero } from "@/components/hero";
import { Features } from "@/components/features";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-purple-900/20 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of students and start learning today. Get unlimited access 
            to all our courses and professional guidance.
          </p>
          <button className="h-14 px-10 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Base Learn. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
