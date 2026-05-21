'use client';

import { useState, useEffect } from 'react';
import { History, Star, Download, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/review/history');
      if (res.data && res.data.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.log('Error fetching history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = history.filter((item) =>
    (item.keyword || item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = 'ID,Keyword,Platform,Total Reviews,Positive,Negative,CSAT,Scanned At\n';
    const rows = history.map(h => 
      `"${h.id}","${h.keyword}","${h.platform}","${h.total_reviews}","${h.positive_count || 0}","${h.negative_count || 0}","${h.average_csat}","${h.created_at}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviewpulse_history_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 font-sans text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Scraped Analysis History</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Review and audit e-commerce products previously analyzed and cached</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={history.length === 0}
          className="bg-white dark:bg-[#18181b] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-zinc-300 dark:border-zinc-700/60 shadow-sm disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-2 shadow-sm">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by product name, keyword, or platform..."
          className="w-full bg-transparent text-zinc-900 dark:text-white pl-12 pr-4 py-2 focus:outline-none text-sm placeholder-zinc-400 dark:placeholder-zinc-500 font-mono"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-zinc-100 dark:bg-[#18181b] text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800/80">
            <tr>
              <th className="p-3.5">Product Name / Keyword</th>
              <th className="p-3.5">Platform</th>
              <th className="p-3.5">Reviews Count</th>
              <th className="p-3.5">Average CSAT</th>
              <th className="p-3.5">Primary Bottleneck</th>
              <th className="p-3.5 text-right">Date Scanned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-zinc-500">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" /> Loading history...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-zinc-500">
                  No analysis history found. Run an extraction from the Dashboard first.
                </td>
              </tr>
            ) : (
              filtered.map((h) => {
                const topFlaw = Array.isArray(h.flaws_detected) && h.flaws_detected.length > 0 
                  ? h.flaws_detected[0].aspect 
                  : (h.top_flaw || 'None');

                return (
                  <tr key={h.id} className="hover:bg-zinc-50 dark:hover:bg-[#18181b]/50">
                    <td className="p-3.5 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <History className="h-4 w-4 text-emerald-500" /> {h.product_name || h.keyword}
                    </td>
                    <td className="p-3.5 uppercase font-semibold text-emerald-600 dark:text-emerald-400">{h.platform}</td>
                    <td className="p-3.5 text-zinc-700 dark:text-zinc-300">{h.total_reviews} reviews</td>
                    <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {h.average_csat}
                    </td>
                    <td className="p-3.5 capitalize text-rose-600 dark:text-rose-400 font-semibold">{topFlaw}</td>
                    <td className="p-3.5 text-right text-zinc-500 font-mono">
                      {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
