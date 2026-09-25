import React from 'react';
import { List, ShoppingBag, PlusCircle, Target, TrendingUp, CreditCard } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, onAddNew, isInvestor = true }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-1.5 py-2 shadow-2xl">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Layer 1: Catatan Keuangan */}
        <button
          onClick={() => {
            setActiveTab('CATATAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold transition ${
            activeTab === 'CATATAN' ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'CATATAN' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="truncate">Catatan</span>
        </button>

        {/* Investasi Saham (Khusus Investor) */}
        {isInvestor && (
          <button
            onClick={() => {
              setActiveTab('INVESTASI');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex-1 flex flex-col items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold transition ${
              activeTab === 'INVESTASI' ? 'text-blue-400 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'INVESTASI' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span className="truncate">Saham</span>
          </button>
        )}

        {/* Layer 3: Kebutuhan Bulanan */}
        <button
          onClick={() => {
            setActiveTab('KEBUTUHAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold transition ${
            activeTab === 'KEBUTUHAN' ? 'text-cyan-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'KEBUTUHAN' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="truncate">Kebutuhan</span>
        </button>

        {/* + Tambah Data (Main Action Button) */}
        <button
          onClick={onAddNew}
          className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-full w-11 h-11 sm:w-12 sm:h-12 p-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition shrink-0 mx-0.5"
          title="Tambah Catatan Baru"
        >
          <PlusCircle className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Layer 2: Target Impian 🎯 */}
        <button
          onClick={() => {
            setActiveTab('IMPIAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold transition ${
            activeTab === 'IMPIAN' ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'IMPIAN' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="truncate">Impian</span>
        </button>

        {/* Layer 4: Pelunasan Utang 💳 */}
        <button
          onClick={() => {
            setActiveTab('UTANG');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center gap-0.5 text-[9px] sm:text-[10px] font-semibold transition ${
            activeTab === 'UTANG' ? 'text-rose-400 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'UTANG' ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="truncate">Utang</span>
        </button>
      </div>
    </div>
  );
}
