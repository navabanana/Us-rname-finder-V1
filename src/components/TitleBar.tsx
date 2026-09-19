import React, { useState } from 'react';
import { Minus, Square, X, Shield, Terminal, Laptop, Activity } from 'lucide-react';

interface TitleBarProps {
  onOpenWindowsExe: () => void;
  onOpenSettings: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isRunning: boolean;
  rateLimitedUntil: number | null;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onOpenWindowsExe,
  onOpenSettings,
  activeTab,
  setActiveTab,
  isRunning,
  rateLimitedUntil,
}) => {
  const [isElectronEnv] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean((window as any).electronAPI?.isElectron);
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleMinimize = () => {
    if (isElectronEnv && (window as any).electronAPI?.minimize) {
      (window as any).electronAPI.minimize();
    } else {
      showToast('Fenêtre minimisée (simulation Windows Desktop)');
    }
  };

  const handleMaximize = () => {
    if (isElectronEnv && (window as any).electronAPI?.maximize) {
      (window as any).electronAPI.maximize();
    } else {
      showToast('Plein écran / Agrandir fenêtre');
    }
  };

  const handleClose = () => {
    if (isElectronEnv && (window as any).electronAPI?.close) {
      (window as any).electronAPI.close();
    } else {
      showToast('Application fermée (simulation Windows)');
    }
  };

  return (
    <header
      id="desktop-titlebar"
      className="bg-[#111217] border-b border-[#23242c] text-slate-300 select-none flex items-center justify-between px-3 py-1.5 text-xs font-sans relative z-30"
    >
      {/* Left: Branding & Windows App identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Discord Logo styled icon */}
          <div className="w-5 h-5 rounded-md bg-[#5865f2] flex items-center justify-center text-white font-black text-xs shadow-sm">
            <span className="leading-none">D</span>
          </div>
          <span className="font-semibold text-slate-200 tracking-wide">
            Discord 3-4L Checker
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#23242c] text-slate-400 font-mono">
            v1.2.0 • Win x64
          </span>
        </div>

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#1a1c23] border border-[#2d303b]">
          {rateLimitedUntil && rateLimitedUntil > Date.now() ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 font-medium">Discord Rate Limit</span>
            </>
          ) : isRunning ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#57f287] animate-ping" />
              <span className="text-[#57f287] font-medium">Scanner Actif</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Prêt</span>
            </>
          )}
        </div>

        {/* Python & Windows .EXE button */}
        <button
          id="btn-open-exe-guide"
          onClick={onOpenWindowsExe}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#57f287]/15 hover:bg-[#57f287]/25 text-[#57f287] border border-[#57f287]/30 transition-colors"
          title="Consulter la version Python et l'exécutable .EXE"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="font-medium text-[11px]">Python & .EXE</span>
        </button>
      </div>

      {/* Center: Navigation Tabs */}
      <nav aria-label="Sections principales" className="flex items-center gap-1 bg-[#1a1c23] p-0.5 rounded-lg border border-[#2d303b]">
        <button
          id="nav-tab-generator"
          onClick={() => setActiveTab('generator')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'generator'
              ? 'bg-[#5865f2] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#252833]'
          }`}
        >
          Générateur & Scanner
        </button>
        <button
          id="nav-tab-manual"
          onClick={() => setActiveTab('manual')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'manual'
              ? 'bg-[#5865f2] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#252833]'
          }`}
        >
          Test Manuel
        </button>
        <button
          id="nav-tab-available"
          onClick={() => setActiveTab('available')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === 'available'
              ? 'bg-[#5865f2] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#252833]'
          }`}
        >
          Disponibles & Favoris
        </button>
      </nav>

      {/* Right: Windows Controls (Minimize, Maximize, Close) */}
      <div className="flex items-center gap-1">
        <button
          id="btn-settings-toggle"
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-[#23242c] text-slate-400 hover:text-slate-200 rounded transition-colors mr-1"
          title="Paramètres & Jeton API"
        >
          <Activity className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center border-l border-[#262832] pl-2">
          <button
            id="win-btn-minimize"
            onClick={handleMinimize}
            className="w-7 h-6 flex items-center justify-center hover:bg-[#262833] text-slate-400 hover:text-white rounded transition-colors"
            title="Minimiser"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            id="win-btn-maximize"
            onClick={handleMaximize}
            className="w-7 h-6 flex items-center justify-center hover:bg-[#262833] text-slate-400 hover:text-white rounded transition-colors"
            title="Agrandir / Restaurer"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            id="win-btn-close"
            onClick={handleClose}
            className="w-7 h-6 flex items-center justify-center hover:bg-[#ed4245] text-slate-400 hover:text-white rounded transition-colors"
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating notification toast if any */}
      {notification && (
        <div className="absolute top-10 right-4 bg-[#23242c] text-white text-xs px-3 py-1.5 rounded border border-[#393c49] shadow-xl animate-fade-in z-50">
          {notification}
        </div>
      )}
    </header>
  );
};
