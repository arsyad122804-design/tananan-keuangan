import React, { useState, useEffect } from 'react';
import { X, Save, Target, Calendar, DollarSign, Clock, Sparkles } from 'lucide-react';
import { formatRupiah, formatHumanRupiah } from '../utils/formatters';

export default function DreamModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    namaImpian: '',
    targetBiaya: '',
    terkumpul: 0,
    jangkaNilai: 12,
    jangkaSatuan: 'bulan', // 'bulan' | 'tahun'
    keterangan: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        namaImpian: initialData.namaImpian || '',
        targetBiaya: initialData.targetBiaya || '',
        terkumpul: initialData.terkumpul || 0,
        jangkaNilai: initialData.jangkaNilai || 12,
        jangkaSatuan: initialData.jangkaSatuan || 'bulan',
        keterangan: initialData.keterangan || ''
      });
    } else {
      setFormData({
        namaImpian: '',
        targetBiaya: '',
        terkumpul: 0,
        jangkaNilai: 12,
        jangkaSatuan: 'bulan',
        keterangan: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      targetBiaya: Number(formData.targetBiaya) || 0,
      terkumpul: Number(formData.terkumpul) || 0,
      jangkaNilai: Number(formData.jangkaNilai) || 1
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
            <Target className="w-5 h-5 text-amber-400" />
            <span>{initialData ? 'Edit Target Impian' : 'Tambah Target Impian Baru'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-200">
          {/* Nama Impian */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Nama Impian / Target Keuangan
            </label>
            <input
              type="text"
              name="namaImpian"
              placeholder="Contoh: Beli Rumah / Dana Darurat / Beli Mobil"
              required
              value={formData.namaImpian}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Biaya */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Target Biaya (Rp)
              </label>
              <input
                type="number"
                name="targetBiaya"
                min="1"
                placeholder="Contoh: 500000 / 2000000"
                required
                value={formData.targetBiaya}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              {formData.targetBiaya && Number(formData.targetBiaya) > 0 && (
                <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex flex-wrap items-center gap-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                  <span>Preview: {formatRupiah(formData.targetBiaya)}</span>
                  {formatHumanRupiah(formData.targetBiaya) && (
                    <span className="text-amber-300 font-semibold">({formatHumanRupiah(formData.targetBiaya)})</span>
                  )}
                </div>
              )}
            </div>

            {/* Terkumpul Saat Ini */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-400" />
                Sudah Terkumpul (Rp)
              </label>
              <input
                type="number"
                name="terkumpul"
                min="0"
                placeholder="0"
                value={formData.terkumpul}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
              {formData.terkumpul && Number(formData.terkumpul) > 0 ? (
                <div className="text-[11px] text-blue-400 font-bold mt-1.5 flex flex-wrap items-center gap-1 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                  <span>Preview: {formatRupiah(formData.terkumpul)}</span>
                  {formatHumanRupiah(formData.terkumpul) && (
                    <span className="text-amber-300 font-semibold">({formatHumanRupiah(formData.terkumpul)})</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Jangka Waktu (Bulan / Tahun) */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Target Jangka Waktu Pencapaian
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  name="jangkaNilai"
                  min="1"
                  required
                  placeholder="Jumlah (misal: 12)"
                  value={formData.jangkaNilai}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <select
                  name="jangkaSatuan"
                  value={formData.jangkaSatuan}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="bulan">Bulan</option>
                  <option value="tahun">Tahun</option>
                </select>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block italic">
              *Estimasi waktu yang Anda targetkan untuk mengumpulkan uang impian ini
            </span>
          </div>

          {/* Keterangan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Keterangan / Catatan Impian (Opsional)
            </label>
            <textarea
              name="keterangan"
              rows="2"
              placeholder="Catatan tambahan, motivasi, atau strategi tabungan..."
              value={formData.keterangan}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-medium text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-2 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Target Impian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
