import React from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, PieChart, Target, Coins } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function StatCards({ summary }) {
  const netStockProfit = summary.totalProfitSaham - summary.totalLossSaham;
  const netCashflow = summary.totalPemasukan - summary.totalPengeluaran;
  const dreamSaved = summary.totalDreamTerkumpul || 0;
  const dreamTarget = summary.totalDreamTarget || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* 1. Total Duit yang Dibawa */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Duit Dibawa (Cash)</span>
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-white tracking-tight font-mono">
            {formatRupiah(summary.duitDibawa)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Uang tunai / Saldo aktif</p>
        </div>
      </div>

      {/* 2. Duit di Saham */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Duit di Saham</span>
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-blue-400 tracking-tight font-mono">
            {formatRupiah(summary.duitSaham)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Modal / Portofolio pasar saham</p>
        </div>
      </div>

      {/* 3. Total Kekayaan */}
      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500 transition-all bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30">
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Total Aset Kekayaan</span>
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-extrabold text-emerald-300 tracking-tight font-mono">
            {formatRupiah(summary.totalKekayaan)}
          </h3>
          <p className="text-xs text-emerald-400/80 mt-1 font-medium">(Cash + Duit di Saham)</p>
        </div>
      </div>

      {/* 4. Net Profit/Loss Saham */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Performa Saham (Net)</span>
          <div className={`p-2.5 rounded-xl ${netStockProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {netStockProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-3">
          <h3 className={`text-2xl font-bold tracking-tight font-mono ${netStockProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netStockProfit >= 0 ? '+' : ''}{formatRupiah(netStockProfit)}
          </h3>
          <div className="flex items-center gap-2 text-[11px] mt-1 text-slate-400 font-mono">
            <span className="text-emerald-400">Gain: +{formatRupiah(summary.totalProfitSaham)}</span>
            <span className="text-red-400">Loss: -{formatRupiah(summary.totalLossSaham)}</span>
          </div>
        </div>
      </div>

      {/* 5. Total Pemasukan */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pemasukan</span>
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatRupiah(summary.totalPemasukan)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Akumulasi uang masuk</p>
        </div>
      </div>

      {/* 6. Total Pengeluaran */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pengeluaran</span>
          <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-red-400 tracking-tight font-mono">
            {formatRupiah(summary.totalPengeluaran)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Akumulasi uang keluar</p>
        </div>
      </div>

      {/* 7. Total Terkumpul Impian */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500 transition-all bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20">
        <div className="flex items-center justify-between">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Total Terkumpul Impian</span>
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-amber-300 tracking-tight font-mono">
            {formatRupiah(dreamSaved)}
          </h3>
          <p className="text-xs text-amber-400/80 mt-1">
            Dari Target: {formatRupiah(dreamTarget)}
          </p>
        </div>
      </div>

      {/* 8. Saldo Arus Kas Bersih (Net Cashflow) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Net Cashflow Arus Kas</span>
          <div className={`p-2.5 rounded-xl ${netCashflow >= 0 ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className={`text-2xl font-bold tracking-tight font-mono ${netCashflow >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
            {netCashflow >= 0 ? '+' : ''}{formatRupiah(netCashflow)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">(Pemasukan - Pengeluaran)</p>
        </div>
      </div>
    </div>
  );
}
