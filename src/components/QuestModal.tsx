import React, { useState } from 'react';
import { CheckCircle2, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { Quest } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  quests: Quest[];
  levelName: string;
  befriendedCount: number;
  playerLevel: number;
  onClaimQuest: (questId: string) => void;
  onAddDynamicQuest: (quest: Quest) => void;
  onClose: () => void;
}

export const QuestModal: React.FC<Props> = ({
  quests,
  levelName,
  befriendedCount,
  playerLevel,
  onClaimQuest,
  onAddDynamicQuest,
  onClose,
}) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerateQuest = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelName,
          befriendedCount,
          playerLevel,
        }),
      });

      const data = await res.json();
      soundManager.playItemPickup();

      const newQuest: Quest = {
        id: `dyn_quest_${Date.now()}`,
        title: data.title,
        description: data.description,
        biomeLevel: playerLevel,
        targetType: 'gather',
        targetCount: 3,
        currentCount: 0,
        rewardItem: data.rewardItem,
        rewardXp: data.rewardXp,
        rewardCoins: 50,
        completed: false,
      };

      onAddDynamicQuest(newQuest);
    } catch (err) {
      soundManager.playItemPickup();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Explorer Quest Log</h2>
              <p className="text-xs text-slate-400">Complete quests to gain XP and unlock new Biomes!</p>
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

        {/* AI Dynamic Quest Button */}
        <div className="p-4 bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs text-sky-200">
            Need a fresh adventure? Generate a dynamic side quest!
          </div>

          <button
            onClick={handleGenerateQuest}
            disabled={generating}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating Quest...' : 'AI Quest Generator'}
          </button>
        </div>

        {/* Quests List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {quests.map((quest) => {
            const isReady = quest.currentCount >= quest.targetCount && !quest.completed;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all ${
                  quest.completed
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : isReady
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg'
                    : 'bg-slate-800/80 border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{quest.title}</h3>
                      {quest.completed && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{quest.description}</p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-bold text-amber-300">+{quest.rewardXp} XP</span>
                    <div className="text-[10px] text-slate-400">{quest.rewardItem}</div>
                  </div>
                </div>

                {/* Progress bar or Claim Button */}
                {!quest.completed && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {quest.currentCount} / {quest.targetCount}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="bg-emerald-400 h-full transition-all duration-300"
                          style={{
                            width: `${Math.min((quest.currentCount / quest.targetCount) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {isReady && (
                      <button
                        onClick={() => {
                          soundManager.playLevelUp();
                          onClaimQuest(quest.id);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow cursor-pointer animate-bounce"
                      >
                        Claim Reward!
                      </button>
                    )}
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
