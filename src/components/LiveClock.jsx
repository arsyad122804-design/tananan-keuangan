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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Waktu Real-Time System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <span>{hari}</span>
            <span className="text-slate-400 font-normal">,</span>
            <span className="text-emerald-300">{tanggal} {bulan} {tahun}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl shadow-inner backdrop-blur-md">
          <Clock className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-emerald-400">
            {hours}:<span className="text-white">{minutes}</span>:<span className="text-emerald-500 text-lg">{seconds}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
