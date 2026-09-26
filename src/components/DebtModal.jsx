import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, CreditCard, AlertCircle, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import { formatRupiah, formatHumanRupiah } from '../utils/formatters';

export default function DebtModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    namaUtang: '',
    nominalUtang: '',
    nominalAwal: '',
    cicilanBulanan: '',
    tanggalTempoBulanan: '1',
    autoDeduct: false,
    jatuhTempo: '',
    keterangan: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        namaUtang: initialData.namaUtang || '',
        nominalUtang: initialData.nominalUtang || '',
        nominalAwal: initialData.nominalAwal || initialData.nominalUtang || '',
        cicilanBulanan: initialData.cicilanBulanan || '',
        tanggalTempoBulanan: initialData.tanggalTempoBulanan || '1',
        autoDeduct: Boolean(initialData.autoDeduct),
        jatuhTempo: initialData.jatuhTempo || '',
        keterangan: initialData.keterangan || ''
      });
    } else {
      setFormData({
        namaUtang: '',
        nominalUtang: '',
        nominalAwal: '',
        cicilanBulanan: '',
        tanggalTempoBulanan: '1',
        autoDeduct: true,
        jatuhTempo: '',
        keterangan: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.namaUtang.trim()) {
      alert('Silakan masukkan nama utang atau pihak pemberi pinjaman.');
      return;
    }
    if (!formData.nominalUtang || Number(formData.nominalUtang) <= 0) {
      alert('Silakan masukkan nominal utang yang valid.');
      return;
    }

    const numNominal = Number(formData.nominalUtang) || 0;
    const numCicilan = Number(formData.cicilanBulanan) || 0;
    const numAwal = Number(formData.nominalAwal) || numNominal;

    onSave({
      ...formData,
      nominalUtang: numNominal,
      nominalAwal: numAwal,
      cicilanBulanan: numCicilan,
      tanggalTempoBulanan: formData.tanggalTempoBulanan || '1',
      autoDeduct: Boolean(formData.autoDeduct)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Pos Utang & Cicilan' : 'Catat Utang / Cicilan Baru'}
              </h3>
              <p className="text-xs text-slate-400">Atur cicilan bulanan dan alokasi pelunasan otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Nama Utang */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-rose-400" />
              Nama Utang / Pihak Pemberi Pinjaman *
            </label>
            <input
              type="text"
              name="namaUtang"
              required
              placeholder="Contoh: Utang Ibu, Cicilan Motor, Pinjaman Teman"
              value={formData.namaUtang}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>

          {/* Nominal Utang (Sisa Kewajiban) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-rose-400" />
              {initialData ? 'Sisa Nominal Utang Saat Ini (Rp) *' : 'Total Nominal Utang (Rp) *'}
            </label>
            <input
              type="number"
              name="nominalUtang"
              required
              min="1"
              placeholder="Contoh: 500000"
              value={formData.nominalUtang}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
            {formData.nominalUtang && Number(formData.nominalUtang) > 0 && (
              <div className="mt-1.5 flex items-center gap-2 text-xs font-mono bg-rose-950/40 border border-rose-800/50 px-3 py-1.5 rounded-lg text-rose-300">
                <span>Preview: {formatRupiah(formData.nominalUtang)}</span>
                {formatHumanRupiah(formData.nominalUtang) && (
                  <span className="text-rose-200 font-semibold">({formatHumanRupiah(formData.nominalUtang)})</span>
                )}
              </div>
            )}
          </div>

          {/* Section: Cicilan Rutin Per Bulan */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Pengaturan Cicilan Rutin Bulanan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nominal Cicilan Per Bulan */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Nominal Cicilan / Bulan (Rp)
                </label>
                <input
                  type="number"
                  name="cicilanBulanan"
                  min="0"
                  placeholder="Contoh: 100000"
                  value={formData.cicilanBulanan}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition"
                />
                {formData.cicilanBulanan && Number(formData.cicilanBulanan) > 0 && (
                  <span className="text-[10px] text-amber-300 font-mono block mt-1">
                    {formatRupiah(formData.cicilanBulanan)} / bulan
                  </span>
                )}
              </div>

              {/* Tanggal Jatuh Tempo Setiap Bulan */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Tanggal Bayar Rutin Tiap Bulan
                </label>
                <select
                  name="tanggalTempoBulanan"
                  value={formData.tanggalTempoBulanan}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 transition"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((tgl) => (
                    <option key={tgl} value={String(tgl)}>
                      Setiap Tanggal {tgl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox Auto-Potong */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                name="autoDeduct"
                checked={formData.autoDeduct}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-400 focus:ring-offset-slate-950"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Otomatis Potong Saldo Kas Per Bulan
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Jika diaktifkan, saat masuk tanggal bayar / bulan baru, cicilan otomatis terbayar & memotong saldo kas uang yang dibawa.
                </p>
              </div>
            </label>
          </div>

          {/* Tanggal Target Pelunasan Akhir (Opsional) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-400" />
              Target Akhir Pelunasan (Opsional)
            </label>
            <input
              type="date"
              name="jatuhTempo"
              value={formData.jatuhTempo}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-400" />
              Catatan / No Rekening Tujuan (Opsional)
            </label>
            <textarea
              name="keterangan"
              rows="2"
              placeholder="Contoh: perbulan 100 rb, transfer ke BCA 123456..."
              value={formData.keterangan}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-slate-950 font-bold text-xs shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah Utang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

