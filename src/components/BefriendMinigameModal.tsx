import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, X } from 'lucide-react';
import { Creature, Inventory } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  creature: Creature;
  inventory: Inventory;
  onBefriendSuccess: (creatureId: string) => void;
  onClose: () => void;
}

export const BefriendMinigameModal: React.FC<Props> = ({
  creature,
  inventory,
  onBefriendSuccess,
  onClose,
}) => {
  const [friendshipProgress, setFriendshipProgress] = useState(creature.affection || 0);
  const [message, setMessage] = useState(`Offer a ${creature.favoriteFood} to befriend ${creature.name}!`);

  const getBerryCount = (foodName: string) => {
    switch (foodName) {
      case 'sunberry':
        return inventory.sunberry;
      case 'electroberry':
        return inventory.electroberry;
      case 'frostberry':
        return inventory.frostberry;
      case 'starfruit':
        return inventory.starfruit;
      default:
        return inventory.sunberry;
    }
  };

  const count = getBerryCount(creature.favoriteFood);

  const handleFeedBerry = () => {
    if (count <= 0) {
      setMessage(`You need a ${creature.favoriteFood}! Gather some from bushes in 3D world.`);
      return;
    }

    soundManager.playCreatureHappy();
    const newProgress = Math.min(friendshipProgress + 35, 100);
    setFriendshipProgress(newProgress);

    if (newProgress >= 100) {
      soundManager.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setMessage(`Yay! ${creature.name} is now your befriended companion! 🎉`);
      setTimeout(() => {
        onBefriendSuccess(creature.id);
      }, 1200);
    } else {
      setMessage(`${creature.name} happily eats the berry and loves you more! 💕`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl text-center">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Creature Befriending
          </span>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creature Preview */}
        <div className="p-6 flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border-2 border-white/30 animate-bounce"
            style={{ backgroundColor: creature.primaryColor }}
          >
            🐾
          </div>

          <h3 className="text-2xl font-black text-white mt-4">{creature.name}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">{creature.description}</p>

          {/* Friendship Meter */}
          <div className="w-full bg-slate-800 rounded-2xl p-4 mt-5 border border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-2">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 fill-rose-400" /> Affection Meter
              </span>
              <span>{friendshipProgress} / 100%</span>
            </div>

            <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${friendshipProgress}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-amber-300 font-semibold mt-4">{message}</p>

          {/* Feed Button */}
          <button
            onClick={handleFeedBerry}
            className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer"
          >
            🍓 Feed {creature.favoriteFood} (Owned: {count})
          </button>
        </div>
      </div>
    </div>
  );
};
