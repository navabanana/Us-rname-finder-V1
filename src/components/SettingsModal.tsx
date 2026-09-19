import React from 'react';
import { GeneratorConfig } from '../types';
import { X, Sliders, Key, Volume2, Sparkles, Shield, Info } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  setConfig,
}) => {
  if (!isOpen) return null;

  const testAudio = () => {
    soundEffects.playAvailableChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161821] border border-[#2e3244] rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-200 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#292c3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5865f2]/20 border border-[#5865f2]/40 flex items-center justify-center text-[#5865f2]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Paramètres Avancés & API</h2>
              <p className="text-xs text-slate-400">
                Configuration de débit, alertes et authentification Discord
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#262939] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ethical Rate Limiting & Quota Protection */}
        <div className="space-y-3 pt-2 border-t border-[#252837]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#57f287]" />
              <span>Régulation Éthique & Respect des Quotas</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#57f287]/15 text-[#57f287] text-[10px] font-semibold">
              Conforme API
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#111218] border border-[#242634] rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#57f287]/10 flex items-center justify-center text-[#57f287] flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Mode Pacing Éthique (Cadence Respectueuse)</div>
                <div className="text-[10px] text-slate-400">
                  Garantit un intervalle minimal (≥ 1,2s) pour prévenir la saturation du service et protéger votre IP
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.safePacingMode}
              onChange={(e) => {
                const checked = e.target.checked;
                setConfig((prev) => ({
                  ...prev,
                  safePacingMode: checked,
                  delayMs: checked && prev.delayMs < 1200 ? 1200 : prev.delayMs,
                }));
              }}
              className="w-4 h-4 accent-[#57f287] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#111218] border border-[#242634] rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#5865f2]/10 flex items-center justify-center text-[#5865f2] flex-shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Recul Adaptatif Intelligent (Exponential Backoff)</div>
                <div className="text-[10px] text-slate-400">
                  Respecte scrupuleusement le délai d'attente (retry_after) renvoyé par Discord avec marge de sécurité
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.adaptiveBackoff}
              onChange={(e) => setConfig((prev) => ({ ...prev, adaptiveBackoff: e.target.checked }))}
              className="w-4 h-4 accent-[#5865f2] cursor-pointer"
            />
          </div>
        </div>

        {/* Discord Token (Optional) */}
        <div className="space-y-2 pt-2 border-t border-[#252837]">
          <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Jeton Discord (Optionnel)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Restreint en local uniquement</span>
          </label>
          <input
            type="password"
            value={config.discordToken || ''}
            onChange={(e) => setConfig((prev) => ({ ...prev, discordToken: e.target.value }))}
            placeholder="Collez votre jeton utilisateur ou bot si souhaité..."
            className="w-full bg-[#111218] border border-[#2b2e3e] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#5865f2] font-mono"
          />
          <p className="text-[11px] text-slate-500 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
            <span>
              Par défaut, l'application utilise le point d'accès public de Discord sans compte requis. Un jeton personnel permet d'éviter les quotas partagés sur certaines adresses IP.
            </span>
          </p>
        </div>

        {/* Notification & Sounds */}
        <div className="space-y-3 pt-2 border-t border-[#252837]">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Alertes & Retours
          </h3>

          <div className="flex items-center justify-between p-3 bg-[#111218] border border-[#242634] rounded-xl">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-slate-300" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Alerte Sonore (Chime)</div>
                <div className="text-[10px] text-slate-400">Joue un son lors d'un pseudo disponible</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testAudio}
                className="text-[11px] px-2 py-1 rounded bg-[#232534] hover:bg-[#2e3144] text-slate-300 transition-colors"
              >
                Tester le son
              </button>
              <input
                type="checkbox"
                checked={config.soundAlerts}
                onChange={(e) => setConfig((prev) => ({ ...prev, soundAlerts: e.target.checked }))}
                className="w-4 h-4 accent-[#5865f2] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#111218] border border-[#242634] rounded-xl">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Sauvegarde automatique des Disponibles</div>
                <div className="text-[10px] text-slate-400">Conserve les pseudos libres dans l'onglet Favoris</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.autoSaveAvailable}
              onChange={(e) => setConfig((prev) => ({ ...prev, autoSaveAvailable: e.target.checked }))}
              className="w-4 h-4 accent-[#5865f2] cursor-pointer"
            />
          </div>

          {/* Simulation Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#111218] border border-[#242634] rounded-xl">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#57f287]" />
              <div>
                <div className="text-xs font-semibold text-slate-200">Mode Démonstration / Simulation Rapide</div>
                <div className="text-[10px] text-slate-400">
                  Permet de tester l'interface à pleine vitesse sans limitation de débit Discord
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.useSimulationFallback}
              onChange={(e) => setConfig((prev) => ({ ...prev, useSimulationFallback: e.target.checked }))}
              className="w-4 h-4 accent-[#5865f2] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#292c3d]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold text-xs transition-colors shadow-md"
          >
            Enregistrer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
