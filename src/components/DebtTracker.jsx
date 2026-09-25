import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Wallet,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertCircle,
  TrendingDown,
  ShieldCheck,
  CheckCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { formatRupiah, formatHumanRupiah, formatDateFull } from '../utils/formatters';

export default function DebtTracker({
  debts = [],
  totalKekayaan = 0,
  currentDuitDibawa = 0,
  currentDuitSaham = 0,
  completedDreamsTarget = 0,
  totalKebutuhanTerbayar = 0,
  onAddNew,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onPayOffDebt,
  onPayAllAffordableDebts
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'READY' | 'UNREADY'
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Calculations of Wealth & Available Pool
  const totalKekayaanVal = Number(totalKekayaan) || 0;
  // Available asset wealth after paid monthly needs & completed dreams
  const sisaDanaBersih = Math.max(0, totalKekayaanVal - Number(totalKebutuhanTerbayar || 0) - Number(completedDreamsTarget || 0));

  let activeWealthPool = sisaDanaBersih;

  // Process waterfall allocation for debts
  const processedDebts = debts.map((item, index) => {
    const nominal = Number(item.nominalUtang) || 0;
    const allocated = Math.min(activeWealthPool, nominal);
    activeWealthPool = Math.max(0, activeWealthPool - allocated);
    const percentage = nominal > 0 ? Math.min(100, Math.round((allocated / nominal) * 100)) : 0;
    const isReady = percentage >= 100 || allocated >= nominal;
    const remaining = Math.max(0, nominal - allocated);

    return {
      ...item,
      originalIndex: index,
      allocated,
      percentage,
      isReady,
      remaining
    };
  });

  const totalNominalUtang = debts.reduce((sum, d) => sum + (Number(d.nominalUtang) || 0), 0);
  const readyDebts = processedDebts.filter((d) => d.isReady);
  const unreadyDebts = processedDebts.filter((d) => !d.isReady);

  const totalTeralokasiUtang = processedDebts.reduce((sum, d) => sum + d.allocated, 0);
  const totalKekuranganUtang = Math.max(0, totalNominalUtang - totalTeralokasiUtang);

  // Filtered items
  const filtered = processedDebts.filter((item) => {
    if (filter === 'READY' && !item.isReady) return false;
    if (filter === 'UNREADY' && item.isReady) return false;
    if (searchTerm.trim()) {
      const matchName = item.namaUtang?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKet = item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchKet;
    }
    return true;
  });

  return (
    <div id="debt-section" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden my-6 p-4 sm:p-6">
      {/* 1. Dynamic Wealth Banner Info */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-950 to-red-950/40 border border-rose-500/30 rounded-xl p-4 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
            <Wallet className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Dana Aset Kekayaan Tersedia (Untuk Pelunasan Utang)
            </span>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-rose-400 font-mono">
                {formatRupiah(sisaDanaBersih)}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800">
                Total Aset: <strong className="text-emerald-300">{formatRupiah(totalKekayaanVal)}</strong>
                {totalKebutuhanTerbayar > 0 && <span className="text-cyan-300 ml-1">(-{formatRupiah(totalKebutuhanTerbayar)} Kebutuhan)</span>}
                {completedDreamsTarget > 0 && <span className="text-amber-400 ml-1">(-{formatRupiah(completedDreamsTarget)} Impian)</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-300 bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800 max-w-lg leading-relaxed">
          💡 Setiap utang yang diceklis (<strong>Ceklis Lunas</strong>) otomatis memotong <strong>Saldo Aset Kekayaan</strong> dan pos utang tersebut langsung terhapus dari daftar.
        </div>
      </div>

      {/* 2. Header Title & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4 text-rose-400" />
              <span>Manajemen & Pelunasan Kewajiban</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex flex-wrap items-center gap-2">
              <span>Daftar Pelunasan Utang</span>
              <span className="text-xs bg-rose-500/15 text-rose-300 font-bold px-2.5 py-0.5 rounded-full border border-rose-500/30 whitespace-nowrap shrink-0 inline-flex items-center font-mono">
                ⚡ {readyDebts.length}/{debts.length} Siap Lunas (100%)
              </span>
            </h2>
          </div>

          {/* Add Debt Button for Mobile Header */}
          <button
            onClick={onAddNew}
            className="md:hidden px-3.5 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-slate-950 font-black rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quick Action: Pay All Affordable Debts */}
          {readyDebts.length > 1 && onPayAllAffordableDebts && (
            <button
              onClick={onPayAllAffordableDebts}
              className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
              <CheckCheck className="w-4 h-4 stroke-[3]" />
              <span>Lunasi Semua ({readyDebts.length} Utang)</span>
            </button>
          )}

          {/* Add Debt Button for Desktop */}
          <button
            onClick={onAddNew}
            className="hidden md:flex px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-slate-950 font-black rounded-xl shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Utang Baru</span>
          </button>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total Kewajiban Utang</span>
          <span className="text-xl font-bold text-rose-400 font-mono">{formatRupiah(totalNominalUtang)}</span>
          <span className="text-[10px] text-slate-500 mt-1 block">{debts.length} Pos Utang Terdaftar</span>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-emerald-950/20">
          <span className="text-[11px] text-emerald-300 font-bold uppercase block">Dana Aset Siap Melunasi</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{formatRupiah(totalTeralokasiUtang)}</span>
          <span className="text-[10px] text-emerald-300/80 mt-1 block font-medium">{readyDebts.length} Utang Siap Lunas 100% ✅</span>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-amber-950/20">
          <span className="text-[11px] text-amber-300 font-bold uppercase block">Kekurangan Dana Pelunasan</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{formatRupiah(totalKekuranganUtang)}</span>
          <span className="text-[10px] text-amber-300/80 mt-1 block font-medium">{unreadyDebts.length} Pos Menunggu Tambahan Aset</span>
        </div>

        <div className="bg-slate-950/80 border border-blue-500/30 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-blue-950/20">
          <span className="text-[11px] text-blue-300 font-bold uppercase block">Sisa Dana Aset Bersih</span>
          <span className="text-xl font-bold text-blue-400 font-mono">{formatRupiah(sisaDanaBersih)}</span>
          <span className="text-[10px] text-blue-300/80 mt-1 block font-medium">Kekayaan Aktif Saat Ini</span>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`whitespace-nowrap py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              filter === 'ALL'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <span>Semua</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                filter === 'ALL' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {debts.length}
            </span>
          </button>
          <button
            onClick={() => setFilter('READY')}
            className={`whitespace-nowrap py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              filter === 'READY'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <span>Siap Lunas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                filter === 'READY' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {readyDebts.length}
            </span>
          </button>
          <button
            onClick={() => setFilter('UNREADY')}
            className={`whitespace-nowrap py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              filter === 'UNREADY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <span>Kurang Dana</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                filter === 'UNREADY' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {unreadyDebts.length}
            </span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Cari utang, cicilan, pinjaman..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition sm:w-64"
        />
      </div>

      {/* 5. Debts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">Belum ada daftar utang pada filter ini.</p>
            <button
              onClick={onAddNew}
              className="mt-3 text-xs text-rose-400 hover:underline font-semibold"
            >
              Catat Utang Baru Sekarang
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const nominal = Number(item.nominalUtang) || 0;
            const isReady = item.isReady;
            const allocated = item.allocated;
            const percentage = item.percentage;
            const remaining = item.remaining;

            return (
              <div
                key={item.id}
                className={`border rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between ${
                  isReady
                    ? 'border-emerald-500/60 bg-slate-950/90 shadow-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/90 hover:border-rose-500/40 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* 1. Header Row: Checkbox + Title on Left, Action Toolbar on Right */}
                  <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Checkbox Button */}
                      <button
                        onClick={() => {
                          if (isReady) {
                            onPayOffDebt(item);
                          }
                        }}
                        disabled={!isReady}
                        className={`p-2 rounded-xl transition shrink-0 flex items-center justify-center ${
                          isReady
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30 animate-bounce cursor-pointer'
                            : 'bg-slate-900 border border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                        }`}
                        title={
                          isReady
                            ? '🎉 Dana 100% Cukup! Klik Ceklis untuk Melunasi & Menghapus Utang ini'
                            : `🔒 Dana belum mencukupi (Kurang ${formatRupiah(remaining)}). Ceklis aktif saat dana aset mencapai 100%.`
                        }
                      >
                        {isReady ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Title */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-base sm:text-lg font-extrabold truncate leading-tight tracking-wide text-white"
                          title={item.namaUtang}
                        >
                          {item.namaUtang}
                        </h3>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 rounded-xl p-1 shrink-0">
                      {onMoveUp && onMoveDown && (
                        <>
                          <button
                            onClick={() => onMoveUp(item.originalIndex)}
                            disabled={item.originalIndex === 0}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 transition"
                            title="Naikkan Prioritas"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onMoveDown(item.originalIndex)}
                            disabled={item.originalIndex === debts.length - 1}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 transition"
                            title="Turunkan Prioritas"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-[1px] h-3.5 bg-slate-800 mx-0.5" />
                        </>
                      )}

                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Utang"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Hapus Utang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Sub-Row: Badges (Status, Tanggal) */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 mb-3">
                    {/* Status Pill Badge */}
                    {isReady ? (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>DANA 100% SIAP LUNAS!</span>
                      </span>
                    ) : (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dana Belum Cukup ({percentage}%)</span>
                      </span>
                    )}

                    {/* Due Date Pill Badge */}
                    {item.jatuhTempo && (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3 h-3 text-rose-400" />
                        <span>Tempo: {item.jatuhTempo.length === 10 ? formatDateFull(item.jatuhTempo) : `Tgl ${item.jatuhTempo}`}</span>
                      </span>
                    )}
                  </div>

                  {/* 3. Progress Bar Section */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Kesiapan Dana Pelunasan Dari Aset</span>
                      <span className={`font-mono font-black ${isReady ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-[2px] border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isReady
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Stats Detail Box */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold uppercase">Total Utang</span>
                      <span className="font-extrabold text-rose-400 text-sm sm:text-base">{formatRupiah(nominal)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold uppercase">Teralokasi Dari Aset</span>
                      <span className={`font-extrabold text-sm sm:text-base ${isReady ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {formatRupiah(allocated)}
                      </span>
                    </div>
                  </div>

                  {/* Optional Note */}
                  {item.keterangan && (
                    <p className="text-xs text-slate-400 italic mt-2.5 px-2 bg-slate-900/50 py-1.5 rounded-lg border border-slate-800/50">
                      📝 {item.keterangan}
                    </p>
                  )}
                </div>

                {/* 5. Bottom Status & Pay Off Action */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs">
                    {isReady ? (
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Dana Aset Siap 100%!
                      </span>
                    ) : (
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Kurang <strong className="text-amber-200 font-mono">{formatRupiah(remaining)}</strong>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!isReady) return;
                      onPayOffDebt(item);
                    }}
                    disabled={!isReady}
                    className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      isReady
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ceklis & Lunasi Sekarang</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
