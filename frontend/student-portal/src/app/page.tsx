"use client";

import { StudentHero } from "@/components/hero";
import { StatsBar } from "@/components/stats";
import { SubjectCards } from "@/components/subjects";
import { HowItWorks } from "@/components/how-it-works";
import { VideoPreview } from "@/components/video-preview";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { FinalCTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="relative pt-20">
        <StudentHero />
        
        <div className="container mx-auto px-6 -mt-20 relative z-20">
          <StatsBar />
        </div>

        <section id="subjects" className="py-32 bg-slate-50/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <div className="badge mb-4">Course Tracks</div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-gradient">Master Your Subjects</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Specialized Grade 8-10 curriculum designed to boost scores by up to 40%.</p>
            </div>
            <SubjectCards />
          </div>
        </section>

        <HowItWorks />
        <VideoPreview />
        
        <Testimonials />
        <FAQ />

        <Pricing />
        <FinalCTA />
      </div>

      <Footer />
    </main>
  );
}
