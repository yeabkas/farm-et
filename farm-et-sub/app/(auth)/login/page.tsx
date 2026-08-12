'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/services';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // loginUser saves the token to localStorage automatically
      await loginUser({ email, password });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Farm-ET</h1>
          <p className="mt-1 text-gray-600">Sign in to your farm dashboard</p>
        </div>

        <div className="mx-auto max-w-md p-6 font-mono bg-linear-to-br from-[#d49e1720] via-[#83c80b1c] to-[#10b9812a] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 text-left">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border rounded-md p-2 mt-1 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border rounded-md p-2 mt-1 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition shadow-md disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Log In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}