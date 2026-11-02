export type ElementType = 'Grass' | 'Electric' | 'Ice' | 'Water' | 'Fire' | 'Cosmic';

export interface Creature {
  id: string;
  name: string;
  element: ElementType;
  description: string;
  shapeType: 'fox' | 'bird' | 'bunny' | 'turtle' | 'bear' | 'seal' | 'jelly' | 'dragon' | 'sprout' | 'lizard' | 'snail' | 'star';
  primaryColor: string;
  secondaryColor: string;
  favoriteFood: string;
  ability: string;
  abilityDescription: string;
  biomeLevel: number; // 1 to 4
  befriended: boolean;
  level: number;
  affection: number; // 0 to 100
  habitatBonus: string;
}

export interface Inventory {
  sunberry: number;
  electroberry: number;
  frostberry: number;
  starfruit: number;
  wood: number;
  stone: number;
  sparkgem: number;
  stardust: number;
  coins: number;
}

export interface HabitatDecoration {
  id: string;
  itemType: string;
  name: string;
  position: [number, number, number];
  rotation: number;
  icon: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: 'Nest' | 'Decor' | 'Utility' | 'Special';
  cost: Partial<Inventory>;
  icon: string;
}

export interface WorldObject {
  id: string;
  type: 'berry_bush' | 'tree' | 'crystal' | 'chest' | 'portal' | 'nest';
  subType?: 'sunberry' | 'electroberry' | 'frostberry' | 'starfruit' | 'wood' | 'stone' | 'sparkgem';
  position: [number, number, number];
  harvested: boolean;
  respawnTime?: number;
  name: string;
}

export interface WildCreatureEntity {
  id: string;
  creatureId: string;
  position: [number, number, number];
  rotation: number;
  state: 'idle' | 'wandering' | 'eating' | 'sleeping' | 'happy';
  targetPos?: [number, number, number];
  friendshipProgress: number; // 0 to 100
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  biomeLevel: number;
  targetType: 'gather' | 'befriend' | 'craft' | 'explore' | 'level';
  targetCount: number;
  currentCount: number;
  rewardItem: string;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
}

export interface BiomeLevel {
  id: number;
  name: string;
  subtitle: string;
  themeColor: string;
  bgFogColor: string;
  skyColor: string;
  groundColor: string;
  accentColor: string;
  requiredPlayerLevel: number;
  unlocked: boolean;
  description: string;
  iconName: string;
  creatures: string[]; // creature ids
}
