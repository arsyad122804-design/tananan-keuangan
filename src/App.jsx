import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  PlusCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Wallet,
  PieChart,
  DollarSign
} from 'lucide-react';
import LiveClock from './components/LiveClock';
import StatCards from './components/StatCards';
import TransactionTable from './components/TransactionTable';
import TransactionModal from './components/TransactionModal';
import InstallPWA, { useInstallPWA } from './components/InstallPWA';
import InstallModal from './components/InstallModal';
import MobileBottomNav from './components/MobileBottomNav';
import DreamTracker from './components/DreamTracker';
import DreamModal from './components/DreamModal';
import { exportToExcel } from './utils/excelExport';
import { exportToWord } from './utils/wordExport';
import { getTodayISOString } from './utils/formatters';

// Initial sample dreams for demonstration
const INITIAL_DREAMS = [
  {
    id: 'd1',
    namaImpian: 'Beli Rumah Minimalis Idaman',
    targetBiaya: 350000000,
    terkumpul: 85000000,
    jangkaNilai: 3,
    jangkaSatuan: 'tahun',
    isCompleted: false,
    keterangan: 'Alokasi dari profit saham & tabungan harian'
  },
  {
    id: 'd2',
    namaImpian: 'Dana Darurat Keuangan (6 Bulan)',
    targetBiaya: 50000000,
    terkumpul: 50000000,
    jangkaNilai: 12,
    jangkaSatuan: 'bulan',
    isCompleted: true,
    keterangan: 'Tersimpan aman di reksadana pasar uang'
  },
  {
    id: 'd3',
    namaImpian: 'Modal Usaha Sampingan & Franchise',
    targetBiaya: 25000000,
    terkumpul: 12000000,
    jangkaNilai: 6,
    jangkaSatuan: 'bulan',
    isCompleted: false,
    keterangan: 'Persiapan bisnis kuliner'
  }
];

// Initial sample data for demonstration
const INITIAL_TRANSACTIONS = [
  {
    id: '1',
    tanggal: getTodayISOString(),
    kebutuhan: 'Gaji Bulanan & Profit Trading BBCA',
    pemasukan: 12500000,
    pengeluaran: 0,
    profitSaham: 1850000,
    lossSaham: 0,
    duitDibawa: 8500000,
    duitSaham: 25000000
  },
  {
    id: '2',
    tanggal: getTodayISOString(),
    kebutuhan: 'Belanja Kebutuhan Pokok & Uang Makan',
    pemasukan: 0,
    pengeluaran: 650000,
    profitSaham: 0,
    lossSaham: 0,
    duitDibawa: 7850000,
    duitSaham: 25000000
  },
  {
    id: '3',
    tanggal: getTodayISOString(),
    kebutuhan: 'Cut loss Saham GOTO & Beli Saham TLKM',
    pemasukan: 0,
    pengeluaran: 0,
    profitSaham: 0,
    lossSaham: 320000,
    duitDibawa: 7850000,
    duitSaham: 24680000
  }
];

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [dreams, setDreams] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_dreams');
    return saved ? JSON.parse(saved) : INITIAL_DREAMS;
  });

  const [activeTab, setActiveTab] = useState('CATATAN'); // 'CATATAN' | 'IMPIAN'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingDream, setEditingDream] = useState(null);
  const [exportMessage, setExportMessage] = useState('');

  const { triggerInstall, isInstalled, canPrompt } = useInstallPWA();

  const handleOpenInstall = () => {
    setIsInstallModalOpen(true);
    triggerInstall();
  };

  // Persist transactions to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('tatanan_uang_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Persist dreams to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('tatanan_uang_dreams', JSON.stringify(dreams));
  }, [dreams]);

  // Dream Handlers
  const handleToggleDreamComplete = (id) => {
    setDreams((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextCompleted = !d.isCompleted;
          const targetNum = Number(d.targetBiaya) || 0;
          return {
            ...d,
            isCompleted: nextCompleted,
            terkumpul: nextCompleted ? Math.max(Number(d.terkumpul) || 0, targetNum) : d.terkumpul
          };
        }
        return d;
      })
    );
    showTemporaryToast('Status Target Impian Berhasil Diperbarui! 🎉');
  };

  const handleSaveDream = (formData) => {
    if (editingDream) {
      setDreams((prev) =>
        prev.map((d) => (d.id === editingDream.id ? { ...d, ...formData } : d))
      );
      setEditingDream(null);
    } else {
      const newDream = {
        id: 'd_' + Date.now().toString(),
        isCompleted: false,
        ...formData
      };
      setDreams((prev) => [newDream, ...prev]);
    }
  };

  const handleEditDream = (item) => {
    setEditingDream(item);
    setIsDreamModalOpen(true);
  };

  const handleDeleteDream = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus target impian ini?')) {
      setDreams((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // Calculate live summary statistics
  const summary = transactions.reduce(
    (acc, curr) => ({
      totalPemasukan: acc.totalPemasukan + (Number(curr.pemasukan) || 0),
      totalPengeluaran: acc.totalPengeluaran + (Number(curr.pengeluaran) || 0),
      totalProfitSaham: acc.totalProfitSaham + (Number(curr.profitSaham) || 0),
      totalLossSaham: acc.totalLossSaham + (Number(curr.lossSaham) || 0),
    }),
    { totalPemasukan: 0, totalPengeluaran: 0, totalProfitSaham: 0, totalLossSaham: 0 }
  );

  // Latest balance lookup (safely retrieve latest non-zero cash & stock)
  const latestItemWithCash = transactions.find((t) => Number(t.duitDibawa) > 0) || transactions[0];
  const latestItemWithSaham = transactions.find((t) => Number(t.duitSaham) > 0) || transactions[0];

  const currentDuitDibawa = latestItemWithCash ? Number(latestItemWithCash.duitDibawa) || 0 : 0;
  const currentDuitSaham = latestItemWithSaham ? Number(latestItemWithSaham.duitSaham) || 0 : 0;
  const totalKekayaan = currentDuitDibawa + currentDuitSaham;

  // Calculate dream totals (active vs completed)
  const totalDreamTarget = dreams.reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);
  const completedTargetSum = dreams.filter((d) => d.isCompleted).reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);
  const activeTargetSum = dreams.filter((d) => !d.isCompleted).reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);
  const remainingWealthForActive = Math.max(0, totalKekayaan - completedTargetSum);
  const activeDreamTerkumpul = Math.min(remainingWealthForActive, activeTargetSum);
  const totalDreamTerkumpul = Math.min(totalKekayaan, completedTargetSum + activeDreamTerkumpul);

  const fullSummary = {
    ...summary,
    duitDibawa: currentDuitDibawa,
    duitSaham: currentDuitSaham,
    totalKekayaan,
    totalDreamTarget,
    totalDreamTerkumpul
  };

  // Add / Edit handler for transactions (with automatic overflow cascade for dreams)
  const handleSaveTransaction = (formData) => {
    const { allocatedDreamId, ...cleanForm } = formData;

    if (editingItem) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingItem.id ? { ...t, ...cleanForm } : t))
      );
      setEditingItem(null);
    } else {
      const newItem = {
        id: Date.now().toString(),
        ...cleanForm
      };
      setTransactions((prev) => [newItem, ...prev]);

      // Automatically add Pemasukan to allocated dream (with overflow cascade to remaining active dreams)
      if (allocatedDreamId && Number(cleanForm.pemasukan) > 0) {
        let remainingIncome = Number(cleanForm.pemasukan);

        setDreams((prev) => {
          let updated = prev.map((d) => ({ ...d }));
          const targetIdx = updated.findIndex((d) => d.id === allocatedDreamId);

          if (targetIdx !== -1) {
            // Fill starting from targetIdx and cascade excess to remaining uncompleted goals
            for (let i = targetIdx; i < updated.length && remainingIncome > 0; i++) {
              if (updated[i].isCompleted) continue;

              const targetBiaya = Number(updated[i].targetBiaya) || 0;
              const currentTerkumpul = Number(updated[i].terkumpul) || 0;
              const needed = Math.max(0, targetBiaya - currentTerkumpul);

              if (needed <= 0) {
                updated[i].isCompleted = true;
                updated[i].terkumpul = targetBiaya;
                continue;
              }

              if (remainingIncome >= needed) {
                remainingIncome -= needed;
                updated[i].terkumpul = targetBiaya;
                updated[i].isCompleted = true;
              } else {
                updated[i].terkumpul = currentTerkumpul + remainingIncome;
                remainingIncome = 0;
              }
            }

            // If still remaining income, cascade to earlier uncompleted goals if any
            if (remainingIncome > 0) {
              for (let i = 0; i < targetIdx && remainingIncome > 0; i++) {
                if (updated[i].isCompleted) continue;

                const targetBiaya = Number(updated[i].targetBiaya) || 0;
                const currentTerkumpul = Number(updated[i].terkumpul) || 0;
                const needed = Math.max(0, targetBiaya - currentTerkumpul);

                if (needed <= 0) {
                  updated[i].isCompleted = true;
                  updated[i].terkumpul = targetBiaya;
                  continue;
                }

                if (remainingIncome >= needed) {
                  remainingIncome -= needed;
                  updated[i].terkumpul = targetBiaya;
                  updated[i].isCompleted = true;
                } else {
                  updated[i].terkumpul = currentTerkumpul + remainingIncome;
                  remainingIncome = 0;
                }
              }
            }
          }
          return updated;
        });
        showTemporaryToast('Pemasukan dialokasikan & sisa otomatis bergulir ke impian sisanya! 🎯');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset data ke contoh awal?')) {
      setTransactions(INITIAL_TRANSACTIONS);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    try {
      exportToExcel(transactions, fullSummary);
      showTemporaryToast('File Excel (.xlsx) berhasil diunduh!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh file Excel');
    }
  };

  const handleExportWord = async () => {
    try {
      await exportToWord(transactions, fullSummary);
      showTemporaryToast('File Word (.docx) berhasil diunduh!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh file Word');
    }
  };

  const showTemporaryToast = (msg) => {
    setExportMessage(msg);
    setTimeout(() => setExportMessage(''), 4000);
  };

  const handleMoveDreamUp = (index) => {
    if (index <= 0) return;
    setDreams((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    showTemporaryToast('Prioritas Impian Berhasil Dinaikkan! ⬆️');
  };

  const handleMoveDreamDown = (index) => {
    setDreams((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    showTemporaryToast('Prioritas Impian Berhasil Diturunkan! ⬇️');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500">
      {/* Toast Notification */}
      {exportMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* 1. DESKTOP / LAPTOP LEFT SIDEBAR NAVBAR (Pinggir) */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl z-40 flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 font-extrabold" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">
                TATANAN UANG
              </h1>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block mt-1">
                Dashboard Keuangan
              </span>
            </div>
          </div>

          {/* Vertical Navigation Tabs (Pill Navbar Pinggir) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Menu Navigasi
            </span>

            {/* Layer 1 Tab */}
            <button
              onClick={() => setActiveTab('CATATAN')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-between gap-3 text-left ${
                activeTab === 'CATATAN'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 shrink-0" />
                <span>Layer 1: Catatan & Saham</span>
              </div>
            </button>

            {/* Layer 2 Tab */}
            <button
              onClick={() => setActiveTab('IMPIAN')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-between gap-3 text-left ${
                activeTab === 'IMPIAN'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PieChart className="w-4 h-4 shrink-0" />
                <span>Layer 2: Target Impian</span>
              </div>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono text-amber-300">
                {dreams.filter((d) => d.isCompleted).length}/{dreams.length}
              </span>
            </button>
          </div>

          {/* Quick Action Center */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Tindakan Cepat
            </span>

            {/* PWA Download Button (Full Width) */}
            <InstallPWA triggerInstall={handleOpenInstall} isInstalled={isInstalled} variant="sidebar" />
          </div>
        </div>

        {/* Sidebar Footer Widget */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400 block font-sans text-[10px]">Total Kekayaan Saat Ini</span>
            <span className="text-emerald-400 font-bold text-sm block">
              {(currentDuitDibawa + currentDuitSaham).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 pt-2 text-center">© 2026 Tatanan Uang</p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Offset by lg:pl-72 for Laptop Sidebar) */}
      <main className="flex-1 lg:pl-72 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'CATATAN' ? (
          /* LAYER 1: Catatan Keuangan, Jam & Stat Cards */
          <div className="space-y-6">
            <LiveClock />
            <StatCards summary={fullSummary} />
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddNew={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        ) : (
          /* LAYER 2: Target Impian & Goal Tracker (Waterfall Total Kekayaan) */
          <div className="space-y-6">
            <DreamTracker
              dreams={dreams}
              totalKekayaan={totalKekayaan}
              currentDuitDibawa={currentDuitDibawa}
              currentDuitSaham={currentDuitSaham}
              onToggleComplete={handleToggleDreamComplete}
              onEdit={handleEditDream}
              onDelete={handleDeleteDream}
              onAddNew={() => {
                setEditingDream(null);
                setIsDreamModalOpen(true);
              }}
              onMoveUp={handleMoveDreamUp}
              onMoveDown={handleMoveDreamDown}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="lg:pl-72 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Tatanan Uang Dashboard — Sistem Keuangan & Laporan Saham Otomatis</p>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingItem}
        dreams={dreams}
        currentBalances={{
          duitDibawa: currentDuitDibawa,
          duitSaham: currentDuitSaham
        }}
      />

      {/* Dream Modal (Add / Edit Target Impian) */}
      <DreamModal
        isOpen={isDreamModalOpen}
        onClose={() => {
          setIsDreamModalOpen(false);
          setEditingDream(null);
        }}
        onSave={handleSaveDream}
        initialData={editingDream}
      />

      {/* Download & Install Center Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onPWAInstall={triggerInstall}
        canPrompt={canPrompt}
      />

      {/* Mobile Bottom Navigation Bar (UI/UX HP) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddNew={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        onAddNewDream={() => {
          setEditingDream(null);
          setIsDreamModalOpen(true);
        }}
        onExportExcel={handleExportExcel}
        onOpenInstall={handleOpenInstall}
      />
    </div>
  );
}
