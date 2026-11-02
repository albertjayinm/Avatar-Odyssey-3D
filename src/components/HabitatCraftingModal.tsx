import React from 'react';
import { Hammer, Lock, X } from 'lucide-react';
import { CRAFTING_RECIPES } from '../data/gameData';
import { CraftingRecipe, Inventory } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  inventory: Inventory;
  onCraftItem: (recipe: CraftingRecipe) => void;
  onClose: () => void;
}

export const HabitatCraftingModal: React.FC<Props> = ({
  inventory,
  onCraftItem,
  onClose,
}) => {
  const canAfford = (recipe: CraftingRecipe) => {
    if (recipe.cost.wood && inventory.wood < recipe.cost.wood) return false;
    if (recipe.cost.stone && inventory.stone < recipe.cost.stone) return false;
    if (recipe.cost.sunberry && inventory.sunberry < recipe.cost.sunberry) return false;
    if (recipe.cost.sparkgem && inventory.sparkgem < recipe.cost.sparkgem) return false;
    if (recipe.cost.stardust && inventory.stardust < recipe.cost.stardust) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🔨
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Base Habitat Crafting</h2>
              <p className="text-xs text-slate-400">Craft cozy nests, feeders, and decor for your 3D camp!</p>
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

        {/* Recipes Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {CRAFTING_RECIPES.map((recipe) => {
            const affordable = canAfford(recipe);

            return (
              <div
                key={recipe.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{recipe.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {recipe.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">{recipe.description}</p>

                  {/* Resource Costs */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    {recipe.cost.wood && (
                      <span
                        className={`px-2 py-1 rounded-lg border font-semibold ${
                          inventory.wood >= recipe.cost.wood
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                            : 'bg-red-950/40 text-red-400 border-red-800/50'
                        }`}
                      >
                        🪵 Wood: {inventory.wood}/{recipe.cost.wood}
                      </span>
                    )}

                    {recipe.cost.stone && (
                      <span
                        className={`px-2 py-1 rounded-lg border font-semibold ${
                          inventory.stone >= recipe.cost.stone
                            ? 'bg-slate-900/60 text-slate-300 border-slate-700'
                            : 'bg-red-950/40 text-red-400 border-red-800/50'
                        }`}
                      >
                        🪨 Stone: {inventory.stone}/{recipe.cost.stone}
                      </span>
                    )}

                    {recipe.cost.sunberry && (
                      <span
                        className={`px-2 py-1 rounded-lg border font-semibold ${
                          inventory.sunberry >= recipe.cost.sunberry
                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                            : 'bg-red-950/40 text-red-400 border-red-800/50'
                        }`}
                      >
                        🍓 Berries: {inventory.sunberry}/{recipe.cost.sunberry}
                      </span>
                    )}

                    {recipe.cost.sparkgem && (
                      <span
                        className={`px-2 py-1 rounded-lg border font-semibold ${
                          inventory.sparkgem >= recipe.cost.sparkgem
                            ? 'bg-yellow-950/40 text-yellow-300 border-yellow-800/50'
                            : 'bg-red-950/40 text-red-400 border-red-800/50'
                        }`}
                      >
                        ⚡ Spark-Gem: {inventory.sparkgem}/{recipe.cost.sparkgem}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  disabled={!affordable}
                  onClick={() => {
                    soundManager.playItemPickup();
                    onCraftItem(recipe);
                  }}
                  className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                    affordable
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 shadow-lg'
                      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {affordable ? (
                    <>
                      <Hammer className="w-4 h-4" /> Craft & Place in 3D
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Missing Resources
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
