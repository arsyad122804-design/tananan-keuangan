import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const downloadLauncherFile = () => {
  const element = document.createElement("a");
  const batContent = `@echo off\ntitle Tatanan Uang\necho Membuka Aplikasi Tatanan Uang...\nstart http://localhost:3000\nexit`;
  const file = new Blob([batContent], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = "Buka_Tatanan_Uang.bat";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = async () => {
    // 1. Trigger browser PWA install prompt if available
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }

    // 2. Always trigger direct file download of the launcher file (No browser alert popups)
    downloadLauncherFile();
  };

  return { triggerInstall, isInstalled, canPrompt: !!deferredPrompt };
}

export default function InstallPWA({ triggerInstall, isInstalled, variant = 'default' }) {
  if (isInstalled) return null;

  if (variant === 'sidebar' || variant === 'full') {
    return (
      <button
        onClick={triggerInstall}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        title="Download File Peluncur & Install Aplikasi di Laptop / HP"
      >
        <Download className="w-4 h-4" />
        <span>Download App</span>
      </button>
    );
  }

  return (
    <button
      onClick={triggerInstall}
      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition flex items-center gap-1.5"
      title="Download File Peluncur & Install Aplikasi di Laptop / HP"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Download App</span>
      <span className="sm:hidden">Download</span>
    </button>
  );
}
