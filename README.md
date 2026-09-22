# 💰 TATANAN UANG - Dashboard Keuangan & Portfolio Saham

Aplikasi web manajemen keuangan cerdas dengan integrasi pencatatan kas, pelacakan portofolio saham, jam real-time, dan target impian (*Waterfall Wealth Allocation*).

---

## ✨ Fitur Utama

- 📊 **Layer 1: Catatan Keuangan & Saham**:
  - Live clock real-time dengan tanggal sistem otomatis.
  - 8 Kartu Ringkasan Finansial interaktif (Cash, Saham, Total Kekayaan, Gain/Loss, Arus Kas, dll).
  - Tabel transaksi responsif & kartu ringkas pada perangkat mobile.
  - Live preview angka Rupiah terbilang (*contoh: Rp 2.000.000 (2 Juta)*).
  - Ekspor laporan ke **Excel (.xlsx)** dan **Word (.docx)**.

- 🎯 **Layer 2: Target Impian Saya**:
  - Alokasi dana bertingkat (*Waterfall Allocation*) otomatis dari Dana Keseluruhan (Cash + Saham).
  - Tombol **Ceklis otomatis terkunci** jika progres dana belum mencukupi 100%.
  - Pengurangan dana otomatis saat impian selesai dicentang (*Ceklis*).
  - Prioritas urutan impian (*Naik/Turun*).

- 📱 **Desain Responsif & PWA Ready**:
  - Tampilan **Sidebar Kiri** khusus Desktop / Laptop.
  - Tampilan **Bottom Navigation Bar** praktis khusus Mobile / HP.
  - Fitur instalasi PWA & file peluncur launcher desktop satu klik.

---

## 🚀 Menjalankan Project

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev

# Build untuk produksi
npm run build
```

---

## 🛠️ Tech Stack
- **React + Vite**
- **Tailwind CSS**
- **Lucide Icons**
- **xlsx & docx exporter**
