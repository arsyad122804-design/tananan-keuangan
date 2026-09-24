import * as XLSX from 'xlsx';
import { formatDateFull, formatRupiah } from './formatters';

export const exportToExcel = (transactions, summary) => {
  // Build header & summary data
  const data = [
    ['LAPORAN TATANAN UANG & PORTOFOLIO SAHAM'],
    [`Tanggal Cetak: ${formatDateFull(new Date())}`],
    [''],
    ['RINGKASAN KEUANGAN & PORTOFOLIO'],
    ['Kategori', 'Nilai (Rp)'],
    ['Total Duit yang Dibawa (Cash)', summary.duitDibawa],
    ['Total Portofolio (Saham)', summary.duitSaham],
    ['TOTAL KEKAYAAN ASET', summary.totalKekayaan],
    ['Total Pemasukan', summary.totalPemasukan],
    ['Total Pengeluaran', summary.totalPengeluaran],
    ['Total Profit Saham (Gain)', summary.totalProfitSaham],
    ['Total Loss Saham (Loss)', summary.totalLossSaham],
    ['NET PROFIT/LOSS SAHAM', summary.totalProfitSaham - summary.totalLossSaham],
    [''],
    ['RINCIAN CATATAN TRANSAKSI HARI/TANGGAL/TAHUN & SAHAM'],
    [
      'No',
      'Hari & Tanggal',
      'Isi Kebutuhan / Keterangan',
      'Pemasukan (Rp)',
      'Pengeluaran (Rp)',
      'Profit Saham (Rp)',
      'Loss Saham (Rp)',
      'Duit Dibawa (Rp)',
      'Portofolio (Rp)'
    ]
  ];

  // Append transaction rows
  transactions.forEach((item, index) => {
    data.push([
      index + 1,
      formatDateFull(item.tanggal),
      item.kebutuhan,
      item.pemasukan || 0,
      item.pengeluaran || 0,
      item.profitSaham || 0,
      item.lossSaham || 0,
      item.duitDibawa || 0,
      item.duitSaham || 0
    ]);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set Column Widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 25 }, // Tanggal
    { wch: 35 }, // Kebutuhan
    { wch: 18 }, // Pemasukan
    { wch: 18 }, // Pengeluaran
    { wch: 18 }, // Profit Saham
    { wch: 18 }, // Loss Saham
    { wch: 20 }, // Duit Dibawa
    { wch: 20 }  // Duit Saham
  ];

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');

  // Trigger download file
  const fileName = `Laporan_Tatanan_Uang_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
