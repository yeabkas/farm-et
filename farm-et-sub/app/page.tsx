import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Farm-ET</h1>
          <p className="mt-1 text-gray-600">Manage your farm operations end-to-end</p>
        </div>

        <div className="font-mono bg-linear-to-br from-[#d49e1720] via-[#83c80b1c] to-[#10b9812a] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 p-6 space-y-4">
          <Link
            href="/login"
            className="block w-full px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition shadow-md text-center"
          >
            Log In
          </Link>
          <Link
            href="/onboarding"
            className="block w-full px-6 py-2 bg-white/70 text-gray-700 border rounded-md font-medium hover:bg-white/90 transition text-center"
          >
            Start Onboarding
          </Link>
        </div>
      </div>
    </main>
  );
}