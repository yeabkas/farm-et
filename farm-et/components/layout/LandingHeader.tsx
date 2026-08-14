import Link from "next/link";
import { Tractor } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tractor className="w-8 h-8 text-emerald-400" />
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">Farm-ET</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <a href="#features" className="text-sm font-semibold text-white/90 hover:text-white transition">Features</a>
          <a href="#benefits" className="text-sm font-semibold text-white/90 hover:text-white transition">Benefits</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-white/90 hover:text-white transition">
            Log In
          </Link>
          <Link
            href="/onboarding"
            className="text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full transition shadow-lg shadow-emerald-500/30"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
