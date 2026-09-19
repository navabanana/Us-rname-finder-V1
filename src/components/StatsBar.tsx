import React from 'react';
import { CheckerStats } from '../types';
import { CheckCircle2, XCircle, Gauge, Zap, AlertTriangle, RotateCcw } from 'lucide-react';

interface StatsBarProps {
  stats: CheckerStats;
  queueLength: number;
  rateLimitedUntil: number | null;
  onResetStats: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  queueLength,
  rateLimitedUntil,
  onResetStats,
}) => {
  const isRateLimited = rateLimitedUntil ? rateLimitedUntil > Date.now() : false;
  const remainingCooldownSec = rateLimitedUntil ? Math.max(0, Math.ceil((rateLimitedUntil - Date.now()) / 1000)) : 0;

  const availabilityRatio =
    stats.totalChecked > 0
      ? ((stats.totalAvailable / stats.totalChecked) * 100).toFixed(1)
      : '0.0';

  return (
    <div id="stats-dashboard-bar" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3 bg-[#13151b] border-b border-[#23242c]">
      {/* Total Checked */}
      <div className="bg-[#1a1c24] border border-[#272935] rounded-lg p-2.5 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Vérifiés</div>
          <div className="text-lg font-bold text-white font-mono">{stats.totalChecked}</div>
        </div>
        <div className="w-8 h-8 rounded-md bg-slate-800/80 flex items-center justify-center text-slate-300">
          <Gauge className="w-4 h-4" />
        </div>
      </div>

      {/* Available Hits */}
      <div className="bg-[#1a1c24] border border-[#57f287]/30 rounded-lg p-2.5 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[#57f287]" />
        <div>
          <div className="text-[11px] text-[#57f287] font-semibold flex items-center gap-1">
            <span>Disponibles</span>
            <span className="text-[10px] text-slate-400">({availabilityRatio}%)</span>
          </div>
          <div className="text-lg font-bold text-[#57f287] font-mono">{stats.totalAvailable}</div>
        </div>
        <div className="w-8 h-8 rounded-md bg-[#57f287]/15 flex items-center justify-center text-[#57f287]">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* Taken */}
      <div className="bg-[#1a1c24] border border-[#272935] rounded-lg p-2.5 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Déjà pris</div>
          <div className="text-lg font-bold text-slate-300 font-mono">{stats.totalTaken}</div>
        </div>
        <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center text-red-400">
          <XCircle className="w-4 h-4" />
        </div>
      </div>

      {/* In Queue */}
      <div className="bg-[#1a1c24] border border-[#272935] rounded-lg p-2.5 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">En file d'attente</div>
          <div className="text-lg font-bold text-indigo-300 font-mono">{queueLength}</div>
        </div>
        <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <Zap className="w-4 h-4" />
        </div>
      </div>

      {/* Rate Limit / Status */}
      <div className={`rounded-lg p-2.5 flex items-center justify-between border ${
        isRateLimited
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
          : 'bg-[#1a1c24] border-[#272935] text-slate-400'
      }`}>
        <div>
          <div className="text-[11px] font-medium">Statut Discord</div>
          <div className="text-xs font-semibold font-mono mt-0.5">
            {isRateLimited ? (
              <span className="text-amber-300 animate-pulse font-bold">
                Pause : {remainingCooldownSec}s
              </span>
            ) : (
              <span className="text-slate-300">Fluide (0 blocage)</span>
            )}
          </div>
        </div>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
          isRateLimited ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800/80 text-slate-400'
        }`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>

      {/* Latency & Reset */}
      <div className="bg-[#1a1c24] border border-[#272935] rounded-lg p-2.5 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Ping Moyen</div>
          <div className="text-sm font-bold text-slate-200 font-mono">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms` : '—'}
          </div>
        </div>
        <button
          id="btn-reset-stats"
          onClick={onResetStats}
          className="p-1.5 rounded hover:bg-[#252833] text-slate-400 hover:text-slate-200 transition-colors"
          title="Réinitialiser les compteurs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
