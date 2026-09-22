import React from 'react';
import { X, Smartphone, Monitor, Download, CheckCircle2, QrCode, ArrowRight, Laptop } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
              📲
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Download & Install Aplikasi Tatanan Uang</h3>
              <p className="text-xs text-emerald-400">Pasang aplikasi di Laptop (Windows) dan HP (Android / iOS)</p>
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
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          
          {/* Section 1: Laptop Windows */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">1. Download & Pasang di Laptop (Windows)</h4>
                <span className="text-xs text-slate-400">Dapat dibuka langsung seperti aplikasi biasa</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 pl-1">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>
                  <strong>Ikon Aplikasi Sudah Dibuat!</strong> Periksa layar <strong>Desktop Windows</strong> Anda. Ikon <strong>"Tatanan Uang"</strong> sudah siap digunakan!
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {canPrompt && (
                  <button
                    onClick={onPWAInstall}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Aplikasi PWA Windows</span>
                  </button>
                )}

                <button
                  onClick={handleDownloadBat}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Shortcut (.bat)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: HP Android / iPhone */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">2. Download & Pasang di HP (Android / iPhone)</h4>
                <span className="text-xs text-slate-400">Muncul sebagai ikon aplikasi resmi di layar utama HP</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Android */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 block mb-1">🤖 HP Android (Chrome):</span>
                <p>1. Buka link web di browser HP Android.</p>
                <p>2. Tekan menu titik tiga <strong>(⋮)</strong> di pojok kanan atas.</p>
                <p>3. Pilih <strong>"Tambah ke Layar Utama" / "Install App"</strong>.</p>
              </div>

              {/* iPhone */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-blue-400 block mb-1">🍎 iPhone / iOS (Safari):</span>
                <p>1. Buka link web di browser Safari iPhone.</p>
                <p>2. Tekan tombol <strong>Share (Bagikan)</strong> ⎋ di bagian bawah.</p>
                <p>3. Pilih <strong>"Tambah ke Layar Utama"</strong> (Add to Home Screen).</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
