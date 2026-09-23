import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  DollarSign,
  PieChart,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatRupiah, formatDateFull, formatHumanRupiah } from '../utils/formatters';

export default function InvestmentTracker({
  investments = [],
  duitSaham = 0,
  onAddNew,
  onEdit,
  onRealize,
  onDelete
}) {
  const [activeSubTab, setActiveSubTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'
  const [searchTerm, setSearchTerm] = useState('');

  const activeHoldings = investments.filter((i) => i.status !== 'CLOSED');
  const closedTrades = investments.filter((i) => i.status === 'CLOSED');

  // Summary calculations
  const totalActiveModal = activeHoldings.reduce((sum, i) => sum + (Number(i.modalInvestasi) || 0), 0);
  
  const totalClosedModal = closedTrades.reduce((sum, i) => sum + (Number(i.modalInvestasi) || 0), 0);
  const totalClosedKembali = closedTrades.reduce((sum, i) => sum + (Number(i.totalKembali) || 0), 0);
  
  const totalProfitRealized = closedTrades
    .filter((i) => i.profitLossType === 'PROFIT')
    .reduce((sum, i) => sum + (Number(i.nominalProfitLoss) || 0), 0);
    
  const totalLossRealized = closedTrades
    .filter((i) => i.profitLossType === 'LOSS')
    .reduce((sum, i) => sum + (Number(i.nominalProfitLoss) || 0), 0);

  const netRealizedPnl = totalProfitRealized - totalLossRealized;

  const currentList = activeSubTab === 'ACTIVE' ? activeHoldings : closedTrades;
  const filteredList = currentList.filter((item) =>
    (item.namaSaham || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 my-6">
      {/* 1. Header & Summary Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-blue-500/20 shrink-0">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Portofolio & Saham yang Diinvestasikan</span>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30 font-mono">
                  {activeHoldings.length} Aktif
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Catat emiten yang dibeli, dan kalkulasi profit/loss otomatis kembali ke Duit di Saham
              </p>
            </div>
          </div>

          <button
            onClick={onAddNew}
            className="w-full md:w-auto px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Beli / Catat Saham Baru</span>
          </button>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          {/* Active Modal */}
          <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-blue-300">
                📊 Sedang Diinvestasikan (Holding)
              </span>
              <span className="text-blue-400 font-bold">{activeHoldings.length} Saham</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
              {formatRupiah(totalActiveModal)}
            </h3>
            <p className="text-[10px] text-slate-400">Modal aktif di pasar saham saat ini</p>
          </div>

          {/* Realized Returns */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                💰 Total Realisasi Dijual
              </span>
              <span className="text-slate-400 font-bold">{closedTrades.length} Selesai</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatRupiah(totalClosedKembali)}
            </h3>
            <p className="text-[10px] text-slate-400">Uang yang sudah cair kembali ke Duit di Saham</p>
          </div>

          {/* Net PnL Realized */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                📈 Net Profit / Loss Realisasi
              </span>
              <span className={`text-[10px] font-bold ${netRealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netRealizedPnl >= 0 ? 'Gain Net' : 'Loss Net'}
              </span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-black font-mono ${netRealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netRealizedPnl >= 0 ? '+' : ''}{formatRupiah(netRealizedPnl)}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="text-emerald-400">Gain: +{formatRupiah(totalProfitRealized)}</span>
              <span className="text-red-400">Loss: -{formatRupiah(totalLossRealized)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Sub Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Sub Tabs Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('ACTIVE')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'ACTIVE'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Saham Aktif / Holding ({activeHoldings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('HISTORY')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'HISTORY'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Riwayat Realisasi / Dijual ({closedTrades.length})</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode saham (cth: BBCA)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 3. Items List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto text-xl">
            📈
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {activeSubTab === 'ACTIVE' ? 'Belum Ada Saham yang Sedang Diinvestasikan' : 'Belum Ada Riwayat Penjualan Saham'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {activeSubTab === 'ACTIVE'
                ? 'Klik tombol "+ Beli / Catat Saham Baru" di atas untuk mulai mencatat modal saham Anda.'
                : 'Ketika Anda merealisasikan/menjual saham aktif, riwayatnya akan tersimpan rapi di sini.'}
            </p>
          </div>
          {activeSubTab === 'ACTIVE' && (
            <button
              onClick={onAddNew}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Saham Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isClosed = item.status === 'CLOSED';
            const isProfit = item.profitLossType === 'PROFIT';
            const modal = Number(item.modalInvestasi) || 0;
            const pnl = Number(item.nominalProfitLoss) || 0;
            const kembali = Number(item.totalKembali) || modal;

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden space-y-4 hover:border-slate-700 transition"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-md ${
                      isClosed
                        ? isProfit
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {item.namaSaham.substring(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white tracking-wider font-mono">
                          {item.namaSaham}
                        </h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          isClosed
                            ? isProfit
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                        }`}>
                          {isClosed ? (isProfit ? '📈 Dijual Untung' : '📉 Cut Loss') : '⏳ Sedang Berjalan'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                        Beli: {formatDateFull(item.tanggalBeli)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                      title="Edit Saham"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metrics Details */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Modal Beli</span>
                    <span className="text-sm font-bold text-white font-mono block">
                      {formatRupiah(modal)}
                    </span>
                  </div>

                  {isClosed ? (
                    <div className={`p-3 rounded-xl border space-y-0.5 ${
                      isProfit ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-red-950/40 border-red-500/30'
                    }`}>
                      <span className={`text-[10px] uppercase font-semibold block ${
                        isProfit ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isProfit ? 'Profit (Untung)' : 'Loss (Rugi)'}
                      </span>
                      <span className={`text-sm font-bold font-mono block ${
                        isProfit ? 'text-emerald-300' : 'text-red-300'
                      }`}>
                        {isProfit ? '+' : '-'}{formatRupiah(pnl)}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-500/20 space-y-0.5">
                      <span className="text-[10px] text-blue-300 uppercase font-semibold block">Status</span>
                      <span className="text-xs font-bold text-blue-400 block">
                        Sedang Diinvestasikan
                      </span>
                    </div>
                  )}
                </div>

                {/* Note */}
                {item.keterangan && (
                  <p className="text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/80 italic">
                    "{item.keterangan}"
                  </p>
                )}

                {/* Action / Return Box */}
                {isClosed ? (
                  <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Uang Kembali ke Duit di Saham:</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        {formatRupiah(kembali)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Jual: {formatDateFull(item.tanggalJual)}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => onRealize(item)}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <span>⚡ Jual / Realisasikan Saham (Untung/Rugi)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
