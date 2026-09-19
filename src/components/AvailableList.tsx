import React, { useState } from 'react';
import { UsernameResult } from '../types';
import {
  Download,
  Copy,
  Check,
  Star,
  ExternalLink,
  Sparkles,
  Trash2,
  CheckCircle2,
  FileText,
  Zap
} from 'lucide-react';

interface AvailableListProps {
  results: UsernameResult[];
  onToggleFavorite: (id: string) => void;
  onClearAvailable: () => void;
  onEquipUsername?: (username: string) => void;
}

export const AvailableList: React.FC<AvailableListProps> = ({
  results,
  onToggleFavorite,
  onClearAvailable,
  onEquipUsername,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<'all' | '3l' | '4l' | 'fav'>('all');

  const availableItems = results.filter((r) => r.available || r.isFavorite);

  const filteredItems = availableItems.filter((r) => {
    if (subFilter === '3l') return r.length === 3;
    if (subFilter === '4l') return r.length === 4;
    if (subFilter === 'fav') return r.isFavorite;
    return true;
  });

  const handleCopySingle = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedSingle(id);
    setTimeout(() => setCopiedSingle(null), 1800);
  };

  const handleCopyAll = () => {
    if (filteredItems.length === 0) return;
    const text = filteredItems.map((r) => `@${r.username}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (filteredItems.length === 0) return;
    const text = filteredItems
      .map((r) => `${r.username} (${r.length} lettres - découvert le ${new Date(r.timestamp).toLocaleString()})`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discord-disponibles-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (filteredItems.length === 0) return;
    const dataStr = JSON.stringify(filteredItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discord-disponibles-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="available-list-view" className="max-w-4xl mx-auto flex flex-col gap-4 py-3">
      {/* Top Banner & Exporters */}
      <div className="bg-[#181a22] border border-[#262834] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#57f287]/20 text-[#57f287] border border-[#57f287]/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Pseudos Rares Disponibles & Favoris</span>
              <span className="px-2 py-0.5 rounded-full bg-[#57f287]/15 text-[#57f287] text-xs font-mono font-bold">
                {filteredItems.length} trouvés
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Exportez ou réclamez immédiatement vos pseudos 3 et 4 lettres
            </p>
          </div>
        </div>

        {/* Exporter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-export-copy-all"
            onClick={handleCopyAll}
            disabled={filteredItems.length === 0}
            className="px-3 py-1.5 rounded-lg bg-[#222533] hover:bg-[#2c3042] disabled:opacity-50 text-slate-200 border border-[#2f3346] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-[#57f287]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Tous Copiés !' : 'Tout Copier'}</span>
          </button>

          <button
            id="btn-export-txt"
            onClick={handleDownloadTxt}
            disabled={filteredItems.length === 0}
            className="px-3 py-1.5 rounded-lg bg-[#222533] hover:bg-[#2c3042] disabled:opacity-50 text-slate-200 border border-[#2f3346] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fichier .TXT</span>
          </button>

          <button
            id="btn-export-json"
            onClick={handleDownloadJson}
            disabled={filteredItems.length === 0}
            className="px-3 py-1.5 rounded-lg bg-[#222533] hover:bg-[#2c3042] disabled:opacity-50 text-slate-200 border border-[#2f3346] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Fichier .JSON</span>
          </button>

          {availableItems.length > 0 && (
            <button
              id="btn-clear-available-list"
              onClick={onClearAvailable}
              className="p-2 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
              title="Vider la liste"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#14161f] p-1 rounded-lg border border-[#262837] w-fit text-xs">
        <button
          onClick={() => setSubFilter('all')}
          className={`px-3 py-1 rounded-md font-medium transition-all ${
            subFilter === 'all' ? 'bg-[#5865f2] text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tous ({availableItems.length})
        </button>
        <button
          onClick={() => setSubFilter('3l')}
          className={`px-3 py-1 rounded-md font-medium transition-all ${
            subFilter === '3l' ? 'bg-[#5865f2] text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3 Lettres ({availableItems.filter((i) => i.length === 3).length})
        </button>
        <button
          onClick={() => setSubFilter('4l')}
          className={`px-3 py-1 rounded-md font-medium transition-all ${
            subFilter === '4l' ? 'bg-[#5865f2] text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          4 Lettres ({availableItems.filter((i) => i.length === 4).length})
        </button>
        <button
          onClick={() => setSubFilter('fav')}
          className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
            subFilter === 'fav' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Star className="w-3 h-3 fill-current" />
          <span>Favoris ({availableItems.filter((i) => i.isFavorite).length})</span>
        </button>
      </div>

      {/* List / Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#181a22] border border-[#262834] rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center">
          <Sparkles className="w-10 h-10 mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">Aucun pseudo disponible enregistré</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Lancez le scanner automatique ou utilisez le test manuel pour trouver des pseudos Discord disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#151720] border border-[#57f287]/30 hover:border-[#57f287]/60 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold font-mono text-[#57f287] tracking-wider">
                      @{item.username}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#202330] text-slate-300">
                      {item.length}L
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Style : {item.pattern.replace('_', ' ')}
                  </div>
                </div>

                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-1.5 rounded hover:bg-[#252838] transition-colors ${
                    item.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Mettre en favori"
                >
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#232532]">
                <button
                  onClick={() => handleCopySingle(item.username, item.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    copiedSingle === item.id
                      ? 'bg-[#57f287] text-black font-bold'
                      : 'bg-[#212431] hover:bg-[#2b2f40] text-slate-200 border border-[#2c3040]'
                  }`}
                >
                  {copiedSingle === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onEquipUsername) {
                      onEquipUsername(item.username);
                    } else {
                      navigator.clipboard.writeText(item.username);
                      window.open('https://discord.com/channels/@me', '_blank');
                    }
                    setCopiedSingle(item.id);
                    setTimeout(() => setCopiedSingle(null), 1800);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-[#57f287] hover:bg-[#43d971] text-black text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  title="Copier le pseudo et ouvrir la page Discord profil pour équiper"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Équiper</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
