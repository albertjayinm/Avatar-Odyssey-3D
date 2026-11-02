import React from 'react';
import { Compass, Lock, MapPin, Sparkles, X } from 'lucide-react';
import { BIOME_LEVELS } from '../data/gameData';
import { BiomeLevel } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  currentBiomeId: number;
  playerLevel: number;
  onSelectLevel: (biomeId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<Props> = ({
  currentBiomeId,
  playerLevel,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Pokopia Biome Levels</h2>
              <p className="text-xs text-slate-400">Travel through portal adventure zones across Pokopia!</p>
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

        {/* Level Map Cards */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {BIOME_LEVELS.map((biome) => {
            const isUnlocked = playerLevel >= biome.requiredPlayerLevel;
            const isCurrent = currentBiomeId === biome.id;

            return (
              <div
                key={biome.id}
                className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-800 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40'
                    : isUnlocked
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                        {biome.subtitle}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded shadow">
                          Current Zone
                        </span>
                      )}
                    </div>

                    {!isUnlocked && (
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                        <Lock className="w-3.5 h-3.5" /> Lvl {biome.requiredPlayerLevel}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white mt-2">{biome.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">{biome.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60">
                  {isUnlocked ? (
                    <button
                      disabled={isCurrent}
                      onClick={() => {
                        soundManager.playLevelUp();
                        onSelectLevel(biome.id);
                        onClose();
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-700 text-slate-400 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow'
                      }`}
                    >
                      <MapPin className="w-4 h-4" /> {isCurrent ? 'Exploring Now' : 'Travel to Biome'}
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs font-bold text-slate-500 bg-slate-900/60 rounded-xl border border-slate-800">
                      Reach Explorer Level {biome.requiredPlayerLevel} to Unlock
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
