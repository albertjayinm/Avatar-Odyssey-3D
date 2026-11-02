import * as THREE from 'three';
import { BiomeLevel, Creature } from '../types';

// ==========================================
// 1. POLISHED 3D EXPLORER CHARACTER MESH
// ==========================================
export function createPlayerMesh(): THREE.Group {
  const player = new THREE.Group();
  player.name = 'player';

  // Skin & Palette Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffdfd0,
    roughness: 0.5,
    metalness: 0.05,
  });

  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Vibrant adventure blue
    roughness: 0.4,
    metalness: 0.1,
  });

  const jacketTrimMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.3,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.6,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Dark slate adventure cargo shorts
    roughness: 0.6,
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x854d0e, // Rich leather hiking boots
    roughness: 0.4,
  });

  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Heavy rubber tread
    roughness: 0.8,
  });

  const hatMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Safari amber/khaki
    roughness: 0.5,
  });

  const hatBandMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.4,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.2,
    metalness: 0.8,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x582f1b, // Warm chestnut bangs
    roughness: 0.7,
  });

  const scarfMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red adventure bandana
    roughness: 0.4,
  });

  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412, // Rust leather backpack
    roughness: 0.5,
  });

  const bedrollMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Forest green rolled mat
    roughness: 0.7,
  });

  // Root Pivot offset so base of boots is at Y = 0
  const characterRoot = new THREE.Group();
  characterRoot.name = 'characterRoot';
  player.add(characterRoot);

  // ------------------------------------------
  // TORSO & CLOTHING
  // ------------------------------------------
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'torso';
  torsoGroup.position.set(0, 0.75, 0);
  characterRoot.add(torsoGroup);

  // Inner shirt / neck
  const neckGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.3, 10);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.55;
  torsoGroup.add(neck);

  // Main Jacket Body
  const bodyGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.65, 12);
  const body = new THREE.Mesh(bodyGeo, jacketMat);
  body.castShadow = true;
  body.receiveShadow = true;
  torsoGroup.add(body);

  // Jacket Zipper line & trim
  const zipperGeo = new THREE.BoxGeometry(0.06, 0.66, 0.38);
  const zipper = new THREE.Mesh(zipperGeo, jacketTrimMat);
  zipper.position.set(0, 0, 0.16);
  torsoGroup.add(zipper);

  // Chest utility pockets
  const pocketGeo = new THREE.BoxGeometry(0.14, 0.14, 0.08);
  const leftPocket = new THREE.Mesh(pocketGeo, jacketTrimMat);
  leftPocket.position.set(0.18, 0.1, 0.32);
  torsoGroup.add(leftPocket);

  const rightPocket = new THREE.Mesh(pocketGeo, jacketTrimMat);
  rightPocket.position.set(-0.18, 0.1, 0.32);
  torsoGroup.add(rightPocket);

  // Utility Belt & Gold Buckle
  const beltGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.1, 14);
  const belt = new THREE.Mesh(beltGeo, hatBandMat);
  belt.position.y = -0.28;
  torsoGroup.add(belt);

  const buckleGeo = new THREE.BoxGeometry(0.14, 0.12, 0.08);
  const buckle = new THREE.Mesh(buckleGeo, goldMat);
  buckle.position.set(0, -0.28, 0.36);
  torsoGroup.add(buckle);

  // Side Belt Pouches
  const pouchGeo = new THREE.BoxGeometry(0.1, 0.12, 0.14);
  const sidePouchL = new THREE.Mesh(pouchGeo, hatBandMat);
  sidePouchL.position.set(0.36, -0.28, 0.02);
  torsoGroup.add(sidePouchL);

  const sidePouchR = new THREE.Mesh(pouchGeo, hatBandMat);
  sidePouchR.position.set(-0.36, -0.28, 0.02);
  torsoGroup.add(sidePouchR);

  // ------------------------------------------
  // ADVENTURE SCARF / BANDANA
  // ------------------------------------------
  const scarfCollarGeo = new THREE.TorusGeometry(0.24, 0.08, 8, 16);
  const scarfCollar = new THREE.Mesh(scarfCollarGeo, scarfMat);
  scarfCollar.rotation.x = Math.PI / 2;
  scarfCollar.position.set(0, 0.38, 0.02);
  torsoGroup.add(scarfCollar);

  // Fluttering Scarf Tails (Dynamic animation targets)
  const scarfTail1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 4), scarfMat);
  scarfTail1.name = 'scarfTail1';
  scarfTail1.position.set(0.08, 0.24, 0.28);
  scarfTail1.rotation.x = 0.4;
  scarfTail1.rotation.z = -0.2;
  torsoGroup.add(scarfTail1);

  const scarfTail2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), scarfMat);
  scarfTail2.name = 'scarfTail2';
  scarfTail2.position.set(0.02, 0.22, 0.26);
  scarfTail2.rotation.x = 0.3;
  scarfTail2.rotation.z = 0.1;
  torsoGroup.add(scarfTail2);

  // ------------------------------------------
  // HEAD & CUTE POLISHED FACE
  // ------------------------------------------
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  headGroup.position.set(0, 1.36, 0);
  characterRoot.add(headGroup);

  // Main Head (chibi egg/sphere)
  const headGeo = new THREE.SphereGeometry(0.38, 16, 16);
  headGeo.scale(1, 1.05, 1);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Hair Locks & Bangs under hat
  const hairBangs = new THREE.Group();
  const bang1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 6), hairMat);
  bang1.position.set(-0.16, 0.18, 0.32);
  bang1.rotation.set(-0.3, 0.2, 0.4);
  hairBangs.add(bang1);

  const bang2 = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 6), hairMat);
  bang2.position.set(0.04, 0.2, 0.34);
  bang2.rotation.set(-0.25, -0.1, -0.2);
  hairBangs.add(bang2);

  const bang3 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 6), hairMat);
  bang3.position.set(0.2, 0.16, 0.3);
  bang3.rotation.set(-0.3, -0.3, -0.4);
  hairBangs.add(bang3);

  // Sideburn tufts
  const sideHairL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 5), hairMat);
  sideHairL.position.set(0.34, 0.05, 0.12);
  sideHairL.rotation.set(0, 0, -0.3);
  hairBangs.add(sideHairL);

  const sideHairR = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 5), hairMat);
  sideHairR.position.set(-0.34, 0.05, 0.12);
  sideHairR.rotation.set(0, 0, 0.3);
  hairBangs.add(sideHairR);

  headGroup.add(hairBangs);

  // Large Expressive Chibi Eyes
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.1 }); // Deep starry navy
  const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 }); // Rosy pink cheeks

  function createChibiEye(isLeft: boolean) {
    const eye = new THREE.Group();
    const sign = isLeft ? 1 : -1;

    // Eye socket base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 12), eyeWhiteMat);
    base.rotation.x = Math.PI / 2;
    eye.add(base);

    // Dark Iris
    const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 12), irisMat);
    iris.rotation.x = Math.PI / 2;
    iris.position.z = 0.01;
    eye.add(iris);

    // Specular Shine Dots (twinkle)
    const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), shineMat);
    shine1.position.set(sign * 0.022, 0.025, 0.03);
    eye.add(shine1);

    const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), shineMat);
    shine2.position.set(-sign * 0.02, -0.02, 0.03);
    eye.add(shine2);

    return eye;
  }

  const leftEye = createChibiEye(true);
  leftEye.position.set(0.14, 0.04, 0.35);
  leftEye.rotation.y = 0.18;
  headGroup.add(leftEye);

  const rightEye = createChibiEye(false);
  rightEye.position.set(-0.14, 0.04, 0.35);
  rightEye.rotation.y = -0.18;
  headGroup.add(rightEye);

  // Rosy Cheek Blushes
  const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.055, 10), blushMat);
  blushL.position.set(0.22, -0.08, 0.32);
  blushL.rotation.y = 0.3;
  headGroup.add(blushL);

  const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.055, 10), blushMat);
  blushR.position.set(-0.22, -0.08, 0.32);
  blushR.rotation.y = -0.3;
  headGroup.add(blushR);

  // Cute Button Smile
  const smileCurve = new THREE.TorusGeometry(0.06, 0.015, 6, 12, Math.PI);
  const smile = new THREE.Mesh(smileCurve, new THREE.MeshBasicMaterial({ color: 0x9f1239 }));
  smile.position.set(0, -0.12, 0.37);
  smile.rotation.x = Math.PI * 0.95;
  headGroup.add(smile);

  // ------------------------------------------
  // EXPLORER HAT
  // ------------------------------------------
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.28, -0.02);
  hatGroup.rotation.x = -0.08;
  headGroup.add(hatGroup);

  // Curved Brim
  const brimGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.05, 20);
  const brim = new THREE.Mesh(brimGeo, hatMat);
  brim.castShadow = true;
  hatGroup.add(brim);

  // Brim Edge Stitch Trim
  const brimTrimGeo = new THREE.TorusGeometry(0.68, 0.025, 6, 24);
  const brimTrim = new THREE.Mesh(brimTrimGeo, hatBandMat);
  brimTrim.rotation.x = Math.PI / 2;
  hatGroup.add(brimTrim);

  // Crown
  const crownGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.38, 16);
  const crown = new THREE.Mesh(crownGeo, hatMat);
  crown.position.y = 0.18;
  crown.castShadow = true;
  hatGroup.add(crown);

  // Crown Top Pinch
  const crownPinch = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), hatMat);
  crownPinch.position.y = 0.34;
  hatGroup.add(crownPinch);

  // Leather Hat Band
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 16), hatBandMat);
  band.position.y = 0.06;
  hatGroup.add(band);

  // Expedition Feather & Gold Badge
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), goldMat);
  badge.position.set(0.42, 0.08, 0.12);
  badge.rotation.z = Math.PI / 2;
  hatGroup.add(badge);

  const featherGeo = new THREE.ConeGeometry(0.05, 0.28, 4);
  const featherMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 }); // Emerald explorer feather
  const feather = new THREE.Mesh(featherGeo, featherMat);
  feather.position.set(0.44, 0.22, 0.12);
  feather.rotation.z = -0.3;
  hatGroup.add(feather);

  // ------------------------------------------
  // BACKPACK & EXPLORER GEAR
  // ------------------------------------------
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(0, 0, -0.28);
  torsoGroup.add(backpackGroup);

  // Rucksack Main Body
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.24), backpackMat);
  pack.castShadow = true;
  backpackGroup.add(pack);

  // Top Rolled Sleeping Mat / Bedroll
  const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.54, 12), bedrollMat);
  bedroll.rotation.z = Math.PI / 2;
  bedroll.position.set(0, 0.32, 0);
  bedroll.castShadow = true;
  backpackGroup.add(bedroll);

  // Bedroll Straps
  const bedrollStrap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 12), hatBandMat);
  bedrollStrap1.rotation.z = Math.PI / 2;
  bedrollStrap1.position.set(-0.16, 0.32, 0);
  backpackGroup.add(bedrollStrap1);

  const bedrollStrap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 12), hatBandMat);
  bedrollStrap2.rotation.z = Math.PI / 2;
  bedrollStrap2.position.set(0.16, 0.32, 0);
  backpackGroup.add(bedrollStrap2);

  // Side Metal Water Canteen
  const canteen = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.24, 10), goldMat);
  canteen.position.set(0.26, -0.06, 0);
  backpackGroup.add(canteen);

  // ------------------------------------------
  // ARTICULATED ARMS (Shoulder Pivots)
  // ------------------------------------------
  function createArm(isLeft: boolean) {
    const armGroup = new THREE.Group();
    const sign = isLeft ? 1 : -1;
    armGroup.name = isLeft ? 'leftArm' : 'rightArm';
    armGroup.position.set(sign * 0.38, 0.22, 0);

    // Shoulder sphere
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), jacketMat);
    armGroup.add(shoulder);

    // Arm sleeve
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.34, 10), jacketMat);
    sleeve.position.y = -0.16;
    sleeve.castShadow = true;
    armGroup.add(sleeve);

    // White cuff
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 10), shirtMat);
    cuff.position.y = -0.32;
    armGroup.add(cuff);

    // Cute Hand / Mitten
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), skinMat);
    hand.position.y = -0.4;
    hand.scale.set(1, 1.1, 0.9);
    armGroup.add(hand);

    return armGroup;
  }

  const leftArm = createArm(true);
  torsoGroup.add(leftArm);

  const rightArm = createArm(false);
  torsoGroup.add(rightArm);

  // ------------------------------------------
  // ARTICULATED LEGS & HIKING BOOTS (Hip Pivots)
  // ------------------------------------------
  function createLeg(isLeft: boolean) {
    const legGroup = new THREE.Group();
    const sign = isLeft ? 1 : -1;
    legGroup.name = isLeft ? 'leftLeg' : 'rightLeg';
    legGroup.position.set(sign * 0.18, 0.48, 0);

    // Cargo Shorts Leg
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.26, 10), pantsMat);
    thigh.position.y = -0.12;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Leg skin / sock
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 8), shirtMat);
    shin.position.y = -0.28;
    legGroup.add(shin);

    // Hiking Boot
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -0.4, 0.05);

    // Ankle cuff
    const bootAnkle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 10), bootMat);
    bootGroup.add(bootAnkle);

    // Foot base
    const footGeo = new THREE.BoxGeometry(0.24, 0.14, 0.36);
    const foot = new THREE.Mesh(footGeo, bootMat);
    foot.position.set(0, -0.04, 0.06);
    foot.castShadow = true;
    bootGroup.add(foot);

    // Thick rubber sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.4), soleMat);
    sole.position.set(0, -0.12, 0.06);
    bootGroup.add(sole);

    legGroup.add(bootGroup);

    return legGroup;
  }

  const leftLeg = createLeg(true);
  characterRoot.add(leftLeg);

  const rightLeg = createLeg(false);
  characterRoot.add(rightLeg);

  // Overall scale adjustment for perfect proportions
  player.scale.setScalar(1.0);

  return player;
}

// ==========================================
// 2. PROCEDURAL EARTH-LIKE PLANET / GLOBE
// ==========================================
export interface PlanetResult {
  planetGroup: THREE.Group;
  surfaceRadius: number;
  cloudGroup: THREE.Group;
  starField: THREE.Points;
  atmosphereMesh: THREE.Mesh;
  getElevationAt: (unitPos: THREE.Vector3) => { elevation: number; isLand: boolean };
}

// Procedural harmonic noise for realistic Earth continents & terrain
export function sampleEarthTerrain(nx: number, ny: number, nz: number): { elevation: number; isLand: boolean } {
  // Spherical harmonics for continental landmasses
  const lon = Math.atan2(nz, nx);
  const lat = Math.asin(Math.max(-1, Math.min(1, ny)));

  // Major continental plates
  const c1 = Math.sin(2.0 * lon) * Math.cos(1.8 * lat);
  const c2 = Math.cos(3.2 * lon + 1.2) * Math.sin(2.5 * lat + 0.5) * 0.6;
  const c3 = Math.sin(5.5 * lon - 2.0) * Math.cos(4.2 * lat) * 0.35;
  const c4 = Math.cos(8.0 * lon + lat * 5.0) * 0.2;

  // Polar ice cap boost
  const polar = Math.pow(Math.abs(ny), 3.0) * 0.9;

  const continentNoise = c1 + c2 + c3 + c4 + polar;

  // Land threshold
  if (continentNoise > 0.05) {
    // Mountain ridges and rolling hills on land
    const hill1 = Math.sin(nx * 14.0 + ny * 10.0) * Math.cos(nz * 14.0) * 0.45;
    const hill2 = Math.cos(nx * 24.0 + nz * 20.0) * 0.25;
    const mountain = Math.max(0, continentNoise - 0.4) * 2.2;
    const landElevation = 0.35 + (continentNoise * 0.8) + hill1 + hill2 + mountain;
    return { elevation: Math.max(0.2, landElevation), isLand: true };
  } else {
    // Ocean basin
    const oceanDepth = Math.max(-0.6, (continentNoise - 0.05) * 0.8);
    return { elevation: oceanDepth, isLand: false };
  }
}

export function createPlanetMesh(radius: number, biome: BiomeLevel): PlanetResult {
  const planetGroup = new THREE.Group();
  planetGroup.name = 'planetGlobe';

  // 1. Planetary Crust (Icosahedron sphere with continent elevation & Earth vertex colors)
  const planetGeo = new THREE.IcosahedronGeometry(radius, 36);
  const posAttr = planetGeo.attributes.position;
  const vertex = new THREE.Vector3();

  const colors: number[] = [];

  // Realistic Earth Color Palette
  const deepOceanColor = new THREE.Color(0x02568a);
  const shallowWaterColor = new THREE.Color(0x0284c7);
  const beachSandColor = new THREE.Color(0xfde047);
  const grassColor = new THREE.Color(0x16a34a); // Rich Earth green
  const forestColor = new THREE.Color(0x15803d);
  const rockColor = new THREE.Color(0x64748b);
  const snowColor = new THREE.Color(0xf8fafc);

  // Biome-specific tints if traveling to fantasy biomes
  if (biome.id === 2) {
    grassColor.setHex(0xd97706); // Amber Ravine
    forestColor.setHex(0xb45309);
  } else if (biome.id === 3) {
    grassColor.setHex(0x93c5fd); // Frosted Peaks
    forestColor.setHex(0x60a5fa);
  } else if (biome.id === 4) {
    grassColor.setHex(0x9333ea); // Cosmic Grotto
    forestColor.setHex(0x6b21a8);
  }

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i);
    vertex.normalize();

    const { elevation, isLand } = sampleEarthTerrain(vertex.x, vertex.y, vertex.z);

    // Apply elevation displacement to vertex
    const r = radius + (isLand ? elevation : -0.2);
    vertex.multiplyScalar(r);
    posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);

    // Realistic Earth color gradient
    const c = new THREE.Color();
    const absY = Math.abs(vertex.y / r);

    if (absY > 0.82) {
      // Polar Ice Caps
      c.copy(snowColor);
    } else if (!isLand) {
      // Oceans
      c.copy(deepOceanColor).lerp(shallowWaterColor, Math.max(0, elevation + 0.6));
    } else if (elevation < 0.6) {
      // Sandy coastal shores
      c.copy(beachSandColor).lerp(grassColor, (elevation - 0.2) / 0.4);
    } else if (elevation < 1.6) {
      // Lowland plains & woodlands
      c.copy(grassColor).lerp(forestColor, (elevation - 0.6) / 1.0);
    } else if (elevation < 2.5) {
      // Mountain slopes
      c.copy(forestColor).lerp(rockColor, (elevation - 1.6) / 0.9);
    } else {
      // Snowcapped peaks
      c.copy(rockColor).lerp(snowColor, Math.min(1, (elevation - 2.5) / 0.8));
    }

    colors.push(c.r, c.g, c.b);
  }

  planetGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  planetGeo.computeVertexNormals();

  const planetMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.82,
    metalness: 0.08,
    flatShading: true,
  });

  const planetSurface = new THREE.Mesh(planetGeo, planetMat);
  planetSurface.receiveShadow = true;
  planetSurface.name = 'planetSurface';
  planetGroup.add(planetSurface);

  // 2. Realistic Earth Ocean Layer (Translucent sphere for water depth and specular sun glint)
  const oceanGeo = new THREE.SphereGeometry(radius + 0.05, 48, 48);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.35,
    transparent: true,
    opacity: 0.72,
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.receiveShadow = true;
  planetGroup.add(oceanMesh);

  // 3. Glowing Earth Atmospheric Halo (Rayleigh scattering blue glow)
  const atmosGeo = new THREE.SphereGeometry(radius * 1.045, 36, 36);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.35,
  });
  const atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
  planetGroup.add(atmosphereMesh);

  // 4. Floating Whimsical Earth Cloud Formations
  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'orbitingClouds';
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.9,
  });

  // Create 24 puffy Earth clouds distributed across continents
  for (let c = 0; c < 24; c++) {
    const singleCloud = new THREE.Group();
    const puffCount = 5 + Math.floor(Math.random() * 4);

    for (let p = 0; p < puffCount; p++) {
      const puffGeo = new THREE.DodecahedronGeometry(1.6 + Math.random() * 1.0, 1);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (p - puffCount / 2) * 1.8,
        Math.random() * 0.6,
        (Math.random() - 0.5) * 1.2
      );
      puff.castShadow = true;
      singleCloud.add(puff);
    }

    // Position cloud on atmospheric sphere shell
    const phi = Math.random() * Math.PI;
    const theta = Math.random() * Math.PI * 2;
    const rCloud = radius + 4.8 + Math.random() * 2.2;

    const cloudPos = new THREE.Vector3(
      rCloud * Math.sin(phi) * Math.cos(theta),
      rCloud * Math.cos(phi),
      rCloud * Math.sin(phi) * Math.sin(theta)
    );
    singleCloud.position.copy(cloudPos);

    const upNorm = cloudPos.clone().normalize();
    singleCloud.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), upNorm);

    cloudGroup.add(singleCloud);
  }
  planetGroup.add(cloudGroup);

  // 5. Deep Space Cosmic Starfield
  const starCount = 800;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let s = 0; s < starCount; s++) {
    const sRad = 240 + Math.random() * 80;
    const sTheta = Math.random() * Math.PI * 2;
    const sPhi = Math.acos(Math.random() * 2 - 1);

    starPositions[s * 3] = sRad * Math.sin(sPhi) * Math.cos(sTheta);
    starPositions[s * 3 + 1] = sRad * Math.cos(sPhi);
    starPositions[s * 3 + 2] = sRad * Math.sin(sPhi) * Math.sin(sTheta);

    const isGold = Math.random() > 0.75;
    starColors[s * 3] = isGold ? 1.0 : 0.85;
    starColors[s * 3 + 1] = isGold ? 0.92 : 0.92;
    starColors[s * 3 + 2] = isGold ? 0.55 : 1.0;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  });

  const starField = new THREE.Points(starGeo, starMat);
  starField.name = 'starField';

  // 6. Cute Earth Moon in the distance
  const moonGroup = new THREE.Group();
  moonGroup.name = 'earthMoon';
  const moonGeo = new THREE.SphereGeometry(6.5, 16, 16);
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.75,
  });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.set(130, 75, -120);
  moonGroup.add(moon);
  planetGroup.add(moonGroup);

  const getElevationAt = (unitPos: THREE.Vector3) => {
    return sampleEarthTerrain(unitPos.x, unitPos.y, unitPos.z);
  };

  return {
    planetGroup,
    surfaceRadius: radius,
    cloudGroup,
    starField,
    atmosphereMesh,
    getElevationAt,
  };
}

// Helper: Align an Object3D to sit flush on a planet sphere at position and face direction
export function orientToPlanetSurface(
  obj: THREE.Object3D,
  position: THREE.Vector3,
  tangentForward?: THREE.Vector3,
  bankingAngle: number = 0
) {
  const normal = position.clone().normalize();
  obj.position.copy(position);

  if (tangentForward && tangentForward.lengthSq() > 0.001) {
    // Project tangentForward onto the tangent plane at normal
    const forward = tangentForward
      .clone()
      .sub(normal.clone().multiplyScalar(tangentForward.dot(normal)))
      .normalize();

    // Right vector (pointing to character's local +X)
    const right = new THREE.Vector3().crossVectors(normal, forward).normalize();

    // Since character model was built with:
    // +Y = Up (head/hat)
    // +Z = Forward (face, eyes, toes)
    // +X = Right
    // Basis (right, normal, forward) maps (1,0,0)->right, (0,1,0)->normal, (0,0,1)->forward!
    const rotMat = new THREE.Matrix4().makeBasis(right, normal, forward);
    obj.quaternion.setFromRotationMatrix(rotMat);

    // Apply bank lean into sharp turns
    if (Math.abs(bankingAngle) > 0.001) {
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(forward, bankingAngle);
      obj.quaternion.multiply(rollQuat);
    }
  } else {
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  }
}

// Convert Spherical Lat/Lon (in radians) to 3D Cartesian Vector
export function sphereLatLonToCartesian(radius: number, latRad: number, lonRad: number): THREE.Vector3 {
  const phi = Math.PI / 2 - latRad;
  const theta = lonRad;
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  );
}

// ==========================================
// 3. TREE MESH (Pivoted at bottom for globe)
// ==========================================
export function createTreeMesh(biomeId: number): THREE.Group {
  const tree = new THREE.Group();
  tree.name = 'tree';

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.8,
  });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.4, 2.0, 8), trunkMat);
  trunk.position.y = 1.0;
  trunk.castShadow = true;
  tree.add(trunk);

  let leafColor = 0x16a34a; // Meadow
  if (biomeId === 2) leafColor = 0xd97706; // Ravine
  if (biomeId === 3) leafColor = 0xbae6fd; // Snow
  if (biomeId === 4) leafColor = 0xa855f7; // Cosmic

  const leafMat = new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: 0.4,
  });

  if (biomeId === 3) {
    // Tiered Pine Tree
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(1.4 - i * 0.35, 1.4, 8),
        leafMat
      );
      cone.position.y = 1.8 + i * 0.85;
      cone.castShadow = true;
      tree.add(cone);
    }
  } else {
    // Stylized Round Puffy Foliage
    const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), leafMat);
    f1.position.y = 2.4;
    f1.castShadow = true;
    tree.add(f1);

    const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), leafMat);
    f2.position.set(0.35, 3.1, 0.2);
    f2.castShadow = true;
    tree.add(f2);
  }

  return tree;
}

// ==========================================
// 4. RESOURCE & PORTAL MESHES
// ==========================================
export function createResourceMesh(type: string, subType?: string): THREE.Group {
  const res = new THREE.Group();

  if (type === 'berry_bush') {
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), bushMat);
    bush.position.y = 0.55;
    bush.castShadow = true;
    res.add(bush);

    let berryColor = 0xef4444;
    if (subType === 'electroberry') berryColor = 0xfacc15;
    if (subType === 'frostberry') berryColor = 0x38bdf8;
    if (subType === 'starfruit') berryColor = 0xc084fc;

    const bMat = new THREE.MeshStandardMaterial({
      color: berryColor,
      emissive: berryColor,
      emissiveIntensity: 0.4,
    });

    for (let i = 0; i < 6; i++) {
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), bMat);
      const angle = (i / 6) * Math.PI * 2;
      berry.position.set(Math.cos(angle) * 0.6, 0.65 + (i % 2) * 0.2, Math.sin(angle) * 0.6);
      res.add(berry);
    }
  } else if (type === 'crystal') {
    let crysColor = 0x38bdf8;
    if (subType === 'sparkgem') crysColor = 0xfacc15;
    if (subType === 'starfruit') crysColor = 0xe0e7ff;

    const crysMat = new THREE.MeshStandardMaterial({
      color: crysColor,
      emissive: crysColor,
      emissiveIntensity: 0.7,
      roughness: 0.1,
    });

    for (let i = 0; i < 3; i++) {
      const crys = new THREE.Mesh(new THREE.ConeGeometry(0.24 + i * 0.05, 0.9 + i * 0.2, 5), crysMat);
      crys.position.set((i - 1) * 0.3, 0.5 + i * 0.1, 0);
      crys.rotation.z = (i - 1) * 0.2;
      crys.castShadow = true;
      res.add(crys);
    }

    const light = new THREE.PointLight(crysColor, 1.4, 4);
    light.position.y = 0.9;
    res.add(light);
  } else if (type === 'chest') {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.65), new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.4 }));
    box.position.y = 0.3;
    box.castShadow = true;
    res.add(box);

    const band = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 0.67), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 }));
    band.position.y = 0.35;
    res.add(band);
  } else if (type === 'portal') {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });

    const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 3.2, 8), stoneMat);
    pillarL.position.set(-1.3, 1.6, 0);
    pillarL.castShadow = true;
    res.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 3.2, 8), stoneMat);
    pillarR.position.set(1.3, 1.6, 0);
    pillarR.castShadow = true;
    res.add(pillarR);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.45, 0.7), stoneMat);
    topBeam.position.set(0, 3.2, 0);
    topBeam.castShadow = true;
    res.add(topBeam);

    const disk = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 20),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    disk.position.set(0, 1.6, 0);
    disk.name = 'portalDisk';
    res.add(disk);

    const pLight = new THREE.PointLight(0x38bdf8, 2.5, 6);
    pLight.position.set(0, 1.6, 0);
    res.add(pLight);
  }

  return res;
}

// ==========================================
// 5. CREATURE 3D MESH (Pokopia Cute Pets)
// ==========================================
export function createCreatureMesh(creature: Creature): THREE.Group {
  const creatureGroup = new THREE.Group();
  creatureGroup.name = `creature_${creature.id}`;

  const priColor = new THREE.Color(creature.primaryColor);
  const secColor = new THREE.Color(creature.secondaryColor);

  const mainMat = new THREE.MeshStandardMaterial({ color: priColor, roughness: 0.35 });
  const secMat = new THREE.MeshStandardMaterial({ color: secColor, roughness: 0.4 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Base Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 14), mainMat);
  body.position.y = 0.52;
  body.castShadow = true;
  creatureGroup.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 14), mainMat);
  head.position.set(0, 0.88, 0.22);
  head.castShadow = true;
  creatureGroup.add(head);

  // Glossy Eyes with Shine
  function addCreatureEye(x: number, y: number, z: number) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
    eye.position.set(x, y, z);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeShineMat);
    shine.position.set(0.015, 0.02, 0.04);
    eye.add(shine);
    creatureGroup.add(eye);
  }

  addCreatureEye(0.16, 0.94, 0.54);
  addCreatureEye(-0.16, 0.94, 0.54);

  // Ears & Tails by shapeType
  if (creature.shapeType === 'fox') {
    const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 4), secMat);
    leftEar.position.set(0.22, 1.25, 0.2);
    leftEar.rotation.z = -0.25;
    creatureGroup.add(leftEar);

    const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 4), secMat);
    rightEar.position.set(-0.22, 1.25, 0.2);
    rightEar.rotation.z = 0.25;
    creatureGroup.add(rightEar);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.75, 8), secMat);
    tail.position.set(0, 0.55, -0.6);
    tail.rotation.x = -1.2;
    tail.name = 'tail';
    creatureGroup.add(tail);
  } else if (creature.shapeType === 'bunny') {
    const leftEar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.75, 8), mainMat);
    leftEar.position.set(0.16, 1.42, 0.18);
    creatureGroup.add(leftEar);

    const rightEar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.75, 8), mainMat);
    rightEar.position.set(-0.16, 1.42, 0.18);
    creatureGroup.add(rightEar);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), secMat);
    tail.position.set(0, 0.55, -0.5);
    tail.name = 'tail';
    creatureGroup.add(tail);
  } else if (creature.shapeType === 'bird') {
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 4), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
    beak.position.set(0, 0.88, 0.58);
    beak.rotation.x = 1.5;
    creatureGroup.add(beak);

    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.4), secMat);
    leftWing.position.set(0.54, 0.55, 0);
    creatureGroup.add(leftWing);

    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.4), secMat);
    rightWing.position.set(-0.54, 0.55, 0);
    creatureGroup.add(rightWing);
  } else {
    // Starry / Cosmic Wings
    const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4), secMat);
    leftWing.scale.set(1, 0.12, 0.8);
    leftWing.position.set(0.65, 0.7, -0.15);
    leftWing.rotation.z = -1.0;
    creatureGroup.add(leftWing);

    const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4), secMat);
    rightWing.scale.set(1, 0.12, 0.8);
    rightWing.position.set(-0.65, 0.7, -0.15);
    rightWing.rotation.z = 1.0;
    creatureGroup.add(rightWing);
  }

  // Aura Light for befriended companions
  if (creature.befriended) {
    const auraLight = new THREE.PointLight(0xfef08a, 1.2, 3.5);
    auraLight.position.set(0, 0.7, 0);
    creatureGroup.add(auraLight);
  }

  return creatureGroup;
}

// ==========================================
// 6. HABITAT DECORATION MESH
// ==========================================
export function createHabitatMesh(itemType: string): THREE.Group {
  const group = new THREE.Group();

  if (itemType === 'straw_nest') {
    const nest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.95, 0.22, 14),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.9 })
    );
    nest.position.y = 0.11;
    group.add(nest);

    const pillow = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 })
    );
    pillow.scale.set(1, 0.3, 1);
    pillow.position.y = 0.22;
    group.add(pillow);
  } else if (itemType === 'berry_feeder') {
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.32, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    trough.position.y = 0.16;
    group.add(trough);

    const bMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), bMat);
      b.position.set(-0.35 + i * 0.22, 0.28, 0);
      group.add(b);
    }
  } else if (itemType === 'campfire') {
    const logMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.85, 8), logMat);
      log.rotation.y = (i / 4) * Math.PI;
      log.rotation.z = 1.57;
      log.position.y = 0.08;
      group.add(log);
    }

    const fire = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.65, 8),
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xef4444,
        emissiveIntensity: 0.95,
      })
    );
    fire.position.y = 0.38;
    fire.name = 'fireFlame';
    group.add(fire);

    const light = new THREE.PointLight(0xf97316, 2.5, 6);
    light.position.y = 0.5;
    group.add(light);
  } else {
    // Cosmic Shrine Statue
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.75, 0.32, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
    );
    base.position.y = 0.16;
    group.add(base);

    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.42),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.6 })
    );
    star.position.y = 0.68;
    star.name = 'shrineStar';
    group.add(star);
  }

  return group;
}
