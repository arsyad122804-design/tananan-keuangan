import React, { useState } from 'react';
import { Edit2, Trash2, Search, Filter, Plus, ArrowUpDown, Calendar, ShoppingBag, Wallet, PieChart, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { formatRupiah, formatDateFull } from '../utils/formatters';

export default function TransactionTable({ transactions, onEdit, onDelete, onAddNew, isInvestor = true }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'cards' | 'table'

  // Filter logic
  const filtered = transactions.filter((item) => {
    const matchesSearch = item.kebutuhan.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMonth === 'ALL') return matchesSearch;
    const itemMonth = item.tanggal.substring(0, 7); // YYYY-MM
    return matchesSearch && itemMonth === filterMonth;
  });

  // Sorting by date (and exact timestamp/ID for same day)
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.tanggal).getTime();
    const dateB = new Date(b.tanggal).getTime();
    if (dateA !== dateB) return sortAsc ? dateA - dateB : dateB - dateA;
    const timeA = Number(a.id) || 0;
    const timeB = Number(b.id) || 0;
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  // Calculate Column Totals
  const totals = sorted.reduce(
    (acc, curr) => ({
      pemasukan: acc.pemasukan + (Number(curr.pemasukan) || 0),
      pengeluaran: acc.pengeluaran + (Number(curr.pengeluaran) || 0),
      profitSaham: acc.profitSaham + (Number(curr.profitSaham) || 0),
      lossSaham: acc.lossSaham + (Number(curr.lossSaham) || 0),
    }),
    { pemasukan: 0, pengeluaran: 0, profitSaham: 0, lossSaham: 0 }
  );

  const months = Array.from(
    new Set(transactions.map((t) => t.tanggal?.substring(0, 7)))
  ).filter(Boolean).sort().reverse();

  return (
    <div id="transaction-section" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden my-6 pb-12 md:pb-0">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
            <span>Catatan Keuangan & Saham</span>
            <span className="text-xs bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono whitespace-nowrap shrink-0 inline-flex items-center">
              {sorted.length} Data
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dapat ditambah, diedit, dan diperbarui secara interaktif
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kebutuhan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Month Filter */}
          {months.length > 0 && (
            <div className="relative">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="ALL">Semua Bulan</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Sort Button */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white hover:border-emerald-500 transition flex items-center gap-1 text-xs font-medium"
            title="Urutkan Tanggal"
          >
            <ArrowUpDown className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Add New Button */}
          <button
            onClick={onAddNew}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan</span>
          </button>
        </div>
      </div>

      {/* 📱 MOBILE CARDS VIEW (Displayed on screens < md) */}
      <div className="block md:hidden p-3 space-y-3">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Belum ada catatan. Klik tombol <span className="text-emerald-400 font-semibold">+ Tambah</span> untuk membuat catatan.
          </div>
        ) : (
          sorted.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden"
            >
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-0.5">
                    {formatDateFull(item.tanggal)}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {item.kebutuhan}
                  </h4>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Metrics Grid */}
              <div className={`grid ${isInvestor ? 'grid-cols-2' : 'grid-cols-2'} gap-2 text-xs`}>
                {/* Pemasukan */}
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Pemasukan</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {item.pemasukan > 0 ? formatRupiah(item.pemasukan) : '-'}
                  </span>
                </div>

                {/* Pengeluaran */}
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Pengeluaran</span>
                  <span className="font-mono font-bold text-red-400">
                    {item.pengeluaran > 0 ? formatRupiah(item.pengeluaran) : '-'}
                  </span>
                </div>

                {/* Profit Saham (Hanya Investor) */}
                {isInvestor && (
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Profit Saham</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {item.profitSaham > 0 ? formatRupiah(item.profitSaham) : '-'}
                    </span>
                  </div>
                )}

                {/* Loss Saham (Hanya Investor) */}
                {isInvestor && (
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Loss Saham</span>
                    <span className="font-mono font-bold text-amber-400">
                      {item.lossSaham > 0 ? formatRupiah(item.lossSaham) : '-'}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Balances */}
              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
                <span className="text-blue-300">Duit Dibawa: {formatRupiah(item.duitDibawa)}</span>
                {isInvestor && <span className="text-purple-300">Portofolio: {formatRupiah(item.duitSaham)}</span>}
              </div>
            </div>
          ))
        )}

        {/* Mobile Totals Footer */}
        {sorted.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 mt-4">
            <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
              TOTAL AKUMULASI:
            </span>
            <div className={`grid ${isInvestor ? 'grid-cols-2' : 'grid-cols-2'} gap-2 text-xs font-mono`}>
              <div className="bg-slate-900 p-2 rounded-lg text-emerald-400">
                In: {totals.pemasukan > 0 ? formatRupiah(totals.pemasukan) : '-'}
              </div>
              <div className="bg-slate-900 p-2 rounded-lg text-red-400">
                Out: {totals.pengeluaran > 0 ? formatRupiah(totals.pengeluaran) : '-'}
              </div>
              {isInvestor && (
                <>
                  <div className="bg-slate-900 p-2 rounded-lg text-emerald-400">
                    Gain: {totals.profitSaham > 0 ? formatRupiah(totals.profitSaham) : '-'}
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg text-amber-400">
                    Loss: {totals.lossSaham > 0 ? formatRupiah(totals.lossSaham) : '-'}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 💻 DESKTOP DATA TABLE VIEW (Displayed on screens >= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-center text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3.5 text-center">No</th>
              <th className="px-4 py-3.5 text-center min-w-[160px]">Hari, Tanggal, Tahun</th>
              <th className="px-4 py-3.5 text-center min-w-[200px]">Isi Kebutuhan</th>
              <th className="px-4 py-3.5 text-center text-emerald-400 min-w-[120px]">Pemasukan</th>
              <th className="px-4 py-3.5 text-center text-red-400 min-w-[120px]">Pengeluaran</th>
              {isInvestor && <th className="px-4 py-3.5 text-center text-emerald-400 min-w-[120px]">Profit Saham</th>}
              {isInvestor && <th className="px-4 py-3.5 text-center text-amber-400 min-w-[120px]">Loss Saham</th>}
              <th className="px-4 py-3.5 text-center text-blue-400 min-w-[140px]">Duit Dibawa</th>
              {isInvestor && <th className="px-4 py-3.5 text-center text-purple-400 min-w-[140px]">Portofolio</th>}
              <th className="px-4 py-3.5 text-center min-w-[100px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-12 text-center text-slate-500">
                  Belum ada catatan keuangan. Klik tombol <span className="text-emerald-400 font-semibold">"Tambah Catatan"</span> di atas untuk memulai.
                </td>
              </tr>
            ) : (
              sorted.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-white whitespace-nowrap">
                    {formatDateFull(item.tanggal)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-200">
                    <span className="font-semibold block">{item.kebutuhan}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-400 font-medium whitespace-nowrap">
                    {item.pemasukan > 0 ? formatRupiah(item.pemasukan) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-red-400 font-medium whitespace-nowrap">
                    {item.pengeluaran > 0 ? formatRupiah(item.pengeluaran) : '-'}
                  </td>
                  {isInvestor && (
                    <td className="px-4 py-3 text-center font-mono text-emerald-400 whitespace-nowrap">
                      {item.profitSaham > 0 ? formatRupiah(item.profitSaham) : '-'}
                    </td>
                  )}
                  {isInvestor && (
                    <td className="px-4 py-3 text-center font-mono text-amber-400 whitespace-nowrap">
                      {item.lossSaham > 0 ? formatRupiah(item.lossSaham) : '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center font-mono text-blue-300 whitespace-nowrap">
                    {formatRupiah(item.duitDibawa)}
                  </td>
                  {isInvestor && (
                    <td className="px-4 py-3 text-center font-mono text-purple-300 whitespace-nowrap">
                      {formatRupiah(item.duitSaham)}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                        title="Edit Catatan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Table Footer Totals */}
          {sorted.length > 0 && (
            <tfoot className="bg-slate-950 font-bold text-xs uppercase tracking-wider text-slate-200 border-t-2 border-slate-800">
              <tr>
                <td colSpan="3" className="px-4 py-4 text-center text-emerald-400">
                  TOTAL AKUMULASI:
                </td>
                <td className="px-4 py-4 text-center font-mono text-emerald-400 text-sm">
                  {totals.pemasukan > 0 ? formatRupiah(totals.pemasukan) : '-'}
                </td>
                <td className="px-4 py-4 text-center font-mono text-red-400 text-sm">
                  {totals.pengeluaran > 0 ? formatRupiah(totals.pengeluaran) : '-'}
                </td>
                {isInvestor && (
                  <td className="px-4 py-4 text-center font-mono text-emerald-400 text-sm">
                    {totals.profitSaham > 0 ? formatRupiah(totals.profitSaham) : '-'}
                  </td>
                )}
                {isInvestor && (
                  <td className="px-4 py-4 text-center font-mono text-amber-400 text-sm">
                    {totals.lossSaham > 0 ? formatRupiah(totals.lossSaham) : '-'}
                  </td>
                )}
                <td colSpan={isInvestor ? 3 : 2} className="px-4 py-4 text-center text-slate-500 font-normal italic">
                  *Total terhitung sesuai filter tabel
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
