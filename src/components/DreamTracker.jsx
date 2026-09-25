import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Plus, Edit2, Trash2, Clock, Sparkles, TrendingUp, DollarSign, PartyPopper, ArrowUp, ArrowDown, Wallet, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export default function DreamTracker({
  dreams,
  totalKekayaan = 0,
  currentDuitDibawa = 0,
  currentDuitSaham = 0,
  totalKebutuhanTerbayar = 0,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddNew,
  onMoveUp,
  onMoveDown
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'COMPLETED'

  // 1. Total Dana Keseluruhan (Cash + Saham)
  const totalKekayaanVal = Number(totalKekayaan) || 0;

  // 2. Sum of target costs for checked-off completed dreams
  const completedTarget = dreams
    .filter((item) => item.isCompleted)
    .reduce((sum, item) => sum + (Number(item.targetBiaya) || 0), 0);

  // 3. Sisa Dana Keseluruhan yang tersedia (dikurangi impian selesai & kebutuhan bulanan terbayar)
  const netSisaDanaKeseluruhan = Math.max(0, totalKekayaanVal - completedTarget - Number(totalKebutuhanTerbayar || 0));
  let activeWealthPool = netSisaDanaKeseluruhan;

  const processedDreams = dreams.map((item, index) => {
    const target = Number(item.targetBiaya) || 0;

    if (item.isCompleted) {
      return {
        ...item,
        originalIndex: index,
        saved: target,
        percentage: 100,
        isFull: true,
        remaining: 0
      };
    } else {
      // Active in-progress items receive available sisa Dana Keseluruhan sequentially
      const allocated = Math.min(activeWealthPool, target);
      activeWealthPool = Math.max(0, activeWealthPool - allocated);
      const percentage = target > 0 ? Math.min(100, Math.round((allocated / target) * 100)) : 0;
      return {
        ...item,
        originalIndex: index,
        saved: allocated,
        percentage,
        isFull: percentage >= 100,
        remaining: Math.max(0, target - allocated)
      };
    }
  });

  const filteredDreams = processedDreams.filter((item) => {
    if (filter === 'IN_PROGRESS') return !item.isCompleted;
    if (filter === 'COMPLETED') return item.isCompleted;
    return true;
  });

  // Totals calculations
  const totalTarget = dreams.reduce((sum, item) => sum + (Number(item.targetBiaya) || 0), 0);
  const completedCount = dreams.filter((item) => item.isCompleted).length;

  const activeDreams = processedDreams.filter((item) => !item.isCompleted);
  const activeTarget = activeDreams.reduce((sum, item) => sum + (Number(item.targetBiaya) || 0), 0);
  const activeTerkumpul = activeDreams.reduce((sum, item) => sum + item.saved, 0);
  const activeRemaining = Math.max(0, activeTarget - activeTerkumpul);

  // Terkumpul Keseluruhan displays remaining available active money (decreases when goals are checked off)
  const totalTerkumpulDisplay = netSisaDanaKeseluruhan;

  return (
    <div id="dream-section" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden my-6 p-4 sm:p-6">
      {/* Dynamic Wealth Banner Info */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-amber-950/40 border border-emerald-500/30 rounded-xl p-4 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Wallet className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Dana Keseluruhan Sisa (Setelah Kebutuhan & Impian)
            </span>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {formatRupiah(netSisaDanaKeseluruhan)}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800">
                Total Aset: <strong className="text-emerald-300">{formatRupiah(totalKekayaanVal)}</strong>
                {totalKebutuhanTerbayar > 0 && <span className="text-cyan-300 ml-1">(-{formatRupiah(totalKebutuhanTerbayar)} Kebutuhan)</span>}
                {completedTarget > 0 && <span className="text-amber-400 ml-1">(-{formatRupiah(completedTarget)} Ceklis)</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-300 bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-800 max-w-lg leading-relaxed">
          💡 Dana yang mengalir ke Target Impian adalah **Sisa Bersih ({formatRupiah(netSisaDanaKeseluruhan)})** setelah dikurangi kebutuhan bulanan terbayar dan impian selesai.
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Target className="w-4 h-4 animate-bounce" />
            <span>Target & Impian Keuangan Masa Depan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex flex-wrap items-center gap-2">
            <span>Daftar Impian Saya</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap shrink-0 inline-flex items-center font-mono">
              {completedCount}/{dreams.length} Tercapai
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({dreams.length})
            </button>
            <button
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'IN_PROGRESS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Proses Sisanya ({dreams.length - completedCount})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'COMPLETED' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Tercapai ({completedCount})
            </button>
          </div>

          {/* Add Dream Button */}
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Impian</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards for Dreams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total Nominal Impian</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{formatRupiah(totalTarget)}</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Semua impian terdaftar</span>
        </div>
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Terkumpul Keseluruhan</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{formatRupiah(totalTerkumpulDisplay)}</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Sisa Dana Keseluruhan Aktif</span>
        </div>
        <div className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-amber-950/30">
          <span className="text-[11px] text-amber-300 font-bold uppercase block">Kekurangan Impian Sisanya</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{formatRupiah(activeRemaining)}</span>
          <span className="text-[10px] text-amber-300/80 mt-1 block font-medium">{activeDreams.length} Impian Berjalan</span>
        </div>
        <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-xl bg-gradient-to-br from-slate-950 to-emerald-950/30">
          <span className="text-[11px] text-emerald-300 font-bold uppercase block">Impian Full (Ceklis)</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{formatRupiah(completedTarget)}</span>
          <span className="text-[10px] text-emerald-300/80 mt-1 block font-medium">{completedCount} Impian Selesai 🎉</span>
        </div>
      </div>

      {/* Dreams Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filteredDreams.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            <Target className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">Belum ada target impian dalam daftar ini.</p>
            <button
              onClick={onAddNew}
              className="mt-3 text-xs text-amber-400 hover:underline font-semibold"
            >
              Tambah Impian Pertama Anda Sekarang
            </button>
          </div>
        ) : (
          filteredDreams.map((item) => {
            const target = Number(item.targetBiaya) || 0;
            const isFull = item.isCompleted || item.isFull;
            const saved = item.saved;
            const percentage = item.percentage;
            const remaining = item.remaining;

            const jangkaStr = `${item.jangkaNilai || 1} ${item.jangkaSatuan || 'bulan'}`;
            const totalMonths = item.jangkaSatuan === 'tahun' ? (item.jangkaNilai || 1) * 12 : (item.jangkaNilai || 1);
            const monthlyEstimate = remaining > 0 && totalMonths > 0 ? Math.round(remaining / totalMonths) : 0;

            return (
              <div
                key={item.id}
                className={`border rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between ${
                  item.isCompleted
                    ? 'border-emerald-500/50 bg-slate-950/90 shadow-emerald-950/20'
                    : isFull
                    ? 'border-amber-500/60 bg-slate-950/90 shadow-amber-950/20'
                    : 'border-slate-800 bg-slate-950/90 hover:border-amber-500/40 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* 1. Header Row: Checkbox + Title on Left, Action Toolbar on Right */}
                  <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Ceklis Button / Toggle Impian Tercapai */}
                      <button
                        onClick={() => {
                          if (isFull || item.isCompleted) {
                            onToggleComplete(item.id);
                          }
                        }}
                        disabled={!isFull && !item.isCompleted}
                        className={`p-2 rounded-xl transition flex items-center justify-center shrink-0 ${
                          item.isCompleted
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 cursor-pointer'
                            : isFull
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 animate-bounce shadow-md shadow-amber-500/30 cursor-pointer'
                            : 'bg-slate-900 border border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                        }`}
                        title={
                          item.isCompleted
                            ? 'Batalkan Status Tercapai'
                            : isFull
                            ? '🎉 Dana sudah 100% FULL! Klik Ceklis untuk selesaikan impian ini'
                            : `🔒 Ceklis Terkunci! (${percentage}% - Terkumpul ${formatRupiah(saved)} dari ${formatRupiah(target)}). Ceklis terbuka saat 100% FULL.`
                        }
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Title */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-base sm:text-lg font-extrabold truncate leading-tight tracking-wide ${
                            item.isCompleted ? 'line-through text-slate-400 font-medium' : 'text-white'
                          }`}
                          title={item.namaImpian}
                        >
                          {item.namaImpian}
                        </h3>
                      </div>
                    </div>

                    {/* Actions & Priority Reorder Toolbar */}
                    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 rounded-xl p-1 shrink-0">
                      {onMoveUp && onMoveDown && !item.isCompleted && (
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
                            disabled={item.originalIndex === dreams.length - 1}
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
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Impian"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Hapus Impian"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Sub-Row: Status Pill & Jangka Waktu Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 mb-3">
                    {item.isCompleted ? (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <PartyPopper className="w-3.5 h-3.5 text-emerald-400" />
                        <span>TERCAPAI (100%)</span>
                      </span>
                    ) : isFull ? (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 shadow-sm shadow-amber-500/10">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>DANA 100% FULL!</span>
                      </span>
                    ) : (
                      <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dana Belum Cukup ({percentage}%)</span>
                      </span>
                    )}

                    <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Jangka Waktu: <strong className="text-white font-bold">{jangkaStr}</strong></span>
                    </span>
                  </div>

                  {/* 3. Progress Bar Section */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Progres Pengumpulan (Dari Dana Aset)</span>
                      <span className={`font-mono font-black ${item.isCompleted || isFull ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-[2px] border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-sm shadow-emerald-500/30'
                            : isFull
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-400 shadow-sm shadow-amber-500/30'
                            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Stats Detail Box */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold uppercase">Target Biaya</span>
                      <span className="font-extrabold text-amber-400 text-sm sm:text-base">{formatRupiah(target)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans font-semibold uppercase">Terkumpul Dari Aset</span>
                      <span className="font-extrabold text-emerald-400 text-sm sm:text-base">{formatRupiah(saved)}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Bottom Status / Deficit Banner */}
                {item.isCompleted ? (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Impian Tercapai & Dikunci!
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/25">
                      Sisa dana kekayaan bergulir otomatis
                    </span>
                  </div>
                ) : isFull ? (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] text-amber-300 flex items-center justify-between font-medium">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      Dana Impian Sudah Full 100%!
                    </span>
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className="text-xs bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold hover:scale-105 transition shadow-md shadow-amber-500/20"
                    >
                      Klik Ceklis Tercapai
                    </button>
                  </div>
                ) : (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Dana Anda belum mencukupi <strong className="text-amber-200 font-mono font-bold whitespace-nowrap">(Kurang {formatRupiah(remaining)})</strong>
                      </span>
                    </div>
                    {monthlyEstimate > 0 && (
                      <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg font-mono shrink-0 self-start sm:self-auto">
                        Estimasi: <strong className="text-amber-300 font-bold">{formatRupiah(monthlyEstimate)}/bln</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
