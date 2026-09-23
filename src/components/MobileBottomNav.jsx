import React from 'react';
import { List, ShoppingBag, PlusCircle, Target, TrendingUp, Download } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, onAddNew, onExportExcel, onOpenInstall, isInvestor = true }) {
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

        {/* Investasi Saham (Khusus Investor) */}
        {isInvestor && (
          <button
            onClick={() => {
              setActiveTab('INVESTASI');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              activeTab === 'INVESTASI' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Investasi</span>
          </button>
        )}

        {/* + Tambah Data (Main Action Button) */}
        <button
          onClick={onAddNew}
          className="flex flex-col items-center justify-center -mt-6 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-full w-12 h-12 p-2.5 shadow-lg shadow-emerald-500/30 hover:scale-110 active:scale-95 transition shrink-0"
          title="Tambah Data Baru"
        >
          <PlusCircle className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Layer 3: Kebutuhan Bulanan */}
        <button
          onClick={() => {
            setActiveTab('KEBUTUHAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            activeTab === 'KEBUTUHAN' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          <span>Kebutuhan</span>
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
          <Target className="w-5 h-5 text-amber-400" />
          <span>Impian</span>
        </button>
      </div>
    </div>
  );
}
