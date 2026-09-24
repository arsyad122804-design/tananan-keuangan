import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Crash caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
  };

  handleResetStorage = async () => {
    if (window.confirm('Bersihkan cache dan muat ulang aplikasi?')) {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
          }
        }
      } catch (e) {
        console.error(e);
      }
      localStorage.clear();
      window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Terjadi Kendala Memuat Tampilan</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'Ada data lokal yang sedang disinkronkan.'}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition"
              >
                Muat Ulang Aplikasi (Refresh)
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Bersihkan Cache Lokal
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
