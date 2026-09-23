// Formatter utilities for Rupiah currency and Indonesian dates

export const formatRupiah = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatNumber = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID').format(num);
};

export const getIndonesianDayName = (date = new Date()) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
};

export const getIndonesianMonthName = (date = new Date()) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[date.getMonth()];
};

export const formatDateFull = (dateInput) => {
  if (!dateInput) return '';
  let date;
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return String(dateInput);
  
  const dayName = getIndonesianDayName(date);
  const dayNum = date.getDate();
  const monthName = getIndonesianMonthName(date);
  const year = date.getFullYear();
  
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
};

export const getTodayISOString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatHumanRupiah = (amount) => {
  const rawNum = Number(amount) || 0;
  if (rawNum === 0) return '';
  const isNeg = rawNum < 0;
  const num = Math.abs(rawNum);
  const prefix = isNeg ? '-' : '';
  if (num >= 1000000000) {
    const val = num / 1000000000;
    return `${prefix}${val % 1 === 0 ? val : val.toFixed(2)} Miliar`;
  }
  if (num >= 1000000) {
    const val = num / 1000000;
    return `${prefix}${val % 1 === 0 ? val : val.toFixed(2)} Juta`;
  }
  if (num >= 1000) {
    const val = num / 1000;
    return `${prefix}${val % 1 === 0 ? val : val.toFixed(2)} Ribu`;
  }
  return '';
};
