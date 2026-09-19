import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GeneratorConfig,
  UsernameResult,
  CheckerStats,
  CheckApiResponse,
} from './types';
import { TitleBar } from './components/TitleBar';
import { StatsBar } from './components/StatsBar';
import { GeneratorControls } from './components/GeneratorControls';
import { LiveResultsFeed } from './components/LiveResultsFeed';
import { ManualChecker } from './components/ManualChecker';
import { AvailableList } from './components/AvailableList';
import { WindowsExeModal } from './components/WindowsExeModal';
import { SettingsModal } from './components/SettingsModal';
import { generateBatchUsernames } from './services/usernameGenerator';
import { checkDiscordUsername } from './services/discordApi';
import { soundEffects } from './services/soundEffects';
import confetti from 'canvas-confetti';
import { Terminal, Shield, Laptop, Zap } from 'lucide-react';

const DEFAULT_CONFIG: GeneratorConfig = {
  lengthMode: '3',
  customLength: 5,
  pattern: 'pronounceable',
  prefix: '',
  suffix: '',
  allowNumbers: true,
  allowUnderscore: true,
  allowDot: true,
  delayMs: 1200,
  soundAlerts: true,
  autoSaveAvailable: true,
  autoEquipAvailable: true,
  useSimulationFallback: false,
  adaptiveBackoff: true,
  safePacingMode: true,
};

export default function App() {
  const [config, setConfig] = useState<GeneratorConfig>(() => {
    try {
      const saved = localStorage.getItem('discord_checker_config');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<string>('generator');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [results, setResults] = useState<UsernameResult[]>(() => {
    try {
      const saved = localStorage.getItem('discord_checker_results');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [stats, setStats] = useState<CheckerStats>({
    totalChecked: 0,
    totalAvailable: 0,
    totalTaken: 0,
    totalRateLimits: 0,
    avgLatencyMs: 0,
    currentSpeedPerMin: 0,
    startTime: null,
  });

  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isExeModalOpen, setIsExeModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Live timer for rate limit countdown
  useEffect(() => {
    if (!rateLimitedUntil) return;
    const interval = setInterval(() => {
      const n = Date.now();
      setCurrentTime(n);
      if (n >= rateLimitedUntil) {
        setRateLimitedUntil(null);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [rateLimitedUntil]);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('discord_checker_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      // Persist only available and favorites to save storage
      const toKeep = results.filter((r) => r.available || r.isFavorite).slice(0, 200);
      localStorage.setItem('discord_checker_results', JSON.stringify(toKeep));
    } catch {}
  }, [results]);

  // Keep a set of already generated or tested names to avoid repeats
  const testedSetRef = useRef<Set<string>>(new Set());

  // Fill initial tested set
  useEffect(() => {
    results.forEach((r) => testedSetRef.current.add(r.username));
  }, []);

  // Batch generation helper
  const handleAddBatch = useCallback((count: number) => {
    setQueue((prev) => {
      const newNames = generateBatchUsernames(config, count, testedSetRef.current);
      newNames.forEach((n) => testedSetRef.current.add(n));
      return [...prev, ...newNames];
    });
  }, [config]);

  // Clear queue
  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Toggle run / pause
  const handleToggleRun = useCallback(() => {
    if (!isRunning) {
      // If queue is empty, preload names
      if (queue.length === 0) {
        handleAddBatch(25);
      }
      setIsRunning(true);
      if (!stats.startTime) {
        setStats((s) => ({ ...s, startTime: Date.now() }));
      }
    } else {
      setIsRunning(false);
    }
  }, [isRunning, queue.length, handleAddBatch, stats.startTime]);

  // Favorite toggle
  const handleToggleFavorite = useCallback((id: string) => {
    setResults((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  }, []);

  // Clear all results
  const handleClearResults = useCallback(() => {
    setResults([]);
    testedSetRef.current.clear();
  }, []);

  // Clear available
  const handleClearAvailable = useCallback(() => {
    setResults((prev) => prev.filter((r) => !r.available && !r.isFavorite));
  }, []);

  // Reset stats
  const handleResetStats = useCallback(() => {
    setStats({
      totalChecked: 0,
      totalAvailable: 0,
      totalTaken: 0,
      totalRateLimits: 0,
      avgLatencyMs: 0,
      currentSpeedPerMin: 0,
      startTime: null,
    });
  }, []);

  // Equip username: copy to clipboard and open Discord profile settings
  const handleEquipUsername = useCallback((username: string) => {
    try {
      navigator.clipboard.writeText(username);
    } catch {}
    window.open('https://discord.com/channels/@me', '_blank');
  }, []);

  // Worker loop for scanning
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const queueRef = useRef(queue);
  queueRef.current = queue;

  const configRef = useRef(config);
  configRef.current = config;

  const rateLimitedUntilRef = useRef(rateLimitedUntil);
  rateLimitedUntilRef.current = rateLimitedUntil;

  const consecutiveRateLimitsRef = useRef<number>(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const runWorkerStep = async () => {
      if (!isRunningRef.current || isCancelled) return;

      // 1. Check if rate limited
      if (rateLimitedUntilRef.current && Date.now() < rateLimitedUntilRef.current) {
        const waitTime = Math.max(500, rateLimitedUntilRef.current - Date.now());
        timeoutId = setTimeout(runWorkerStep, waitTime);
        return;
      } else if (rateLimitedUntilRef.current && Date.now() >= rateLimitedUntilRef.current) {
        setRateLimitedUntil(null);
      }

      // 2. Replenish queue if low
      if (queueRef.current.length === 0) {
        const fresh = generateBatchUsernames(configRef.current, 20, testedSetRef.current);
        fresh.forEach((n) => testedSetRef.current.add(n));
        setQueue(fresh);
        timeoutId = setTimeout(runWorkerStep, 300);
        return;
      }

      // 3. Pop first item
      const nextUsername = queueRef.current[0];
      setQueue((prev) => prev.slice(1));

      // 4. Perform API check
      const currentConfig = configRef.current;
      const res: CheckApiResponse = await checkDiscordUsername(
        nextUsername,
        currentConfig.discordToken,
        currentConfig.useSimulationFallback
      );

      if (isCancelled) return;

      // 5. Handle rate limit response with ethical adaptive backoff
      if (res.status === 'rate_limited') {
        consecutiveRateLimitsRef.current += 1;
        const baseCooldown = (res.retryAfter || 5) * 1000;
        const backoffMultiplier = currentConfig.adaptiveBackoff
          ? Math.min(3, Math.pow(1.25, consecutiveRateLimitsRef.current - 1))
          : 1;
        const cooldown = Math.round(baseCooldown * backoffMultiplier) + 600;

        setRateLimitedUntil(Date.now() + cooldown);
        setStats((prev) => ({ ...prev, totalRateLimits: prev.totalRateLimits + 1 }));

        // Re-insert into queue so it is not lost
        setQueue((prev) => [nextUsername, ...prev]);

        timeoutId = setTimeout(runWorkerStep, cooldown);
        return;
      }

      // Successfully processed request: gradually cool down consecutive rate limits counter
      if (consecutiveRateLimitsRef.current > 0) {
        consecutiveRateLimitsRef.current = Math.max(0, consecutiveRateLimitsRef.current - 1);
      }

      // 6. Record result
      const newResult: UsernameResult = {
        id: `${nextUsername}-${Date.now()}`,
        username: nextUsername,
        length: nextUsername.length,
        pattern: currentConfig.pattern,
        status: res.status,
        available: res.available,
        latencyMs: res.latencyMs,
        timestamp: new Date().toISOString(),
        error: res.error,
        isFavorite: false,
      };

      setResults((prev) => [newResult, ...prev.slice(0, 199)]);

      // 7. Update stats
      setStats((prev) => {
        const newChecked = prev.totalChecked + 1;
        const newAvailable = res.available ? prev.totalAvailable + 1 : prev.totalAvailable;
        const newTaken = !res.available && res.status === 'taken' ? prev.totalTaken + 1 : prev.totalTaken;
        const lat = res.latencyMs || 0;
        const newAvgLat =
          prev.avgLatencyMs === 0 ? lat : Math.round((prev.avgLatencyMs * 4 + lat) / 5);

        return {
          ...prev,
          totalChecked: newChecked,
          totalAvailable: newAvailable,
          totalTaken: newTaken,
          avgLatencyMs: newAvgLat,
        };
      });

      // 8. Trigger alert if available
      if (res.available) {
        if (currentConfig.soundAlerts) {
          soundEffects.playAvailableChime();
        }
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#57f287', '#5865f2', '#fee75c'],
        });
        if (currentConfig.autoEquipAvailable) {
          try {
            navigator.clipboard.writeText(nextUsername);
            window.open('https://discord.com/channels/@me', '_blank');
          } catch {}
        }
      }

      // 9. Schedule next check with ethical pacing
      if (isRunningRef.current && !isCancelled) {
        const minSafeDelay = currentConfig.safePacingMode ? 1200 : 300;
        const appliedDelay = Math.max(minSafeDelay, currentConfig.delayMs);
        timeoutId = setTimeout(runWorkerStep, appliedDelay);
      }
    };

    if (isRunning) {
      runWorkerStep();
    }

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-[#0c0d12] text-slate-100 flex flex-col select-none font-sans antialiased">
      {/* 1. Windows Native / Electron Style Title Bar */}
      <TitleBar
        onOpenWindowsExe={() => setIsExeModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRunning={isRunning}
        rateLimitedUntil={rateLimitedUntil}
      />

      {/* 2. Top Stats Bar */}
      <StatsBar
        stats={stats}
        queueLength={queue.length}
        rateLimitedUntil={rateLimitedUntil}
        onResetStats={handleResetStats}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 p-3 sm:p-4 max-w-7xl w-full mx-auto overflow-y-auto">
        {/* Ethical Backoff / Rate Limit Alert Banner */}
        {rateLimitedUntil && rateLimitedUntil > currentTime && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200 animate-fade-in shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span>Pause de sécurité active (Rate limit Discord détecté)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[11px] font-mono font-bold">
                    {Math.max(1, Math.ceil((rateLimitedUntil - currentTime) / 1000))}s restantes
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Respect automatique du quota (retry_after) avec temporisation protectrice pour éviter le blocage de votre connexion.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRateLimitedUntil(null)}
              className="text-xs font-semibold px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-amber-300 border border-amber-500/40 transition-colors whitespace-nowrap self-end sm:self-center"
              title="Reprendre immédiatement sans attendre"
            >
              Ignorer la pause
            </button>
          </div>
        )}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Generator Controls */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <GeneratorControls
                config={config}
                setConfig={setConfig}
                isRunning={isRunning}
                onToggleRun={handleToggleRun}
                onAddBatch={handleAddBatch}
                onClearQueue={handleClearQueue}
                queueCount={queue.length}
              />

              {/* Windows .EXE Quick Banner */}
              <div className="bg-[#141620] border border-[#262837] rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#5865f2]/15 text-[#5865f2] flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Version Exécutable Windows</div>
                    <div className="text-[10px] text-slate-400">
                      Architecture Electron & installeur .exe prêt
                    </div>
                  </div>
                </div>

                <button
                  id="btn-banner-open-exe"
                  onClick={() => setIsExeModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#5865f2]/20 hover:bg-[#5865f2]/30 text-[#858ef8] border border-[#5865f2]/35 text-xs font-semibold transition-colors"
                >
                  Guide .EXE
                </button>
              </div>
            </div>

            {/* Right Column: Live Stream Results */}
            <div className="lg:col-span-7">
              <LiveResultsFeed
                results={results}
                onToggleFavorite={handleToggleFavorite}
                onClearResults={handleClearResults}
                onEquipUsername={handleEquipUsername}
              />
            </div>
          </div>
        )}

        {activeTab === 'manual' && (
          <ManualChecker
            discordToken={config.discordToken}
            useSimulationFallback={config.useSimulationFallback}
            soundAlerts={config.soundAlerts}
          />
        )}

        {activeTab === 'available' && (
          <AvailableList
            results={results}
            onToggleFavorite={handleToggleFavorite}
            onClearAvailable={handleClearAvailable}
            onEquipUsername={handleEquipUsername}
          />
        )}
      </main>

      {/* 4. Desktop Status Bar (Windows / Discord styled bottom bar) */}
      <footer className="bg-[#0f1016] border-t border-[#1f212c] px-3 py-1.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-[#57f287]" />
            <span>Discord Gateway v9 Proxy : En ligne</span>
          </span>
          <span className="hidden sm:inline-block text-slate-600">•</span>
          <span className="hidden sm:inline-block text-slate-400">
            Node / Electron Sandbox Win64
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-400">
            File d'attente : <strong className="text-indigo-400">{queue.length}</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Disponibles : <strong className="text-[#57f287]">{stats.totalAvailable}</strong>
          </span>
        </div>
      </footer>

      {/* Windows .EXE Guide / Modal */}
      <WindowsExeModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        setConfig={setConfig}
      />
    </div>
  );
}
