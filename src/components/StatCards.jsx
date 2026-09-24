import React from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, PieChart, Target, Coins } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function StatCards({ summary, isInvestor = true }) {
  const netStockProfit = summary.totalProfitSaham - summary.totalLossSaham;
  const netCashflow = summary.totalPemasukan - summary.totalPengeluaran;
  const dreamSaved = summary.totalDreamTerkumpul || 0;
  const dreamTarget = summary.totalDreamTarget || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-4 sm:my-6">
      {/* 1. Total Kekayaan (HERO CARD - Span 2 Columns on Mobile) */}
      <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden group hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <span>💎</span> Total Aset Kekayaan
          </span>
          <div className="p-2 sm:p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-300 tracking-tight font-mono">
            {formatRupiah(isInvestor ? summary.totalKekayaan : summary.duitDibawa)}
          </h3>
          <p className="text-[11px] sm:text-xs text-emerald-400/80 mt-0.5 font-medium">
            {isInvestor ? '(Cash + Portofolio)' : '(Total Saldo Kas)'}
          </p>
        </div>
      </div>

      {/* 2. Total Duit yang Dibawa (Cash) */}
      <div className="col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Cash / Duit Dibawa</span>
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-base sm:text-2xl font-bold text-white tracking-tight font-mono">
            {formatRupiah(summary.duitDibawa)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Uang tunai / Saldo</p>
        </div>
      </div>

      {/* 3. Portofolio (Hanya untuk Investor) */}
      {isInvestor && (
        <div className="col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Portofolio</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-base sm:text-2xl font-bold text-blue-400 tracking-tight font-mono">
              {formatRupiah(summary.duitSaham)}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Saldo Portofolio Saham</p>

            {/* Breakdown Rincian: Total Beli & Profit */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1 text-[10px] sm:text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Beli:</span>
                <span className="text-blue-300 font-bold">
                  {formatRupiah(summary.totalInvestedModal || 0)}
                  {summary.activeHoldingCount > 0 && (
                    <span className="text-[9px] text-slate-400 font-normal ml-1">({summary.activeHoldingCount} saham)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Profit/Loss:</span>
                <span className={`font-bold ${netStockProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netStockProfit >= 0 ? '+' : ''}{formatRupiah(netStockProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Net Profit/Loss Saham (Hanya untuk Investor) */}
      {isInvestor && (
        <div className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Performa Saham (Net)</span>
            <div className={`p-2 rounded-xl ${netStockProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {netStockProfit >= 0 ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className={`text-base sm:text-2xl font-bold tracking-tight font-mono ${netStockProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netStockProfit >= 0 ? '+' : ''}{formatRupiah(netStockProfit)}
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] mt-0.5 text-slate-400 font-mono">
              <span className="text-emerald-400">Gain: +{formatRupiah(summary.totalProfitSaham)}</span>
              <span className="text-red-400">Loss: -{formatRupiah(summary.totalLossSaham)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Total Pemasukan */}
      <div className="col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Pemasukan</span>
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-base sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatRupiah(summary.totalPemasukan)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Total uang masuk</p>
        </div>
      </div>

      {/* 6. Total Pengeluaran */}
      <div className="col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Pengeluaran</span>
          <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
            <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-base sm:text-2xl font-bold text-red-400 tracking-tight font-mono">
            {formatRupiah(summary.totalPengeluaran)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Total uang keluar</p>
        </div>
      </div>

      {/* 7. Total Terkumpul Impian */}
      <div className="col-span-1 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden group hover:border-amber-500 transition-all bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20">
        <div className="flex items-center justify-between">
          <span className="text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Impian</span>
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-base sm:text-2xl font-bold text-amber-300 tracking-tight font-mono">
            {formatRupiah(dreamSaved)}
          </h3>
          <p className="text-[10px] sm:text-xs text-amber-400/80 mt-0.5">
            Target: {formatRupiah(dreamTarget)}
          </p>
        </div>
      </div>

      {/* 8. Saldo Arus Kas Bersih (Net Cashflow) */}
      <div className="col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Net Cashflow</span>
          <div className={`p-2 rounded-xl ${netCashflow >= 0 ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
            <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <h3 className={`text-base sm:text-2xl font-bold tracking-tight font-mono ${netCashflow >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
            {netCashflow >= 0 ? '+' : ''}{formatRupiah(netCashflow)}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Masuk - Keluar</p>
        </div>
      </div>
    </div>
  );
}
