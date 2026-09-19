import React, { useState } from 'react';
import { X, Laptop, CheckCircle2, Download, Package, Shield, FileCode, Check, AlertCircle, Sparkles, Terminal, Copy } from 'lucide-react';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeModal: React.FC<WindowsExeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'python' | 'requirements' | 'electron'>('python');
  const [copiedPip, setCopiedPip] = useState(false);
  const [copiedBuild, setCopiedBuild] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);

  if (!isOpen) return null;

  const REQUIREMENTS_CONTENT = `customtkinter>=5.2.0\nrequests>=2.31.0\npyinstaller>=6.0.0`;

  const handleCopyPip = () => {
    navigator.clipboard.writeText('pip install -r requirements.txt');
    setCopiedPip(true);
    setTimeout(() => setCopiedPip(false), 2000);
  };

  const handleCopyBuild = () => {
    navigator.clipboard.writeText('pyinstaller --onefile --noconsole --name "final" final.py');
    setCopiedBuild(true);
    setTimeout(() => setCopiedBuild(false), 2000);
  };

  const handleCopyReqs = () => {
    navigator.clipboard.writeText(REQUIREMENTS_CONTENT);
    setCopiedReqs(true);
    setTimeout(() => setCopiedReqs(false), 2000);
  };

  const handleDownloadRequirements = () => {
    const blob = new Blob([REQUIREMENTS_CONTENT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPythonScript = async () => {
    try {
      const response = await fetch('/final.py');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/x-python;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'final.py';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open('/final.py', '_blank');
    }
  };

  const handleDownloadPythonBat = () => {
    const batScript = `@echo off
setlocal enabledelayedexpansion
title final.exe - Compilation Python PyInstaller
color 0b

cd /d "%~dp0"

echo ==============================================================================
echo   CREATION DE L'EXECUTABLE final.exe WINDOWS (PYTHON + PYINSTALLER)
echo ==============================================================================
echo.
echo Repertoire actuel : %cd%
echo.

where python >nul 2>&1
if %errorlevel% neq 0 (
    color 0c
    echo [ERREUR] Python n'a pas ete detecte sur ce PC !
    echo.
    echo Comment l'installer en 1 minute :
    echo 1. Rendez-vous sur https://www.python.org/downloads/
    echo 2. Lancez l'installeur et COCHEZ BIEN la case "Add Python to PATH" !
    echo 3. Relancez ensuite ce fichier .bat.
    echo.
    pause
    exit /b 1
)

echo [1/2] Installation des modules Python (customtkinter, requests, pyinstaller)...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    color 0c
    echo [ERREUR] Echec de l'installation des dependances pip.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Compilation en un seul fichier .EXE autonome sans console...
python -m PyInstaller --onefile --noconsole --clean --name "final" final.py
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo [ERREUR] PyInstaller a rencontre une erreur lors de la compilation.
    pause
    exit /b %errorlevel%
)

echo.
color 0a
echo ==============================================================================
echo   SUCCES TOTAL ! Votre fichier .EXE autonome a ete cree :
echo   Dossier : dist\\
echo   Fichier : final.exe
echo.
echo   Double-cliquez sur final.exe pour lancer l'application vibecodee !
echo ==============================================================================
echo.
pause
explorer dist
`;
    const blob = new Blob([batScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creer_exe_python.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161821] border border-[#2e3244] rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#292c3d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#57f287]/15 border border-[#57f287]/30 flex items-center justify-center text-[#57f287]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Application Python & Compilation .EXE Windows</span>
                <span className="px-2 py-0.5 rounded-full bg-[#57f287]/20 text-[#57f287] text-[10px] font-bold">
                  Zero Vite / Zero Node
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interface CustomTkinter moderne, multi-threading, alertes sonores et export en 1 fichier .exe autonome
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#232638] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-lg bg-[#111217] p-1 border border-[#232635]">
          <button
            onClick={() => setActiveTab('python')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'python'
                ? 'bg-[#5865f2] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Guide & Exécution Python / .EXE</span>
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'requirements'
                ? 'bg-[#5865f2] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>requirements.txt</span>
          </button>
        </div>

        {activeTab === 'python' ? (
          <div className="space-y-4">
            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-[#12131b] border border-[#232635] p-3 rounded-xl flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#57f287] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">1 Fichier .EXE Unique</div>
                  <div className="text-[10px] text-slate-400">PyInstaller --onefile</div>
                </div>
              </div>
              <div className="bg-[#12131b] border border-[#232635] p-3 rounded-xl flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#5865f2] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">CustomTkinter Dark</div>
                  <div className="text-[10px] text-slate-400">Thème sombre Discord natif</div>
                </div>
              </div>
              <div className="bg-[#12131b] border border-[#232635] p-3 rounded-xl flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Multi-threading</div>
                  <div className="text-[10px] text-slate-400">0 freeze pendant les requêtes</div>
                </div>
              </div>
            </div>

            {/* Step 1: Install Requirements */}
            <div className="bg-[#0f1016] border border-[#232636] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#5865f2]/20 text-[#858ef8] flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Installer les dépendances (1 seule fois)</span>
                </div>
                <button
                  onClick={handleDownloadRequirements}
                  className="text-[11px] text-[#858ef8] hover:text-white flex items-center gap-1 font-medium transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Télécharger requirements.txt</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#191b26] border border-[#2a2e40] rounded-lg px-3 py-2">
                <code className="text-xs font-mono text-[#57f287]">
                  pip install -r requirements.txt
                </code>
                <button
                  onClick={handleCopyPip}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors pl-2"
                >
                  {copiedPip ? <Check className="w-3.5 h-3.5 text-[#57f287]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPip ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Run directly or compile to .exe */}
            <div className="bg-[#0f1016] border border-[#232636] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-[#57f287]/20 text-[#57f287] flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>Lancer l'application Python directement</span>
                </div>
                <button
                  onClick={handleDownloadPythonScript}
                  className="text-[11px] text-[#00ff9d] hover:text-white flex items-center gap-1 font-bold transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Télécharger final.py</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#191b26] border border-[#2a2e40] rounded-lg px-3 py-2">
                <code className="text-xs font-mono text-cyan-300">
                  python final.py
                </code>
              </div>

              <div className="pt-2 border-t border-[#1d202d] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <span>Créer l'exécutable final.exe autonome pour Windows</span>
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#191b26] border border-[#2a2e40] rounded-lg px-3 py-2">
                  <code className="text-[11px] font-mono text-[#858ef8] truncate mr-2">
                    pyinstaller --onefile --noconsole --name "final" final.py
                  </code>
                  <button
                    onClick={handleCopyBuild}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors flex-shrink-0"
                  >
                    {copiedBuild ? <Check className="w-3.5 h-3.5 text-[#57f287]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBuild ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Le fichier exécutable sera généré dans le dossier <code className="text-[#00ff9d] font-bold">dist\final.exe</code>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#0f1016] border border-[#232636] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#57f287]" />
                  <span className="text-xs font-bold text-white font-mono">requirements.txt</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReqs}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 bg-[#1e202b] rounded-md"
                  >
                    {copiedReqs ? <Check className="w-3.5 h-3.5 text-[#57f287]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReqs ? 'Copié !' : 'Copier'}</span>
                  </button>
                  <button
                    onClick={handleDownloadRequirements}
                    className="text-xs text-[#57f287] hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 bg-[#57f287]/15 rounded-md border border-[#57f287]/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>

              <pre className="bg-[#12131b] border border-[#202330] rounded-lg p-3.5 font-mono text-xs text-[#57f287] leading-relaxed select-all">
                {REQUIREMENTS_CONTENT}
              </pre>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p><strong>customtkinter</strong> : Fournit la magnifique interface graphique sombre moderne (boutons arrondis, curseurs, fenêtres avec scroll).</p>
                <p><strong>requests</strong> : Gère les requêtes HTTP rapides vers l'API Discord avec gestion des délais et rate-limits.</p>
                <p><strong>pyinstaller</strong> : Assemble le code Python et ses dépendances en un seul fichier <code className="text-slate-300">.exe</code> sans console.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#292c3d]">
          <div className="text-xs text-slate-400">
            Fichiers créés : <code className="text-slate-300 font-mono">requirements.txt</code> &bull; <code className="text-slate-300 font-mono">discord_checker.py</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPythonBat}
              className="px-3.5 py-2 rounded-xl bg-[#232638] hover:bg-[#2e324a] text-slate-200 hover:text-white font-medium text-xs flex items-center gap-2 border border-[#353a52] transition-all"
              title="Télécharger le script 1-clic qui lance pip et PyInstaller automatiquement"
            >
              <Download className="w-4 h-4 text-[#57f287]" />
              <span>Script 1-Clic (.BAT)</span>
            </button>
            <button
              onClick={handleDownloadPythonScript}
              className="px-3.5 py-2 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger discord_checker.py</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-[#1e202b] hover:bg-[#2b2d3d] text-slate-300 font-semibold text-xs transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
