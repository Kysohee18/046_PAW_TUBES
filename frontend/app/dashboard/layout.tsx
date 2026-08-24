'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LayoutDashboard, History, Key, BookOpen, LogOut, ShieldAlert } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('rp_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('rp_token');
    router.push('/login');
  };

  if (isAuthenticated === null) {
    // Intentionally blank: this route requires a token, and until the
    // client-side check above resolves, nothing about the dashboard
    // (nav, layout, data) should be visible or implied.
    return <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b]" />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-60 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d0d10] p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">ReviewPulse</span>
            </Link>
            <ThemeToggle />
          </div>

          <nav className="space-y-1 text-xs">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded font-medium border transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700/60 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border-transparent'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-500" /> Flaw Intelligence
            </Link>

            <Link
              href="/dashboard/history"
              className={`flex items-center gap-2.5 px-3 py-2 rounded font-medium border transition-colors ${
                pathname === '/dashboard/history'
                  ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700/60 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border-transparent'
              }`}
            >
              <History className="h-4 w-4" /> Scraped History
            </Link>

            <Link
              href="/dashboard/api-keys"
              className={`flex items-center gap-2.5 px-3 py-2 rounded font-medium border transition-colors ${
                pathname === '/dashboard/api-keys'
                  ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700/60 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border-transparent'
              }`}
            >
              <Key className="h-4 w-4" /> Developer Tokens
            </Link>

            <Link
              href="/docs"
              className={`flex items-center gap-2.5 px-3 py-2 rounded font-medium border transition-colors ${
                pathname === '/docs'
                  ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700/60 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border-transparent'
              }`}
            >
              <BookOpen className="h-4 w-4" /> API Docs
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-xs">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors w-full font-medium"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
