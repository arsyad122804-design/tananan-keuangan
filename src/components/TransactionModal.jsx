import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, PieChart, ShoppingBag, PlusCircle, Clock, RotateCcw } from 'lucide-react';
import { getTodayISOString, formatDateFull, formatRupiah, formatHumanRupiah } from '../utils/formatters';

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  dreams = [],
  currentBalances = {},
  isInvestor = true
}) {
  const [formData, setFormData] = useState({
    tanggal: getTodayISOString(),
    kebutuhan: '',
    pemasukan: '',
    pengeluaran: '',
    profitSaham: '',
    lossSaham: '',
    duitDibawa: currentBalances.duitDibawa || '',
    duitSaham: currentBalances.duitSaham || '',
    allocatedDreamId: ''
  });

  // Track whether user explicitly manually altered cash or saham
  const [manualOverrideCash, setManualOverrideCash] = useState(false);
  const [manualOverrideSaham, setManualOverrideSaham] = useState(false);

  // Whenever modal opens or initialData changes, reset form
  useEffect(() => {
    if (isOpen) {
      setManualOverrideCash(false);
      setManualOverrideSaham(false);

      if (initialData) {
        setFormData({
          tanggal: initialData.tanggal || getTodayISOString(),
          kebutuhan: initialData.kebutuhan || '',
          pemasukan: initialData.pemasukan ? String(initialData.pemasukan) : '',
          pengeluaran: initialData.pengeluaran ? String(initialData.pengeluaran) : '',
          profitSaham: initialData.profitSaham ? String(initialData.profitSaham) : '',
          lossSaham: initialData.lossSaham ? String(initialData.lossSaham) : '',
          duitDibawa: initialData.duitDibawa !== undefined ? String(initialData.duitDibawa) : (currentBalances.duitDibawa ? String(currentBalances.duitDibawa) : ''),
          duitSaham: initialData.duitSaham !== undefined ? String(initialData.duitSaham) : (currentBalances.duitSaham ? String(currentBalances.duitSaham) : ''),
          allocatedDreamId: initialData.allocatedDreamId || ''
        });
      } else {
        // Clean empty form for new entry, synced to today's date & carrying current balances
        const baseCash = Number(currentBalances.duitDibawa) || 0;
        const baseSaham = Number(currentBalances.duitSaham) || 0;

        setFormData({
          tanggal: getTodayISOString(),
          kebutuhan: '',
          pemasukan: '',
          pengeluaran: '',
          profitSaham: '',
          lossSaham: '',
          duitDibawa: baseCash > 0 ? String(baseCash) : '',
          duitSaham: baseSaham > 0 ? String(baseSaham) : '',
          allocatedDreamId: ''
        });
      }
    }
  }, [initialData, isOpen, currentBalances]);

  if (!isOpen) return null;

  const baseCash = Number(currentBalances.duitDibawa) || 0;
  const baseSaham = Number(currentBalances.duitSaham) || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'duitDibawa') {
      setManualOverrideCash(true);
    }
    if (name === 'duitSaham') {
      setManualOverrideSaham(true);
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      const inc = Number(next.pemasukan) || 0;
      const exp = Number(next.pengeluaran) || 0;
      const prof = Number(next.profitSaham) || 0;
      const loss = Number(next.lossSaham) || 0;

      // When income or expense is typed, automatically adjust Cash (Duit Dibawa)
      if (name === 'pemasukan' || name === 'pengeluaran') {
        const calculatedCash = Math.max(0, baseCash + inc - exp);
        next.duitDibawa = String(calculatedCash);
        setManualOverrideCash(false);
      }

      // When profit or loss saham is typed, automatically adjust Stock (Duit di Saham)
      if (name === 'profitSaham' || name === 'lossSaham') {
        const calculatedSaham = Math.max(0, baseSaham + prof - loss);
        next.duitSaham = String(calculatedSaham);
        setManualOverrideSaham(false);
      }

      return next;
    });
  };

  const handleRecalculateAuto = () => {
    const inc = Number(formData.pemasukan) || 0;
    const exp = Number(formData.pengeluaran) || 0;
    const prof = Number(formData.profitSaham) || 0;
    const loss = Number(formData.lossSaham) || 0;

    setFormData((prev) => ({
      ...prev,
      duitDibawa: String(Math.max(0, baseCash + inc - exp)),
      duitSaham: String(Math.max(0, baseSaham + prof - loss))
    }));
    setManualOverrideCash(false);
    setManualOverrideSaham(false);
  };

  const handleSetToday = () => {
    setFormData((prev) => ({
      ...prev,
      tanggal: getTodayISOString()
    }));
  };

  // Live calculation of preview balances
  const calculatedCash = Number(formData.duitDibawa) || 0;
  const calculatedSaham = Number(formData.duitSaham) || 0;
  const calculatedTotalKekayaan = calculatedCash + (isInvestor ? calculatedSaham : 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      pemasukan: Number(formData.pemasukan) || 0,
      pengeluaran: Number(formData.pengeluaran) || 0,
      profitSaham: Number(formData.profitSaham) || 0,
      lossSaham: Number(formData.lossSaham) || 0,
      duitDibawa: calculatedCash,
      duitSaham: isInvestor ? calculatedSaham : 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <PlusCircle className="w-5 h-5" />
            <span>{initialData ? 'Edit Catatan Keuangan' : 'Isi Catatan Keuangan Baru'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Top Info Banner */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Tanggal Real-Time: <strong className="text-emerald-400 font-semibold">{formatDateFull(formData.tanggal)}</strong></span>
            </div>
            {formData.tanggal !== getTodayISOString() && (
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Gunakan Waktu Sekarang
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Tanggal Catatan
              </label>
              <input
                type="date"
                name="tanggal"
                required
                value={formData.tanggal}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition font-mono"
              />
            </div>

            {/* Isi Kebutuhan / Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                Isi Kebutuhan / Keterangan
              </label>
              <input
                type="text"
                name="kebutuhan"
                placeholder="Contoh: Gaji, Belanja Harian, Beli Saham..."
                required
                value={formData.kebutuhan}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Pemasukan */}
            <div className="bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                + Pemasukan (Rp)
              </label>
              <input
                type="number"
                name="pemasukan"
                min="0"
                placeholder="0 (Ketik nominal)"
                value={formData.pemasukan}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-sm"
              />
              {formData.pemasukan && Number(formData.pemasukan) > 0 && (
                <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <span>Preview: {formatRupiah(formData.pemasukan)}</span>
                  {formatHumanRupiah(formData.pemasukan) && (
                    <span className="text-amber-300">({formatHumanRupiah(formData.pemasukan)})</span>
                  )}
                </div>
              )}

              {/* Optional Allocation to Dream */}
              {dreams && dreams.length > 0 && Number(formData.pemasukan) > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-[11px] text-amber-400 font-semibold mb-1">
                    🎯 Alokasikan Sebagian/Semua ke Target Impian:
                  </label>
                  <select
                    name="allocatedDreamId"
                    value={formData.allocatedDreamId}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Tanpa Alokasi khusus --</option>
                    {dreams.map((d) => (
                      <option key={d.id} value={d.id}>
                        🎯 {d.namaImpian} (Target: {formatRupiah(d.targetBiaya)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Pengeluaran */}
            <div className="bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-red-400 uppercase tracking-wider">
                - Pengeluaran (Rp)
              </label>
              <input
                type="number"
                name="pengeluaran"
                min="0"
                placeholder="0 (Ketik nominal)"
                value={formData.pengeluaran}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500 text-sm"
              />
              {formData.pengeluaran && Number(formData.pengeluaran) > 0 && (
                <div className="text-[11px] text-red-400 font-bold flex items-center gap-1">
                  <span>Preview: {formatRupiah(formData.pengeluaran)}</span>
                  {formatHumanRupiah(formData.pengeluaran) && (
                    <span className="text-amber-300">({formatHumanRupiah(formData.pengeluaran)})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profit & Loss Saham (Hanya Investor) */}
          {isInvestor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profit Saham */}
              <div className="bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  📈 Profit Saham (Gain Rp)
                </label>
                <input
                  type="number"
                  name="profitSaham"
                  min="0"
                  placeholder="0 (Ketik nominal untung)"
                  value={formData.profitSaham}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 text-sm"
                />
                {formData.profitSaham && Number(formData.profitSaham) > 0 && (
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>Preview: +{formatRupiah(formData.profitSaham)}</span>
                    {formatHumanRupiah(formData.profitSaham) && (
                      <span className="text-amber-300">({formatHumanRupiah(formData.profitSaham)})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Loss Saham */}
              <div className="bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  📉 Loss Saham (Rugi Rp)
                </label>
                <input
                  type="number"
                  name="lossSaham"
                  min="0"
                  placeholder="0 (Ketik nominal rugi)"
                  value={formData.lossSaham}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500 text-sm"
                />
                {formData.lossSaham && Number(formData.lossSaham) > 0 && (
                  <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <span>Preview: -{formatRupiah(formData.lossSaham)}</span>
                    {formatHumanRupiah(formData.lossSaham) && (
                      <span className="text-amber-300">({formatHumanRupiah(formData.lossSaham)})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 ${isInvestor ? 'sm:grid-cols-2' : ''} gap-4 border-t border-slate-800 pt-4`}>
            {/* Total Duit Yang Saya Bawa */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Saldo Duit Dibawa (Cash Rp)
                </label>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${manualOverrideCash ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {manualOverrideCash ? '✏️ Diedit Manual' : '⚡ Otomatis Terhitung'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="duitDibawa"
                  placeholder="0 (Otomatis terhitung)"
                  value={formData.duitDibawa}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500 transition text-sm font-bold"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {baseCash > 0 ? `Saldo awal: ${formatRupiah(baseCash)}` : 'Mulai dari Rp 0'}
                </span>
                {formData.duitDibawa && Number(formData.duitDibawa) > 0 && (
                  <span className="text-emerald-400 font-bold">
                    {formatRupiah(formData.duitDibawa)} {formatHumanRupiah(formData.duitDibawa) && `(${formatHumanRupiah(formData.duitDibawa)})`}
                  </span>
                )}
              </div>
            </div>

            {/* Duit Di Saham (Hanya Investor) */}
            {isInvestor && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-blue-400" />
                    Nilai Duit di Saham (Portofolio Rp)
                  </label>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${manualOverrideSaham ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                    {manualOverrideSaham ? '✏️ Diedit Manual' : '⚡ Otomatis Terhitung'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="duitSaham"
                    placeholder="0 (Otomatis terhitung)"
                    value={formData.duitSaham}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 transition text-sm font-bold"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {baseSaham > 0 ? `Saham awal: ${formatRupiah(baseSaham)}` : 'Mulai dari Rp 0'}
                  </span>
                  {formData.duitSaham && Number(formData.duitSaham) > 0 && (
                    <span className="text-blue-400 font-bold">
                      {formatRupiah(formData.duitSaham)} {formatHumanRupiah(formData.duitSaham) && `(${formatHumanRupiah(formData.duitSaham)})`}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {(manualOverrideCash || manualOverrideSaham) && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRecalculateAuto}
                className="text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hitung Ulang Otomatis dari Rumus (+Pemasukan -Pengeluaran)</span>
              </button>
            </div>
          )}

          {/* Live Total Seluruh Kekayaan Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950/80 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-lg shadow-emerald-950/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💎</span> {isInvestor ? 'Total Seluruh Aset Kekayaan (Cash + Saham):' : 'Total Saldo Kas Anda:'}
                </span>
                <span className="text-[11px] text-emerald-400/80 block mt-0.5">
                  {isInvestor 
                    ? `Cash: ${formatRupiah(calculatedCash)} + Saham: ${formatRupiah(calculatedSaham)}`
                    : `Sisa Saldo Kas: ${formatRupiah(calculatedCash)}`
                  }
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                  {formatRupiah(calculatedTotalKekayaan)}
                </span>
                {formatHumanRupiah(calculatedTotalKekayaan) && (
                  <span className="text-xs text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    {formatHumanRupiah(calculatedTotalKekayaan)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-medium text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
