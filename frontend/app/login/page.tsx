'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, Lock, Mail, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.token) {
        localStorage.setItem('rp_token', res.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('seller@store.com');
    setPassword('seller123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between font-sans">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-[#09090b]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-base text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            ReviewPulse
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <button className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono border border-emerald-500/20 mb-2">
              <KeyRound className="h-3 w-3" /> Merchant Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Sign In to ReviewPulse</h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Access your e-commerce product flaw intelligence dashboard</p>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@store.com"
                    className="w-full bg-zinc-100 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/60 rounded-lg pl-10 pr-3.5 py-2.5 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-100 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/60 rounded-lg pl-10 pr-3.5 py-2.5 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm"
              >
                {loading ? 'Signing in...' : 'Sign In to Dashboard'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Demo Account Auto-Fill */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="w-full py-2 px-3 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/60 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Auto-fill Demo Account (seller@store.com)
              </button>
            </div>

            <div className="text-center text-xs text-zinc-500 pt-1">
              <span>Don't have an account? </span>
              <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-4 text-center text-xs text-zinc-500 font-mono">
        ReviewPulse SaaS • E-Commerce Review & Flaw Intelligence
      </footer>
    </div>
  );
}
