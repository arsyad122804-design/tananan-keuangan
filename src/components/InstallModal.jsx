import React from 'react';
import { X, Smartphone, Monitor, Download, CheckCircle2, QrCode, ArrowRight, Laptop, Sparkles } from 'lucide-react';

export default function InstallModal({ isOpen, onClose, onPWAInstall, canPrompt }) {
  if (!isOpen) return null;

  const handleDownloadBat = () => {
    const element = document.createElement("a");
    const batContent = `@echo off\ntitle Tatanan Uang\nstart http://localhost:3000\nexit`;
    const file = new Blob([batContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "Buka_Tatanan_Uang.bat";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/25 shrink-0">
              📲
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Download & Pasang Aplikasi</h3>
              <p className="text-xs text-emerald-400 font-medium">Bisa langsung dipakai di HP (Android & iPhone) serta Laptop!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-200">
          
          {/* Main 1-Click Install Button Banner */}
          <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-900 border border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <strong className="text-white text-sm font-extrabold">Pasang Cepat ke Layar HP</strong>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Aplikasi langsung terpasang di HP tanpa perlu buka browser lagi!
              </p>
            </div>

            <button
              onClick={() => {
                onPWAInstall();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Pasang Sekarang (Install)</span>
            </button>
          </div>

          {/* Section 1: HP Android & iPhone Guide */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">📱 Petunjuk Pasang di HP (Android & iPhone)</h4>
                <span className="text-xs text-slate-400">Ikuti 3 langkah mudah berikut sesuai HP Anda:</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Android */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <span>🤖</span> Android (Google Chrome):
                </span>
                <ol className="space-y-1.5 text-slate-300 pl-1 list-decimal list-inside leading-relaxed">
                  <li>Buka website ini di <strong>Google Chrome</strong> HP.</li>
                  <li>Tekan menu titik tiga <strong>(⋮)</strong> di pojok kanan atas Chrome.</li>
                  <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</li>
                  <li>Tekan <strong>Install / Tambah</strong>. Selesai! Ikon langsung ada di layar HP.</li>
                </ol>
              </div>

              {/* iPhone */}
              <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-xl space-y-2">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 text-sm">
                  <span>🍎</span> iPhone (Safari):
                </span>
                <ol className="space-y-1.5 text-slate-300 pl-1 list-decimal list-inside leading-relaxed">
                  <li>Buka website ini di browser <strong>Safari</strong> iPhone.</li>
                  <li>Tekan tombol <strong>Bagikan / Share</strong> (ikon kotak tanda panah ke atas di bawah).</li>
                  <li>Geser ke bawah lalu pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).</li>
                  <li>Tekan <strong>Add</strong> di pojok kanan atas. Selesai!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 2: Laptop Windows */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">💻 Pasang di Laptop (Komputer / Windows)</h4>
                <span className="text-xs text-slate-400">Untuk akses cepat langsung dari desktop laptop</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={onPWAInstall}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Install Aplikasi PWA</span>
              </button>

              <button
                onClick={handleDownloadBat}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Download Shortcut .bat</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            ✨ Bebas kuota & otomatis offline setelah dipasang
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
