'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, BarChart2, Shield, Check, Star } from 'lucide-react';

// Trust bar / logo cloud: e-commerce platforms reviews are sourced from.
// Static config: { name, logo }. Swap/extend this array to add platforms.
const DATA_SOURCES = [
  { name: 'Shopee', logo: '/logos/shopee.svg' },
  { name: 'Tokopedia', logo: '/logos/tokopedia.svg' },
  { name: 'Amazon', logo: '/logos/amazon.svg' },
  { name: 'Shopify', logo: '/logos/shopify.svg' },
  { name: 'Lazada', logo: '/logos/lazada.svg' },
  { name: 'TikTok Shop', logo: '/logos/tiktokshop.svg' },
  { name: 'Blibli', logo: '/logos/blibli.svg' },
];

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Standardized Header */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-[#09090b]/90 backdrop-blur fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex justify-between items-center text-base">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              ReviewPulse
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <Link href="#sources" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Data Sources</Link>
              <Link href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Pricing</Link>
              <Link href="/docs" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">API Docs</Link>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <ThemeToggle />
            <Link href="/login" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-lg transition-all shadow-sm">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-8 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 text-sm font-mono">
          <span className="text-emerald-500 font-bold">● LIVE</span> Shopee & Tokopedia Analytics API
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
          Product Flaw Intelligence <br />
          <span className="text-zinc-500 dark:text-zinc-400 font-normal">for E-Commerce Sellers</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Extract battery, packaging, shipping, and quality complaints from buyer reviews. Automatically calculate aspect CSAT ratings and generate actionable fix checklists.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link href="/register">
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-7 py-3.5 rounded-lg transition-colors inline-flex items-center gap-2 shadow-md">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <Link href="/docs">
            <button className="bg-zinc-200 dark:bg-zinc-900 hover:bg-zinc-300 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 font-bold text-base px-7 py-3.5 rounded-lg transition-colors">
              Read API Docs
            </button>
          </Link>
        </div>
      </section>

      {/* Trust Bar / Logo Cloud — e-commerce platforms reviews are sourced from */}
      <section id="sources" className="py-14 px-8 bg-zinc-100/70 dark:bg-[#0c0c0e] border-y border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* NOTE: "50.000+ pengguna" is a placeholder figure for demo/mockup
              purposes only — not a real production metric. Swap once actual
              usage data is available. */}
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Dipercaya oleh 50.000+ Pengguna untuk Mengelola Proses Mereka
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {DATA_SOURCES.map((source) => (
              <div
                key={source.name}
                className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <img src={source.logo} alt={source.name} className="h-6 w-6 shrink-0 object-contain" />
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{source.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Aspect Flaw Matrix</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Categorize complaints by battery, packaging, delivery speed, and build quality with clear count totals.
            </p>
          </div>
          <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">CSAT Score Delta</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Measure satisfaction rating variances across product iterations and supplier batches.
            </p>
          </div>
          <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Developer REST API</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Integrate flaw extraction directly into your warehouse ERP via X-API-KEY header authentication.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-[#0c0c0e]">
        <div className="max-w-6xl mx-auto px-8 text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-bold">Pricing Plans</span>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">Simple, Transparent Pricing for Sellers</h2>
            <p className="text-base text-zinc-500 max-w-2xl mx-auto">Start with 1,000 free monthly review analyses or scale up with pro features.</p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-800 text-sm font-medium">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-md transition-colors ${billingCycle === 'monthly' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm' : 'text-zinc-500'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-md transition-colors ${billingCycle === 'annual' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-sm' : 'text-zinc-500'}`}
            >
              Annual (20% Off)
            </button>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Plan 1: Developer Free */}
            <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl space-y-8 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Developer Free</h3>
                <p className="text-xs text-zinc-500">For testing and small side stores.</p>
                <div className="text-4xl font-extrabold text-zinc-900 dark:text-white font-mono mt-4">$0 <span className="text-sm text-zinc-500 font-normal">/mo</span></div>
              </div>

              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> 1,000 Review Extractions/mo</li>
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Shopee & Tokopedia Scraping</li>
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Aspect Flaw Breakdown</li>
              </ul>

              <Link href="/register" className="block">
                <button className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-sm py-3 rounded-xl transition-colors border border-zinc-300 dark:border-zinc-700">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Plan 2: Pro Seller */}
            <div className="p-8 bg-white dark:bg-[#121215] border-2 border-emerald-500 rounded-2xl space-y-8 shadow-md relative">
              <span className="absolute -top-3.5 right-6 bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase">
                Most Popular
              </span>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Pro Seller</h3>
                <p className="text-xs text-zinc-500">For growing Shopee & Tokopedia stores.</p>
                <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-4">
                  {billingCycle === 'annual' ? '$23' : '$29'} <span className="text-sm text-zinc-500 font-normal">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> 50,000 Review Extractions/mo</li>
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Unlimited Store Link Scraping</li>
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> AI Fix Recommendation Generator</li>
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Export CSV & JSON Reports</li>
              </ul>

              <Link href="/register" className="block">
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm">
                  Start 14-Day Free Trial
                </button>
              </Link>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="p-8 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl space-y-8 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Enterprise</h3>
                <p className="text-xs text-zinc-500">For multi-brand retail distributors.</p>
                <div className="text-4xl font-extrabold text-zinc-900 dark:text-white font-mono mt-4">Custom</div>
              </div>

              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Unlimited API Extractions</li>
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Dedicated Supabase Instance</li>
                <li className="flex items-center gap-2.5"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> 24/7 Priority Support SLA</li>
              </ul>

              <Link href="/docs" className="block">
                <button className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-sm py-3 rounded-xl transition-colors border border-zinc-300 dark:border-zinc-700">
                  Contact Enterprise Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Standardized Footer */}
      <footer className="py-10 border-t border-zinc-200 dark:border-zinc-800/80 text-center text-sm text-zinc-500">
        ReviewPulse SaaS &copy; 2026. Built with Express.js, Supabase PostgreSQL, and Next.js 16.
      </footer>
    </div>
  );
}
