import React, { useRef, useState } from 'react';
import {
  BookOpen,
  Compass,
  Hammer,
  HelpCircle,
  MessageCircle,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { BiomeLevel, Creature, Inventory, Quest } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  currentBiome: BiomeLevel;
  playerLevel: number;
  playerXp: number;
  inventory: Inventory;
  activeCompanion: Creature | null;
  activeQuest: Quest | null;
  onOpenPokopedia: () => void;
  onOpenCrafting: () => void;
  onOpenQuests: () => void;
  onOpenLevelSelect: () => void;
  onOpenCompanionChat: () => void;
  onTouchMove: (input: { x: number; y: number }) => void;
  onJumpRequest: () => void;
}

export const UIOverlay: React.FC<Props> = ({
  currentBiome,
  playerLevel,
  playerXp,
  inventory,
  activeCompanion,
  activeQuest,
  onOpenPokopedia,
  onOpenCrafting,
  onOpenQuests,
  onOpenLevelSelect,
  onOpenCompanionChat,
  onTouchMove,
  onJumpRequest,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Virtual Joystick handlers for Touch/Mouse
  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDraggingJoystick(true);
    updateJoystick(e);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingJoystick) return;
    updateJoystick(e);
  };

  const handleJoystickEnd = () => {
    setIsDraggingJoystick(false);
    setJoystickPos({ x: 0, y: 0 });
    onTouchMove({ x: 0, y: 0 });
  };

  const updateJoystick = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickContainerRef.current) return;
    const rect = joystickContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const maxRadius = rect.width / 2;

    const normalizedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(deltaY, deltaX);

    const knobX = Math.cos(angle) * normalizedDist;
    const knobY = Math.sin(angle) * normalizedDist;

    setJoystickPos({ x: knobX, y: knobY });

    // Output -1 to 1 range
    onTouchMove({
      x: knobX / maxRadius,
      y: knobY / maxRadius,
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Player Level & Active Biome Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md text-white p-2.5 px-4 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-900 text-lg shadow">
              {playerLevel}
            </div>
            <span className="absolute -bottom-1 -right-1 text-[10px] font-extrabold bg-emerald-500 text-slate-950 px-1 rounded shadow">
              LVL
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">{currentBiome.name}</span>
              <button
                onClick={onOpenLevelSelect}
                className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/40 transition flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3 h-3" />
                Change Level
              </button>
            </div>

            {/* XP Progress Bar */}
            <div className="w-36 bg-slate-800 h-2 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-300"
                style={{ width: `${Math.min((playerXp / 200) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Active Companion Badge */}
        {activeCompanion ? (
          <button
            onClick={onOpenCompanionChat}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-purple-500/40 shadow-xl hover:scale-105 transition cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow"
              style={{ backgroundColor: activeCompanion.primaryColor }}
            >
              🐾
            </div>
            <div className="text-left">
              <div className="text-xs text-purple-200 flex items-center gap-1">
                Active Companion <MessageCircle className="w-3 h-3 text-purple-300" />
              </div>
              <div className="font-bold text-sm">{activeCompanion.name}</div>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenPokopedia}
            className="bg-slate-900/80 text-slate-300 px-4 py-2 rounded-2xl border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            + Choose Companion in Pokopedia
          </button>
        )}

        {/* Right: Quick Inventory Resources Bar */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md text-white px-3 py-2 rounded-2xl border border-slate-700/80 text-xs font-bold shadow-xl">
          <span className="flex items-center gap-1 text-red-400">
            🍓 {inventory.sunberry + inventory.electroberry + inventory.frostberry + inventory.starfruit}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-amber-300">
            🪵 {inventory.wood}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            🪨 {inventory.stone}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-yellow-400">
            🪙 {inventory.coins}
          </span>

          <button
            onClick={toggleSound}
            className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Middle Right Menu Action Buttons */}
      <div className="absolute right-4 top-24 flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={onOpenPokopedia}
          className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-emerald-300/40 hover:scale-110 transition cursor-pointer group"
          title="Pokopedia"
        >
          <BookOpen className="w-6 h-6" />
        </button>

        <button
          onClick={onOpenCrafting}
          className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-amber-300/40 hover:scale-110 transition cursor-pointer"
          title="Base Crafting & Decorator"
        >
          <Hammer className="w-6 h-6" />
        </button>

        <button
          onClick={onOpenQuests}
          className="relative w-12 h-12 bg-gradient-to-tr from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-sky-300/40 hover:scale-110 transition cursor-pointer"
          title="Adventure Quests"
        >
          <Zap className="w-6 h-6" />
          {activeQuest && !activeQuest.completed && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* Active Quest Quick Tracker Box (Bottom Left) */}
      {activeQuest && (
        <div className="absolute left-4 bottom-28 pointer-events-auto bg-slate-900/85 backdrop-blur-md text-white p-3 px-4 rounded-2xl border border-slate-700/80 max-w-xs shadow-2xl">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 flex items-center justify-between">
            <span>Active Quest</span>
            <span className="text-slate-400">+{activeQuest.rewardXp} XP</span>
          </div>
          <div className="font-bold text-sm text-slate-100 mt-0.5">{activeQuest.title}</div>
          <div className="text-xs text-slate-300 line-clamp-2 mt-0.5">{activeQuest.description}</div>
        </div>
      )}

      {/* Bottom Controls Bar (Touch Virtual Joystick + Mobile Jump Button) */}
      <div className="flex items-end justify-between pointer-events-auto w-full">
        {/* Touch Virtual Joystick */}
        <div
          ref={joystickContainerRef}
          onMouseDown={handleJoystickStart}
          onMouseMove={handleJoystickMove}
          onMouseUp={handleJoystickEnd}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          className="relative w-28 h-28 bg-slate-900/60 backdrop-blur-md rounded-full border-2 border-slate-600/80 flex items-center justify-center shadow-2xl touch-none"
        >
          <div
            className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full shadow-lg border border-white/50 transition-transform duration-75"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          />
        </div>

        {/* Touch Jump Button */}
        <button
          onClick={onJumpRequest}
          className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 active:from-amber-600 text-slate-950 font-black text-sm rounded-full shadow-2xl border-2 border-yellow-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
