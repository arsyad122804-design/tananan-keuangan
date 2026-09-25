import React from 'react';
import { List, ShoppingBag, Target, TrendingUp, CreditCard } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, isInvestor = true }) {
  const tabs = [
    {
      id: 'CATATAN',
      label: 'Catatan',
      icon: List,
      activeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40 shadow-emerald-500/10'
    },
    ...(isInvestor
      ? [
          {
            id: 'INVESTASI',
            label: 'Saham',
            icon: TrendingUp,
            activeColor: 'text-blue-300 bg-blue-500/15 border-blue-500/40 shadow-blue-500/10'
          }
        ]
      : []),
    {
      id: 'KEBUTUHAN',
      label: 'Kebutuhan',
      icon: ShoppingBag,
      activeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40 shadow-cyan-500/10'
    },
    {
      id: 'IMPIAN',
      label: 'Impian',
      icon: Target,
      activeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/40 shadow-amber-500/10'
    },
    {
      id: 'UTANG',
      label: 'Utang',
      icon: CreditCard,
      activeColor: 'text-rose-300 bg-rose-500/15 border-rose-500/40 shadow-rose-500/10'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-2 shadow-2xl">
      <div className={`grid ${tabs.length === 5 ? 'grid-cols-5' : 'grid-cols-4'} gap-1.5 max-w-lg mx-auto`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-[10px] transition-all duration-200 border ${
                isActive
                  ? `${tab.activeColor} font-black shadow-md`
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40 active:scale-95'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="truncate tracking-tight font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
