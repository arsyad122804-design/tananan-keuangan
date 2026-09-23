import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Wallet,
  Tag,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCheck,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingDown
} from 'lucide-react';
import { formatRupiah, formatHumanRupiah } from '../utils/formatters';

export default function MonthlyNeedTracker({
  monthlyNeeds = [],
  totalKekayaan = 0,
  currentDuitDibawa = 0,
  currentDuitSaham = 0,
  completedDreamsTarget = 0,
  onTogglePaid,
  onEdit,
  onDelete,
  onAddNew,
  onMoveUp,
  onMoveDown,
  onResetAllUnpaid,
  onCheckAllAffordable
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNPAID' | 'PAID'
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Calculations
  const totalTargetKebutuhan = monthlyNeeds.reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);
  const paidNeeds = monthlyNeeds.filter((n) => n.isPaid);
  const unpaidNeeds = monthlyNeeds.filter((n) => !n.isPaid);

  const totalTerbayar = paidNeeds.reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);
  const totalBelumBayar = unpaidNeeds.reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);

  const totalKekayaanVal = Number(totalKekayaan) || 0;
  // Sisa Dana Keseluruhan after both paid monthly needs and completed dreams
  const sisaDanaBersih = Math.max(0, totalKekayaanVal - totalTerbayar - completedDreamsTarget);

  // Check if at least one unpaid need is affordable
  const hasAffordableUnpaid = unpaidNeeds.some((n) => sisaDanaBersih >= (Number(n.nominal) || 0));

  // Filtered items
  const filtered = monthlyNeeds.filter((item) => {
    if (filter === 'UNPAID' && item.isPaid) return false;
    if (filter === 'PAID' && !item.isPaid) return false;
    if (searchTerm.trim()) {
      const matchName = item.namaKebutuhan?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = item.kategori?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchCat;
    }
    return true;
  });

  return (
    <div id="monthly-needs-section" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden my-6 p-4 sm:p-6">
      {/* 1. Dynamic Wealth Banner Info */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-950 to-blue-950/40 border border-cyan-500/30 rounded-xl p-4 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Wallet className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Sisa Dana Keseluruhan (Setelah Kebutuhan Bulanan & Impian)
            </span>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                {formatRupiah(sisaDanaBersih)}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800">
                Total Aset: <strong className="text-emerald-300">{formatRupiah(totalKekayaanVal)}</strong>
                {totalTerbayar > 0 && <span className="text-cyan-300 ml-1">(-{formatRupiah(totalTerbayar)} Kebutuhan)</span>}
                {completedDreamsTarget > 0 && <span className="text-amber-400 ml-1">(-{formatRupiah(completedDreamsTarget)} Impian)</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-300 bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800 max-w-lg leading-relaxed">
          💡 Setiap pos kebutuhan yang dicentang (<strong>Ceklis Terbayar</strong>) otomatis mengurangi Dana Keseluruhan dan menyesuaikan jatah yang mengalir ke <strong>Target Impian</strong>.
        </div>
      </div>

      {/* 2. Header Title & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4 animate-bounce" />
            <span>Pos Rutin Setiap Gajian</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex flex-wrap items-center gap-2">
            <span>Kebutuhan Bulanan</span>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30 whitespace-nowrap shrink-0 inline-flex items-center font-mono">
              {paidNeeds.length}/{monthlyNeeds.length} Terbayar
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Ceklis Semua yang Cukup Dana */}
          <button
            onClick={onCheckAllAffordable}
            disabled={!hasAffordableUnpaid || unpaidNeeds.length === 0}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              hasAffordableUnpaid && unpaidNeeds.length > 0
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-40 cursor-not-allowed'
            }`}
            title="Ceklis semua kebutuhan bulanan yang dananya mencukupi"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Ceklis Semua (Cukup Dana)</span>
          </button>

          {/* Quick Action: Reset All to Unpaid for new month */}
          <button
            onClick={onResetAllUnpaid}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            title="Reset semua centang untuk memulai bulan/gajian baru"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bulan</span>
          </button>

          {/* Add Need Button */}
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-105 transition flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Kebutuhan</span>
          </button>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total Anggaran Bulanan</span>
          <span className="text-xl font-bold text-cyan-400 font-mono">{formatRupiah(totalTargetKebutuhan)}</span>
          <span className="text-[10px] text-slate-500 mt-1 block">{monthlyNeeds.length} Pos Pengeluaran Rutin</span>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-emerald-950/20">
          <span className="text-[11px] text-emerald-300 font-bold uppercase block">Sudah Terbayar (Ceklis)</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{formatRupiah(totalTerbayar)}</span>
          <span className="text-[10px] text-emerald-300/80 mt-1 block font-medium">{paidNeeds.length} Pos Lunas Terbayar ✅</span>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-amber-950/20">
          <span className="text-[11px] text-amber-300 font-bold uppercase block">Sisa Belum Dibayar</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{formatRupiah(totalBelumBayar)}</span>
          <span className="text-[10px] text-amber-300/80 mt-1 block font-medium">{unpaidNeeds.length} Pos Menunggu Pembayaran</span>
        </div>

        <div className="bg-slate-950/80 border border-blue-500/30 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-blue-950/20">
          <span className="text-[11px] text-blue-300 font-bold uppercase block">Sisa Dana Keseluruhan</span>
          <span className="text-xl font-bold text-blue-400 font-mono">{formatRupiah(sisaDanaBersih)}</span>
          <span className="text-[10px] text-blue-300/80 mt-1 block font-medium">Siap Mengalir ke Target Impian</span>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({monthlyNeeds.length})
          </button>
          <button
            onClick={() => setFilter('UNPAID')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'UNPAID' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Belum Bayar ({unpaidNeeds.length})
          </button>
          <button
            onClick={() => setFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'PAID' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sudah Bayar ({paidNeeds.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Cari kebutuhan bulanan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition sm:w-60"
        />
      </div>

      {/* 5. Needs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">Belum ada data kebutuhan bulanan pada filter ini.</p>
            <button
              onClick={onAddNew}
              className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
            >
              Tambah Kebutuhan Bulanan Sekarang
            </button>
          </div>
        ) : (
          filtered.map((item, index) => {
            const isPaid = item.isPaid;
            const originalIndex = monthlyNeeds.findIndex((n) => n.id === item.id);
            const nominalNum = Number(item.nominal) || 0;
            const isAffordable = isPaid || sisaDanaBersih >= nominalNum;
            const deficit = Math.max(0, nominalNum - sisaDanaBersih);

            return (
              <div
                key={item.id || index}
                className={`border rounded-2xl p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isPaid
                    ? 'bg-slate-950/80 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : isAffordable
                    ? 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/40 hover:shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-90'
                }`}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Checkbox Button */}
                      <button
                        onClick={() => {
                          if (!isPaid && !isAffordable) return;
                          onTogglePaid(item.id);
                        }}
                        disabled={!isPaid && !isAffordable}
                        className={`p-2 rounded-xl transition flex items-center justify-center ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isAffordable
                            ? 'bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-700'
                            : 'bg-slate-900 text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed'
                        }`}
                        title={
                          isPaid
                            ? 'Tandai Belum Terbayar'
                            : isAffordable
                            ? 'Tandai Sudah Terbayar (Ceklis)'
                            : `Dana belum mencukupi (Kurang ${formatRupiah(deficit)})`
                        }
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-base font-bold ${
                              isPaid ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {item.namaKebutuhan}
                          </h3>
                          {isPaid ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                              LUNAS TERBAYAR
                            </span>
                          ) : isAffordable ? (
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/20">
                              DANA MENCUKUPI
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-500/10 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                              DANA KURANG
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] text-cyan-300">
                            {item.kategori || 'Tagihan'}
                          </span>
                          {item.tanggalJatuhTempo && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              Tgl {item.tanggalJatuhTempo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Move, Edit, Delete */}
                    <div className="flex items-center gap-1">
                      {/* Priority Move Up/Down */}
                      {onMoveUp && onMoveDown && (
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-1">
                          <button
                            onClick={() => onMoveUp(originalIndex)}
                            disabled={originalIndex === 0}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded"
                            title="Naikkan Urutan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onMoveDown(originalIndex)}
                            disabled={originalIndex === monthlyNeeds.length - 1}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded"
                            title="Turunkan Urutan"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Kebutuhan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Hapus Kebutuhan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Nominal Display Box */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between mt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Nominal Rutin
                      </span>
                      <span className="text-lg font-bold font-mono text-cyan-400">
                        {formatRupiah(item.nominal)}
                      </span>
                    </div>
                    {formatHumanRupiah(item.nominal) && (
                      <span className="text-xs text-cyan-300/80 font-mono bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded-md">
                        {formatHumanRupiah(item.nominal)}
                      </span>
                    )}
                  </div>

                  {/* Insufficient funds warning badge */}
                  {!isPaid && !isAffordable && (
                    <div className="mt-3 bg-red-950/40 border border-red-500/30 px-3 py-2 rounded-xl flex items-center justify-between text-xs text-red-300">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Dana Anda belum mencukupi (Kurang {formatRupiah(deficit)})</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">Sisa: {formatRupiah(sisaDanaBersih)}</span>
                    </div>
                  )}

                  {/* Optional Note */}
                  {item.keterangan && (
                    <p className="text-xs text-slate-400 italic mt-2.5 px-1 bg-slate-900/50 py-1 rounded border border-slate-800/50">
                      📝 {item.keterangan}
                    </p>
                  )}
                </div>

                {/* Bottom Toggle CTA Button */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isPaid
                      ? 'Dana terpakai dari kekayaan'
                      : isAffordable
                      ? 'Siap dibayar saat gajian'
                      : 'Kekayaan belum cukup'}
                  </span>
                  <button
                    onClick={() => {
                      if (!isPaid && !isAffordable) return;
                      onTogglePaid(item.id);
                    }}
                    disabled={!isPaid && !isAffordable}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                      isPaid
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : isAffordable
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 opacity-40 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isPaid ? (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        <span>Batal Ceklis</span>
                      </>
                    ) : isAffordable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ceklis Terbayar</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                        <span>Dana Kurang</span>
                      </>
                    )}
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
