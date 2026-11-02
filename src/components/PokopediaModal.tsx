import React, { useState } from 'react';
import { Heart, Shield, Sparkles, X } from 'lucide-react';
import { Creature, ElementType } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  creatures: Creature[];
  activeCompanion: Creature | null;
  onSelectCompanion: (creature: Creature) => void;
  onClose: () => void;
}

export const PokopediaModal: React.FC<Props> = ({
  creatures,
  activeCompanion,
  onSelectCompanion,
  onClose,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<ElementType | 'All'>('All');

  const filteredCreatures =
    selectedFilter === 'All'
      ? creatures
      : creatures.filter((c) => c.element === selectedFilter);

  const getElementBadgeColor = (element: ElementType) => {
    switch (element) {
      case 'Grass':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Electric':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'Ice':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Water':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Fire':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Cosmic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              📖
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Pokopedia Index</h2>
              <p className="text-xs text-slate-400">
                Befriended: {creatures.filter((c) => c.befriended).length} / {creatures.length} Creatures
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Element Filter Bar */}
        <div className="p-3 px-5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {(['All', 'Grass', 'Electric', 'Ice', 'Water', 'Fire', 'Cosmic'] as const).map((elem) => (
            <button
              key={elem}
              onClick={() => {
                soundManager.playClick();
                setSelectedFilter(elem);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedFilter === elem
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {elem}
            </button>
          ))}
        </div>

        {/* Creature Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCreatures.map((creature) => {
            const isActive = activeCompanion?.id === creature.id;

            return (
              <div
                key={creature.id}
                className={`relative rounded-2xl p-4 border transition-all ${
                  creature.befriended
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Active companion indicator */}
                {isActive && (
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold bg-purple-500 text-white px-2 py-0.5 rounded-full shadow">
                    Active
                  </span>
                )}

                {/* Avatar & Element */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20"
                    style={{ backgroundColor: creature.primaryColor }}
                  >
                    {creature.befriended ? '🐾' : '❓'}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">
                      {creature.befriended ? creature.name : 'Unbefriended'}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${getElementBadgeColor(
                        creature.element
                      )}`}
                    >
                      {creature.element}
                    </span>
                  </div>
                </div>

                {/* Description / Lock text */}
                <p className="text-xs text-slate-300 mt-3 line-clamp-2">
                  {creature.befriended
                    ? creature.description
                    : `Explore Biome Level ${creature.biomeLevel} to find and feed this creature!`}
                </p>

                {/* Abilities & Affection if befriended */}
                {creature.befriended && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 font-semibold text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" /> {creature.ability}
                      </span>
                      <span className="flex items-center gap-1 text-rose-400 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-rose-400" /> {creature.affection}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">{creature.abilityDescription}</p>

                    <button
                      onClick={() => {
                        soundManager.playCreatureHappy();
                        onSelectCompanion(creature);
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer mt-1 ${
                        isActive
                          ? 'bg-slate-700 text-slate-300 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow'
                      }`}
                    >
                      {isActive ? 'Current Companion' : 'Summon as Companion'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
