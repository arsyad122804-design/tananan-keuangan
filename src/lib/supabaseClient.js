import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://dlpeewnkckobbvelnpxg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGVld25rY2tvYmJ2ZWxucHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMjQ0MjMsImV4cCI6MjEwNTcwMDQyM30.vdSFRLrQtzRq55yaBlA57I8pI6ipzbS0KmdoSzsP8FY';

// Get credentials from localStorage first, fallback to Vite env variables or defaults
export const getSupabaseConfig = () => {
  const localUrl = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('tatanan_uang_supabase_url') : null;
  const localKey = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('tatanan_uang_supabase_anon_key') : null;

  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || null;
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || null;

  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = localKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

  return { url: (url || '').trim(), anonKey: (anonKey || '').trim() };
};

export const setSupabaseConfig = (url, anonKey) => {
  if (url && anonKey) {
    localStorage.setItem('tatanan_uang_supabase_url', url.trim());
    localStorage.setItem('tatanan_uang_supabase_anon_key', anonKey.trim());
  } else {
    localStorage.removeItem('tatanan_uang_supabase_url');
    localStorage.removeItem('tatanan_uang_supabase_anon_key');
  }
  supabaseInstance = null; // Reset cached instance
};

let supabaseInstance = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey);
      return supabaseInstance;
    } catch (err) {
      console.error('Error creating Supabase client:', err);
      return null;
    }
  }
  return null;
};

// SQL Schema for user to copy-paste into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- TATANAN UANG - DATABASE SCHEMA UNTUK SUPABASE (POSTGRESQL)
-- ========================================================

-- 1. TABEL TRANSAKSI & PORTOFOLIO SAHAM
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  tanggal DATE NOT NULL,
  kebutuhan TEXT NOT NULL,
  pemasukan NUMERIC DEFAULT 0,
  pengeluaran NUMERIC DEFAULT 0,
  profit_saham NUMERIC DEFAULT 0,
  loss_saham NUMERIC DEFAULT 0,
  duit_dibawa NUMERIC DEFAULT 0,
  duit_saham NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL TARGET IMPIAN (WATERFALL GOALS)
CREATE TABLE IF NOT EXISTS dreams (
  id TEXT PRIMARY KEY,
  nama_impian TEXT NOT NULL,
  target_biaya NUMERIC DEFAULT 0,
  terkumpul NUMERIC DEFAULT 0,
  jangka_nilai NUMERIC DEFAULT 1,
  jangka_satuan TEXT DEFAULT 'bulan',
  is_completed BOOLEAN DEFAULT FALSE,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL KEBUTUHAN BULANAN (MONTHLY NEEDS)
CREATE TABLE IF NOT EXISTS monthly_needs (
  id TEXT PRIMARY KEY,
  nama_kebutuhan TEXT NOT NULL,
  nominal NUMERIC DEFAULT 0,
  kategori TEXT DEFAULT 'Tagihan & Utilitas',
  tanggal_jatuh_tempo TEXT DEFAULT '1',
  is_paid BOOLEAN DEFAULT FALSE,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL PENGGUNA (USERS & AUTENTIKASI)
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  is_investor BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL INVESTASI SAHAM PER EMITEN (PORTFOLIO & TRADE TRACKING)
CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  nama_saham TEXT NOT NULL,
  modal_investasi NUMERIC DEFAULT 0,
  tanggal_beli DATE NOT NULL,
  status TEXT DEFAULT 'HOLDING', -- 'HOLDING' (Sedang Berjalan) | 'CLOSED' (Selesai/Dijual)
  profit_loss_type TEXT DEFAULT 'NONE', -- 'PROFIT' | 'LOSS' | 'NONE'
  nominal_profit_loss NUMERIC DEFAULT 0,
  total_kembali NUMERIC DEFAULT 0,
  tanggal_jual DATE,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Memberikan izin akses penuh (Public Read/Write)
CREATE POLICY "Public full access transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access dreams" ON dreams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access monthly_needs" ON monthly_needs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access investments" ON investments FOR ALL USING (true) WITH CHECK (true);
`;

// Default Master User (fikri / fikri)
export const DEFAULT_MASTER_USER = {
  id: 'user_master_fikri',
  username: 'fikri',
  password: 'fikri',
  namaLengkap: 'Fikri (Master Admin)',
  isInvestor: true,
  isAdmin: true
};

// Test Supabase connection
export const testSupabaseConnection = async (customUrl, customKey) => {
  try {
    const url = customUrl || getSupabaseConfig().url;
    const key = customKey || getSupabaseConfig().anonKey;

    if (!url || !key) {
      return { success: false, message: 'URL atau API Key Supabase belum diisi.' };
    }

    const client = createClient(url, key);
    const { error } = await client.from('transactions').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          needsSchema: true,
          message: 'Terkoneksi ke Supabase, namun tabel belum dibuat. Silakan jalankan script SQL Schema di Supabase SQL Editor.'
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Koneksi ke Database Supabase berhasil! 🟢' };
  } catch (err) {
    return { success: false, message: err.message || 'Gagal menghubungi server Supabase.' };
  }
};

// Data Mapper Functions
export const mapTransactionToDb = (t) => ({
  id: String(t.id),
  tanggal: t.tanggal,
  kebutuhan: t.kebutuhan || '',
  pemasukan: Number(t.pemasukan) || 0,
  pengeluaran: Number(t.pengeluaran) || 0,
  profit_saham: Number(t.profitSaham) || 0,
  loss_saham: Number(t.lossSaham) || 0,
  duit_dibawa: Number(t.duitDibawa) || 0,
  duit_saham: Number(t.duitSaham) || 0
});

export const mapTransactionFromDb = (t) => ({
  id: String(t.id),
  tanggal: t.tanggal,
  kebutuhan: t.kebutuhan,
  pemasukan: Number(t.pemasukan) || 0,
  pengeluaran: Number(t.pengeluaran) || 0,
  profitSaham: Number(t.profit_saham) || 0,
  lossSaham: Number(t.loss_saham) || 0,
  duitDibawa: Number(t.duit_dibawa) || 0,
  duitSaham: Number(t.duit_saham) || 0
});

export const mapDreamToDb = (d) => ({
  id: String(d.id),
  nama_impian: d.namaImpian || '',
  target_biaya: Number(d.targetBiaya) || 0,
  terkumpul: Number(d.terkumpul) || 0,
  jangka_nilai: Number(d.jangkaNilai) || 1,
  jangka_satuan: d.jangkaSatuan || 'bulan',
  is_completed: Boolean(d.isCompleted),
  keterangan: d.keterangan || ''
});

export const mapDreamFromDb = (d) => ({
  id: String(d.id),
  namaImpian: d.nama_impian,
  targetBiaya: Number(d.target_biaya) || 0,
  terkumpul: Number(d.terkumpul) || 0,
  jangkaNilai: Number(d.jangka_nilai) || 1,
  jangkaSatuan: d.jangka_satuan || 'bulan',
  isCompleted: Boolean(d.is_completed),
  keterangan: d.keterangan || ''
});

export const mapMonthlyNeedToDb = (n) => ({
  id: String(n.id),
  nama_kebutuhan: n.namaKebutuhan || '',
  nominal: Number(n.nominal) || 0,
  kategori: n.kategori || 'Tagihan & Utilitas',
  tanggal_jatuh_tempo: String(n.tanggalJatuhTempo || '1'),
  is_paid: Boolean(n.isPaid),
  keterangan: n.keterangan || ''
});

export const mapMonthlyNeedFromDb = (n) => ({
  id: String(n.id),
  namaKebutuhan: n.nama_kebutuhan,
  nominal: Number(n.nominal) || 0,
  kategori: n.kategori || 'Tagihan & Utilitas',
  tanggalJatuhTempo: n.tanggal_jatuh_tempo || '1',
  isPaid: Boolean(n.is_paid),
  keterangan: n.keterangan || ''
});

export const mapUserToDb = (u) => ({
  id: String(u.id),
  username: String(u.username).trim().toLowerCase(),
  password: String(u.password),
  nama_lengkap: u.namaLengkap || u.username,
  is_investor: Boolean(u.isInvestor),
  is_admin: Boolean(u.isAdmin)
});

export const mapUserFromDb = (u) => ({
  id: String(u.id),
  username: u.username,
  password: u.password,
  namaLengkap: u.nama_lengkap,
  isInvestor: Boolean(u.is_investor),
  isAdmin: Boolean(u.is_admin)
});

export const mapInvestmentToDb = (inv) => ({
  id: String(inv.id),
  nama_saham: String(inv.namaSaham || '').toUpperCase().trim(),
  modal_investasi: Number(inv.modalInvestasi) || 0,
  tanggal_beli: inv.tanggalBeli || inv.tanggal || new Date().toISOString().split('T')[0],
  status: inv.status || 'HOLDING',
  profit_loss_type: inv.profitLossType || 'NONE',
  nominal_profit_loss: Number(inv.nominalProfitLoss) || 0,
  total_kembali: Number(inv.totalKembali) || 0,
  tanggal_jual: inv.tanggalJual || null,
  keterangan: inv.keterangan || ''
});

export const mapInvestmentFromDb = (inv) => ({
  id: String(inv.id),
  namaSaham: inv.nama_saham,
  modalInvestasi: Number(inv.modal_investasi) || 0,
  tanggalBeli: inv.tanggal_beli,
  status: inv.status || 'HOLDING',
  profitLossType: inv.profit_loss_type || 'NONE',
  nominalProfitLoss: Number(inv.nominal_profit_loss) || 0,
  totalKembali: Number(inv.total_kembali) || 0,
  tanggalJual: inv.tanggal_jual || null,
  keterangan: inv.keterangan || ''
});

// Authentication & Local User Management
export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem('tatanan_uang_users');
    if (!raw) {
      const initialUsers = [DEFAULT_MASTER_USER];
      localStorage.setItem('tatanan_uang_users', JSON.stringify(initialUsers));
      return initialUsers;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [DEFAULT_MASTER_USER];
    }
    // Ensure master fikri user always exists
    if (!parsed.some((u) => u.username === 'fikri')) {
      parsed.unshift(DEFAULT_MASTER_USER);
      localStorage.setItem('tatanan_uang_users', JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Error reading stored users:', err);
    return [DEFAULT_MASTER_USER];
  }
};

export const saveStoredUsers = (users) => {
  try {
    localStorage.setItem('tatanan_uang_users', JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users:', err);
  }
};

export const getCurrentSession = () => {
  try {
    const raw = localStorage.getItem('tatanan_uang_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCurrentSession = (user) => {
  if (user) {
    localStorage.setItem('tatanan_uang_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('tatanan_uang_session');
  }
};

export const loginUser = async (usernameInput, passwordInput) => {
  const username = String(usernameInput || '').trim().toLowerCase();
  const password = String(passwordInput || '').trim();

  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi.' };
  }

  // Check special Master Account fikri / fikri
  if (username === 'fikri' && password === 'fikri') {
    const master = { ...DEFAULT_MASTER_USER };
    setCurrentSession(master);
    return { success: true, user: master };
  }

  // Check Supabase cloud first if available
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('app_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (!error && data) {
        const loggedInUser = mapUserFromDb(data);
        setCurrentSession(loggedInUser);
        return { success: true, user: loggedInUser };
      }
    } catch (e) {
      console.warn('Cloud login check failed, falling back to local:', e);
    }
  }

  // Check local users
  const users = getStoredUsers();
  const found = users.find((u) => u.username.toLowerCase() === username && u.password === password);

  if (found) {
    setCurrentSession(found);
    return { success: true, user: found };
  }

  return { success: false, message: 'Username atau password tidak sesuai.' };
};

export const registerUser = async (formData) => {
  const username = String(formData.username || '').trim().toLowerCase();
  const password = String(formData.password || '').trim();
  const namaLengkap = String(formData.namaLengkap || formData.username || '').trim();
  const isInvestor = Boolean(formData.isInvestor);

  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi.' };
  }

  if (username.length < 3) {
    return { success: false, message: 'Username minimal 3 karakter.' };
  }

  const users = getStoredUsers();
  if (users.some((u) => u.username.toLowerCase() === username)) {
    return { success: false, message: 'Username ini sudah terdaftar. Silakan pilih username lain.' };
  }

  const newUser = {
    id: 'user_' + Date.now().toString(),
    username,
    password,
    namaLengkap,
    isInvestor,
    isAdmin: username === 'fikri'
  };

  // Save to local
  users.push(newUser);
  saveStoredUsers(users);

  // Sync to Supabase cloud if table exists
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('app_users').insert(mapUserToDb(newUser));
    } catch (e) {
      console.warn('Cloud user sync failed:', e);
    }
  }

  setCurrentSession(newUser);
  return { success: true, user: newUser };
};

// Sync Operations
export const fetchAllFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [txRes, dreamRes, needRes, invRes] = await Promise.all([
      client.from('transactions').select('*').order('tanggal', { ascending: false }).order('created_at', { ascending: false }),
      client.from('dreams').select('*').order('created_at', { ascending: true }),
      client.from('monthly_needs').select('*').order('created_at', { ascending: true }),
      client.from('investments').select('*').order('created_at', { ascending: false })
    ]);

    // Separate real dreams from fallback investments stored in dreams table
    let cleanDreams = [];
    const fallbackInvestments = [];

    if (dreamRes.data && Array.isArray(dreamRes.data)) {
      dreamRes.data.forEach((row) => {
        const isInv = String(row.id || '').startsWith('inv_') || String(row.keterangan || '').startsWith('TATANAN_INV:');
        if (isInv) {
          try {
            if (row.keterangan && row.keterangan.startsWith('TATANAN_INV:')) {
              const parsed = JSON.parse(row.keterangan.replace('TATANAN_INV:', ''));
              fallbackInvestments.push(parsed);
            } else {
              fallbackInvestments.push({
                id: row.id,
                namaSaham: row.nama_impian || 'SAHAM',
                modalInvestasi: Number(row.target_biaya) || 0,
                tanggalBeli: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                status: row.jangka_satuan || 'HOLDING',
                profitLossType: 'NONE',
                nominalProfitLoss: Number(row.terkumpul) || 0,
                totalKembali: 0,
                keterangan: row.keterangan || ''
              });
            }
          } catch (e) {
            console.error('Error parsing fallback investment from dream row:', e);
          }
        } else {
          cleanDreams.push(mapDreamFromDb(row));
        }
      });
    }

    let finalInvestments = null;
    if (invRes.data && Array.isArray(invRes.data) && invRes.data.length > 0) {
      finalInvestments = invRes.data.map(mapInvestmentFromDb);
    } else if (fallbackInvestments.length > 0) {
      finalInvestments = fallbackInvestments;
    }

    return {
      transactions: txRes.data ? txRes.data.map(mapTransactionFromDb) : null,
      dreams: cleanDreams.length > 0 || (dreamRes.data && dreamRes.data.length === 0) ? cleanDreams : null,
      monthlyNeeds: needRes.data ? needRes.data.map(mapMonthlyNeedFromDb) : null,
      investments: finalInvestments
    };
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return null;
  }
};

export const syncItemToSupabase = async (table, item, action = 'upsert') => {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    if (table === 'investments') {
      const invId = String(item.id || item);
      const dreamFallbackId = invId.startsWith('inv_') ? invId : 'inv_' + invId;

      if (action === 'delete') {
        // Delete from investments table
        client.from('investments').delete().eq('id', invId).catch(() => {});
        // Also delete from fallback dreams table
        await client.from('dreams').delete().eq('id', dreamFallbackId);
      } else {
        // Upsert to investments table (if exists)
        const payload = mapInvestmentToDb(item);
        client.from('investments').upsert(payload).catch(() => {});

        // Also upsert to fallback dreams table for guaranteed cross-device sync
        const dreamFallbackPayload = {
          id: dreamFallbackId,
          nama_impian: String(item.namaSaham || 'SAHAM').toUpperCase().trim(),
          target_biaya: Number(item.modalInvestasi) || 0,
          terkumpul: Number(item.nominalProfitLoss) || 0,
          jangka_nilai: 1,
          jangka_satuan: item.status || 'HOLDING',
          is_completed: item.status === 'CLOSED',
          keterangan: 'TATANAN_INV:' + JSON.stringify(item)
        };
        await client.from('dreams').upsert(dreamFallbackPayload);
      }
      return;
    }

    if (action === 'delete') {
      await client.from(table).delete().eq('id', String(item.id || item));
    } else {
      let payload;
      if (table === 'transactions') payload = mapTransactionToDb(item);
      else if (table === 'dreams') payload = mapDreamToDb(item);
      else if (table === 'monthly_needs') payload = mapMonthlyNeedToDb(item);
      else if (table === 'app_users') payload = mapUserToDb(item);

      if (payload) {
        await client.from(table).upsert(payload);
      }
    }
  } catch (err) {
    console.error(`Error syncing ${action} to ${table}:`, err);
  }
};

