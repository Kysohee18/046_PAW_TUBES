'use client';

import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Star, Activity, Key, Terminal, ArrowUpRight, Copy, Check, Filter } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function DashboardPage() {
  const [keyword, setKeyword] = useState('Headphone Bluetooth Wireless');
  const [platform, setPlatform] = useState('shopee');
  const [loading, setLoading] = useState(false);
  const [activeSeverity, setActiveSeverity] = useState('all');
  const [copied, setCopied] = useState(false);
  // The API key is never re-fetched from the server (it's only returned once,
  // at creation time — see /dashboard/api-keys). We persist the last-created
  // key in this browser's localStorage so this page can reuse it.
  const [activeApiKey, setActiveApiKey] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');

  const [analysis, setAnalysis] = useState<any>({
    product_name: 'Headphone Bluetooth Wireless',
    platform: 'shopee',
    total_reviews: 12,
    positive_count: 5,
    negative_count: 4,
    neutral_count: 3,
    average_csat: 3.45,
    flaws_detected: [
      { aspect: 'battery', count: 4, impact: '-0.80 pts', severity: 'high', note: 'Baterai cepat panas & boros pas dipake 1 jam' },
      { aspect: 'packaging', count: 3, impact: '-0.60 pts', severity: 'medium', note: 'Kemasan kardus penyok pas sampe di rumah' },
      { aspect: 'shipping', count: 2, impact: '-0.40 pts', severity: 'low', note: 'Pengiriman kurir agak lambat telat 2 hari' },
      { aspect: 'quality', count: 1, impact: '-0.20 pts', severity: 'low', note: 'Bahan plastik agak tipis' }
    ],
    feature_csat: {
        battery: 2.80,
        packaging: 3.10,
        shipping: 3.90,
        quality: 3.70
    },
    ai_action_items: [
      { aspect: 'battery', recommendation: 'Gunakan cell baterai berkapasitas lebih besar dan tambahkan instruksi pengisian daya yang aman.' },
      { aspect: 'packaging', recommendation: 'Tambahkan kardus luar ganda dan bubble wrap minimal 3 lapis untuk melindungi produk.' },
      { aspect: 'shipping', recommendation: 'Gunakan layanan kurir prioritas dan proses pesanan sebelum jam 15:00 di hari yang sama.' }
    ]
  });

  useEffect(() => {
    setActiveApiKey(localStorage.getItem('rp_active_api_key') || '');
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;

    if (!activeApiKey) {
      setAnalyzeError('No API key set for this browser. Generate one in Developer Tokens first.');
      return;
    }

    setAnalyzeError('');
    setLoading(true);
    try {
      const res = await api.post('/review/analyze', { keyword, platform }, {
        headers: { 'x-api-key': activeApiKey }
      });
      if (res.data && res.data.data) {
        setAnalysis(res.data.data);
      }
    } catch (err: any) {
      setAnalyzeError(err.response?.data?.message || 'Failed to analyze reviews.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFlaws = (analysis.flaws_detected || []).filter((f: any) => {
    if (activeSeverity === 'high') return f.severity === 'high';
    if (activeSeverity === 'medium') return f.severity === 'medium';
    return true;
  });

  const copyCurl = () => {
    navigator.clipboard.writeText(`curl -X POST ${API_BASE_URL}/review/analyze -H "X-API-KEY: ${activeApiKey || '<your_api_key>'}" -H "Content-Type: application/json" -d '{"keyword": "${keyword}", "platform": "${platform}"}'`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans text-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Review Flaw Intelligence</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Scrape buyer complaints & CSAT bottlenecks across e-commerce platforms</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">REST API v1.0 Operational</span>
        </div>
      </div>

      {!activeApiKey && (
        <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs px-4 py-3 rounded-xl">
          <span>No API key set for this browser yet — analyze won't work until you generate one.</span>
          <Link href="/dashboard/api-keys" className="font-bold underline shrink-0">Generate a key &rarr;</Link>
        </div>
      )}
      {analyzeError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-xl">
          {analyzeError}
        </div>
      )}

      {/* Search Input Bar */}
      <form onSubmit={handleAnalyze} className="flex gap-3 bg-white dark:bg-[#121215] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search product keyword or store URL..."
            className="w-full bg-transparent text-zinc-900 dark:text-white pl-11 pr-4 py-2.5 rounded-lg focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500 text-sm font-mono"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-zinc-100 dark:bg-[#18181b] text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg text-sm font-mono border border-zinc-300 dark:border-zinc-700/60 focus:outline-none"
        >
          <option value="shopee">Shopee</option>
          <option value="tokopedia">Tokopedia</option>
          <option value="amazon">Amazon</option>
          <option value="lazada">Lazada</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
        >
          {loading ? 'Processing...' : 'Run Extraction'}
        </button>
      </form>

      {/* High-Visibility KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
            <span className="font-mono uppercase text-xs font-semibold">Scraped Reviews</span>
            <Activity className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{analysis.total_reviews}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 font-semibold">
            <ArrowUpRight className="h-3.5 w-3.5" /> +12.4% vs 24h ago
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
            <span className="font-mono uppercase text-xs font-semibold">Primary Bottleneck</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 capitalize">{analysis.flaws_detected?.[0]?.aspect || 'None'}</div>
          <div className="text-xs text-zinc-500 font-mono">{analysis.flaws_detected?.[0]?.count || 0} negative mentions</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
            <span className="font-mono uppercase text-xs font-semibold">Overall CSAT</span>
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{analysis.average_csat} / 5.00</div>
          <div className="text-xs text-zinc-500 font-mono">Calculated Rating</div>
        </div>

        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
            <span className="font-mono uppercase text-xs font-semibold">Developer Auth</span>
            <Key className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400 truncate">
            {activeApiKey ? `${activeApiKey.substring(0, 12)}...` : 'Not set'}
          </div>
          <div className="text-xs text-zinc-500 font-mono">{activeApiKey ? 'X-API-KEY Active' : 'Generate a key to activate'}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aspect Flaw Data Matrix Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">Aspect Flaw Data Matrix</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Categorized buyer complaints & sentiment penalty impact</p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              <button onClick={() => setActiveSeverity('all')} className={`px-2.5 py-1 rounded-md ${activeSeverity === 'all' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : 'text-zinc-500'}`}>All</button>
              <button onClick={() => setActiveSeverity('high')} className={`px-2.5 py-1 rounded-md ${activeSeverity === 'high' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold' : 'text-zinc-500'}`}>Critical</button>
            </div>
          </div>

          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-100 dark:bg-[#18181b] text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800/80">
              <tr>
                <th className="p-3">Aspect</th>
                <th className="p-3">Count</th>
                <th className="p-3">CSAT Impact</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Observed Customer Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {filteredFlaws.map((f: any) => (
                <tr key={f.aspect} className="hover:bg-zinc-50 dark:hover:bg-[#18181b]/50">
                  <td className="p-3 font-bold text-zinc-900 dark:text-white capitalize">{f.aspect}</td>
                  <td className="p-3 text-zinc-700 dark:text-zinc-300">{f.count} mentions</td>
                  <td className="p-3 text-rose-600 dark:text-rose-400">{f.impact || '-0.30 pts'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded uppercase font-bold text-xs ${
                      f.severity === 'high' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-xs">{f.note || 'Review complaint observed.'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Feature CSAT Breakdown */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-6 space-y-5 shadow-sm">
          <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
            <h3 className="font-bold text-zinc-900 dark:text-white text-base">Feature CSAT Breakdown</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Rating score per product dimension</p>
          </div>

          <div className="space-y-4 font-mono">
            {Object.entries(analysis.feature_csat || {}).map(([aspect, score]: [string, any]) => (
              <div key={aspect} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300 capitalize font-medium">{aspect}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{score} / 5.00</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-[#18181b] h-2.5 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800/80">
                  <div
                    className="bg-emerald-500 h-full rounded transition-all duration-300"
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal API Inspector */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
            <Terminal className="h-4 w-4 text-emerald-500" />
            <span className="font-bold">Developer REST API Inspector</span>
          </div>
          <button
            onClick={copyCurl}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 bg-zinc-100 dark:bg-[#18181b] rounded-md border border-zinc-200 dark:border-zinc-700/60 font-semibold"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy Curl'}
          </button>
        </div>
        <div className="bg-zinc-900 text-emerald-400 p-4 rounded-lg font-mono text-xs border border-zinc-800 overflow-x-auto leading-relaxed">
          curl -X POST {API_BASE_URL}/review/analyze -H "X-API-KEY: {activeApiKey || '<your_api_key>'}" -H "Content-Type: application/json" -d '&#123; "keyword": "{keyword}", "platform": "{platform}" &#125;'
        </div>
      </div>
    </div>
  );
}
