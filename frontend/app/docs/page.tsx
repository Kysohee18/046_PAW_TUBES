'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShoppingBag, Terminal, Key, BookOpen, ArrowLeft, Copy, Check, Code, Shield, HelpCircle } from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

const response = await axios.post('https://046-paw-tubes.vercel.app/api/v1/review/analyze', {
  keyword: 'Headphone Wireless Bluetooth',
  productName: 'Headphone Wireless Bluetooth ANC',
  platform: 'shopee'
}, {
  headers: { 'X-API-KEY': 'rp_your_api_key_here' }
});

console.log(response.data);`;

  const registerExample = `curl -X POST https://046-paw-tubes.vercel.app/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@example.com",
    "password": "your_password",
    "fullName": "Demo Seller",
    "companyName": "TechStore ID"
  }'`;

  const loginExample = `curl -X POST https://046-paw-tubes.vercel.app/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@example.com",
    "password": "your_password"
  }'`;

  const createKeyExample = `curl -X POST https://046-paw-tubes.vercel.app/api/v1/user/api-keys \\
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "My Integration Key" }'`;

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
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Standardized Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-[#09090b]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">ReviewPulse</span>
            </Link>
            <span className="text-xs font-mono text-zinc-400 border-l border-zinc-300 dark:border-zinc-800 pl-3">API Documentation v1.0</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <button className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Documentation Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Production Topic Navigation Sidebar */}
        <aside className="w-56 shrink-0 space-y-6 hidden md:block">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold px-2">Getting Started</span>
            <nav className="space-y-0.5 text-xs font-medium">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${activeSection === 'overview' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection('authentication')}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${activeSection === 'authentication' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Authentication & Keys
              </button>
            </nav>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold px-2">Endpoints Reference</span>
            <nav className="space-y-0.5 text-xs font-medium">
              <button
                onClick={() => setActiveSection('auth-endpoints')}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${activeSection === 'auth-endpoints' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                POST /auth/register, /auth/login
              </button>
              <button
                onClick={() => setActiveSection('apikey-endpoints')}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${activeSection === 'apikey-endpoints' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                POST /user/api-keys
              </button>
              <button
                onClick={() => setActiveSection('endpoints')}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${activeSection === 'endpoints' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                POST /review/analyze
              </button>
              <button
                onClick={() => setActiveSection('errors')}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${activeSection === 'errors' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Error Codes
              </button>
            </nav>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold px-2">Code Examples</span>
            <nav className="space-y-0.5 text-xs font-medium">
              <button
                onClick={() => setActiveSection('code')}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${activeSection === 'code' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                cURL & Node.js
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 space-y-10 max-w-4xl">
          {/* Section: Overview */}
          <section id="overview" className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono border border-emerald-500/20">
              <BookOpen className="h-3.5 w-3.5" /> REST API v1.0 Production Standard
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">API Overview & Architecture</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The ReviewPulse REST API allows e-commerce merchants and warehouse ERP developers to programmatically extract buyer complaint flaws, compute aspect CSAT ratings, and trigger automated quality control fix checklists for products sold on Shopee, Tokopedia, and Amazon.
            </p>
          </section>

          {/* Section: Authentication */}
          <section id="authentication" className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-500" /> API Authentication
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              All requests to <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">/review/*</code> endpoints must contain your secret key in the <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">X-API-KEY</code> HTTP header. Get your key from the <Link href="/dashboard/api-keys" className="text-emerald-600 dark:text-emerald-400 underline">Dashboard &rarr; Developer Tokens</Link> page (requires login).
            </p>
            <div className="bg-[#121215] text-zinc-300 p-4 rounded-lg font-mono text-xs border border-zinc-800 flex items-center justify-between">
              <span>X-API-KEY: rp_your_api_key_here</span>
              <button
                onClick={() => copyToClipboard('X-API-KEY: rp_your_api_key_here', 'key')}
                className="text-xs text-zinc-500 hover:text-white font-sans"
              >
                {copiedCode === 'key' ? 'Copied!' : 'Copy Header'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Shown once</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">The full key is displayed <span className="font-semibold">only at creation time</span>. We never store or return the raw key again &mdash; the dashboard and API only expose the key prefix afterward. Lost it? Revoke and generate a new one.</p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Server-side only</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Never embed your key in frontend/mobile code or commit it to a public repo. Call this API from your backend, and pass results to your client &mdash; same rule as Stripe or OpenAI secret keys.</p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Per-key quota</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Each key has its own <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">usage_limit</code> (default 1000 calls). Track consumption in the dashboard; requests past the limit get <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">429</code>.</p>
              </div>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Revoke anytime</span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">Revoking a key is immediate and irreversible (<code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">is_active: false</code>). Use a separate key per integration/environment so you can revoke one without breaking others.</p>
              </div>
            </div>
          </section>

          {/* Section: Auth endpoints */}
          <section id="auth-endpoints" className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-500" /> POST /api/v1/auth/register &amp; /auth/login
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Create a seller account and exchange credentials for a JWT. The token is required (as a <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">Bearer</code> header) for API key management routes below &mdash; it does <span className="font-semibold">not</span> authorize <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">/review/analyze</code>, which uses <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">X-API-KEY</code> instead.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Register</span>
              <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">{registerExample}</pre>
            </div>
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Login</span>
              <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">{loginExample}</pre>
              <p className="text-[11px] text-zinc-500">Response returns <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">token</code> &mdash; save it to call <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">/user/api-keys</code>.</p>
            </div>
          </section>

          {/* Section: API key management */}
          <section id="apikey-endpoints" className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-cyan-500" /> POST /api/v1/user/api-keys
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Generate an <code className="bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-zinc-300 dark:border-zinc-800">X-API-KEY</code> for your account (JWT-protected). Also available: <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">GET /user/api-keys</code> (list) and <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">DELETE /user/api-keys/:keyId</code> (revoke).
            </p>
            <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">{createKeyExample}</pre>
          </section>

          {/* Section: Endpoint POST /review/analyze */}
          <section id="endpoints" className="space-y-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-cyan-500" /> POST /api/v1/review/analyze
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Extract product complaint flaws and calculate CSAT ratings for a specific product keyword or store URL. Results are cached for 24 hours per keyword &mdash; repeat calls return <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">cached: true</code> instantly. See also <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">GET /review/history</code> for past analyses.
            </p>

            {/* Code Box: cURL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">cURL Request</span>
                <button
                  onClick={() => copyToClipboard(curlExample, 'curl')}
                  className="text-xs text-emerald-500 font-mono flex items-center gap-1 hover:underline"
                >
                  {copiedCode === 'curl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedCode === 'curl' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="bg-[#09090b] text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">
                {curlExample}
              </pre>
            </div>

            {/* Code Box: Node.js */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">Node.js (Axios) Request</span>
                <button
                  onClick={() => copyToClipboard(nodeExample, 'node')}
                  className="text-xs text-emerald-500 font-mono flex items-center gap-1 hover:underline"
                >
                  {copiedCode === 'node' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedCode === 'node' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="bg-[#09090b] text-zinc-300 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">
                {nodeExample}
              </pre>
            </div>

            {/* Code Box: Response */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-zinc-500 uppercase font-semibold">200 OK Response</span>
              <pre className="bg-[#09090b] text-zinc-300 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto">
                {responseExample}
              </pre>
            </div>
          </section>

          {/* Section: Error codes */}
          <section id="errors" className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-rose-500" /> Error Codes
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Every error follows the same envelope: <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded font-mono">{`{ "status": "error", "message": "..." }`}</code>.
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
                  <tr><td className="px-4 py-2 font-mono text-amber-500">400</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Missing required field (e.g. keyword, email, password)</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-rose-500">401</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Missing Authorization Bearer token or X-API-KEY header</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-rose-500">403</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Invalid/expired JWT or inactive/invalid API key</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-orange-500">429</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">API key usage limit exceeded, or rate limit (200 req/15min) hit</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-red-600">500</td><td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">Internal server error</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
