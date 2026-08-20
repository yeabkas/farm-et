import Link from "next/link";

import { ArrowRight, Sprout, Tractor, TrendingUp, ShoppingBag, CheckCircle2 } from "lucide-react";

import heroBg from "../public/hero-farm.jpg";
import Image from "next/image";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { Chatbot } from "@/components/chatbot/Chatbot";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-mono text-gray-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      <LandingHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[85vh] flex items-center">
          {/* Background Image with slight blur, fixed for parallax scroll effect */}
          <div className="fixed inset-0 z-0">
            <Image
              src={heroBg}
              alt="Ethiopian Farm Landscape"
              fill
              placeholder="blur"
              className="object-cover scale-[1.02]"
              priority
            />
            {/* Professional dark gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">The Future of Agriculture in Ethiopia</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-8 drop-shadow-lg leading-tight">
              All-in-One Farm <br className="hidden md:block" /> Management Software
            </h1>

            <p className="mt-6 text-xl text-emerald-50 max-w-3xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-md">
              Keep precise records, track livestock health, plan crop rotations, and manage your entire farm&apos;s accounting in one unified platform.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                href="/onboarding"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 text-lg font-bold rounded-full text-emerald-900 bg-white hover:bg-emerald-50 hover:scale-105 transition-all shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold rounded-full text-white bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-400/30 backdrop-blur-md transition-all"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* Bottom Wave Divider */}
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-transparent relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">Everything you need to run a profitable farm</h2>
              <p className="text-lg text-emerald-50 drop-shadow-sm">Farm-ET brings your fields, barns, and office together. Make data-driven decisions that increase your yields and reduce costs.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Livestock */}
              <div className="bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/40 transition-all duration-300">
                  <span className="text-3xl brightness-50 leading-none filter group-hover:brightness-0 group-hover:invert transition-all">🐄</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">Livestock Management</h3>
                <p className="text-emerald-50/90 leading-relaxed">
                  Track individual animal health, breeding cycles, genetics, and treatments. Know exactly when your livestock is ready for market.
                </p>
              </div>

              {/* Crops */}
              <div className="bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/40 transition-all duration-300">
                  <Sprout className="w-7 h-7 text-emerald-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">Crop Planning</h3>
                <p className="text-emerald-50/90 leading-relaxed">
                  Map your fields, plan crop rotations, log harvests, and monitor soil treatments to maximize your yield per hectare.
                </p>
              </div>

              {/* Accounting */}
              <div className="bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/40 transition-all duration-300">
                  <TrendingUp className="w-7 h-7 text-emerald-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">Farm Accounting</h3>
                <p className="text-emerald-50/90 leading-relaxed">
                  Automatically track expenses, sales, and generate Profit & Loss reports specifically designed for agricultural businesses.
                </p>
              </div>

              {/* Marketplace */}
              <div className="bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/40 transition-all duration-300">
                  <ShoppingBag className="w-7 h-7 text-emerald-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">Direct Marketplace</h3>
                <p className="text-emerald-50/90 leading-relaxed">
                  Cut out the middleman. List your harvest or livestock directly on the Farm-ET marketplace to connect with buyers instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24 bg-transparent relative z-10 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                  Stop guessing. Start growing.
                </h2>
                <p className="text-lg text-emerald-50/90 leading-relaxed">
                  Ditch the scattered notebooks and complicated spreadsheets. Farm-ET gives you the clarity you need to make profitable decisions for your farm&apos;s future.
                </p>

                <ul className="space-y-5">
                  {[
                    "Centralized record keeping accessible anywhere.",
                    "Identify your most profitable crops and animals.",
                    "Stay compliant with automated reporting.",
                    "Built specifically for the Ethiopian agricultural ecosystem."
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-white font-medium drop-shadow-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg transition shadow-lg shadow-emerald-500/30"
                  >
                    Create Your Farm Profile
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Decorative Visual / Abstract Dashboard Representation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-emerald-300/10 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-sm"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-4 overflow-hidden">
                  <div className="flex gap-4 mb-4">
                    <div className="w-1/3 h-24 bg-emerald-400/20 rounded-xl animate-pulse border border-emerald-400/20"></div>
                    <div className="w-2/3 h-24 bg-blue-400/20 rounded-xl animate-pulse delay-75 border border-blue-400/20"></div>
                  </div>
                  <div className="w-full h-40 bg-white/5 rounded-xl border border-white/10 flex items-end p-4 gap-2">
                    {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-400/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1 h-12 bg-white/5 rounded-lg border border-white/10"></div>
                    <div className="flex-1 h-12 bg-white/5 rounded-lg border border-white/10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <Chatbot />
    </div>
  );
}