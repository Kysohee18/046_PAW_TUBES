'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Terminal, Key, Copy, Check, Shield, HelpCircle } from 'lucide-react';

const NAV_SECTIONS = [
  { group: 'Getting Started', items: [
    { id: 'overview', label: 'Overview' },
    { id: 'authentication', label: 'Authentication' },
  ]},
  { group: 'Endpoints', items: [
    { id: 'auth-endpoints', label: 'POST /auth/register, /auth/login' },
    { id: 'apikey-endpoints', label: 'POST /user/api-keys' },
    { id: 'endpoints', label: 'POST /review/analyze' },
    { id: 'errors', label: 'Error codes' },
  ]},
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const curlExample = `curl -X POST https://046-paw-tubes.vercel.app/api/v1/review/analyze \\
  -H "X-API-KEY: rp_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "keyword": "Headphone Wireless Bluetooth",
    "productName": "Headphone Wireless Bluetooth ANC",
    "platform": "shopee"
  }'`;

  const nodeExample = `const axios = require('axios');

const { data } = await axios.post(
  'https://046-paw-tubes.vercel.app/api/v1/review/analyze',
  { keyword: 'Headphone Wireless Bluetooth', platform: 'shopee' },
  { headers: { 'X-API-KEY': process.env.REVIEWPULSE_KEY } }
);

console.log(data.data.flaws_detected);`;

  const registerExample = `curl -X POST https://046-paw-tubes.vercel.app/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@example.com",
    "password": "your_password",
    "fullName": "Your Name",
    "companyName": "Your Store"
  }'`;

  const loginExample = `curl -X POST https://046-paw-tubes.vercel.app/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@example.com",
    "password": "your_password"
  }'`;

  const createKeyExample = `curl -X POST https://046-paw-tubes.vercel.app/api/v1/user/api-keys \\
  -H "Authorization: Bearer <your_jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Production Key" }'`;

  const responseExample = `{
  "status": "success",
  "cached": false,
  "data": {
    "id": 6,
    "keyword": "headphone wireless bluetooth",
    "product_name": "Headphone Wireless Bluetooth ANC",
    "platform": "shopee",
    "total_reviews": 15,
    "positive_count": 4,
    "negative_count": 3,
    "neutral_count": 8,
    "average_csat": "3.53",
    "flaws_detected": [
      { "aspect": "shipping", "count": 9, "severity": "high", "note": "..." }
    ],
    "feature_csat": { "battery": 3.57, "shipping": 3.29 },
    "ai_action_items": [
      { "aspect": "shipping", "severity": "high", "recommendation": "..." }
    ],
    "created_at": "2026-08-22T14:31:59.909Z"
  }
}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans scroll-smooth">
      {/* Standardized Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-[#09090b]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">ReviewPulse</span>
            </Link>
            <span className="text-xs font-mono text-zinc-400 border-l border-zinc-300 dark:border-zinc-800 pl-3">Docs</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Documentation Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar — real anchor links, active state driven by scroll position */}
        <aside className="w-56 shrink-0 space-y-6 hidden md:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
          {NAV_SECTIONS.map((group) => (
            <div className="space-y-1" key={group.group}>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold px-2">{group.group}</span>
              <nav className="space-y-0.5 text-xs font-medium">
                {group.items.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block px-3 py-1.5 rounded transition-colors ${
                      activeSection === item.id
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        {/* Content Body */}
        <main className="flex-1 space-y-10 max-w-4xl">
          {/* Section: Overview */}
          <section
            id="overview"
            ref={(el) => { sectionRefs.current.overview = el; }}
            className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8 scroll-mt-20"
          >
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">API Reference</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Send a product keyword and platform, get back categorized complaint data: which aspect buyers are unhappy about (battery, packaging, shipping, quality), a CSAT score per aspect, and a ranked list of fixes. One endpoint, JSON in, JSON out.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-1">
              <span className="text-zinc-400 dark:text-zinc-600">Base URL</span>
              <code className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800">https://046-paw-tubes.vercel.app/api/v1</code>
            </div>
          </section>

          {/* Section: Authentication */}
          <section
            id="authentication"
            ref={(el) => { sectionRefs.current.authentication = el; }}
            className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8 scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-500" /> Authentication
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Every call to <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">/review/*</code> needs an <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">X-API-KEY</code> header. Generate one from <Link href="/dashboard/api-keys" className="text-emerald-600 dark:text-emerald-400 underline">Dashboard &rarr; Developer Tokens</Link> after logging in.
            </p>
            <div className="bg-[#121215] text-zinc-300 p-4 rounded-lg font-mono text-xs border border-zinc-800 flex items-center justify-between">
              <span>X-API-KEY: rp_your_api_key_here</span>
              <button
                onClick={() => copyToClipboard('X-API-KEY: rp_your_api_key_here', 'key')}
                className="text-xs text-zinc-500 hover:text-white font-sans"
              >
                {copiedCode === 'key' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Shown once</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">The full key appears only in the create response. After that, the API and dashboard only expose the prefix. If you lose it, revoke it and make a new one.</p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Server-side only</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Don't ship this key in frontend or mobile bundles. Call the API from your own backend and forward the result to your client.</p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Per-key quota</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Each key gets its own <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">usage_limit</code> (1000 calls by default). Requests past it return <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">429</code>.</p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Revoke anytime</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Revoking is immediate and can't be undone. Use a separate key per integration so one revoke doesn't take down everything.</p>
              </div>
            </div>
          </section>

          {/* Section: Auth endpoints */}
          <section
            id="auth-endpoints"
            ref={(el) => { sectionRefs.current['auth-endpoints'] = el; }}
            className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8 scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-500" /> POST /auth/register, /auth/login
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Registers a seller account or exchanges credentials for a JWT. This token authenticates the key-management routes below via <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">Authorization: Bearer</code>. It does not authenticate <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">/review/analyze</code> — that one uses the API key instead.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Register</span>
              <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">{registerExample}</pre>
            </div>
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Login</span>
              <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">{loginExample}</pre>
              <p className="text-[11px] text-zinc-500">The response's <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">token</code> is what you pass to <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">/user/api-keys</code> below.</p>
            </div>
          </section>

          {/* Section: API key management */}
          <section
            id="apikey-endpoints"
            ref={(el) => { sectionRefs.current['apikey-endpoints'] = el; }}
            className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8 scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-cyan-500" /> POST /user/api-keys
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Creates a new API key for the authenticated account. Also: <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">GET /user/api-keys</code> lists your keys (prefix only), <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">DELETE /user/api-keys/:keyId</code> revokes one.
            </p>
            <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">{createKeyExample}</pre>
          </section>

          {/* Section: Endpoint POST /review/analyze */}
          <section
            id="endpoints"
            ref={(el) => { sectionRefs.current.endpoints = el; }}
            className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8 scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-cyan-500" /> POST /review/analyze
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Runs sentiment and aspect-flaw extraction on reviews matching a keyword, returns CSAT breakdown and a fix checklist. Results are cached 24 hours per keyword — a repeat call in that window returns <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">cached: true</code> with no reprocessing. Past analyses: <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">GET /review/history</code>.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">cURL</span>
                <button
                  onClick={() => copyToClipboard(curlExample, 'curl')}
                  className="text-xs text-emerald-500 font-mono flex items-center gap-1 hover:underline"
                >
                  {copiedCode === 'curl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedCode === 'curl' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">
                {curlExample}
              </pre>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Node.js</span>
                <button
                  onClick={() => copyToClipboard(nodeExample, 'node')}
                  className="text-xs text-emerald-500 font-mono flex items-center gap-1 hover:underline"
                >
                  {copiedCode === 'node' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedCode === 'node' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#09090b] text-zinc-300 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">
                {nodeExample}
              </pre>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Response — 200</span>
              <pre className="bg-[#09090b] text-zinc-300 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">
                {responseExample}
              </pre>
            </div>
          </section>

          {/* Section: Error codes */}
          <section
            id="errors"
            ref={(el) => { sectionRefs.current.errors = el; }}
            className="space-y-4 scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-rose-500" /> Error codes
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Errors share one shape: <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">{`{ "status": "error", "message": "..." }`}</code>.
            </p>
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                  <tr>
                    <th className="text-left px-4 py-2 font-mono">Status</th>
                    <th className="text-left px-4 py-2 font-mono">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <tr><td className="px-4 py-2 font-mono text-amber-500">400</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Missing required field (keyword, email, password)</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-rose-500">401</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Missing Authorization or X-API-KEY header</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-rose-500">403</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">JWT expired/invalid, or API key inactive/invalid</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-orange-500">429</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Key quota used up, or rate limit (200 req/15 min) hit</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-red-600">500</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Server error — retry, or check status</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
