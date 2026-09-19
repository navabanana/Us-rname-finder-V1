import React from 'react';
import { GeneratorConfig, PatternType, UsernameLength } from '../types';
import { Play, Pause, Plus, Trash2, Sliders, ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface GeneratorControlsProps {
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  isRunning: boolean;
  onToggleRun: () => void;
  onAddBatch: (count: number) => void;
  onClearQueue: () => void;
  queueCount: number;
}

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  config,
  setConfig,
  isRunning,
  onToggleRun,
  onAddBatch,
  onClearQueue,
  queueCount,
}) => {
  const handleLengthChange = (lengthMode: UsernameLength) => {
    setConfig((prev) => ({ ...prev, lengthMode }));
  };

  const handlePatternChange = (pattern: PatternType) => {
    setConfig((prev) => ({ ...prev, pattern }));
  };

  return (
    <div id="generator-controls-panel" className="bg-[#181a22] border border-[#262834] rounded-xl p-4 flex flex-col gap-4">
      {/* Top Header with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262834]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#5865f2]/15 text-[#5865f2]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Configuration du Générateur
            </h2>
            <p className="text-xs text-slate-400">
              Ciblez des pseudos Discord rares de 3 et 4 lettres
            </p>
          </div>
        </div>

        {/* Play / Pause Primary Action */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-scanner"
            onClick={onToggleRun}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-black font-bold'
                : 'bg-[#5865f2] hover:bg-[#4752c4] text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Mettre en Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Lancer le Scanner</span>
              </>
            )}
          </button>

          {queueCount > 0 && (
            <button
              id="btn-clear-queue"
              onClick={onClearQueue}
              className="p-2 rounded-lg bg-[#20222c] hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-[#2b2e3c] transition-colors"
              title="Vider la file d'attente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Length Selection (3L, 4L, Mixed, Custom length) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            Longueur Cible du Pseudo
          </label>
          <span className="text-[11px] text-slate-400">
            {config.lengthMode === 'custom' ? `${config.customLength || 5} caractères` : config.lengthMode === 'mixed' ? '3 ou 4' : `${config.lengthMode} lettres`}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            id="opt-length-3"
            type="button"
            onClick={() => handleLengthChange('3')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-0.5 border transition-all ${
              config.lengthMode === '3'
                ? 'bg-[#5865f2]/20 border-[#5865f2] text-white shadow-sm'
                : 'bg-[#1e202a] border-[#292c3a] text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <span className="text-sm font-bold text-slate-100">3 Lettres</span>
            <span className="text-[10px] text-amber-400 font-normal">Ultra Rare (OG)</span>
          </button>

          <button
            id="opt-length-4"
            type="button"
            onClick={() => handleLengthChange('4')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-0.5 border transition-all ${
              config.lengthMode === '4'
                ? 'bg-[#5865f2]/20 border-[#5865f2] text-white shadow-sm'
                : 'bg-[#1e202a] border-[#292c3a] text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <span className="text-sm font-bold text-slate-100">4 Lettres</span>
            <span className="text-[10px] text-indigo-300 font-normal">Haut Potentiel</span>
          </button>

          <button
            id="opt-length-mixed"
            type="button"
            onClick={() => handleLengthChange('mixed')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-0.5 border transition-all ${
              config.lengthMode === 'mixed'
                ? 'bg-[#5865f2]/20 border-[#5865f2] text-white shadow-sm'
                : 'bg-[#1e202a] border-[#292c3a] text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <span className="text-sm font-bold text-slate-100">3 & 4 Mixtes</span>
            <span className="text-[10px] text-slate-400 font-normal">Alternance</span>
          </button>

          <button
            id="opt-length-custom"
            type="button"
            onClick={() => handleLengthChange('custom')}
            className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-0.5 border transition-all ${
              config.lengthMode === 'custom'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                : 'bg-[#1e202a] border-[#292c3a] text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <span className="text-sm font-bold text-cyan-300">Sur mesure</span>
            <span className="text-[10px] text-cyan-400/80 font-normal">{config.customLength || 5} Caractères</span>
          </button>
        </div>

        {/* Custom Length Slider & Direct Number Input (2 to 32) */}
        {config.lengthMode === 'custom' && (
          <div className="mt-1 p-3 rounded-lg bg-[#141620] border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-2">
                <span>Longueur sélectionnée :</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm">
                  {config.customLength || 5} caractères
                </span>
              </span>
              <span className="text-[11px] text-slate-400">Min 2 — Max 32</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={32}
                value={config.customLength || 5}
                onChange={(e) => setConfig((prev) => ({ ...prev, customLength: parseInt(e.target.value, 10) }))}
                className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-[#232736] rounded-lg"
              />
              <input
                type="number"
                min={2}
                max={32}
                value={config.customLength || 5}
                onChange={(e) => {
                  const val = Math.max(2, Math.min(32, parseInt(e.target.value || '2', 10)));
                  setConfig((prev) => ({ ...prev, customLength: val }));
                }}
                className="w-16 px-2 py-1 text-center bg-[#1c1f2e] border border-cyan-500/40 rounded text-cyan-200 font-mono text-xs font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[2, 5, 6, 7, 8, 10, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, customLength: n }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
                    config.customLength === n
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                      : 'bg-[#1a1d2b] border-[#292d3f] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {n}L
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Pattern Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Style & Motif du Nom
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'pronounceable', label: 'Prononçable (CVC)', desc: 'ex: zox, kuro, rax' },
            { id: 'pure_alpha', label: 'Pur Alphabétique', desc: 'ex: xyz, qpr, wkl' },
            { id: 'alphanumeric', label: 'Alphanumérique', desc: 'ex: x0r, neo7, v1be' },
            { id: 'symmetric', label: 'Symétrique / Écho', desc: 'ex: xox, abba, o_o' },
            { id: 'dictionary', label: 'Mots & Racines', desc: 'ex: volt, mist, zen' },
            { id: 'with_special', label: 'Avec point/underscore', desc: 'ex: z_x, k.ro' },
          ].map((item) => (
            <button
              key={item.id}
              id={`pattern-btn-${item.id}`}
              type="button"
              onClick={() => handlePatternChange(item.id as PatternType)}
              className={`p-2 rounded-lg text-left border transition-all flex flex-col gap-0.5 ${
                config.pattern === item.id
                  ? 'bg-[#5865f2]/15 border-[#5865f2] text-white'
                  : 'bg-[#1e202a] border-[#292c3a] text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-semibold text-slate-200">{item.label}</span>
              <span className="text-[10px] text-slate-400 font-mono">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Speed & Rate Limit Delay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#262834]">
        {/* Delay Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Intervalle entre requêtes API</span>
            </span>
            <span className="text-xs font-mono font-bold text-[#57f287]">
              {config.delayMs} ms
            </span>
          </div>

          <input
            id="input-delay-slider"
            type="range"
            min="400"
            max="3000"
            step="100"
            value={config.delayMs}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, delayMs: Number(e.target.value) }))
            }
            className="w-full accent-[#5865f2] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span className="text-amber-400">Rapide (400ms)</span>
            <span className="text-indigo-300">Équilibré (1000ms)</span>
            <span className="text-[#57f287] flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> Anti-Ban (2000ms+)
            </span>
          </div>
        </div>

        {/* Batch Add Generators */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-300">
            Alimenter la file d'attente
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="btn-add-batch-25"
              type="button"
              onClick={() => onAddBatch(25)}
              className="py-2 px-2 rounded-lg bg-[#222531] hover:bg-[#2c3040] text-slate-200 border border-[#2d3142] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+25 noms</span>
            </button>
            <button
              id="btn-add-batch-50"
              type="button"
              onClick={() => onAddBatch(50)}
              className="py-2 px-2 rounded-lg bg-[#222531] hover:bg-[#2c3040] text-slate-200 border border-[#2d3142] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+50 noms</span>
            </button>
            <button
              id="btn-add-batch-100"
              type="button"
              onClick={() => onAddBatch(100)}
              className="py-2 px-2 rounded-lg bg-[#222531] hover:bg-[#2c3040] text-slate-200 border border-[#2d3142] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+100 noms</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Prefix & Suffix Optional Filters */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#262834]">
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">
            Préfixe fixe (optionnel)
          </label>
          <input
            id="input-prefix"
            type="text"
            maxLength={2}
            value={config.prefix}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                prefix: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
              }))
            }
            placeholder="ex: x, z"
            className="w-full bg-[#13151b] border border-[#2b2e3c] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#5865f2] font-mono"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">
            Suffixe fixe (optionnel)
          </label>
          <input
            id="input-suffix"
            type="text"
            maxLength={2}
            value={config.suffix}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                suffix: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
              }))
            }
            placeholder="ex: 7, x"
            className="w-full bg-[#13151b] border border-[#2b2e3c] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#5865f2] font-mono"
          />
        </div>
      </div>

      {/* Row 5: Auto-equip Automation */}
      <div className="pt-2 border-t border-[#262834] flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="toggle-auto-equip"
            type="checkbox"
            checked={config.autoEquipAvailable ?? true}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, autoEquipAvailable: e.target.checked }))
            }
            className="w-4 h-4 rounded bg-[#151720] border-[#373b4e] accent-[#00f0ff] cursor-pointer"
          />
          <span className="text-xs font-semibold text-[#00f0ff] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Auto-équiper si libre</span>
          </span>
        </label>
        <span className="text-[11px] text-slate-400">
          Copie le pseudo & ouvre votre profil Discord en direct
        </span>
      </div>
    </div>
  );
};
