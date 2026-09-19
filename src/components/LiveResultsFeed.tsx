import React, { useState, useMemo } from 'react';
import { UsernameResult } from '../types';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Star,
  ExternalLink,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  Zap
} from 'lucide-react';

interface LiveResultsFeedProps {
  results: UsernameResult[];
  onToggleFavorite: (id: string) => void;
  onClearResults: () => void;
  onEquipUsername?: (username: string) => void;
}

export const LiveResultsFeed: React.FC<LiveResultsFeedProps> = ({
  results,
  onToggleFavorite,
  onClearResults,
  onEquipUsername,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'available' | '3l' | '4l' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (username: string, id: string) => {
    navigator.clipboard.writeText(username);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // Filter tab
      if (filterMode === 'available' && !item.available) return false;
      if (filterMode === '3l' && item.length !== 3) return false;
      if (filterMode === '4l' && item.length !== 4) return false;
      if (filterMode === 'favorites' && !item.isFavorite) return false;

      // Search term
      if (searchQuery.trim()) {
        return item.username.toLowerCase().includes(searchQuery.toLowerCase().trim());
      }
      return true;
    });
  }, [results, filterMode, searchQuery]);

  return (
    <div id="live-results-feed-panel" className="bg-[#181a22] border border-[#262834] rounded-xl flex flex-col h-[580px] overflow-hidden">
      {/* Feed Toolbar */}
      <div className="p-3 border-b border-[#262834] bg-[#14151c] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#57f287] animate-pulse" />
            Flux de Vérification en Direct
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#20222d] text-slate-400">
            {filteredResults.length} / {results.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#1c1e28] p-1 rounded-lg border border-[#282b3a] text-xs">
          <button
            id="filter-tab-all"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-[#5865f2] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous
          </button>
          <button
            id="filter-tab-available"
            onClick={() => setFilterMode('available')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              filterMode === 'available'
                ? 'bg-[#57f287] text-black font-bold'
                : 'text-[#57f287] hover:bg-[#57f287]/10'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Disponibles</span>
          </button>
          <button
            id="filter-tab-3l"
            onClick={() => setFilterMode('3l')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              filterMode === '3l'
                ? 'bg-[#5865f2] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3L
          </button>
          <button
            id="filter-tab-4l"
            onClick={() => setFilterMode('4l')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              filterMode === '4l'
                ? 'bg-[#5865f2] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4L
          </button>
          <button
            id="filter-tab-favorites"
            onClick={() => setFilterMode('favorites')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              filterMode === 'favorites'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Favoris</span>
          </button>
        </div>

        {/* Search & Clear */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              id="input-feed-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer pseudo..."
              className="bg-[#121319] border border-[#262834] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#5865f2] w-36"
            />
          </div>

          {results.length > 0 && (
            <button
              id="btn-clear-feed-results"
              onClick={onClearResults}
              className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-slate-500 border border-transparent hover:border-red-500/20 transition-all"
              title="Effacer l'historique des résultats"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredResults.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Filter className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs font-medium text-slate-400">Aucun résultat à afficher</p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
              {results.length === 0
                ? 'Cliquez sur "Lancer le Scanner" ou ajoutez un lot pour vérifier des pseudos en direct via l\'API.'
                : 'Aucun pseudo ne correspond aux filtres actifs.'}
            </p>
          </div>
        ) : (
          filteredResults.map((item) => (
            <div
              key={item.id}
              id={`result-row-${item.username}`}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                item.available
                  ? 'bg-[#1b2f24] border-[#57f287]/40 shadow-sm'
                  : item.status === 'rate_limited'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-[#15161e] border-[#222430] hover:border-[#2d3040]'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {item.available ? (
                    <div className="w-8 h-8 rounded-lg bg-[#57f287]/20 border border-[#57f287]/40 flex items-center justify-center text-[#57f287]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : item.status === 'rate_limited' ? (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#1f212c] flex items-center justify-center text-slate-500">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Username Display */}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-bold font-mono tracking-wide ${
                        item.available ? 'text-[#57f287]' : 'text-slate-200'
                      }`}
                    >
                      @{item.username}
                    </span>

                    {/* Length Tag */}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#252835] text-slate-300 font-semibold">
                      {item.length}L
                    </span>

                    {/* Pattern Tag */}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#20222d] text-slate-400 capitalize hidden sm:inline-block">
                      {item.pattern.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status subtitle */}
                  <div className="flex items-center gap-2 text-[11px] mt-0.5">
                    {item.available ? (
                      <span className="text-[#57f287] font-semibold flex items-center gap-1">
                        ● DISPONIBLE SUR DISCORD
                      </span>
                    ) : item.status === 'rate_limited' ? (
                      <span className="text-amber-400 font-medium">
                        Rate limit temporaire Discord
                      </span>
                    ) : item.status === 'invalid' ? (
                      <span className="text-red-400 font-medium">
                        {item.error || 'Caractères invalides ou réservé'}
                      </span>
                    ) : (
                      <span className="text-slate-400">Pris par un utilisateur</span>
                    )}

                    {item.latencyMs !== undefined && (
                      <span className="text-slate-400 font-mono text-[10px]">
                        • {item.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Favorite Toggle */}
                <button
                  id={`btn-fav-${item.username}`}
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-1.5 rounded hover:bg-[#252834] transition-colors ${
                    item.isFavorite
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={item.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* Fast Copy Button */}
                <button
                  id={`btn-copy-${item.username}`}
                  onClick={() => handleCopy(item.username, item.id)}
                  className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                    copiedId === item.id
                      ? 'bg-[#57f287] text-black font-bold'
                      : item.available
                      ? 'bg-[#57f287]/20 hover:bg-[#57f287]/30 text-[#57f287] border border-[#57f287]/40'
                      : 'bg-[#20222d] hover:bg-[#292c3a] text-slate-300 border border-[#2a2c3a]'
                  }`}
                  title="Copier le nom"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>

                {/* Equip on Discord button if available */}
                {item.available && (
                  <button
                    id={`btn-equip-${item.username}`}
                    type="button"
                    onClick={() => {
                      if (onEquipUsername) {
                        onEquipUsername(item.username);
                      } else {
                        navigator.clipboard.writeText(item.username);
                        window.open('https://discord.com/channels/@me', '_blank');
                      }
                      setCopiedId(item.id);
                      setTimeout(() => setCopiedId(null), 1800);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#57f287] hover:bg-[#43d971] text-black font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                    title="Copier le pseudo et ouvrir Discord pour l'équiper instantanément"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Équiper</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
