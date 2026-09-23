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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
              📲
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Cara Pasang Aplikasi di HP & Laptop</h3>
              <p className="text-xs text-emerald-400">Mudah, cepat, & tanpa perlu download file APK ribet!</p>
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
          
          {/* NOTICE FOR MOBILE */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">Catatan untuk Pengguna HP:</strong>
              Aplikasi ini adalah <strong>Web App Resmi (PWA)</strong>. Anda <u>tidak perlu membuka file unduhan</u> di File Manager. Cukup ikuti cara pasang langsung ke layar HP di bawah ini!
            </div>
          </div>

          {/* Section 1: HP Android & iPhone */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">📱 Pasang di HP (Android & iPhone)</h4>
                  <span className="text-xs text-slate-400">Ikon aplikasi langsung muncul di layar utama HP Anda</span>
                </div>
              </div>

              {canPrompt && (
                <button
                  onClick={() => {
                    onPWAInstall();
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang ke Layar HP Sekarang</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Android */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <span>🤖</span> Android (Google Chrome):
                </span>
                <ol className="space-y-1.5 text-slate-300 pl-1 list-decimal list-inside">
                  <li>Buka website ini di <strong>Google Chrome</strong> HP.</li>
                  <li>Tekan menu titik tiga <strong>(⋮)</strong> di pojok kanan atas Chrome.</li>
                  <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</li>
                  <li>Tekan <strong>Install / Tambah</strong>. Selesai!</li>
                </ol>
              </div>

              {/* iPhone */}
              <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-xl space-y-2">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 text-sm">
                  <span>🍎</span> iPhone (Safari):
                </span>
                <ol className="space-y-1.5 text-slate-300 pl-1 list-decimal list-inside">
                  <li>Buka website ini di browser <strong>Safari</strong> iPhone.</li>
                  <li>Tekan tombol <strong>Bagikan / Share</strong> (ikon kotak tanda panah ke atas di bawah).</li>
                  <li>Geser ke bawah lalu pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).</li>
                  <li>Tekan <strong>Add</strong> di pojok kanan atas. Selesai!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 2: Laptop Windows */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-300 text-sm">💻 Pasang di Laptop (Khusus Komputer / Windows)</h4>
                <span className="text-xs text-slate-400">File pintasan desktop untuk pengguna Laptop / PC</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {canPrompt && (
                <button
                  onClick={onPWAInstall}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Install Aplikasi PWA Windows</span>
                </button>
              )}

              <button
                onClick={handleDownloadBat}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Download Shortcut .bat (Laptop Windows)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
