import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#d49e1740] via-[#83c80b5c] to-[#10b98157] p-6">
      <main>
        <Link
          href="/onboarding"
          className="inline-block p-12 bg-[#10b981]  text-slate-900 font-mono text-[48px] leading-tight rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-md transition-all duration-300 ease-out border border-white/50 backdrop-blur-sm tracking-tight text-center"
        >
          Start Onboarding
        </Link>
      </main>
    </div>
  );
}