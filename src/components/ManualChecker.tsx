import React, { useState } from 'react';
import { checkDiscordUsername } from '../services/discordApi';
import { CheckApiResponse } from '../types';
import { Search, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';

interface ManualCheckerProps {
  discordToken?: string;
  useSimulationFallback: boolean;
  soundAlerts: boolean;
}

export const ManualChecker: React.FC<ManualCheckerProps> = ({
  discordToken,
  useSimulationFallback,
  soundAlerts,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckApiResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheck = async (e?: React.FormEvent, customName?: string) => {
    if (e) e.preventDefault();
    const target = (customName || usernameInput).toLowerCase().trim();
    if (!target) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await checkDiscordUsername(target, discordToken, useSimulationFallback);
      setResult(res);

      if (res.available) {
        if (soundAlerts) soundEffects.playAvailableChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5865f2', '#57f287', '#fee75c'],
        });
      }
    } catch {
      setResult({
        username: target,
        available: false,
        status: 'error',
        error: 'Erreur réseau inattendue',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const testSuggestions = ['zox', 'kuro', 'vyle', 'nova', 'x0r', 'echo', 'rift', 'sol'];

  return (
    <div id="manual-checker-view" className="max-w-3xl mx-auto flex flex-col gap-5 py-4">
      {/* Header Info */}
      <div className="bg-[#181a22] border border-[#262834] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-[#5865f2]/15 text-[#5865f2]">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Vérificateur Manuel Discord Direct
            </h2>
            <p className="text-xs text-slate-400">
              Interrogez l'API Discord en temps réel pour n'importe quel pseudo unique
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCheck} className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-slate-500 font-mono font-bold text-sm">
              @
            </span>
            <input
              id="input-manual-username"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="Entrez un pseudo (ex: zox, kuro, dark)..."
              maxLength={32}
              className="w-full bg-[#121319] border border-[#2b2e3c] rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#5865f2] font-mono tracking-wider shadow-inner"
            />
          </div>

          <button
            id="btn-submit-manual-check"
            type="submit"
            disabled={loading || !usernameInput.trim()}
            className="px-5 py-2.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <span>Vérifier</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-[#232530]">
          <span className="text-[11px] text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Suggestions rapides :
          </span>
          {testSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setUsernameInput(s);
                handleCheck(undefined, s);
              }}
              className="px-2 py-0.5 rounded bg-[#20222d] hover:bg-[#2b2e3c] text-slate-300 text-xs font-mono transition-colors border border-[#2b2e3c]"
            >
              @{s}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div
          id="manual-result-card"
          className={`rounded-xl border p-5 transition-all ${
            result.available
              ? 'bg-[#14291e] border-[#57f287]/50 shadow-lg'
              : result.status === 'rate_limited'
              ? 'bg-amber-950/25 border-amber-500/40'
              : 'bg-[#191b24] border-[#292c3a]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {result.available ? (
                <div className="w-12 h-12 rounded-xl bg-[#57f287]/20 border border-[#57f287]/40 flex items-center justify-center text-[#57f287]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : result.status === 'rate_limited' ? (
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#232532] flex items-center justify-center text-slate-500">
                  <XCircle className="w-7 h-7" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-black font-mono tracking-wider ${
                      result.available ? 'text-[#57f287]' : 'text-slate-100'
                    }`}
                  >
                    @{result.username}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#202330] text-slate-400 font-mono">
                    {result.username.length} lettres
                  </span>
                </div>

                <div className="text-xs font-medium mt-1">
                  {result.available ? (
                    <span className="text-[#57f287] font-bold tracking-wide">
                      DISPONIBLE À LA RÉSERVATION SUR DISCORD !
                    </span>
                  ) : result.status === 'rate_limited' ? (
                    <span className="text-amber-400 font-semibold">
                      Rate limit Discord (Réessayer dans {result.retryAfter || 5}s)
                    </span>
                  ) : result.status === 'invalid' ? (
                    <span className="text-red-400 font-semibold">
                      {result.error || 'Format non autorisé par la politique des pseudos Discord'}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Indisponible (déjà réservé par un compte Discord)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                id="btn-copy-manual-result"
                onClick={() => handleCopy(result.username)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-[#57f287] text-black font-bold'
                    : 'bg-[#222533] hover:bg-[#2b2e3e] text-slate-200 border border-[#2f3344]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>

              {result.available && (
                <a
                  id="btn-claim-manual-result"
                  href="https://discord.com/login"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold transition-colors shadow-md"
                >
                  Réclamer sur Discord
                </a>
              )}
            </div>
          </div>

          {/* Diagnostic payload */}
          <div className="mt-4 pt-3 border-t border-[#262837] text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>Latence : {result.latencyMs || '—'} ms</span>
            <span>Statut HTTP : {result.status}</span>
            <span>Horodatage : {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
