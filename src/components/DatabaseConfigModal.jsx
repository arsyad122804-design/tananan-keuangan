import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  HelpCircle,
  Unplug
} from 'lucide-react';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA
} from '../lib/supabaseClient';

export default function DatabaseConfigModal({ isOpen, onClose, onConfigSaved, onSyncNow, dbStatus }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('CONFIG'); // 'CONFIG' | 'SQL'

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      setUrl(current.url || '');
      setAnonKey(current.anonKey || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Harap isi URL dan Anon Key terlebih dahulu.' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      alert('Harap isi URL dan Anon API Key Supabase Anda.');
      return;
    }

    setSupabaseConfig(url.trim(), anonKey.trim());
    if (onConfigSaved) onConfigSaved();
    if (onSyncNow) onSyncNow();
    onClose();
  };

  const handleDisconnect = () => {
    if (window.confirm('Putuskan koneksi Supabase dan beralih ke Database Offline (LocalStorage)?')) {
      setSupabaseConfig('', '');
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      if (onConfigSaved) onConfigSaved();
      onClose();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
              <Database className="w-5 h-5 font-bold animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Pengaturan Database Supabase</span>
                {dbStatus === 'CONNECTED' ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    🟢 Terkoneksi
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    ⚪ Mode Lokal Offline
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Sinkronisasi data otomatis antar HP & Laptop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-2">
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'CONFIG'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Koneksi Database
          </button>
          <button
            onClick={() => setActiveTab('SQL')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'SQL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Script SQL Schema</span>
            <span className="text-[9px] bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
              3 Tabel
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'CONFIG' ? (
            <>
              {/* Info Guide */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Cara Mendapatkan URL & Key Supabase:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
                  <li>
                    Buka dashboard gratis di{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Buat project baru (contoh: <em>tatanan-uang-db</em>).</li>
                  <li>Masuk ke menu <strong>Project Settings → API</strong>.</li>
                  <li>Salin <strong>Project URL</strong> dan <strong>anon/public Key</strong> ke form di bawah ini.</li>
                </ol>
              </div>

              {/* Form Input URL */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Supabase Project URL *
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              {/* Form Input Key */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Supabase anon / public API Key *
                </label>
                <textarea
                  rows="3"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
                />
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.needsSchema && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('SQL')}
                        className="text-amber-400 underline hover:text-amber-300 font-bold block pt-1"
                      >
                        Klik di sini untuk melihat & menyalin Script SQL Schema ➔
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* SQL Schema Guide */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    SQL Script untuk Dijalankan di Supabase SQL Editor:
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-emerald-500/20"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Tersalin!' : 'Salin SQL Schema'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
                  <pre className="text-[11px] font-mono text-emerald-300/90 leading-relaxed whitespace-pre">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  💡 <strong>Cara Pakai:</strong> Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda, buat query baru, lalu tempel (*paste*) script di atas dan klik <strong>Run</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          {url && anonKey ? (
            <button
              onClick={handleDisconnect}
              className="px-3.5 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Unplug className="w-3.5 h-3.5" />
              <span>Putus Koneksi (Gunakan Lokal)</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500">Mode: LocalStorage Offline</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testing || !url || !anonKey}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition"
            >
              Simpan & Sinkronkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
