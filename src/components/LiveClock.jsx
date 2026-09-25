import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { getIndonesianDayName, getIndonesianMonthName } from '../utils/formatters';

export default function LiveClock({ onDayChange }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow((prev) => {
        // Detect date change (midnight change)
        if (prev.getDate() !== current.getDate()) {
          if (onDayChange) onDayChange(current);
        }
        return current;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDayChange]);

  const hari = getIndonesianDayName(now);
  const tanggal = now.getDate();
  const bulan = getIndonesianMonthName(now);
  const tahun = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Waktu Real-Time System</span>
          </div>
          <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-1.5 whitespace-nowrap leading-tight tracking-wide">
            <span>{hari},</span>
            <span className="text-emerald-300 font-extrabold">{tanggal} {bulan} {tahun}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800/90 px-3.5 py-2 rounded-xl shadow-inner backdrop-blur-md shrink-0">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div className="font-mono text-lg sm:text-2xl font-black tracking-widest text-emerald-400 whitespace-nowrap">
            {hours}:<span className="text-white">{minutes}</span>:<span className="text-emerald-400">{seconds}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
