/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BefriendMinigameModal } from './components/BefriendMinigameModal';
import { CompanionChatModal } from './components/CompanionChatModal';
import { HabitatCraftingModal } from './components/HabitatCraftingModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PokopediaModal } from './components/PokopediaModal';
import { QuestModal } from './components/QuestModal';
import { ThreeGameCanvas } from './components/ThreeGameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { BIOME_LEVELS, CREATURE_DATABASE, INITIAL_QUESTS } from './data/gameData';
import { CraftingRecipe, Creature, HabitatDecoration, Inventory, Quest } from './types';
import { soundManager } from './utils/sound';

export default function App() {
  // Game State
  const [currentBiomeId, setCurrentBiomeId] = useState<number>(1);
  const [creatures, setCreatures] = useState<Creature[]>(CREATURE_DATABASE);
  const [activeCompanion, setActiveCompanion] = useState<Creature | null>(null);

  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [playerXp, setPlayerXp] = useState<number>(0);

  const [inventory, setInventory] = useState<Inventory>({
    sunberry: 8,
    electroberry: 4,
    frostberry: 2,
    starfruit: 1,
    wood: 12,
    stone: 8,
    sparkgem: 2,
    stardust: 1,
    coins: 100,
  });

  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [habitatDecorations, setHabitatDecorations] = useState<HabitatDecoration[]>([]);
  const [placementItem, setPlacementItem] = useState<string | null>(null);

  // Modals state
  const [showPokopedia, setShowPokopedia] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showCompanionChat, setShowCompanionChat] = useState(false);
  const [approachedCreature, setApproachedCreature] = useState<Creature | null>(null);

  // Controls input state
  const [touchInput, setTouchInput] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [jumpRequested, setJumpRequested] = useState<boolean>(false);

  const currentBiome = BIOME_LEVELS.find((b) => b.id === currentBiomeId) || BIOME_LEVELS[0];
  const activeQuest = quests.find((q) => !q.completed) || null;

  // XP & Leveling helper
  const addXp = (amount: number) => {
    setPlayerXp((prevXp) => {
      const total = prevXp + amount;
      if (total >= 200) {
        soundManager.playLevelUp();
        setPlayerLevel((lvl) => lvl + 1);
        return total - 200;
      }
      return total;
    });
  };

  // Resource Gathering Handler
  const handleGatherResource = (type: string, subType?: string) => {
    soundManager.playItemPickup();

    setInventory((prev) => {
      const next = { ...prev };
      if (type === 'berry') {
        if (subType === 'electroberry') next.electroberry += 2;
        else if (subType === 'frostberry') next.frostberry += 2;
        else if (subType === 'starfruit') next.starfruit += 2;
        else next.sunberry += 3;
      } else if (type === 'crystal') {
        if (subType === 'sparkgem') next.sparkgem += 1;
        else next.stone += 3;
      } else if (type === 'chest') {
        next.coins += 50;
        next.wood += 5;
        next.sunberry += 2;
      }
      return next;
    });

    addXp(15);

    // Update quest progress if gathering quest
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (!q.completed && q.targetType === 'gather') {
          const nextCount = q.currentCount + 1;
          return { ...q, currentCount: nextCount };
        }
        return q;
      })
    );
  };

  // Crafting Handler
  const handleCraftItem = (recipe: CraftingRecipe) => {
    // Deduct cost
    setInventory((prev) => {
      const next = { ...prev };
      if (recipe.cost.wood) next.wood -= recipe.cost.wood;
      if (recipe.cost.stone) next.stone -= recipe.cost.stone;
      if (recipe.cost.sunberry) next.sunberry -= recipe.cost.sunberry;
      if (recipe.cost.sparkgem) next.sparkgem -= recipe.cost.sparkgem;
      return next;
    });

    setShowCrafting(false);
    setPlacementItem(recipe.id);

    // Update quest progress
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (!q.completed && q.targetType === 'craft') {
          return { ...q, currentCount: q.currentCount + 1 };
        }
        return q;
      })
    );
  };

  // Habitat Placement Confirmation
  const handlePlaceDecoration = (itemType: string, position: [number, number, number]) => {
    soundManager.playItemPickup();
    const newDecor: HabitatDecoration = {
      id: `decor_${Date.now()}`,
      itemType,
      name: itemType,
      position,
      rotation: 0,
      icon: 'Bed',
    };

    setHabitatDecorations((prev) => [...prev, newDecor]);
    setPlacementItem(null);
    addXp(25);
  };

  // Befriend Success Handler
  const handleBefriendSuccess = (creatureId: string) => {
    setCreatures((prev) =>
      prev.map((c) => (c.id === creatureId ? { ...c, befriended: true, affection: 100 } : c))
    );

    const newlyBefriended = creatures.find((c) => c.id === creatureId);
    if (newlyBefriended) {
      setActiveCompanion(newlyBefriended);
    }

    setApproachedCreature(null);
    addXp(60);

    // Update quest progress
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (!q.completed && q.targetType === 'befriend') {
          return { ...q, currentCount: q.currentCount + 1 };
        }
        return q;
      })
    );
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    soundManager.playLevelUp();
    addXp(quest.rewardXp);

    setInventory((prev) => ({
      ...prev,
      coins: prev.coins + quest.rewardCoins,
    }));

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D Game Canvas */}
      <ThreeGameCanvas
        currentBiome={currentBiome}
        creatures={creatures}
        activeCompanion={activeCompanion}
        habitatDecorations={habitatDecorations}
        inventory={inventory}
        onGatherResource={handleGatherResource}
        onApproachCreature={(c) => {
          if (c.befriended) {
            setActiveCompanion(c);
            setShowCompanionChat(true);
          } else {
            setApproachedCreature(c);
          }
        }}
        onChangeBiome={(biomeId) => setCurrentBiomeId(biomeId)}
        onOpenCrafting={() => setShowCrafting(true)}
        placementItem={placementItem}
        onPlaceDecoration={handlePlaceDecoration}
        touchInput={touchInput}
        jumpRequested={jumpRequested}
        clearJumpRequest={() => setJumpRequested(false)}
      />

      {/* UI Controls & HUD Overlay */}
      <UIOverlay
        currentBiome={currentBiome}
        playerLevel={playerLevel}
        playerXp={playerXp}
        inventory={inventory}
        activeCompanion={activeCompanion}
        activeQuest={activeQuest}
        onOpenPokopedia={() => setShowPokopedia(true)}
        onOpenCrafting={() => setShowCrafting(true)}
        onOpenQuests={() => setShowQuests(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenCompanionChat={() => {
          if (activeCompanion) setShowCompanionChat(true);
          else setShowPokopedia(true);
        }}
        onTouchMove={(input) => setTouchInput(input)}
        onJumpRequest={() => setJumpRequested(true)}
      />

      {/* Modals */}
      {showPokopedia && (
        <PokopediaModal
          creatures={creatures}
          activeCompanion={activeCompanion}
          onSelectCompanion={(c) => {
            setActiveCompanion(c);
            setShowPokopedia(false);
          }}
          onClose={() => setShowPokopedia(false)}
        />
      )}

      {showCrafting && (
        <HabitatCraftingModal
          inventory={inventory}
          onCraftItem={handleCraftItem}
          onClose={() => setShowCrafting(false)}
        />
      )}

      {showQuests && (
        <QuestModal
          quests={quests}
          levelName={currentBiome.name}
          befriendedCount={creatures.filter((c) => c.befriended).length}
          playerLevel={playerLevel}
          onClaimQuest={handleClaimQuest}
          onAddDynamicQuest={(newQuest) => setQuests((prev) => [...prev, newQuest])}
          onClose={() => setShowQuests(false)}
        />
      )}

      {showLevelSelect && (
        <LevelSelectModal
          currentBiomeId={currentBiomeId}
          playerLevel={playerLevel}
          onSelectLevel={(id) => setCurrentBiomeId(id)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {showCompanionChat && activeCompanion && (
        <CompanionChatModal
          activeCompanion={activeCompanion}
          levelName={currentBiome.name}
          onClose={() => setShowCompanionChat(false)}
        />
      )}

      {approachedCreature && (
        <BefriendMinigameModal
          creature={approachedCreature}
          inventory={inventory}
          onBefriendSuccess={handleBefriendSuccess}
          onClose={() => setApproachedCreature(null)}
        />
      )}
    </div>
  );
}
