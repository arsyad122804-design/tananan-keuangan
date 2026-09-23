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
  DollarSign,
  ShoppingBag
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
import MonthlyNeedTracker from './components/MonthlyNeedTracker';
import MonthlyNeedModal from './components/MonthlyNeedModal';
import DatabaseConfigModal from './components/DatabaseConfigModal';
import AuthScreen from './components/AuthScreen';
import { exportToExcel } from './utils/excelExport';
import { exportToWord } from './utils/wordExport';
import { getTodayISOString, formatRupiah } from './utils/formatters';
import { Database, LogOut, Crown, User, ShieldCheck } from 'lucide-react';
import {
  getSupabaseConfig,
  fetchAllFromSupabase,
  syncItemToSupabase,
  testSupabaseConnection,
  getCurrentSession,
  setCurrentSession,
  DEFAULT_MASTER_USER
} from './lib/supabaseClient';

// Initial empty state
const INITIAL_MONTHLY_NEEDS = [];
const INITIAL_DREAMS = [];
const INITIAL_TRANSACTIONS = [];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [dreams, setDreams] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_dreams');
    return saved ? JSON.parse(saved) : INITIAL_DREAMS;
  });

  const [monthlyNeeds, setMonthlyNeeds] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_monthly_needs');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_NEEDS;
  });

  const [activeTab, setActiveTab] = useState('CATATAN'); // 'CATATAN' | 'KEBUTUHAN' | 'IMPIAN'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState('LOCAL'); // 'LOCAL' | 'CONNECTED' | 'CONNECTING' | 'ERROR'
  const [editingItem, setEditingItem] = useState(null);
  const [editingDream, setEditingDream] = useState(null);
  const [editingNeed, setEditingNeed] = useState(null);
  const [exportMessage, setExportMessage] = useState('');

  const { triggerInstall, isInstalled, canPrompt } = useInstallPWA();

  const handleOpenInstall = () => {
    setIsInstallModalOpen(true);
    triggerInstall();
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      setCurrentSession(null);
      setCurrentUser(null);
    }
  };

  // Check Supabase connection and initial sync on mount
  useEffect(() => {
    const initDatabase = async () => {
      const config = getSupabaseConfig();
      if (config.url && config.anonKey) {
        setDbStatus('CONNECTING');
        const testRes = await testSupabaseConnection();
        if (testRes.success) {
          setDbStatus('CONNECTED');
          try {
            const cloudData = await fetchAllFromSupabase();
            if (cloudData) {
              setTransactions(cloudData.transactions || []);
              setDreams(cloudData.dreams || []);
              setMonthlyNeeds(cloudData.monthlyNeeds || []);
            }
          } catch (e) {
            console.error('Failed to load cloud data on startup:', e);
          }
        } else {
          setDbStatus('ERROR');
        }
      } else {
        setDbStatus('LOCAL');
      }
    };
    initDatabase();
  }, []);

  // Persist transactions to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('tatanan_uang_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Persist dreams to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('tatanan_uang_dreams', JSON.stringify(dreams));
  }, [dreams]);

  // Persist monthly needs to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('tatanan_uang_monthly_needs', JSON.stringify(monthlyNeeds));
  }, [monthlyNeeds]);

  // Monthly Needs Handlers
  const handleToggleNeedPaid = (id) => {
    const targetNeed = monthlyNeeds.find((n) => n.id === id);
    if (!targetNeed) return;

    if (!targetNeed.isPaid) {
      const needed = Number(targetNeed.nominal) || 0;
      const currentPaid = monthlyNeeds.filter((n) => n.isPaid).reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);
      const completedDreams = dreams.filter((d) => d.isCompleted).reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);
      const availableFunds = Math.max(0, totalKekayaan - currentPaid - completedDreams);

      if (availableFunds < needed) {
        showTemporaryToast(`Dana belum mencukupi! Kurang ${formatRupiah(needed - availableFunds)}`);
        return;
      }
    }

    setMonthlyNeeds((prev) => {
      const updatedList = prev.map((n) => (n.id === id ? { ...n, isPaid: !n.isPaid } : n));
      const target = updatedList.find((n) => n.id === id);
      if (target) syncItemToSupabase('monthly_needs', target);
      return updatedList;
    });
    showTemporaryToast(targetNeed.isPaid ? 'Ceklis Kebutuhan Dibatalkan!' : 'Kebutuhan Berhasil Dicentang Terbayar! 🛍️');
  };

  const handleSaveNeed = (formData) => {
    if (editingNeed) {
      const updated = { ...editingNeed, ...formData };
      setMonthlyNeeds((prev) =>
        prev.map((n) => (n.id === editingNeed.id ? updated : n))
      );
      syncItemToSupabase('monthly_needs', updated);
      setEditingNeed(null);
      showTemporaryToast('Kebutuhan Bulanan Berhasil Diperbarui! ✅');
    } else {
      const newNeed = {
        id: 'n_' + Date.now().toString(),
        ...formData
      };
      setMonthlyNeeds((prev) => [...prev, newNeed]);
      syncItemToSupabase('monthly_needs', newNeed);
      showTemporaryToast('Kebutuhan Bulanan Baru Ditambahkan! 🎯');
    }
  };

  const handleEditNeed = (item) => {
    setEditingNeed(item);
    setIsNeedModalOpen(true);
  };

  const handleDeleteNeed = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pos kebutuhan bulanan ini?')) {
      setMonthlyNeeds((prev) => prev.filter((n) => n.id !== id));
      syncItemToSupabase('monthly_needs', id, 'delete');
      showTemporaryToast('Kebutuhan Bulanan Dihapus');
    }
  };

  const handleMoveNeedUp = (index) => {
    if (index <= 0) return;
    setMonthlyNeeds((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveNeedDown = (index) => {
    setMonthlyNeeds((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleResetAllNeedsUnpaid = () => {
    if (window.confirm('Reset semua status kebutuhan menjadi Belum Bayar untuk memulai bulan/gajian baru?')) {
      setMonthlyNeeds((prev) => {
        const updated = prev.map((n) => ({ ...n, isPaid: false }));
        updated.forEach((n) => syncItemToSupabase('monthly_needs', n));
        return updated;
      });
      showTemporaryToast('Semua Kebutuhan Direset untuk Bulan Baru! 🔄');
    }
  };

  const handleCheckAllAffordableNeeds = () => {
    const unpaid = monthlyNeeds.filter((n) => !n.isPaid);
    if (unpaid.length === 0) {
      showTemporaryToast('Semua kebutuhan sudah lunas terbayar! ✅');
      return;
    }

    const currentPaid = monthlyNeeds.filter((n) => n.isPaid).reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);
    const completedDreams = dreams.filter((d) => d.isCompleted).reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);
    let available = Math.max(0, totalKekayaan - currentPaid - completedDreams);

    if (available <= 0) {
      alert(`Dana tidak mencukupi! Sisa dana Anda saat ini Rp 0. Silakan tambah pemasukan/saldo atau batalkan ceklis pos lain.`);
      return;
    }

    let newlyCheckedCount = 0;
    setMonthlyNeeds((prev) => {
      let pool = available;
      return prev.map((item) => {
        if (item.isPaid) return item;
        const nominal = Number(item.nominal) || 0;
        if (pool >= nominal) {
          pool -= nominal;
          newlyCheckedCount++;
          const paidItem = { ...item, isPaid: true };
          syncItemToSupabase('monthly_needs', paidItem);
          return paidItem;
        }
        return item;
      });
    });

    if (newlyCheckedCount === unpaid.length) {
      showTemporaryToast('Semua kebutuhan bulanan berhasil diceklis lunas! 🎉');
    } else if (newlyCheckedCount > 0) {
      showTemporaryToast(`${newlyCheckedCount} kebutuhan berhasil diceklis sesuai sisa dana yang pas! 🛍️`);
    } else {
      alert(`Sisa dana Anda (${formatRupiah(available)}) belum mencukupi untuk nominal pos kebutuhan yang tersisa.`);
    }
  };

  // Dream Handlers
  const handleToggleDreamComplete = (id) => {
    setDreams((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextCompleted = !d.isCompleted;
          const targetNum = Number(d.targetBiaya) || 0;
          const updatedDream = {
            ...d,
            isCompleted: nextCompleted,
            terkumpul: nextCompleted ? Math.max(Number(d.terkumpul) || 0, targetNum) : d.terkumpul
          };
          syncItemToSupabase('dreams', updatedDream);
          return updatedDream;
        }
        return d;
      })
    );
    showTemporaryToast('Status Target Impian Berhasil Diperbarui! 🎉');
  };

  const handleSaveDream = (formData) => {
    if (editingDream) {
      const updated = { ...editingDream, ...formData };
      setDreams((prev) =>
        prev.map((d) => (d.id === editingDream.id ? updated : d))
      );
      syncItemToSupabase('dreams', updated);
      setEditingDream(null);
    } else {
      const newDream = {
        id: 'd_' + Date.now().toString(),
        isCompleted: false,
        ...formData
      };
      setDreams((prev) => [...prev, newDream]);
      syncItemToSupabase('dreams', newDream);
    }
  };

  const handleEditDream = (item) => {
    setEditingDream(item);
    setIsDreamModalOpen(true);
  };

  const handleDeleteDream = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus target impian ini?')) {
      setDreams((prev) => prev.filter((d) => d.id !== id));
      syncItemToSupabase('dreams', id, 'delete');
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

  // Latest balance lookup from the latest transaction snapshot
  const latestItem = transactions.length > 0 ? transactions[0] : null;

  const currentDuitDibawa = latestItem && latestItem.duitDibawa !== undefined ? Number(latestItem.duitDibawa) || 0 : 0;
  const currentDuitSaham = latestItem && latestItem.duitSaham !== undefined ? Number(latestItem.duitSaham) || 0 : 0;
  const totalKekayaan = currentDuitDibawa + (isInvestor ? currentDuitSaham : 0);

  // Calculate monthly needs totals
  const totalKebutuhanNominal = monthlyNeeds.reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);
  const totalKebutuhanTerbayar = monthlyNeeds
    .filter((n) => n.isPaid)
    .reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);
  const totalKebutuhanSisa = monthlyNeeds
    .filter((n) => !n.isPaid)
    .reduce((sum, n) => sum + (Number(n.nominal) || 0), 0);

  // Calculate dream totals (active vs completed) considering paid monthly needs
  const totalDreamTarget = dreams.reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);
  const completedTargetSum = dreams.filter((d) => d.isCompleted).reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);
  const activeTargetSum = dreams.filter((d) => !d.isCompleted).reduce((sum, d) => sum + (Number(d.targetBiaya) || 0), 0);

  // Remaining wealth available for active dreams is reduced by completed dreams & paid monthly needs
  const remainingWealthForActive = Math.max(0, totalKekayaan - completedTargetSum - totalKebutuhanTerbayar);
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
      const updated = { ...editingItem, ...cleanForm };
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingItem.id ? updated : t))
      );
      syncItemToSupabase('transactions', updated);
      setEditingItem(null);
    } else {
      const newItem = {
        id: Date.now().toString(),
        ...cleanForm
      };
      setTransactions((prev) => [newItem, ...prev]);
      syncItemToSupabase('transactions', newItem);

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

            // Sync updated dreams to Supabase
            updated.forEach((d) => syncItemToSupabase('dreams', d));
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
      syncItemToSupabase('transactions', id, 'delete');
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

  const handleSyncCloudData = async () => {
    setDbStatus('CONNECTING');
    const testRes = await testSupabaseConnection();
    if (testRes.success) {
      setDbStatus('CONNECTED');
      try {
        const cloudData = await fetchAllFromSupabase();
        if (cloudData) {
          if (cloudData.transactions && cloudData.transactions.length > 0) {
            setTransactions(cloudData.transactions);
          }
          if (cloudData.dreams && cloudData.dreams.length > 0) {
            setDreams(cloudData.dreams);
          }
          if (cloudData.monthlyNeeds && cloudData.monthlyNeeds.length > 0) {
            setMonthlyNeeds(cloudData.monthlyNeeds);
          }
          showTemporaryToast('Data berhasil disinkronkan dari Cloud Supabase! ☁️');
        }
      } catch (err) {
        console.error('Error syncing:', err);
        showTemporaryToast('Gagal memuat data dari Supabase');
      }
    } else {
      setDbStatus(getSupabaseConfig().url ? 'ERROR' : 'LOCAL');
    }
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
    if (index >= prev.length - 1) return prev;
    setDreams((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    showTemporaryToast('Prioritas Impian Berhasil Diturunkan! ⬇️');
  };

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const isInvestor = Boolean(currentUser.isInvestor);
  const isMasterAdmin = currentUser.username === 'fikri' || currentUser.isAdmin;

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
        <div className="space-y-5">
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

          {/* User Profile Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">
                {isMasterAdmin ? (
                  <Crown className="w-4 h-4 text-amber-400" />
                ) : (
                  <User className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white truncate block">
                  {currentUser.namaLengkap || currentUser.username}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5 ${
                  isMasterAdmin
                    ? 'bg-amber-500/20 text-amber-300'
                    : isInvestor
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {isMasterAdmin ? '👑 Master Admin' : isInvestor ? '📈 Investor' : '💵 Reguler'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Vertical Navigation Tabs (Pill Navbar Pinggir) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Menu Navigasi
            </span>

            {/* Tab Catatan & Saham (atau Catatan Kas untuk Non-Investor) */}
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
                <span>{isInvestor ? 'Catatan & Saham' : 'Catatan Kas'}</span>
              </div>
            </button>

            {/* Tab Kebutuhan Bulanan */}
            <button
              onClick={() => setActiveTab('KEBUTUHAN')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-between gap-3 text-left ${
                activeTab === 'KEBUTUHAN'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Kebutuhan Bulanan</span>
              </div>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono text-cyan-300 whitespace-nowrap shrink-0 inline-flex items-center">
                {monthlyNeeds.filter((n) => n.isPaid).length}/{monthlyNeeds.length}
              </span>
            </button>

            {/* Tab Target Impian */}
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
                <span>Target Impian</span>
              </div>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono text-amber-300 whitespace-nowrap shrink-0 inline-flex items-center">
                {dreams.filter((d) => d.isCompleted).length}/{dreams.length}
              </span>
            </button>
          </div>

          {/* Quick Action Center */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Tindakan Cepat
            </span>

            {/* Supabase Database Cloud Button - KHUSUS MASTER AKUN FIKRI */}
            {isMasterAdmin && (
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 transition group hover:border-slate-600"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                  <span>Database Cloud</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono">
                  {dbStatus === 'CONNECTED' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online
                    </span>
                  ) : dbStatus === 'CONNECTING' ? (
                    <span className="text-amber-400 animate-pulse">Konek...</span>
                  ) : dbStatus === 'ERROR' ? (
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      Error
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      Lokal
                    </span>
                  )}
                </span>
              </button>
            )}

            {/* PWA Download Button (Full Width) */}
            <InstallPWA triggerInstall={handleOpenInstall} isInstalled={isInstalled} variant="sidebar" />
          </div>
        </div>

        {/* Sidebar Footer Widget */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400 block font-sans text-[10px]">
              {isInvestor ? 'Total Kekayaan Saat Ini' : 'Total Saldo Kas'}
            </span>
            <span className="text-emerald-400 font-bold text-sm block">
              {(isInvestor ? (currentDuitDibawa + currentDuitSaham) : currentDuitDibawa).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 pt-2 text-center">© 2026 Tatanan Uang</p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Offset by lg:pl-72 for Laptop Sidebar) */}
      <main className="flex-1 lg:pl-72 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Header Top Bar (Brand, User Info & Database Status) */}
        <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <TrendingUp className="w-4 h-4 font-extrabold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-white leading-none truncate">TATANAN UANG</h1>
                {isMasterAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </div>
              <span className="text-[9px] text-emerald-400 font-medium truncate block mt-0.5">
                {currentUser.namaLengkap || currentUser.username} ({isInvestor ? 'Investor' : 'Reguler'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Database Cloud Status Pill for Mobile - KHUSUS FIKRI */}
            {isMasterAdmin && (
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:border-slate-700 transition"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                {dbStatus === 'CONNECTED' ? (
                  <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Cloud
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">Cloud DB</span>
                )}
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg bg-slate-900 border border-slate-800 transition"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'CATATAN' && (
          /* LAYER 1: Catatan Keuangan, Jam & Stat Cards */
          <div className="space-y-6">
            <LiveClock />
            <StatCards summary={fullSummary} isInvestor={isInvestor} />
            <TransactionTable
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddNew={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              isInvestor={isInvestor}
            />
          </div>
        )}

        {activeTab === 'KEBUTUHAN' && (
          /* LAYER 3: Kebutuhan Bulanan & Pos Rutin Gajian */
          <div className="space-y-6">
            <MonthlyNeedTracker
              monthlyNeeds={monthlyNeeds}
              totalKekayaan={totalKekayaan}
              currentDuitDibawa={currentDuitDibawa}
              currentDuitSaham={currentDuitSaham}
              completedDreamsTarget={completedTargetSum}
              onTogglePaid={handleToggleNeedPaid}
              onEdit={handleEditNeed}
              onDelete={handleDeleteNeed}
              onAddNew={() => {
                setEditingNeed(null);
                setIsNeedModalOpen(true);
              }}
              onMoveUp={handleMoveNeedUp}
              onMoveDown={handleMoveNeedDown}
              onResetAllUnpaid={handleResetAllNeedsUnpaid}
              onCheckAllAffordable={handleCheckAllAffordableNeeds}
            />
          </div>
        )}

        {activeTab === 'IMPIAN' && (
          /* LAYER 2: Target Impian & Goal Tracker (Waterfall Total Kekayaan) */
          <div className="space-y-6">
            <DreamTracker
              dreams={dreams}
              totalKekayaan={totalKekayaan}
              currentDuitDibawa={currentDuitDibawa}
              currentDuitSaham={currentDuitSaham}
              totalKebutuhanTerbayar={totalKebutuhanTerbayar}
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
        isInvestor={isInvestor}
      />

      {/* Monthly Need Modal (Add / Edit Kebutuhan Bulanan) */}
      <MonthlyNeedModal
        isOpen={isNeedModalOpen}
        onClose={() => {
          setIsNeedModalOpen(false);
          setEditingNeed(null);
        }}
        onSave={handleSaveNeed}
        initialData={editingNeed}
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

      {/* Database Cloud Configuration Modal - KHUSUS FIKRI */}
      {isMasterAdmin && (
        <DatabaseConfigModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          onConfigSaved={() => {
            showTemporaryToast('Konfigurasi database disimpan!');
          }}
          onSyncNow={handleSyncCloudData}
          dbStatus={dbStatus}
        />
      )}

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
          if (activeTab === 'KEBUTUHAN') {
            setEditingNeed(null);
            setIsNeedModalOpen(true);
          } else if (activeTab === 'IMPIAN') {
            setEditingDream(null);
            setIsDreamModalOpen(true);
          } else {
            setEditingItem(null);
            setIsModalOpen(true);
          }
        }}
        onExportExcel={handleExportExcel}
        onOpenInstall={handleOpenInstall}
      />
    </div>
  );
}
