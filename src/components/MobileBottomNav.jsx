import React from 'react';
import { Home, List, PlusCircle, Target, FileSpreadsheet, Download } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, onAddNew, onExportExcel, onOpenInstall }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Layer 1: Catatan Keuangan */}
        <button
          onClick={() => {
            setActiveTab('CATATAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            activeTab === 'CATATAN' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-5 h-5 text-emerald-400" />
          <span>Catatan</span>
        </button>

        {/* Layer 2: Target Impian 🎯 */}
        <button
          onClick={() => {
            setActiveTab('IMPIAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            activeTab === 'IMPIAN' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-5 h-5 text-amber-400 animate-pulse" />
          <span>Impian</span>
        </button>

        {/* + Tambah Data (Main Action Button) */}
        <button
          onClick={onAddNew}
          className="flex flex-col items-center justify-center -mt-6 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-full w-13 h-13 p-3 shadow-lg shadow-emerald-500/30 hover:scale-110 active:scale-95 transition"
          title="Tambah Catatan Baru"
        >
          <PlusCircle className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Ekspor Excel */}
        <button
          onClick={onExportExcel}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 text-[10px] font-medium transition"
        >
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <span>Excel</span>
        </button>

        {/* Install App */}
        <button
          onClick={onOpenInstall}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-teal-400 text-[10px] font-medium transition"
        >
          <Download className="w-5 h-5 text-teal-400" />
          <span>Install</span>
        </button>
      </div>
    </div>
  );
}
