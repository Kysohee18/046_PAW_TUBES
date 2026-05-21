'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, ShieldCheck, Trash2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/api-keys');
      if (res.data && res.data.apiKeys) {
        setKeys(res.data.apiKeys);
      }
    } catch (err) {
      console.log('Error fetching keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/user/api-keys', { name: keyName || 'Production Store Key' });
      if (res.data && res.data.apiKey) {
        setNewlyCreatedKey(res.data.apiKey.key);
        setKeyName('');
        fetchKeys();
      }
    } catch (err) {
      alert('Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId: number) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access.')) return;
    try {
      await api.delete(`/user/api-keys/${keyId}`);
      fetchKeys();
    } catch (err) {
      alert('Failed to revoke key');
    }
  };

  const handleCopy = (id: number, keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 font-sans text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Developer Tokens</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage your X-API-KEY credentials for ReviewPulse REST API</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setNewlyCreatedKey(null); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Generate New API Key
        </button>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
        <span>Pass header <code className="bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded font-mono text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-zinc-800">X-API-KEY: rp_...</code> in your HTTP requests to analyze product reviews.</span>
      </div>

      {/* Modal Generate Key */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create Developer API Key</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Give your token a descriptive name to track its usage.</p>
            
            {newlyCreatedKey ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Your New API Key:</span>
                  <div className="font-mono text-xs text-zinc-900 dark:text-white break-all select-all font-bold">{newlyCreatedKey}</div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(newlyCreatedKey); setShowModal(false); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs"
                >
                  Copy Key & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4">
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Shopee Sync Service"
                  className="w-full bg-zinc-100 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/60 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs"
                  >
                    {generating ? 'Generating...' : 'Confirm Generate'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-zinc-100 dark:bg-[#18181b] text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800/80">
            <tr>
              <th className="p-3.5">Key Name</th>
              <th className="p-3.5">Prefix</th>
              <th className="p-3.5">Quota Usage</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-zinc-500">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2" /> Loading keys...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-zinc-500">
                  No API keys found. Click "Generate New API Key" above.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="hover:bg-zinc-50 dark:hover:bg-[#18181b]/50">
                  <td className="p-3.5 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-emerald-500" /> {k.name}
                  </td>
                  <td className="p-3.5 text-zinc-500">{k.key_prefix}...</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-700 dark:text-zinc-300">{k.usage_count || 0} / {k.usage_limit}</span>
                      <div className="w-20 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, ((k.usage_count || 0) / k.usage_limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      k.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {k.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {k.key && (
                      <button
                        onClick={() => handleCopy(k.id, k.key)}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700/60 inline-flex items-center gap-1 text-xs"
                      >
                        {copiedId === k.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copiedId === k.id ? 'Copied' : 'Copy'}
                      </button>
                    )}
                    {k.is_active && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded border border-rose-500/20 inline-flex items-center gap-1 text-xs"
                      >
                        <Trash2 className="h-3 w-3" /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
