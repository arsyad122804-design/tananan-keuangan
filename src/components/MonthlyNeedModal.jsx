import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, CheckCircle2, ShoppingBag } from 'lucide-react';
import { formatRupiah, formatHumanRupiah } from '../utils/formatters';

const KATEGORI_OPTIONS = [
  'Tagihan & Utilitas',
  'Pangan & Belanja Dapur',
  'Sewa & Tempat Tinggal',
  'Cicilan & Kewajiban',
  'Keluarga & Orang Tua',
  'Pendidikan & Anak',
  'Transportasi & Bensin',
  'Kesehatan & Asuransi',
  'Hiburan & Langganan',
  'Lain-lain'
];

export default function MonthlyNeedModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    namaKebutuhan: '',
    nominal: '',
    kategori: 'Tagihan & Utilitas',
    tanggalJatuhTempo: '1',
    keterangan: '',
    isPaid: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        namaKebutuhan: initialData.namaKebutuhan || '',
        nominal: initialData.nominal || '',
        kategori: initialData.kategori || 'Tagihan & Utilitas',
        tanggalJatuhTempo: initialData.tanggalJatuhTempo || '1',
        keterangan: initialData.keterangan || '',
        isPaid: initialData.isPaid || false
      });
    } else {
      setFormData({
        namaKebutuhan: '',
        nominal: '',
        kategori: 'Tagihan & Utilitas',
        tanggalJatuhTempo: '1',
        keterangan: '',
        isPaid: false
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
    if (!formData.namaKebutuhan.trim()) {
      alert('Silakan masukkan nama kebutuhan bulanan.');
      return;
    }
    if (!formData.nominal || Number(formData.nominal) <= 0) {
      alert('Silakan masukkan nominal pengeluaran yang valid.');
      return;
    }

    onSave({
      ...formData,
      nominal: Number(formData.nominal) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Edit Kebutuhan Bulanan' : 'Tambah Kebutuhan Bulanan'}
              </h3>
              <p className="text-xs text-slate-400">Pengeluaran rutin wajib setiap gajian</p>
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
          {/* Nama Kebutuhan */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              Nama Kebutuhan Bulanan *
            </label>
            <input
              type="text"
              name="namaKebutuhan"
              required
              placeholder="Contoh: Belanja Dapur, Token Listrik, Wifi Indihome, Uang Ortu"
              value={formData.namaKebutuhan}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Kategori & Tanggal Rutin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-cyan-400" />
                Kategori Pos *
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              >
                {KATEGORI_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Tgl Rutin / Jatuh Tempo
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Tgl</span>
                <input
                  type="number"
                  name="tanggalJatuhTempo"
                  min="1"
                  max="31"
                  value={formData.tanggalJatuhTempo}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <span className="text-xs text-slate-400">setiap bln</span>
              </div>
            </div>
          </div>

          {/* Nominal Biaya */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Nominal Pengeluaran Rutin (Rp) *
            </label>
            <input
              type="number"
              name="nominal"
              required
              min="0"
              placeholder="Contoh: 500000"
              value={formData.nominal}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
            {formData.nominal && Number(formData.nominal) > 0 && (
              <div className="mt-1.5 flex items-center gap-2 text-xs font-mono bg-cyan-950/40 border border-cyan-800/50 px-3 py-1.5 rounded-lg text-cyan-300">
                <span>Preview: {formatRupiah(formData.nominal)}</span>
                {formatHumanRupiah(formData.nominal) && (
                  <span className="text-cyan-200 font-semibold">({formatHumanRupiah(formData.nominal)})</span>
                )}
              </div>
            )}
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Catatan / Detail Tambahan (Opsional)
            </label>
            <textarea
              name="keterangan"
              rows="2"
              placeholder="Contoh: Bayar via transfer BCA no rek..., no token listrik..."
              value={formData.keterangan}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
            />
          </div>

          {/* Status Checkbox */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Status Bulan Ini</span>
              <span className="text-[11px] text-slate-400">Tandai jika kebutuhan ini sudah dibayar saat gajian</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah Kebutuhan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
