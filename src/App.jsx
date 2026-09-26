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
  ShoppingBag,
  CreditCard,
  Download
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
import InvestmentTracker from './components/InvestmentTracker';
import InvestmentModal from './components/InvestmentModal';
import DebtTracker from './components/DebtTracker';
import DebtModal from './components/DebtModal';
import DatabaseConfigModal from './components/DatabaseConfigModal';
import AuthScreen from './components/AuthScreen';
import { exportToExcel } from './utils/excelExport';
import { exportToWord } from './utils/wordExport';
import { getTodayISOString, formatRupiah } from './utils/formatters';
import { Database, LogOut, Crown, User, ShieldCheck } from 'lucide-react';
import {
  getSupabaseConfig,
  getSupabaseClient,
  fetchAllFromSupabase,
  syncItemToSupabase,
  testSupabaseConnection,
  getCurrentSession,
  setCurrentSession,
  DEFAULT_MASTER_USER,
  getDeletedIds,
  addDeletedId,
  removeDeletedId,
  clearDeletedIds
} from './lib/supabaseClient';

// Initial default data
const INITIAL_MONTHLY_NEEDS = [];
const INITIAL_DREAMS = [];
const INITIAL_TRANSACTIONS = [];
const INITIAL_DEBTS = [];
const INITIAL_INVESTMENTS = [];

export const sortTransactionsDesc = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const dateA = new Date(a.tanggal).getTime();
    const dateB = new Date(b.tanggal).getTime();
    if (dateA !== dateB) return dateB - dateA;
    const timeA = Number(a.id) || 0;
    const timeB = Number(b.id) || 0;
    return timeB - timeA;
  });
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());

  const isInvestor = currentUser ? Boolean(currentUser.isInvestor) : true;
  const isMasterAdmin = currentUser ? (currentUser.username === 'fikri' || currentUser.isAdmin) : false;

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_transactions');
    return saved ? sortTransactionsDesc(JSON.parse(saved)) : INITIAL_TRANSACTIONS;
  });

  const [dreams, setDreams] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_dreams');
    return saved ? JSON.parse(saved) : INITIAL_DREAMS;
  });

  const [monthlyNeeds, setMonthlyNeeds] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_monthly_needs');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_NEEDS;
  });

  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_debts');
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [investments, setInvestments] = useState(() => {
    const saved = localStorage.getItem('tatanan_uang_investments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INVESTMENTS;
  });

  const [activeTab, setActiveTab] = useState('CATATAN'); // 'CATATAN' | 'INVESTASI' | 'KEBUTUHAN' | 'IMPIAN' | 'UTANG'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentModalMode, setInvestmentModalMode] = useState('NEW'); // 'NEW' | 'EDIT' | 'REALIZE'
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
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

  const handleToggleInvestorMode = () => {
    if (!currentUser) return;
    const nextInvestor = !isInvestor;
    const updated = { ...currentUser, isInvestor: nextInvestor };
    setCurrentUser(updated);
    setCurrentSession(updated);
    syncItemToSupabase('app_users', updated);
    showTemporaryToast(`Mode diubah: ${nextInvestor ? '📈 Mode Investor (Saham Aktif)' : '💵 Mode Reguler (Non-Saham)'}`);
  };

  // Reusable Cloud Sync function with safe merging so local additions never get lost
  const refreshDataFromCloud = async (silent = true) => {
    try {
      const config = getSupabaseConfig();
      if (!config.url || !config.anonKey) return;

      const cloudData = await fetchAllFromSupabase();
      if (cloudData) {
        setDbStatus('CONNECTED');
        const deleted = getDeletedIds();

        // 1. Transactions Smart Merge
        if (Array.isArray(cloudData.transactions)) {
          setTransactions((prevLocal) => {
            const map = new Map();
            cloudData.transactions.forEach((t) => {
              if (t && t.id && !deleted.has(String(t.id))) {
                map.set(String(t.id), t);
              }
            });
            (prevLocal || []).forEach((t) => {
              if (t && t.id && !deleted.has(String(t.id))) {
                if (!map.has(String(t.id))) {
                  map.set(String(t.id), t);
                  syncItemToSupabase('transactions', t);
                }
              }
            });
            const merged = sortTransactionsDesc(Array.from(map.values()));
            localStorage.setItem('tatanan_uang_transactions', JSON.stringify(merged));
            return merged;
          });
        }

        // 2. Dreams Smart Merge
        if (Array.isArray(cloudData.dreams)) {
          setDreams((prevLocal) => {
            const map = new Map();
            cloudData.dreams.forEach((d) => {
              if (d && d.id && !deleted.has(String(d.id))) {
                map.set(String(d.id), d);
              }
            });
            (prevLocal || []).forEach((d) => {
              if (d && d.id && !deleted.has(String(d.id))) {
                if (!map.has(String(d.id))) {
                  map.set(String(d.id), d);
                  syncItemToSupabase('dreams', d);
                }
              }
            });
            const merged = Array.from(map.values());
            localStorage.setItem('tatanan_uang_dreams', JSON.stringify(merged));
            return merged;
          });
        }

        // 3. Monthly Needs Smart Merge
        if (Array.isArray(cloudData.monthlyNeeds)) {
          setMonthlyNeeds((prevLocal) => {
            const map = new Map();
            cloudData.monthlyNeeds.forEach((n) => {
              if (n && n.id && !deleted.has(String(n.id))) {
                map.set(String(n.id), n);
              }
            });
            (prevLocal || []).forEach((n) => {
              if (n && n.id && !deleted.has(String(n.id))) {
                if (!map.has(String(n.id))) {
                  map.set(String(n.id), n);
                  syncItemToSupabase('monthly_needs', n);
                }
              }
            });
            const merged = Array.from(map.values());
            localStorage.setItem('tatanan_uang_monthly_needs', JSON.stringify(merged));
            return merged;
          });
        }

        // 4. Debts Smart Merge
        if (Array.isArray(cloudData.debts)) {
          setDebts((prevLocal) => {
            const map = new Map();
            cloudData.debts.forEach((d) => {
              if (d && d.id && !deleted.has(String(d.id))) {
                map.set(String(d.id), d);
              }
            });
            (prevLocal || []).forEach((d) => {
              if (d && d.id && !deleted.has(String(d.id))) {
                if (!map.has(String(d.id))) {
                  map.set(String(d.id), d);
                  syncItemToSupabase('debts', d);
                }
              }
            });
            const merged = Array.from(map.values());
            localStorage.setItem('tatanan_uang_debts', JSON.stringify(merged));
            return merged;
          });
        }

        // 5. Investments Smart Merge
        if (Array.isArray(cloudData.investments)) {
          setInvestments((prevLocal) => {
            const map = new Map();
            cloudData.investments.forEach((i) => {
              if (i && i.id && !deleted.has(String(i.id))) {
                map.set(String(i.id), i);
              }
            });
            (prevLocal || []).forEach((i) => {
              if (i && i.id && !deleted.has(String(i.id))) {
                if (!map.has(String(i.id))) {
                  map.set(String(i.id), i);
                  syncItemToSupabase('investments', i);
                }
              }
            });
            const merged = Array.from(map.values());
            localStorage.setItem('tatanan_uang_investments', JSON.stringify(merged));
            return merged;
          });
        }

        if (!silent) {
          showTemporaryToast('Data tersinkronisasi realtime dari Cloud! ☁️');
        }
      }
    } catch (e) {
      console.error('Failed to sync cloud data:', e);
    }
  };

  // Check Supabase connection and initial sync + Realtime Listener on mount
  useEffect(() => {
    let syncTimer = null;

    const initDatabase = async () => {
      const config = getSupabaseConfig();
      if (config.url && config.anonKey) {
        setDbStatus('CONNECTING');
        const testRes = await testSupabaseConnection();
        if (testRes.success) {
          setDbStatus('CONNECTED');
          await refreshDataFromCloud(true);
        } else {
          setDbStatus('ERROR');
        }
      } else {
        setDbStatus('LOCAL');
      }
    };

    initDatabase();

    // Auto-sync when window receives focus or tab becomes visible
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshDataFromCloud(true);
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // Supabase Realtime Channel Subscription for live cross-device sync with debouncing
    const client = getSupabaseClient();
    let channel = null;
    if (client) {
      try {
        channel = client
          .channel('realtime_app_sync')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            if (syncTimer) clearTimeout(syncTimer);
            syncTimer = setTimeout(() => {
              refreshDataFromCloud(true);
            }, 1500);
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel error:', err);
      }
    }

    return () => {
      if (syncTimer) clearTimeout(syncTimer);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
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

  // Persist investments to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('tatanan_uang_investments', JSON.stringify(investments));
  }, [investments]);

  // Persist debts to LocalStorage whenever updated
  useEffect(() => {
    localStorage.setItem('tatanan_uang_debts', JSON.stringify(debts));
  }, [debts]);

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
      removeDeletedId(updated.id);
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
      removeDeletedId(newNeed.id);
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
      addDeletedId(id);
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
      removeDeletedId(updated.id);
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
      removeDeletedId(newDream.id);
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
      addDeletedId(id);
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

  // Calculate active investments modal (holding)
  const safeInvestments = Array.isArray(investments) ? investments.filter((i) => i != null && typeof i === 'object') : [];
  const activeHoldings = safeInvestments.filter((i) => i.status !== 'CLOSED');
  const totalInvestedModal = activeHoldings.reduce((sum, i) => sum + (Number(i?.modalInvestasi) || 0), 0);
  const activeHoldingCount = activeHoldings.length;

  // Latest balance lookup from the latest transaction snapshot
  const sortedTransactions = sortTransactionsDesc(transactions);
  const latestItem = sortedTransactions.length > 0 ? sortedTransactions[0] : null;

  const currentDuitDibawa = latestItem && latestItem.duitDibawa !== undefined ? Number(latestItem.duitDibawa) || 0 : 0;
  const currentDuitSaham = latestItem && latestItem.duitSaham !== undefined ? Number(latestItem.duitSaham) || 0 : 0;
  // Effective portfolio wealth: if currentDuitSaham is 0 (or less than totalInvestedModal), we account for totalInvestedModal so active stocks are counted
  const effectiveDuitSaham = Math.max(currentDuitSaham, totalInvestedModal);
  const totalKekayaan = currentDuitDibawa + (isInvestor ? effectiveDuitSaham : 0);

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
    duitSaham: effectiveDuitSaham,
    totalKekayaan,
    totalDreamTarget,
    totalDreamTerkumpul,
    totalInvestedModal,
    activeHoldingCount
  };

  // Add / Edit handler for transactions (with automatic overflow cascade for dreams)
  const handleSaveTransaction = (formData) => {
    const { allocatedDreamId, ...cleanForm } = formData;

    if (editingItem) {
      const updated = { ...editingItem, ...cleanForm };
      removeDeletedId(updated.id);
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
      removeDeletedId(newItem.id);
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
            updated.forEach((d) => {
              removeDeletedId(d.id);
              syncItemToSupabase('dreams', d);
            });
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
      addDeletedId(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      syncItemToSupabase('transactions', id, 'delete');
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset data ke contoh awal?')) {
      clearDeletedIds();
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
            setTransactions(sortTransactionsDesc(cloudData.transactions));
          }
          if (cloudData.dreams && cloudData.dreams.length > 0) {
            setDreams(cloudData.dreams);
          }
          if (cloudData.monthlyNeeds && cloudData.monthlyNeeds.length > 0) {
            setMonthlyNeeds(cloudData.monthlyNeeds);
          }
          if (cloudData.investments && cloudData.investments.length > 0) {
            setInvestments(cloudData.investments);
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

  // Investment (Saham) Handlers
  const handleSaveInvestment = (formData, mode) => {
    if (mode === 'REALIZE') {
      // Realization / Sale of stock
      const pnl = Number(formData.nominalProfitLoss) || 0;
      const isProfit = formData.profitLossType === 'PROFIT';
      const netChange = isProfit ? pnl : -pnl;
      const modal = Number(formData.modalInvestasi) || 0;
      const totalKembali = isProfit ? modal + pnl : Math.max(0, modal - pnl);

      const updatedInv = {
        ...formData,
        status: 'CLOSED',
        totalKembali
      };
      removeDeletedId(updatedInv.id);

      setInvestments((prev) =>
        prev.map((i) => (i.id === formData.id ? updatedInv : i))
      );
      syncItemToSupabase('investments', updatedInv);

      // Automatically update Portofolio balance (modal + profit returns to Portofolio) and record transaction
      const newTx = {
        id: Date.now().toString(),
        tanggal: formData.tanggalJual || getTodayISOString(),
        kebutuhan: `Jual Saham ${formData.namaSaham} (${isProfit ? `Profit +${formatRupiah(pnl)}` : `Cut Loss -${formatRupiah(pnl)}`})`,
        pemasukan: 0,
        pengeluaran: 0,
        profitSaham: isProfit ? pnl : 0,
        lossSaham: !isProfit ? pnl : 0,
        duitDibawa: currentDuitDibawa,
        duitSaham: currentDuitSaham + totalKembali
      };
      removeDeletedId(newTx.id);

      setTransactions((prev) => sortTransactionsDesc([newTx, ...prev]));
      syncItemToSupabase('transactions', newTx);

      showTemporaryToast(
        isProfit
          ? `🎉 Saham ${formData.namaSaham} Dijual Untung! Modal + Profit (${formatRupiah(totalKembali)}) kembali ke Portofolio.`
          : `⚠️ Saham ${formData.namaSaham} Dijual Cut Loss -${formatRupiah(pnl)}. Sisa modal (${formatRupiah(totalKembali)}) kembali ke Portofolio.`
      );
    } else if (mode === 'TOPUP') {
      // Top-up modal to an existing stock
      const topUpNominal = Number(formData.topUpNominal) || 0;
      const newTotalModal = Number(formData.modalInvestasi) || ((Number(editingInvestment?.modalInvestasi) || 0) + topUpNominal);

      const updated = {
        ...editingInvestment,
        modalInvestasi: newTotalModal,
        keterangan: formData.keterangan || editingInvestment.keterangan
      };
      removeDeletedId(updated.id);

      setInvestments((prev) =>
        prev.map((i) => (i.id === editingInvestment.id ? updated : i))
      );
      syncItemToSupabase('investments', updated);
      setEditingInvestment(null);

      // Deduct topUpNominal from Portofolio balance and record purchase transaction
      if (topUpNominal > 0) {
        const topUpTx = {
          id: Date.now().toString(),
          tanggal: formData.tanggalBeli || getTodayISOString(),
          kebutuhan: `Beli Tambahan Saham ${formData.namaSaham}`,
          pemasukan: 0,
          pengeluaran: topUpNominal,
          profitSaham: 0,
          lossSaham: 0,
          duitDibawa: currentDuitDibawa,
          duitSaham: Math.max(0, currentDuitSaham - topUpNominal)
        };
        removeDeletedId(topUpTx.id);
        setTransactions((prev) => sortTransactionsDesc([topUpTx, ...prev]));
        syncItemToSupabase('transactions', topUpTx);
      }

      showTemporaryToast(`Modal saham ${formData.namaSaham} bertambah +${formatRupiah(topUpNominal)} (Total: ${formatRupiah(newTotalModal)})! 📈`);
    } else if (editingInvestment) {
      // Edit existing stock
      const oldModal = Number(editingInvestment.modalInvestasi) || 0;
      const newModal = Number(formData.modalInvestasi) || 0;
      const modalDiff = newModal - oldModal;

      const updated = { ...editingInvestment, ...formData };
      removeDeletedId(updated.id);
      setInvestments((prev) =>
        prev.map((i) => (i.id === editingInvestment.id ? updated : i))
      );
      syncItemToSupabase('investments', updated);
      setEditingInvestment(null);

      // If modal was increased, deduct difference from Portofolio
      if (modalDiff > 0) {
        const addTx = {
          id: Date.now().toString(),
          tanggal: formData.tanggalBeli || getTodayISOString(),
          kebutuhan: `Beli Tambahan Saham ${formData.namaSaham}`,
          pemasukan: 0,
          pengeluaran: modalDiff,
          profitSaham: 0,
          lossSaham: 0,
          duitDibawa: currentDuitDibawa,
          duitSaham: Math.max(0, currentDuitSaham - modalDiff)
        };
        removeDeletedId(addTx.id);
        setTransactions((prev) => sortTransactionsDesc([addTx, ...prev]));
        syncItemToSupabase('transactions', addTx);
        showTemporaryToast(`Modal saham ${formData.namaSaham} bertambah +${formatRupiah(modalDiff)} (Total: ${formatRupiah(newModal)})! 📈`);
      } else {
        showTemporaryToast(`Saham ${formData.namaSaham} berhasil diperbarui!`);
      }
    } else {
      // New investment purchase: check if existing holding with same name exists
      const modal = Number(formData.modalInvestasi) || 0;
      const cleanName = formData.namaSaham.toUpperCase().trim();
      const existingHolding = investments.find(
        (i) => i.status !== 'CLOSED' && (i.namaSaham || '').toUpperCase().trim() === cleanName
      );

      if (existingHolding) {
        const oldModal = Number(existingHolding.modalInvestasi) || 0;
        const newTotal = oldModal + modal;
        const updated = {
          ...existingHolding,
          modalInvestasi: newTotal,
          keterangan: formData.keterangan || existingHolding.keterangan
        };
        removeDeletedId(updated.id);

        setInvestments((prev) =>
          prev.map((i) => (i.id === existingHolding.id ? updated : i))
        );
        syncItemToSupabase('investments', updated);

        if (modal > 0) {
          const buyTx = {
            id: Date.now().toString(),
            tanggal: formData.tanggalBeli || getTodayISOString(),
            kebutuhan: `Beli Tambahan Saham ${cleanName}`,
            pemasukan: 0,
            pengeluaran: modal,
            profitSaham: 0,
            lossSaham: 0,
            duitDibawa: currentDuitDibawa,
            duitSaham: Math.max(0, currentDuitSaham - modal)
          };
          removeDeletedId(buyTx.id);
          setTransactions((prev) => sortTransactionsDesc([buyTx, ...prev]));
          syncItemToSupabase('transactions', buyTx);
        }

        showTemporaryToast(`Modal saham ${cleanName} bertambah +${formatRupiah(modal)} (Total: ${formatRupiah(newTotal)})! 📈`);
      } else {
        const newInv = {
          id: 'inv_' + Date.now().toString(),
          status: 'HOLDING',
          profitLossType: 'NONE',
          nominalProfitLoss: 0,
          totalKembali: 0,
          ...formData
        };
        removeDeletedId(newInv.id);
        setInvestments((prev) => [newInv, ...prev]);
        syncItemToSupabase('investments', newInv);

        if (modal > 0) {
          const buyTx = {
            id: Date.now().toString(),
            tanggal: formData.tanggalBeli || getTodayISOString(),
            kebutuhan: `Beli Saham ${formData.namaSaham}`,
            pemasukan: 0,
            pengeluaran: modal,
            profitSaham: 0,
            lossSaham: 0,
            duitDibawa: currentDuitDibawa,
            duitSaham: Math.max(0, currentDuitSaham - modal)
          };
          removeDeletedId(buyTx.id);
          setTransactions((prev) => sortTransactionsDesc([buyTx, ...prev]));
          syncItemToSupabase('transactions', buyTx);
        }

        showTemporaryToast(`Saham ${formData.namaSaham} modal ${formatRupiah(modal)} berhasil dicatat! 📈`);
      }
    }
  };

  const handleRealizeInvestment = (item) => {
    setEditingInvestment(item);
    setInvestmentModalMode('REALIZE');
    setIsInvestmentModalOpen(true);
  };

  const handleTopUpInvestment = (item) => {
    setEditingInvestment(item);
    setInvestmentModalMode('TOPUP');
    setIsInvestmentModalOpen(true);
  };

  const handleEditInvestment = (item) => {
    setEditingInvestment(item);
    setInvestmentModalMode('EDIT');
    setIsInvestmentModalOpen(true);
  };

  const handleDeleteInvestment = (id) => {
    if (window.confirm('Hapus catatan saham ini dari daftar portofolio?')) {
      addDeletedId(id);
      setInvestments((prev) => prev.filter((i) => i.id !== id));
      syncItemToSupabase('investments', id, 'delete');
      showTemporaryToast('Catatan saham dihapus');
    }
  };

  const handleClearInvestmentHistory = () => {
    if (window.confirm('Kosongkan semua riwayat penjualan saham yang sudah selesai?')) {
      const closed = investments.filter((i) => i.status === 'CLOSED');
      setInvestments((prev) => prev.filter((i) => i.status !== 'CLOSED'));
      closed.forEach((item) => {
        addDeletedId(item.id);
        syncItemToSupabase('investments', item.id, 'delete');
      });
      showTemporaryToast('Semua riwayat penjualan saham berhasil dikosongkan! 🗑️');
    }
  };

  const handleTopUpPortofolio = (amount, note = 'Top Up Saldo Portofolio Saham') => {
    const nominal = Number(amount) || 0;
    if (nominal <= 0) return;

    const newTx = {
      id: Date.now().toString(),
      tanggal: getTodayISOString(),
      kebutuhan: note,
      pemasukan: nominal,
      pengeluaran: 0,
      profitSaham: 0,
      lossSaham: 0,
      duitDibawa: currentDuitDibawa,
      duitSaham: currentDuitSaham + nominal
    };
    removeDeletedId(newTx.id);

    setTransactions((prev) => sortTransactionsDesc([newTx, ...prev]));
    syncItemToSupabase('transactions', newTx);
    showTemporaryToast(`Saldo Portofolio Saham bertambah +${formatRupiah(nominal)}! 💰`);
  };

  // Debt Handlers
  const handleSaveDebt = (formData) => {
    if (editingDebt) {
      const updated = { ...editingDebt, ...formData };
      removeDeletedId(updated.id);
      setDebts((prev) =>
        prev.map((d) => (d.id === editingDebt.id ? updated : d))
      );
      syncItemToSupabase('debts', updated);
      setEditingDebt(null);
      showTemporaryToast('Catatan utang berhasil diperbarui! 💳');
    } else {
      const newDebt = {
        id: 'debt_' + Date.now().toString(),
        ...formData
      };
      removeDeletedId(newDebt.id);
      setDebts((prev) => [...prev, newDebt]);
      syncItemToSupabase('debts', newDebt);
      showTemporaryToast('Daftar utang baru berhasil ditambahkan! 💳');
    }
  };

  const handleEditDebt = (item) => {
    setEditingDebt(item);
    setIsDebtModalOpen(true);
  };

  const handleDeleteDebt = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan utang ini?')) {
      addDeletedId(id);
      setDebts((prev) => prev.filter((d) => d.id !== id));
      syncItemToSupabase('debts', id, 'delete');
      showTemporaryToast('Catatan utang dihapus');
    }
  };

  const handleMoveDebtUp = (index) => {
    if (index <= 0) return;
    setDebts((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDebtDown = (index) => {
    setDebts((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Pay off debt flow: deduct from cash balance (pengeluaran) & auto-delete debt
  const handlePayOffDebt = (debt) => {
    const nominal = Number(debt.nominalUtang) || 0;
    if (nominal <= 0) return;

    if (!window.confirm(`Konfirmasi pelunasan utang "${debt.namaUtang}" sebesar ${formatRupiah(nominal)}?\n\nDana akan langsung dipotong dari saldo uang kas (Aset Kekayaan) dan utang otomatis terhapus lunas.`)) {
      return;
    }

    // 1. Create deduction transaction in Catatan Keuangan
    const newDuitDibawa = Math.max(0, currentDuitDibawa - nominal);
    const payTx = {
      id: Date.now().toString(),
      tanggal: getTodayISOString(),
      kebutuhan: `Pelunasan Utang: ${debt.namaUtang}`,
      pemasukan: 0,
      pengeluaran: nominal,
      profitSaham: 0,
      lossSaham: 0,
      duitDibawa: newDuitDibawa,
      duitSaham: currentDuitSaham
    };
    removeDeletedId(payTx.id);
    addDeletedId(debt.id);

    setTransactions((prev) => sortTransactionsDesc([payTx, ...prev]));
    syncItemToSupabase('transactions', payTx);

    // 2. Remove debt from debts list and cloud
    setDebts((prev) => prev.filter((d) => d.id !== debt.id));
    syncItemToSupabase('debts', debt.id, 'delete');

    showTemporaryToast(`Alhamdulillah! Utang "${debt.namaUtang}" ${formatRupiah(nominal)} telah lunas & terhapus! 🎉`);
  };

  // Pay all affordable debts at once
  const handlePayAllAffordableDebts = () => {
    if (debts.length === 0) {
      showTemporaryToast('Tidak ada daftar utang.');
      return;
    }

    let available = Math.max(0, totalKekayaan - totalKebutuhanTerbayar - completedTargetSum);
    const affordableDebts = [];
    let tempAvail = available;

    for (const d of debts) {
      const nominal = Number(d.nominalUtang) || 0;
      if (tempAvail >= nominal && nominal > 0) {
        tempAvail -= nominal;
        affordableDebts.push(d);
      }
    }

    if (affordableDebts.length === 0) {
      alert(`Sisa aset kekayaan Anda (${formatRupiah(available)}) belum mencukupi untuk melunasi utang.`);
      return;
    }

    const totalBayar = affordableDebts.reduce((sum, d) => sum + (Number(d.nominalUtang) || 0), 0);
    if (!window.confirm(`Lunasi ${affordableDebts.length} utang sekaligus senilai total ${formatRupiah(totalBayar)}?\n\nSaldo kas akan dipotong dan utang yang terbayar akan otomatis terhapus.`)) {
      return;
    }

    // Deduct & create transactions
    let runningCash = currentDuitDibawa;
    const newTxs = [];
    const idsToRemove = new Set(affordableDebts.map(d => d.id));

    affordableDebts.forEach((d, idx) => {
      const nominal = Number(d.nominalUtang) || 0;
      runningCash = Math.max(0, runningCash - nominal);
      const tx = {
        id: (Date.now() + idx).toString(),
        tanggal: getTodayISOString(),
        kebutuhan: `Pelunasan Utang: ${d.namaUtang}`,
        pemasukan: 0,
        pengeluaran: nominal,
        profitSaham: 0,
        lossSaham: 0,
        duitDibawa: runningCash,
        duitSaham: currentDuitSaham
      };
      newTxs.push(tx);
      syncItemToSupabase('transactions', tx);
      syncItemToSupabase('debts', d.id, 'delete');
    });

    setTransactions((prev) => sortTransactionsDesc([...newTxs, ...prev]));
    setDebts((prev) => prev.filter((d) => !idsToRemove.has(d.id)));

    showTemporaryToast(`Sukses! ${affordableDebts.length} utang berhasil dilunasi & dihapus! 🎉`);
  };

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

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
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur-xs opacity-50"></div>
              <div className="relative w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 leading-none">
                TATANAN UANG
              </h1>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-1">
                Dashboard Keuangan
              </span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-3.5 rounded-2xl shadow-lg space-y-2.5">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 shadow-inner">
                    {isMasterAdmin ? (
                      <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                    ) : (
                      <User className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  {isMasterAdmin && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-slate-950"></span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white truncate block">
                      {currentUser.namaLengkap ? currentUser.namaLengkap.replace(' (Master Admin)', '') : currentUser.username}
                    </span>
                    {isMasterAdmin && (
                      <span className="text-[9px] text-amber-400 font-extrabold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
                        PRO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block truncate">
                    {currentUser.username ? `@${currentUser.username}` : 'Akun Utama'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 rounded-xl bg-slate-900/80 border border-slate-800 transition shrink-0"
                title="Keluar dari akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Toggle Button Full-Width Single Line */}
            <button
              type="button"
              onClick={handleToggleInvestorMode}
              title="Klik untuk ganti mode Investor / Reguler"
              className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-200 border cursor-pointer ${
                isInvestor
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                {isInvestor ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-[11px]">Mode Investor</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-[11px]">Mode Reguler</span>
                  </>
                )}
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-950/60 font-mono text-slate-400 border border-slate-800">
                Ganti ⇄
              </span>
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

            {/* Tab Khusus Investasi Saham (Hanya Investor) */}
            {isInvestor && (
              <button
                onClick={() => setActiveTab('INVESTASI')}
                className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-between gap-3 text-left ${
                  activeTab === 'INVESTASI'
                    ? 'bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Investasi Saham</span>
                </div>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono text-blue-300 whitespace-nowrap shrink-0 inline-flex items-center">
                  {investments.filter((i) => i.status === 'HOLDING').length} Aktif
                </span>
              </button>
            )}

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

            {/* Tab Pelunasan Utang */}
            <button
              onClick={() => setActiveTab('UTANG')}
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-between gap-3 text-left ${
                activeTab === 'UTANG'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Pelunasan Utang</span>
              </div>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 font-mono text-rose-300 whitespace-nowrap shrink-0 inline-flex items-center">
                {debts.length} Pos
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
              {(isInvestor ? totalKekayaan : currentDuitDibawa).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 pt-2 text-center">© 2026 Tatanan Uang</p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Offset by lg:pl-72 for Laptop Sidebar) */}
      <main className="flex-1 lg:pl-72 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Header (Clean, Premium 2-Tier Layout) */}
        <div className="lg:hidden pb-3 mb-4 border-b border-slate-800/80 space-y-2.5">
          {/* Row 1: Brand Title on Left, Action Icons on Right */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Glossy Brand Icon */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-xs opacity-50"></div>
                <div className="relative w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 leading-none truncate">
                    TATANAN UANG
                  </h1>
                  {isMasterAdmin && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                  Dashboard Keuangan
                </span>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Database Cloud Status */}
              {isMasterAdmin && (
                <button
                  onClick={() => setIsDbModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition shadow-sm"
                  title="Database Cloud Supabase"
                >
                  <Database className={`w-4 h-4 ${dbStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-slate-400'}`} />
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl bg-slate-900 border border-slate-800 transition"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: User Status & Mode Switcher Bar */}
          <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-emerald-500/30">
                {isMasterAdmin ? '👑' : '👤'}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-extrabold text-white truncate">
                  {currentUser.namaLengkap ? currentUser.namaLengkap.replace(' (Master Admin)', '') : currentUser.username}
                </span>
                {isMasterAdmin && (
                  <span className="text-[8px] text-amber-400 font-black bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20 shrink-0">
                    PRO
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleInvestorMode}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1 border transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm ${
                isInvestor
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              }`}
              title="Sentuh untuk ganti Mode Investor / Reguler"
            >
              {isInvestor ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="whitespace-nowrap font-bold">Mode Investor</span>
                </>
              ) : (
                <>
                  <Wallet className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="whitespace-nowrap font-bold">Mode Reguler</span>
                </>
              )}
              <span className="text-[8px] text-slate-400 pl-0.5">⇄</span>
            </button>
          </div>
        </div>

        {/* Mobile Install App Quick Banner */}
        {!isInstalled && (
          <div className="lg:hidden mb-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-emerald-500/30 font-black text-lg">
                📲
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  <span>Pasang Aplikasi ke Layar HP</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">PWA</span>
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Akses instan tanpa browser, offline & cepat!
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenInstall}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[3]" />
              <span>Install</span>
            </button>
          </div>
        )}

        {activeTab === 'CATATAN' && (
          /* LAYER 1: Catatan Keuangan, Jam & Stat Cards */
          <div className="space-y-6">
            <LiveClock />
            <StatCards summary={fullSummary} isInvestor={isInvestor} />
            <TransactionTable
              transactions={sortedTransactions}
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

        {activeTab === 'INVESTASI' && isInvestor && (
          /* LAYER 4: Portofolio & Investasi Saham */
          <div className="space-y-6">
            <InvestmentTracker
              investments={investments}
              duitSaham={currentDuitSaham}
              onAddNew={() => {
                setEditingInvestment(null);
                setInvestmentModalMode('NEW');
                setIsInvestmentModalOpen(true);
              }}
              onEdit={handleEditInvestment}
              onTopUp={handleTopUpInvestment}
              onTopUpPortofolio={handleTopUpPortofolio}
              onRealize={handleRealizeInvestment}
              onDelete={handleDeleteInvestment}
              onClearHistory={handleClearInvestmentHistory}
              onSyncCloud={() => refreshDataFromCloud(false)}
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

        {activeTab === 'UTANG' && (
          /* LAYER 5: Pelunasan Utang dari Aset Kekayaan */
          <div className="space-y-6">
            <DebtTracker
              debts={debts}
              totalKekayaan={totalKekayaan}
              currentDuitDibawa={currentDuitDibawa}
              currentDuitSaham={currentDuitSaham}
              totalKebutuhanTerbayar={totalKebutuhanTerbayar}
              completedDreamsTarget={completedTargetSum}
              onPayOffDebt={handlePayOffDebt}
              onPayAllAffordable={handlePayAllAffordableDebts}
              onEdit={handleEditDebt}
              onDelete={handleDeleteDebt}
              onAddNew={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
              onMoveUp={handleMoveDebtUp}
              onMoveDown={handleMoveDebtDown}
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
          duitDibawa: editingItem
            ? (() => {
                const idx = transactions.findIndex((t) => t.id === editingItem.id);
                const prev = idx >= 0 && idx < transactions.length - 1 ? transactions[idx + 1] : null;
                return prev ? Number(prev.duitDibawa) || 0 : 0;
              })()
            : currentDuitDibawa,
          duitSaham: editingItem
            ? (() => {
                const idx = transactions.findIndex((t) => t.id === editingItem.id);
                const prev = idx >= 0 && idx < transactions.length - 1 ? transactions[idx + 1] : null;
                return prev ? Number(prev.duitSaham) || 0 : 0;
              })()
            : currentDuitSaham
        }}
        isInvestor={isInvestor}
      />

      {/* Investment Modal (Buy / Edit / Realize Trade) */}
      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        mode={investmentModalMode}
        onClose={() => {
          setIsInvestmentModalOpen(false);
          setEditingInvestment(null);
        }}
        onSave={handleSaveInvestment}
        initialData={editingInvestment}
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

      {/* Debt Modal (Add / Edit Utang) */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setEditingDebt(null);
        }}
        onSave={handleSaveDebt}
        initialData={editingDebt}
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
        isInvestor={isInvestor}
        onAddNew={() => {
          if (activeTab === 'INVESTASI') {
            setEditingInvestment(null);
            setInvestmentModalMode('NEW');
            setIsInvestmentModalOpen(true);
          } else if (activeTab === 'KEBUTUHAN') {
            setEditingNeed(null);
            setIsNeedModalOpen(true);
          } else if (activeTab === 'IMPIAN') {
            setEditingDream(null);
            setIsDreamModalOpen(true);
          } else if (activeTab === 'UTANG') {
            setEditingDebt(null);
            setIsDebtModalOpen(true);
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
