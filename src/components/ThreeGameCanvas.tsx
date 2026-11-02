import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BiomeLevel, Creature, HabitatDecoration, Inventory, WorldObject } from '../types';
import { soundManager } from '../utils/sound';
import {
  createCreatureMesh,
  createHabitatMesh,
  createPlanetMesh,
  createPlayerMesh,
  createResourceMesh,
  createTreeMesh,
  orientToPlanetSurface,
  sampleEarthTerrain,
  sphereLatLonToCartesian,
} from '../utils/threeHelpers';

interface Props {
  currentBiome: BiomeLevel;
  creatures: Creature[];
  activeCompanion: Creature | null;
  habitatDecorations: HabitatDecoration[];
  inventory: Inventory;
  onGatherResource: (type: string, subType?: string) => void;
  onApproachCreature: (creature: Creature) => void;
  onChangeBiome: (biomeId: number) => void;
  onOpenCrafting: () => void;
  placementItem: string | null;
  onPlaceDecoration: (itemType: string, position: [number, number, number]) => void;
  touchInput: { x: number; y: number };
  jumpRequested: boolean;
  clearJumpRequest: () => void;
}

// Earth-scale radius: Grand, expansive globe with gentle natural horizon curve
const EARTH_RADIUS = 56.0;

export const ThreeGameCanvas: React.FC<Props> = ({
  currentBiome,
  creatures,
  activeCompanion,
  habitatDecorations,
  inventory,
  onGatherResource,
  onApproachCreature,
  onChangeBiome,
  onOpenCrafting,
  placementItem,
  onPlaceDecoration,
  touchInput,
  jumpRequested,
  clearJumpRequest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction prompt state
  const [nearestInteraction, setNearestInteraction] = useState<{
    text: string;
    action: () => void;
  } | null>(null);

  // References to Three.js core objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cloudsRef = useRef<THREE.Group | null>(null);

  // Character & Companion references
  const playerMeshRef = useRef<THREE.Group | null>(null);
  const companionMeshRef = useRef<THREE.Group | null>(null);

  // Spherical Coordinates & Navigation on the Earth Globe
  // Starting point on a lush green continent (lat ~0.2, lon ~0.4)
  const playerUnitPos = useRef<THREE.Vector3>(
    new THREE.Vector3(0.55, 0.28, 0.78).normalize()
  );
  // Tangent facing vector on sphere
  const playerFacing = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const currentPos3D = useRef<THREE.Vector3>(new THREE.Vector3());
  const playerSpeed = useRef<number>(0);
  const playerBanking = useRef<number>(0);

  // Jumping
  const playerJumpY = useRef<number>(0);
  const playerJumpVel = useRef<number>(0);
  const isJumping = useRef<boolean>(false);

  // Free Camera Orbit State
  const camOrbitYaw = useRef<number>(0); // Angle relative to player's ground heading
  const camOrbitPitch = useRef<number>(0.35); // Elevation angle above horizon
  const camDistance = useRef<number>(11.5);
  const isPointerDown = useRef<boolean>(false);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Input states
  const keysPressed = useRef<Record<string, boolean>>({});

  // Dynamic entities on the globe
  const worldObjectsRef = useRef<{ mesh: THREE.Group; data: WorldObject }[]>([]);
  const wildCreatureMeshesRef = useRef<
    { mesh: THREE.Group; creature: Creature; unitPos: THREE.Vector3; targetUnit: THREE.Vector3 }[]
  >([]);
  const habitatMeshesRef = useRef<THREE.Group[]>([]);
  const placementGhostRef = useRef<THREE.Group | null>(null);

  // 1. Initialize Three.js Scene, Camera, Renderer & Pointer Controls
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Initial compute of player facing tangent
    const normal = playerUnitPos.current.clone();
    const tempUp = new THREE.Vector3(0, 1, 0);
    if (Math.abs(normal.dot(tempUp)) > 0.9) tempUp.set(0, 0, 1);
    playerFacing.current = new THREE.Vector3().crossVectors(tempUp, normal).normalize();

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        triggerJump();
      }
      if (e.key.toLowerCase() === 'e') {
        if (nearestInteractionRef.current) {
          nearestInteractionRef.current.action();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    // Pointer / Mouse Drag to Orbit Camera
    const handlePointerDown = (e: PointerEvent) => {
      // Don't drag if clicking buttons
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      isPointerDown.current = true;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDown.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      camOrbitYaw.current -= dx * 0.006;
      camOrbitPitch.current = Math.max(0.08, Math.min(1.15, camOrbitPitch.current + dy * 0.005));
    };

    const handlePointerUp = () => {
      isPointerDown.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      camDistance.current = Math.max(6.5, Math.min(22.0, camDistance.current + e.deltaY * 0.015));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    containerRef.current.addEventListener('wheel', handleWheel, { passive: true });

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  const nearestInteractionRef = useRef<typeof nearestInteraction>(null);
  useEffect(() => {
    nearestInteractionRef.current = nearestInteraction;
  }, [nearestInteraction]);

  const triggerJump = () => {
    if (!isJumping.current) {
      playerJumpVel.current = 0.36;
      isJumping.current = true;
      soundManager.playJump();
    }
  };

  useEffect(() => {
    if (jumpRequested) {
      triggerJump();
      clearJumpRequest();
    }
  }, [jumpRequested]);

  // 2. Build Earth-like Biome Planet when currentBiome changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear existing objects
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Sky Color & Subtle Horizon Fog
    scene.background = new THREE.Color(currentBiome.skyColor || 0x0f172a);
    scene.fog = new THREE.FogExp2(0x0284c7, 0.0035);

    // Natural Earth Lighting:
    // Main Sun Key Light casting clear daylight shadows
    const sunLight = new THREE.DirectionalLight(0xfffdf5, 1.6);
    sunLight.position.set(70, 90, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 20;
    sunLight.shadow.camera.far = 240;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Sky/Ocean Ambient Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x064e3b, 0.8);
    scene.add(hemiLight);

    // Soft Blue Earth Rim Light (night side fill)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    rimLight.position.set(-70, -40, -60);
    scene.add(rimLight);

    // --- Build Earth-like Globe ---
    const planetData = createPlanetMesh(EARTH_RADIUS, currentBiome);
    scene.add(planetData.planetGroup);
    scene.add(planetData.starField);
    cloudsRef.current = planetData.cloudGroup;

    // --- Create Polished 3D Character ---
    const playerGroup = createPlayerMesh();
    scene.add(playerGroup);
    playerMeshRef.current = playerGroup;

    // Ensure player spawn is on land
    const spawnNormal = playerUnitPos.current;
    const spawnTerrain = sampleEarthTerrain(spawnNormal.x, spawnNormal.y, spawnNormal.z);
    const spawnPos = spawnNormal.clone().multiplyScalar(EARTH_RADIUS + spawnTerrain.elevation);
    currentPos3D.current.copy(spawnPos);
    orientToPlanetSurface(playerGroup, spawnPos, playerFacing.current);

    // --- Populate Earth Continents with Trees ---
    // Place trees on genuine landmasses with varied elevation
    let plantedTrees = 0;
    let seed = 0;
    while (plantedTrees < 55 && seed < 300) {
      seed++;
      // Distribute points on sphere
      const y = 1 - (seed / 300) * 2;
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = seed * 2.3999632;
      const testUnit = new THREE.Vector3(Math.cos(phi) * rAtY, y, Math.sin(phi) * rAtY).normalize();

      // Avoid player immediate spawn area
      if (testUnit.distanceTo(spawnNormal) < 0.25) continue;

      const { elevation, isLand } = sampleEarthTerrain(testUnit.x, testUnit.y, testUnit.z);
      // Only plant on land in temperate zones (not in oceans or polar ice)
      if (isLand && elevation > 0.4 && elevation < 2.3 && Math.abs(testUnit.y) < 0.78) {
        const tree = createTreeMesh(currentBiome.id);
        const treePos = testUnit.clone().multiplyScalar(EARTH_RADIUS + elevation);
        orientToPlanetSurface(tree, treePos);

        const s = 0.9 + Math.random() * 0.4;
        tree.scale.set(s, s, s);

        scene.add(tree);
        plantedTrees++;
      }
    }

    // --- Populate Earth with World Objects (Bushes, Crystals, Chest, Portal) ---
    worldObjectsRef.current = [];

    const candidateObjects = [
      {
        id: 'bush_1',
        type: 'berry_bush' as const,
        subType: currentBiome.id === 1 ? 'sunberry' : currentBiome.id === 2 ? 'electroberry' : currentBiome.id === 3 ? 'frostberry' : 'starfruit',
        name: 'Fresh Berry Bush',
        offsetUnit: new THREE.Vector3(0.58, 0.26, 0.75).normalize(),
      },
      {
        id: 'bush_2',
        type: 'berry_bush' as const,
        subType: currentBiome.id === 1 ? 'sunberry' : currentBiome.id === 2 ? 'electroberry' : currentBiome.id === 3 ? 'frostberry' : 'starfruit',
        name: 'Wild Berry Bush',
        offsetUnit: new THREE.Vector3(0.50, 0.35, 0.78).normalize(),
      },
      {
        id: 'bush_3',
        type: 'berry_bush' as const,
        subType: currentBiome.id === 1 ? 'sunberry' : currentBiome.id === 2 ? 'electroberry' : currentBiome.id === 3 ? 'frostberry' : 'starfruit',
        name: 'Sunberry Shrub',
        offsetUnit: new THREE.Vector3(0.62, 0.22, 0.74).normalize(),
      },
      {
        id: 'crys_1',
        type: 'crystal' as const,
        subType: currentBiome.id === 2 ? 'sparkgem' : 'wood',
        name: 'Elemental Deposit',
        offsetUnit: new THREE.Vector3(0.48, 0.30, 0.82).normalize(),
      },
      {
        id: 'crys_2',
        type: 'crystal' as const,
        subType: currentBiome.id === 2 ? 'sparkgem' : 'stone',
        name: 'Crystal Geode Spire',
        offsetUnit: new THREE.Vector3(0.64, 0.32, 0.69).normalize(),
      },
      {
        id: 'chest_1',
        type: 'chest' as const,
        name: 'Ancient Explorer Chest',
        offsetUnit: new THREE.Vector3(0.52, 0.20, 0.82).normalize(),
      },
      {
        id: 'portal_1',
        type: 'portal' as const,
        name: `Adventure Portal (${currentBiome.name})`,
        offsetUnit: new THREE.Vector3(0.42, 0.38, 0.82).normalize(),
      },
    ];

    candidateObjects.forEach((item) => {
      const terrain = sampleEarthTerrain(item.offsetUnit.x, item.offsetUnit.y, item.offsetUnit.z);
      const pos = item.offsetUnit.clone().multiplyScalar(EARTH_RADIUS + Math.max(0.1, terrain.elevation));
      const mesh = createResourceMesh(item.type, item.subType);
      orientToPlanetSurface(mesh, pos);
      scene.add(mesh);

      worldObjectsRef.current.push({
        mesh,
        data: {
          id: item.id,
          type: item.type,
          subType: item.subType as any,
          position: [pos.x, pos.y, pos.z],
          harvested: false,
          name: item.name,
        },
      });
    });

    // --- Spawn Wild Creatures on the Earth Continents ---
    wildCreatureMeshesRef.current = [];
    const biomeCreatures = creatures.filter((c) => c.biomeLevel === currentBiome.id);

    biomeCreatures.forEach((creature, idx) => {
      const cMesh = createCreatureMesh(creature);
      // Place around player's continent
      const angle = (idx / Math.max(1, biomeCreatures.length)) * Math.PI * 2;
      const tangentOffset = new THREE.Vector3(Math.cos(angle) * 0.1, 0, Math.sin(angle) * 0.1);
      const startUnit = spawnNormal.clone().add(tangentOffset).normalize();

      const terrain = sampleEarthTerrain(startUnit.x, startUnit.y, startUnit.z);
      const startPos = startUnit.clone().multiplyScalar(EARTH_RADIUS + Math.max(0.2, terrain.elevation));

      orientToPlanetSurface(cMesh, startPos);
      scene.add(cMesh);

      wildCreatureMeshesRef.current.push({
        mesh: cMesh,
        creature,
        unitPos: startUnit,
        targetUnit: startUnit.clone(),
      });
    });

    // --- Rebuild Habitat Meshes on the Globe ---
    habitatMeshesRef.current = [];
    habitatDecorations.forEach((decor) => {
      const hMesh = createHabitatMesh(decor.itemType);
      const pos = new THREE.Vector3(...decor.position);
      orientToPlanetSurface(hMesh, pos);
      scene.add(hMesh);
      habitatMeshesRef.current.push(hMesh);
    });
  }, [currentBiome]);

  // Update Companion Mesh when active companion changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (companionMeshRef.current) {
      scene.remove(companionMeshRef.current);
      companionMeshRef.current = null;
    }

    if (activeCompanion) {
      const compMesh = createCreatureMesh(activeCompanion);
      const compPos = currentPos3D.current.clone();
      orientToPlanetSurface(compMesh, compPos);
      scene.add(compMesh);
      companionMeshRef.current = compMesh;
    }
  }, [activeCompanion]);

  // Update Habitat Placement Ghost
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (placementGhostRef.current) {
      scene.remove(placementGhostRef.current);
      placementGhostRef.current = null;
    }

    if (placementItem) {
      const ghost = createHabitatMesh(placementItem);
      ghost.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.65;
        }
      });

      const ghostPos = currentPos3D.current.clone();
      orientToPlanetSurface(ghost, ghostPos);
      scene.add(ghost);
      placementGhostRef.current = ghost;
    }
  }, [placementItem]);

  // 3. Smooth 60 FPS Earth Game Loop
  useEffect(() => {
    let animFrameId: number;
    let stepCount = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const playerMesh = playerMeshRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;

      if (!playerMesh || !camera || !renderer || !scene) return;

      stepCount++;

      // Rotate Earth Clouds gently
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.0004;
        cloudsRef.current.rotation.x += 0.00015;
      }

      // -------------------------------------------------------------
      // 1. CAMERA-RELATIVE SPHERICAL MOVEMENT ON EARTH
      // -------------------------------------------------------------
      const normal = playerUnitPos.current; // Surface up vector at player
      const facing = playerFacing.current; // Player's current facing direction on tangent plane

      // Compute camera's ground projection vectors relative to player
      const camPos = camera.position;
      const toPlayer = new THREE.Vector3().subVectors(currentPos3D.current, camPos);

      // Camera forward along tangent plane:
      let camFwd = toPlayer.clone().sub(normal.clone().multiplyScalar(toPlayer.dot(normal))).normalize();
      if (camFwd.lengthSq() < 0.001) camFwd = facing.clone();

      // Camera right along tangent plane (pointing to screen-right):
      const camRight = new THREE.Vector3().crossVectors(camFwd, normal).normalize();

      // Read keyboard inputs
      let inputX = 0;
      let inputZ = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) inputZ -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) inputZ += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) inputX -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) inputX += 1;

      // Touch Joystick input
      if (touchInput.x !== 0 || touchInput.y !== 0) {
        inputX += touchInput.x;
        inputZ += touchInput.y;
      }

      const inputLen = Math.hypot(inputX, inputZ);
      const isMoving = inputLen > 0.05;

      const targetMaxSpeed = keysPressed.current['shift'] ? 0.32 : 0.18;
      const targetSpeed = isMoving ? targetMaxSpeed * Math.min(inputLen, 1) : 0;

      // Smooth acceleration & deceleration
      playerSpeed.current = THREE.MathUtils.lerp(playerSpeed.current, targetSpeed, 0.22);

      if (playerSpeed.current > 0.01) {
        const normInputX = inputX / Math.max(inputLen, 1);
        const normInputZ = inputZ / Math.max(inputLen, 1);

        // Movement tangent vector relative to camera view
        const moveTangent = new THREE.Vector3()
          .addScaledVector(camRight, normInputX)
          .addScaledVector(camFwd, -normInputZ)
          .normalize();

        // Rotate player position along the great circle on the Earth sphere
        // Axis of rotation = (normal x moveTangent)
        const rotAxis = new THREE.Vector3().crossVectors(normal, moveTangent).normalize();
        const deltaAngle = playerSpeed.current / EARTH_RADIUS;

        const moveQuat = new THREE.Quaternion().setFromAxisAngle(rotAxis, deltaAngle);

        // Update player unit normal
        normal.applyQuaternion(moveQuat).normalize();

        // Parallel-transport facing direction
        facing.applyQuaternion(moveQuat);
        facing.sub(normal.clone().multiplyScalar(facing.dot(normal))).normalize();

        // Smoothly rotate facing towards moveTangent
        const turnDot = facing.dot(moveTangent);
        const turnCross = new THREE.Vector3().crossVectors(facing, moveTangent).dot(normal);

        // Banking lean into turn
        const targetBanking = THREE.MathUtils.clamp(-turnCross * 0.45, -0.16, 0.16);
        playerBanking.current = THREE.MathUtils.lerp(playerBanking.current, targetBanking, 0.15);

        facing.lerp(moveTangent, 0.22);
        facing.sub(normal.clone().multiplyScalar(facing.dot(normal))).normalize();

        // Footsteps
        if (stepCount % (keysPressed.current['shift'] ? 12 : 16) === 0 && !isJumping.current) {
          soundManager.playFootstep();
        }

        // --- ARTICULATED RUNNING ANIMATIONS ---
        const leftLeg = playerMesh.getObjectByName('leftLeg');
        const rightLeg = playerMesh.getObjectByName('rightLeg');
        const leftArm = playerMesh.getObjectByName('leftArm');
        const rightArm = playerMesh.getObjectByName('rightArm');
        const torso = playerMesh.getObjectByName('torso');
        const scarfTail1 = playerMesh.getObjectByName('scarfTail1');
        const scarfTail2 = playerMesh.getObjectByName('scarfTail2');

        const strideFreq = keysPressed.current['shift'] ? 0.45 : 0.35;
        const stride = Math.sin(stepCount * strideFreq) * (keysPressed.current['shift'] ? 0.85 : 0.65);

        if (leftLeg && rightLeg) {
          leftLeg.rotation.x = stride;
          rightLeg.rotation.x = -stride;
        }

        if (leftArm && rightArm) {
          // Natural counter-swing of arms
          leftArm.rotation.x = -stride * 0.75;
          rightArm.rotation.x = stride * 0.75;
        }

        if (torso) {
          torso.rotation.x = 0.14; // Forward runner's lean
          torso.position.y = 0.75 + Math.abs(Math.sin(stepCount * strideFreq)) * 0.06;
        }

        if (scarfTail1 && scarfTail2) {
          scarfTail1.rotation.x = 0.4 + Math.sin(stepCount * 0.6) * 0.35;
          scarfTail2.rotation.x = 0.3 + Math.cos(stepCount * 0.6) * 0.3;
        }
      } else {
        // --- IDLE BREATHING ANIMATION ---
        playerBanking.current = THREE.MathUtils.lerp(playerBanking.current, 0, 0.15);

        const leftLeg = playerMesh.getObjectByName('leftLeg');
        const rightLeg = playerMesh.getObjectByName('rightLeg');
        const leftArm = playerMesh.getObjectByName('leftArm');
        const rightArm = playerMesh.getObjectByName('rightArm');
        const torso = playerMesh.getObjectByName('torso');
        const head = playerMesh.getObjectByName('head');
        const scarfTail1 = playerMesh.getObjectByName('scarfTail1');
        const scarfTail2 = playerMesh.getObjectByName('scarfTail2');

        if (leftLeg && rightLeg) {
          leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.15);
          rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.15);
        }

        if (leftArm && rightArm) {
          leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.15);
          rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.15);
        }

        if (torso) {
          torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0, 0.15);
          torso.position.y = 0.75 + Math.sin(stepCount * 0.05) * 0.02;
        }

        if (head) {
          head.rotation.z = Math.sin(stepCount * 0.035) * 0.03;
        }

        if (scarfTail1 && scarfTail2) {
          scarfTail1.rotation.x = 0.35 + Math.sin(stepCount * 0.1) * 0.08;
          scarfTail2.rotation.x = 0.25 + Math.cos(stepCount * 0.1) * 0.06;
        }
      }

      // --- 2. JUMPING PHYSICS & TERRAIN ELEVATION ---
      if (isJumping.current) {
        playerJumpY.current += playerJumpVel.current;
        playerJumpVel.current -= 0.019; // Earth gravity

        const leftArm = playerMesh.getObjectByName('leftArm');
        const rightArm = playerMesh.getObjectByName('rightArm');
        if (leftArm && rightArm) {
          leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -1.3, 0.2);
          rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -1.3, 0.2);
        }

        if (playerJumpY.current <= 0) {
          playerJumpY.current = 0;
          isJumping.current = false;
          playerJumpVel.current = 0;
          soundManager.playFootstep();
        }
      }

      // Sample Earth continent height under player
      const terrain = sampleEarthTerrain(normal.x, normal.y, normal.z);
      const groundRadius = EARTH_RADIUS + Math.max(0.1, terrain.elevation);
      const totalRadius = groundRadius + playerJumpY.current;

      currentPos3D.current.copy(normal).multiplyScalar(totalRadius);

      // Orient Character Mesh flush with Earth surface normal and facing forward
      orientToPlanetSurface(playerMesh, currentPos3D.current, facing, playerBanking.current);

      // --- 3. DYNAMIC EARTH CAMERA FOLLOW & ORBIT ---
      // Build camera position relative to player's surface normal and facing tangent
      const playerRight = new THREE.Vector3().crossVectors(normal, facing).normalize();

      // Combined orbit angle (auto-tracking + manual drag yaw)
      const orbitDir = new THREE.Vector3()
        .addScaledVector(facing, -Math.cos(camOrbitYaw.current))
        .addScaledVector(playerRight, Math.sin(camOrbitYaw.current))
        .normalize();

      const horizDist = camDistance.current * Math.cos(camOrbitPitch.current);
      const vertDist = camDistance.current * Math.sin(camOrbitPitch.current) + 2.5;

      const idealCamPos = currentPos3D.current
        .clone()
        .addScaledVector(orbitDir, horizDist)
        .addScaledVector(normal, vertDist);

      camera.position.lerp(idealCamPos, 0.1);
      camera.up.lerp(normal, 0.12).normalize();

      const lookTarget = currentPos3D.current.clone().addScaledVector(normal, 1.4);
      camera.lookAt(lookTarget);

      // Auto-return orbit yaw behind player slowly when moving
      if (isMoving && !isPointerDown.current) {
        camOrbitYaw.current = THREE.MathUtils.lerp(camOrbitYaw.current, 0, 0.04);
      }

      // --- 4. COMPANION AI ON EARTH GLOBE ---
      if (companionMeshRef.current) {
        const compMesh = companionMeshRef.current;
        // Follow behind player slightly to the side
        const compTargetPos = currentPos3D.current
          .clone()
          .addScaledVector(facing, -2.4)
          .addScaledVector(playerRight, -1.4);

        const compNormal = compTargetPos.clone().normalize();
        const compTerrain = sampleEarthTerrain(compNormal.x, compNormal.y, compNormal.z);
        const compHop = Math.abs(Math.sin(stepCount * 0.14)) * 0.35;
        const compPos = compNormal.multiplyScalar(EARTH_RADIUS + Math.max(0.1, compTerrain.elevation) + compHop);

        orientToPlanetSurface(compMesh, compPos, facing);
      }

      // --- 5. PLACEMENT GHOST POSITION ON EARTH ---
      if (placementGhostRef.current) {
        const ghostTarget = currentPos3D.current.clone().addScaledVector(facing, 3.5);
        const ghostNormal = ghostTarget.clone().normalize();
        const ghostTerrain = sampleEarthTerrain(ghostNormal.x, ghostNormal.y, ghostNormal.z);
        const ghostPos = ghostNormal.multiplyScalar(EARTH_RADIUS + Math.max(0.1, ghostTerrain.elevation));
        orientToPlanetSurface(placementGhostRef.current, ghostPos, facing);
      }

      // --- 6. WILD CREATURES WANDERING ON EARTH ---
      wildCreatureMeshesRef.current.forEach((item) => {
        const { mesh, creature, unitPos, targetUnit } = item;

        if (Math.random() < 0.006) {
          const randAxis = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize();
          targetUnit.copy(unitPos).applyAxisAngle(randAxis, 0.25).normalize();
        }

        unitPos.lerp(targetUnit, 0.018).normalize();

        const cTerrain = sampleEarthTerrain(unitPos.x, unitPos.y, unitPos.z);
        const creatureHop = Math.abs(Math.sin(stepCount * 0.08 + unitPos.x * 20)) * 0.2;
        const cPos = unitPos.clone().multiplyScalar(EARTH_RADIUS + Math.max(0.1, cTerrain.elevation) + creatureHop);

        const cFacing = new THREE.Vector3().subVectors(targetUnit, unitPos).normalize();
        orientToPlanetSurface(mesh, cPos, cFacing.lengthSq() > 0.01 ? cFacing : undefined);
      });

      // --- 7. ANIMATE PORTAL, FLAMES & SHRINES ---
      scene.traverse((child) => {
        if (child.name === 'portalDisk') {
          child.rotation.z += 0.025;
        }
        if (child.name === 'fireFlame') {
          child.scale.setScalar(1 + Math.sin(stepCount * 0.22) * 0.12);
        }
        if (child.name === 'shrineStar') {
          child.rotation.y += 0.02;
          child.rotation.x += 0.01;
        }
      });

      // --- 8. PROXIMITY INTERACTIONS ---
      let foundInteraction: { text: string; action: () => void } | null = null;

      // 1. Check Creatures
      wildCreatureMeshesRef.current.forEach(({ mesh, creature }) => {
        const dist = currentPos3D.current.distanceTo(mesh.position);
        if (dist < 4.2) {
          foundInteraction = {
            text: creature.befriended
              ? `Talk with ${creature.name}`
              : `Offer Berry to ${creature.name} (${creature.element})`,
            action: () => onApproachCreature(creature),
          };
        }
      });

      // 2. Check World Objects
      if (!foundInteraction) {
        worldObjectsRef.current.forEach(({ mesh, data }) => {
          const dist = currentPos3D.current.distanceTo(mesh.position);
          if (dist < 4.0 && !data.harvested) {
            if (data.type === 'berry_bush') {
              foundInteraction = {
                text: `Harvest ${data.name}`,
                action: () => {
                  data.harvested = true;
                  mesh.visible = false;
                  onGatherResource('berry', data.subType);
                },
              };
            } else if (data.type === 'crystal') {
              foundInteraction = {
                text: `Mine ${data.name}`,
                action: () => {
                  data.harvested = true;
                  mesh.visible = false;
                  onGatherResource('crystal', data.subType);
                },
              };
            } else if (data.type === 'chest') {
              foundInteraction = {
                text: `Open ${data.name}`,
                action: () => {
                  data.harvested = true;
                  mesh.visible = false;
                  onGatherResource('chest');
                },
              };
            } else if (data.type === 'portal') {
              const nextBiomeId = (currentBiome.id % 4) + 1;
              foundInteraction = {
                text: `Enter Warp Portal to Biome ${nextBiomeId}`,
                action: () => onChangeBiome(nextBiomeId),
              };
            }
          }
        });
      }

      setNearestInteraction(foundInteraction);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [currentBiome, activeCompanion, placementItem, touchInput]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    >
      {/* Placement Mode Banner */}
      {placementItem && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/95 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-3 backdrop-blur-md animate-bounce z-20 border border-amber-300">
          <span>Click to Place on Planet Earth!</span>
          <button
            onClick={() => {
              if (placementGhostRef.current) {
                const pos = placementGhostRef.current.position;
                onPlaceDecoration(placementItem, [pos.x, pos.y, pos.z]);
              }
            }}
            className="bg-slate-950 text-amber-300 px-3.5 py-1.5 rounded-xl text-xs hover:bg-slate-900 shadow cursor-pointer font-extrabold"
          >
            Confirm Placement
          </button>
        </div>
      )}

      {/* Floating Interactive 3D Action Button Prompt */}
      {nearestInteraction && !placementItem && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => nearestInteraction.action()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-3 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="bg-slate-950 text-emerald-400 font-black w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow">
              E
            </span>
            <span className="text-xs">{nearestInteraction.text}</span>
          </button>
        </div>
      )}
    </div>
  );
};
