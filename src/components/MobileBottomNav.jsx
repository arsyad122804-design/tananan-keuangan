import React from 'react';
import { List, ShoppingBag, Target, TrendingUp, CreditCard } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, isInvestor = true }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-2 py-2 shadow-2xl">
      <div className={`grid ${isInvestor ? 'grid-cols-5' : 'grid-cols-4'} gap-1 max-w-lg mx-auto`}>
        {/* Layer 1: Catatan Keuangan */}
        <button
          onClick={() => {
            setActiveTab('CATATAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'CATATAN'
              ? 'text-emerald-400 font-bold bg-emerald-500/10 shadow-sm'
              : 'text-slate-400 hover:text-white active:scale-95'
          }`}
        >
          <List className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${activeTab === 'CATATAN' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="truncate">Catatan</span>
        </button>

        {/* Investasi Saham (Khusus Investor) */}
        {isInvestor && (
          <button
            onClick={() => {
              setActiveTab('INVESTASI');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
              activeTab === 'INVESTASI'
                ? 'text-blue-400 font-bold bg-blue-500/10 shadow-sm'
                : 'text-slate-400 hover:text-white active:scale-95'
            }`}
          >
            <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${activeTab === 'INVESTASI' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span className="truncate">Saham</span>
          </button>
        )}

        {/* Layer 3: Kebutuhan Bulanan */}
        <button
          onClick={() => {
            setActiveTab('KEBUTUHAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'KEBUTUHAN'
              ? 'text-cyan-400 font-bold bg-cyan-500/10 shadow-sm'
              : 'text-slate-400 hover:text-white active:scale-95'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${activeTab === 'KEBUTUHAN' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="truncate">Kebutuhan</span>
        </button>

        {/* Layer 2: Target Impian 🎯 */}
        <button
          onClick={() => {
            setActiveTab('IMPIAN');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'IMPIAN'
              ? 'text-amber-400 font-bold bg-amber-500/10 shadow-sm'
              : 'text-slate-400 hover:text-white active:scale-95'
          }`}
        >
          <Target className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${activeTab === 'IMPIAN' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="truncate">Impian</span>
        </button>

        {/* Layer 4: Pelunasan Utang 💳 */}
        <button
          onClick={() => {
            setActiveTab('UTANG');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'UTANG'
              ? 'text-rose-400 font-bold bg-rose-500/10 shadow-sm'
              : 'text-slate-400 hover:text-white active:scale-95'
          }`}
        >
          <CreditCard className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${activeTab === 'UTANG' ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="truncate">Utang</span>
        </button>
      </div>
    </div>
  );
}
