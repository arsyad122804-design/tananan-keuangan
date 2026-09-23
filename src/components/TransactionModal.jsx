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

  // Whenever modal opens or initialData changes, reset form
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          tanggal: initialData.tanggal || getTodayISOString(),
          kebutuhan: initialData.kebutuhan || '',
          pemasukan: initialData.pemasukan ? String(initialData.pemasukan) : '',
          pengeluaran: initialData.pengeluaran ? String(initialData.pengeluaran) : '',
          profitSaham: initialData.profitSaham ? String(initialData.profitSaham) : '',
          lossSaham: initialData.lossSaham ? String(initialData.lossSaham) : '',
          duitDibawa: initialData.duitDibawa !== undefined ? String(initialData.duitDibawa) : (currentBalances.duitDibawa || ''),
          duitSaham: initialData.duitSaham !== undefined ? String(initialData.duitSaham) : (currentBalances.duitSaham || ''),
          allocatedDreamId: initialData.allocatedDreamId || ''
        });
      } else {
        // Clean empty form for new entry, synced to today's date
        setFormData({
          tanggal: getTodayISOString(),
          kebutuhan: '',
          pemasukan: '',
          pengeluaran: '',
          profitSaham: '',
          lossSaham: '',
          duitDibawa: currentBalances.duitDibawa ? String(currentBalances.duitDibawa) : '',
          duitSaham: currentBalances.duitSaham ? String(currentBalances.duitSaham) : '',
          allocatedDreamId: ''
        });
      }
    }
  }, [initialData, isOpen, currentBalances]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Automatically calculate cash and stock balances based on financial inputs
      const baseCash = Number(currentBalances.duitDibawa) || 0;
      const baseSaham = Number(currentBalances.duitSaham) || 0;

      const inc = Number(next.pemasukan) || 0;
      const exp = Number(next.pengeluaran) || 0;
      const prof = Number(next.profitSaham) || 0;
      const loss = Number(next.lossSaham) || 0;

      // When income or expense is entered, automatically adjust Cash (Duit Dibawa)
      if (name === 'pemasukan' || name === 'pengeluaran') {
        const calculatedCash = Math.max(0, baseCash + inc - exp);
        next.duitDibawa = String(calculatedCash);
      }

      // When profit or loss saham is entered, automatically adjust Stock (Duit di Saham)
      if (name === 'profitSaham' || name === 'lossSaham') {
        const calculatedSaham = Math.max(0, baseSaham + prof - loss);
        next.duitSaham = String(calculatedSaham);
      }

      return next;
    });
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
  const calculatedTotalKekayaan = calculatedCash + calculatedSaham;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      pemasukan: Number(formData.pemasukan) || 0,
      pengeluaran: Number(formData.pengeluaran) || 0,
      profitSaham: Number(formData.profitSaham) || 0,
      lossSaham: Number(formData.lossSaham) || 0,
      duitDibawa: calculatedCash,
      duitSaham: calculatedSaham,
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
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Saldo Duit Dibawa (Cash Rp)
              </label>
              <input
                type="number"
                name="duitDibawa"
                placeholder="Ketik saldo cash (cth: 5000000)"
                value={formData.duitDibawa}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition text-sm"
              />
              {formData.duitDibawa && Number(formData.duitDibawa) > 0 && (
                <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                  <span>Saldo Cash: {formatRupiah(formData.duitDibawa)}</span>
                  {formatHumanRupiah(formData.duitDibawa) && (
                    <span className="text-amber-300">({formatHumanRupiah(formData.duitDibawa)})</span>
                  )}
                </div>
              )}
            </div>

            {/* Duit Di Saham (Hanya Investor) */}
            {isInvestor && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-blue-400" />
                  Nilai Duit di Saham (Portofolio Rp)
                </label>
                <input
                  type="number"
                  name="duitSaham"
                  placeholder="Ketik total saham (cth: 15000000)"
                  value={formData.duitSaham}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-blue-500 transition text-sm"
                />
                {formData.duitSaham && Number(formData.duitSaham) > 0 && (
                  <div className="text-[11px] text-blue-400 font-bold mt-1 flex items-center gap-1">
                    <span>Portofolio Saham: {formatRupiah(formData.duitSaham)}</span>
                    {formatHumanRupiah(formData.duitSaham) && (
                      <span className="text-amber-300">({formatHumanRupiah(formData.duitSaham)})</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Total Seluruh Kekayaan Banner */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-slate-950 to-teal-950/70 border border-emerald-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 font-medium">
              {isInvestor ? 'Total Seluruh Aset Kekayaan (Cash + Saham):' : 'Total Saldo Kas:'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {formatRupiah(isInvestor ? calculatedTotalKekayaan : calculatedCash)}
              </span>
              {formatHumanRupiah(isInvestor ? calculatedTotalKekayaan : calculatedCash) && (
                <span className="text-xs text-amber-300 font-bold">
                  ({formatHumanRupiah(isInvestor ? calculatedTotalKekayaan : calculatedCash)})
                </span>
              )}
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
