import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { getTodayISOString, formatDateFull, formatRupiah, formatHumanRupiah } from '../utils/formatters';

export default function InvestmentModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = 'NEW' // 'NEW' | 'EDIT' | 'REALIZE'
}) {
  const [formData, setFormData] = useState({
    namaSaham: '',
    modalInvestasi: '',
    tanggalBeli: getTodayISOString(),
    status: 'HOLDING', // 'HOLDING' | 'CLOSED'
    profitLossType: 'PROFIT', // 'PROFIT' | 'LOSS'
    nominalProfitLoss: '',
    tanggalJual: getTodayISOString(),
    keterangan: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          namaSaham: initialData.namaSaham || '',
          modalInvestasi: initialData.modalInvestasi ? String(initialData.modalInvestasi) : '',
          tanggalBeli: initialData.tanggalBeli || getTodayISOString(),
          status: mode === 'REALIZE' ? 'CLOSED' : (initialData.status || 'HOLDING'),
          profitLossType: initialData.profitLossType && initialData.profitLossType !== 'NONE' ? initialData.profitLossType : 'PROFIT',
          nominalProfitLoss: initialData.nominalProfitLoss ? String(initialData.nominalProfitLoss) : '',
          tanggalJual: initialData.tanggalJual || getTodayISOString(),
          keterangan: initialData.keterangan || ''
        });
      } else {
        setFormData({
          namaSaham: '',
          modalInvestasi: '',
          tanggalBeli: getTodayISOString(),
          status: 'HOLDING',
          profitLossType: 'PROFIT',
          nominalProfitLoss: '',
          tanggalJual: getTodayISOString(),
          keterangan: ''
        });
      }
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const modalNumber = Number(formData.modalInvestasi) || 0;
  const pnlNumber = Number(formData.nominalProfitLoss) || 0;

  // Calculate return when closing trade
  let totalKembali = modalNumber;
  if (formData.status === 'CLOSED' || mode === 'REALIZE') {
    if (formData.profitLossType === 'PROFIT') {
      totalKembali = modalNumber + pnlNumber;
    } else {
      totalKembali = Math.max(0, modalNumber - pnlNumber);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.namaSaham.trim()) {
      alert('Nama emiten / saham wajib diisi!');
      return;
    }
    if (modalNumber <= 0) {
      alert('Modal investasi wajib lebih dari 0!');
      return;
    }

    const payload = {
      ...formData,
      namaSaham: formData.namaSaham.toUpperCase().trim(),
      modalInvestasi: modalNumber,
      nominalProfitLoss: pnlNumber,
      totalKembali: formData.status === 'CLOSED' || mode === 'REALIZE' ? totalKembali : 0,
      status: mode === 'REALIZE' ? 'CLOSED' : formData.status,
      tanggalJual: formData.status === 'CLOSED' || mode === 'REALIZE' ? formData.tanggalJual : null,
    };

    onSave(payload, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b border-slate-800 flex items-center justify-between ${
          mode === 'REALIZE'
            ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950'
            : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900'
        }`}>
          <div className="flex items-center gap-2.5 font-bold text-white text-base sm:text-lg">
            <div className={`p-2 rounded-xl ${mode === 'REALIZE' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3>
                {mode === 'REALIZE'
                  ? `Jual / Realisasi Saham (${formData.namaSaham || 'Emiten'})`
                  : initialData
                  ? 'Edit Saham yang Diinvestasikan'
                  : 'Catat Saham yang Diinvestasikan'}
              </h3>
              <p className="text-xs text-slate-400 font-normal">
                {mode === 'REALIZE'
                  ? 'Hitung untung/rugi & uang kembali ke Duit di Saham'
                  : 'Masukkan emiten dan modal yang dibeli'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-200">
          {/* 1. Nama Saham & Modal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Kode / Nama Saham
              </label>
              <input
                type="text"
                name="namaSaham"
                placeholder="Contoh: BBCA, BBRI, TLKM"
                required
                disabled={mode === 'REALIZE'}
                value={formData.namaSaham}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold tracking-wider placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Modal Beli (Rp)
              </label>
              <input
                type="number"
                name="modalInvestasi"
                placeholder="0 (Modal beli)"
                required
                min="1"
                disabled={mode === 'REALIZE'}
                value={formData.modalInvestasi}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500 text-sm font-bold"
              />
              {modalNumber > 0 && (
                <span className="text-[11px] text-blue-400 font-semibold block mt-0.5">
                  {formatRupiah(modalNumber)} {formatHumanRupiah(modalNumber) && `(${formatHumanRupiah(modalNumber)})`}
                </span>
              )}
            </div>
          </div>

          {/* 2. Tanggal Beli */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Tanggal Beli Saham
            </label>
            <input
              type="date"
              name="tanggalBeli"
              required
              disabled={mode === 'REALIZE'}
              value={formData.tanggalBeli}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
            />
          </div>

          {/* 3. SECTION KHUSUS JUAL / REALISASI */}
          {(mode === 'REALIZE' || formData.status === 'CLOSED') && (
            <div className="bg-slate-950 border-2 border-blue-500/40 p-4 rounded-2xl space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span> Hasil Realisasi Jual Saham
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                  Selesai Dijual
                </span>
              </div>

              {/* Profit vs Loss Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pilih Hasil Trade:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, profitLossType: 'PROFIT' }))}
                    className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      formData.profitLossType === 'PROFIT'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>📈 Profit (Untung)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, profitLossType: 'LOSS' }))}
                    className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      formData.profitLossType === 'LOSS'
                        ? 'bg-red-500/20 text-red-300 border-red-500 shadow-md shadow-red-500/10'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span>📉 Loss (Rugi)</span>
                  </button>
                </div>
              </div>

              {/* Nominal Profit / Loss */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                  formData.profitLossType === 'PROFIT' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {formData.profitLossType === 'PROFIT' ? '+ Nominal Keuntungan (Profit Rp)' : '- Nominal Kerugian (Loss Rp)'}
                </label>
                <input
                  type="number"
                  name="nominalProfitLoss"
                  placeholder={formData.profitLossType === 'PROFIT' ? '0 (Ketik keuntungan)' : '0 (Ketik kerugian)'}
                  min="0"
                  required
                  value={formData.nominalProfitLoss}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none text-sm font-bold ${
                    formData.profitLossType === 'PROFIT' ? 'border-emerald-500/50 focus:border-emerald-400' : 'border-red-500/50 focus:border-red-400'
                  }`}
                />
                {pnlNumber > 0 && (
                  <span className={`text-[11px] font-semibold block mt-0.5 ${
                    formData.profitLossType === 'PROFIT' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formData.profitLossType === 'PROFIT' ? '+' : '-'}{formatRupiah(pnlNumber)} {formatHumanRupiah(pnlNumber) && `(${formatHumanRupiah(pnlNumber)})`}
                  </span>
                )}
              </div>

              {/* Tanggal Jual */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Tanggal Jual / Realisasi
                </label>
                <input
                  type="date"
                  name="tanggalJual"
                  required
                  value={formData.tanggalJual}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              {/* Formula & Total Uang Kembali Banner */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Modal Awal:</span>
                  <span className="font-mono text-slate-200">{formatRupiah(modalNumber)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {formData.profitLossType === 'PROFIT' ? 'Keuntungan (+):' : 'Kerugian (-):'}
                  </span>
                  <span className={`font-mono font-bold ${
                    formData.profitLossType === 'PROFIT' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formData.profitLossType === 'PROFIT' ? '+' : '-'}{formatRupiah(pnlNumber)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      💰 Total Uang Kembali ke Duit di Saham:
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      (Otomatis masuk & menambah saldo kas saham)
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {formatRupiah(totalKembali)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Keterangan / Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan / Strategi
            </label>
            <input
              type="text"
              name="keterangan"
              placeholder="Contoh: Beli di support, target TP 5%, swing trading..."
              value={formData.keterangan}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-medium text-xs sm:text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 text-xs sm:text-sm shadow-lg ${
                mode === 'REALIZE'
                  ? 'bg-blue-500 hover:bg-blue-600 text-slate-950 shadow-blue-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {mode === 'REALIZE'
                  ? 'Konfirmasi & Realisasikan Saham'
                  : initialData
                  ? 'Simpan Perubahan'
                  : 'Simpan Saham'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
