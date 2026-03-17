import Link from "next/link";
import { Star } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">Base Learn</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100">
          {children}
        </div>
      </div>
      <div className="p-8 text-center">
        <p className="text-slate-400 text-sm font-medium">© 2026 Base Learn. Empowering students everywhere.</p>
      </div>
    </div>
  );
}
