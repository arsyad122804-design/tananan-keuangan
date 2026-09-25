import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { formatRupiah, formatHumanRupiah } from '../utils/formatters';

export default function DebtModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    namaUtang: '',
    nominalUtang: '',
    jatuhTempo: '',
    keterangan: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        namaUtang: initialData.namaUtang || '',
        nominalUtang: initialData.nominalUtang || '',
        jatuhTempo: initialData.jatuhTempo || '',
        keterangan: initialData.keterangan || ''
      });
    } else {
      setFormData({
        namaUtang: '',
        nominalUtang: '',
        jatuhTempo: '',
        keterangan: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
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

    onSave({
      ...formData,
      nominalUtang: Number(formData.nominalUtang) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Pos Utang' : 'Catat Utang / Kewajiban Baru'}
              </h3>
              <p className="text-xs text-slate-400">Alokasi pelunasan otomatis dari Dana Aset Kekayaan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="Contoh: Utang Teman, Cicilan Paylater, Pinjaman Bank, Kartu Kredit"
              value={formData.namaUtang}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>

          {/* Nominal Utang */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-rose-400" />
              Nominal Utang Wajib Dilunasi (Rp) *
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

          {/* Tanggal Jatuh Tempo */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-400" />
              Tanggal Jatuh Tempo / Target Pelunasan (Opsional)
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
              placeholder="Contoh: Transfer ke BCA No Rek 123456 a/n..., jatuh tempo tiap tanggal 15"
              value={formData.keterangan}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none"
            />
          </div>

          {/* Flow Info Banner */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-start gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              💡 Saat dana aset kekayaan mencukupi <strong>100%</strong>, Anda dapat menekan tombol <strong>Ceklis Lunas</strong>. Saldo kekayaan akan dipotong otomatis dan pos utang ini langsung terhapus dari daftar.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-slate-950 font-bold text-xs shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah Utang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
