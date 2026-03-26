import * as THREE from "three";
import treeSpeciesData from "../data/treeSpecies.json";

const PATA_DE_VACA_POSITION = new THREE.Vector3(10, 0, -6);
const WATER_LEVEL = 0.15;
const TERRAIN_WIDTH = 180;
const TERRAIN_LENGTH = 540;
const TERRAIN_SEGMENTS_X = 160;
const TERRAIN_SEGMENTS_Z = 440;
const TREE_SPECIES = treeSpeciesData.treeSpecies;
const BIOMASS_CELL_SIZE = 20;
const DISPLAY_BIOMASS_FACTOR = 0.085;
const FAUNA_SPECIES = [
  { key: "capivara", kind: "ground", biomes: ["mata_ciliar", "varzea"], weightKg: 65, occupancy: 0.14 },
  { key: "cotia", kind: "ground", biomes: ["varzea", "terra_firme"], weightKg: 6, occupancy: 0.03 },
  { key: "onca", kind: "ground", biomes: ["terra_firme"], weightKg: 96, occupancy: 0.022 },
  { key: "macaco", kind: "arboreal", biomes: ["terra_firme"], weightKg: 9, occupancy: 0.05 },
  { key: "iguana", kind: "ground", biomes: ["mata_ciliar", "varzea"], weightKg: 5, occupancy: 0.025 },
  { key: "mucura", kind: "ground", biomes: ["mata_ciliar", "varzea"], weightKg: 2, occupancy: 0.022 },
  { key: "porco-do-mato", kind: "ground", biomes: ["varzea", "terra_firme"], weightKg: 28, occupancy: 0.05 },
  { key: "jabuti", kind: "ground", biomes: ["terra_firme", "varzea"], weightKg: 7, occupancy: 0.02 },
  { key: "bufalo", kind: "water_edge", biomes: ["mata_ciliar"], weightKg: 300, occupancy: 0.045 },
  { key: "arara", kind: "bird", biomes: ["varzea", "terra_firme"], weightKg: 1.2, occupancy: 0.018 },
  { key: "bem-te-vi", kind: "bird", biomes: ["mata_ciliar", "varzea"], weightKg: 0.08, occupancy: 0.012 },
  { key: "garca", kind: "wader", biomes: ["mata_ciliar"], weightKg: 1.4, occupancy: 0.02 },
  { key: "tracaja", kind: "river", biomes: ["mata_ciliar"], weightKg: 3.5, occupancy: 0.018 },
  { key: "matamata", kind: "river", biomes: ["mata_ciliar"], weightKg: 11, occupancy: 0.014 },
  { key: "aracu", kind: "river", biomes: ["mata_ciliar"], weightKg: 1.8, occupancy: 0.026 },
  { key: "pacu", kind: "river", biomes: ["mata_ciliar"], weightKg: 5.5, occupancy: 0.02 },
  { key: "tamata", kind: "river", biomes: ["mata_ciliar"], weightKg: 1.2, occupancy: 0.018 },
  { key: "tucunare", kind: "river", biomes: ["mata_ciliar"], weightKg: 4, occupancy: 0.022 },
  { key: "boto", kind: "river", biomes: ["mata_ciliar"], weightKg: 110, occupancy: 0.012 },
  { key: "sucuri", kind: "river", biomes: ["mata_ciliar"], weightKg: 120, occupancy: 0.018 },
  { key: "jacare", kind: "river", biomes: ["mata_ciliar"], weightKg: 65, occupancy: 0.018 },
];
const DAY_COLOR = new THREE.Color(0x8fb1ba);
const DUSK_COLOR = new THREE.Color(0x5f7186);
const NIGHT_COLOR = new THREE.Color(0x0e1622);
const DAY_FOG = new THREE.Color(0x8fb1ba);
const NIGHT_FOG = new THREE.Color(0x101824);

export class World {
  constructor(scene) {
    this.scene = scene;
    this.bounds = {
      minX: -66,
      maxX: 66,
      minZ: -198,
      maxZ: 198,
      floorY: 1.7,
    };
    this.floatingLife = [];
    this.movingAnimals = [];
    this.riverLife = [];
    this.ambientCreatures = [];
    this.interactables = [];
    this.colliders = [];
    this.treeAnchors = [];
    this.focusedInteractable = null;
    this.lanterns = [];
    this.timeOfDay = 0.18;
    this.dayDuration = 220;
    this.weatherClock = 0;
    this.weatherInterval = 18;
    this.rainAmount = 0;
    this.targetRain = 0;
  }

  build() {
    this.addLights();
    this.addRainSystem();
    this.addFloodplainTerrain();
    this.addWaterRibbon();
    this.addVictoriaRegiaField();
    this.addRockOutcrops();
    this.addBiomeForests();
    this.addBroadleafClusters();
    this.addGroundPlants();
    this.addGroundCover();
    this.addRiversideHouse();
    this.addJeep();
    this.addWildlife();
    this.addButterflies();
    this.addPataDeVaca();
    this.addBiomeSign();
    this.addForestEdge();
  }

  addLights() {
    const hemi = new THREE.HemisphereLight(0xd7e7ef, 0x35553a, 1.9);
    const sun = new THREE.DirectionalLight(0xfff2c7, 1.45);
    const moon = new THREE.DirectionalLight(0x7ba0d8, 0.18);

    sun.position.set(22, 34, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 220;
    sun.shadow.camera.left = -95;
    sun.shadow.camera.right = 95;
    sun.shadow.camera.top = 95;
    sun.shadow.camera.bottom = -95;
    sun.shadow.bias = -0.00025;
    moon.position.set(-28, 22, -12);

    this.hemiLight = hemi;
    this.sunLight = sun;
    this.moonLight = moon;
    this.scene.add(hemi, sun, moon);
  }

  addRainSystem() {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = THREE.MathUtils.randFloat(this.bounds.minX - 10, this.bounds.maxX + 10);
      positions[index * 3 + 1] = THREE.MathUtils.randFloat(4, 28);
      positions[index * 3 + 2] = THREE.MathUtils.randFloat(this.bounds.minZ - 18, this.bounds.maxZ + 18);
      speeds[index] = THREE.MathUtils.randFloat(18, 28);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xbfd7ef,
      size: 0.12,
      transparent: true,
      opacity: 0,
    });

    this.rainPositions = positions;
    this.rainSpeeds = speeds;
    this.rain = new THREE.Points(geometry, material);
    this.rain.frustumCulled = false;
    this.scene.add(this.rain);
  }

  getChannelCenterX(z) {
    return -10 + Math.sin(z * 0.055) * 9 + Math.sin(z * 0.14) * 2.4;
  }

  getLakeBlend(z) {
    return THREE.MathUtils.smoothstep(z, this.bounds.maxZ - 72, this.bounds.maxZ + 16);
  }

  getRiverCenterX(z) {
    const channelCenter = this.getChannelCenterX(z);
    const lakeBlend = this.getLakeBlend(z);
    return THREE.MathUtils.lerp(channelCenter, -2, lakeBlend);
  }

  getChannelWidth(z) {
    return 13 + Math.sin(z * 0.045 + 1.2) * 2.6 + Math.cos(z * 0.09) * 1.4;
  }

  getRiverWidth(z) {
    const channelWidth = this.getChannelWidth(z);
    const lakeBlend = this.getLakeBlend(z);
    return THREE.MathUtils.lerp(channelWidth, 34, lakeBlend);
  }

  getTerrainHeightAt(x, z) {
    const riverDistance = Math.abs(x - this.getRiverCenterX(z));
    const riverWidth = this.getRiverWidth(z);
    const lakeBlend = this.getLakeBlend(z);
    const bankBlend = THREE.MathUtils.clamp((riverDistance - riverWidth * 0.45) / 24, 0, 1);
    const floodBlend = THREE.MathUtils.clamp(riverDistance / (riverWidth * 1.8), 0, 1);
    const terraFirmeBlend = THREE.MathUtils.clamp((riverDistance - riverWidth - 18) / 26, 0, 1);
    const macroNoise =
      Math.sin(x * 0.075) * 0.34 +
      Math.cos(z * 0.068) * 0.28 +
      Math.sin((x + z) * 0.042) * 0.24;
    const terraceNoise = Math.sin(z * 0.022 + x * 0.015) * 0.45;
    const mountainNoise =
      Math.sin(x * 0.032 + z * 0.018) * 0.9 +
      Math.cos(z * 0.026 - x * 0.013) * 0.75 +
      Math.sin((x - z) * 0.018) * 0.55;
    const plainBase = THREE.MathUtils.lerp(-0.85, 2.45, bankBlend);
    const leveeLift = (1 - Math.abs(floodBlend - 0.5) * 2) * 0.42;
    const channelCut = THREE.MathUtils.clamp(1 - riverDistance / (riverWidth * 0.5), 0, 1) * 0.72;
    const lakeCut = lakeBlend * THREE.MathUtils.clamp(1 - riverDistance / (riverWidth * 0.92), 0, 1) * 1.1;
    const terraFirmeLift = terraFirmeBlend * (0.75 + mountainNoise * 0.65);
    const height =
      plainBase +
      macroNoise +
      terraceNoise * 0.55 +
      leveeLift +
      terraFirmeLift -
      channelCut -
      lakeCut;

    return THREE.MathUtils.clamp(height, -1, 3);
  }

  getGroundHeightAt(x, z) {
    return this.getTerrainHeightAt(x, z);
  }

  getFloorHeightAt(x, z) {
    return this.bounds.floorY + this.getGroundHeightAt(x, z);
  }

  addCollider(x, z, radius) {
    const collider = { x, z, radius };
    this.colliders.push(collider);
    return collider;
  }

  registerInteractable(interactable) {
    interactable.outlineMeshes = this.createOutlineMeshes(interactable.object);
    this.interactables.push(interactable);
  }

  createOutlineMeshes(object) {
    const outlineMeshes = [];

    object.traverse((child) => {
      if (!child.isMesh || child.userData.isOutline) {
        return;
      }

      const outline = new THREE.Mesh(
        child.geometry,
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.BackSide,
        }),
      );

      outline.visible = false;
      outline.userData.isOutline = true;
      outline.scale.multiplyScalar(1.08);
      child.add(outline);
      outlineMeshes.push(outline);
    });

    return outlineMeshes;
  }

  setFocusedInteractable(interactable) {
    if (this.focusedInteractable === interactable) {
      return;
    }

    if (this.focusedInteractable?.outlineMeshes) {
      this.focusedInteractable.outlineMeshes.forEach((mesh) => {
        mesh.visible = false;
      });
    }

    this.focusedInteractable = interactable;

    if (interactable?.outlineMeshes) {
      interactable.outlineMeshes.forEach((mesh) => {
        mesh.visible = true;
      });
    }
  }

  resolvePlayerCollision(position, playerRadius = 0.65) {
    const resolved = position.clone();

    for (const collider of this.colliders) {
      const offsetX = resolved.x - collider.x;
      const offsetZ = resolved.z - collider.z;
      const distance = Math.hypot(offsetX, offsetZ);
      const minDistance = playerRadius + collider.radius;

      if (distance >= minDistance || distance === 0) {
        continue;
      }

      const push = (minDistance - distance) / distance;
      resolved.x += offsetX * push;
      resolved.z += offsetZ * push;
    }

    return resolved;
  }

  isWaterAt(x, z) {
    return this.getGroundHeightAt(x, z) <= WATER_LEVEL + 0.05;
  }

  getBiomeAt(x, z) {
    const lakeBlend = this.getLakeBlend(z);
    const riverDistance = Math.abs(x - this.getRiverCenterX(z));
    const riverWidth = this.getRiverWidth(z);
    const groundY = this.getGroundHeightAt(x, z);

    if (lakeBlend > 0.58 && (riverDistance < riverWidth + 10 || groundY < 0.4)) {
      return "lago";
    }

    if (riverDistance < riverWidth + 6 || groundY < 0.55) {
      return "mata_ciliar";
    }

    if (riverDistance < riverWidth + 20 || groundY < 1.6) {
      return "varzea";
    }

    return "terra_firme";
  }

  addFloodplainTerrain() {
    const geometry = new THREE.PlaneGeometry(
      TERRAIN_WIDTH,
      TERRAIN_LENGTH,
      TERRAIN_SEGMENTS_X,
      TERRAIN_SEGMENTS_Z,
    );
    geometry.rotateX(-Math.PI / 2);

    const position = geometry.attributes.position;

    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const z = position.getZ(index);
      position.setY(index, this.getGroundHeightAt(x, z));
    }

    geometry.computeVertexNormals();

    const terrain = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x6a8c58,
        roughness: 1,
        metalness: 0,
      }),
    );

    terrain.receiveShadow = true;
    this.scene.add(terrain);
  }

  addWaterRibbon() {
    const segments = 140;
    const vertices = [];
    const indices = [];

    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments;
      const z = THREE.MathUtils.lerp(this.bounds.minZ - 36, this.bounds.maxZ + 36, t);
      const centerX = this.getRiverCenterX(z);
      const halfWidth = this.getRiverWidth(z) * 0.62;
      const ripple = Math.sin(z * 0.11) * 0.04;

      vertices.push(centerX - halfWidth, WATER_LEVEL + ripple, z);
      vertices.push(centerX + halfWidth, WATER_LEVEL - ripple * 0.4, z);

      if (index < segments) {
        const a = index * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;

        indices.push(a, c, b, b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const water = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x4e93a5,
        transparent: true,
        opacity: 0.86,
        roughness: 0.18,
        metalness: 0.06,
      }),
    );

    water.receiveShadow = true;
    this.scene.add(water);
  }

  registerTreeAnchor(position, height, biome) {
    this.treeAnchors.push({
      position: position.clone(),
      canopyY: position.y + height,
      biome,
    });
  }

  findNearestTreeAnchor(x, z, biome = null) {
    let closest = null;
    let bestDistance = Infinity;

    this.treeAnchors.forEach((anchor) => {
      if (biome && anchor.biome !== biome) {
        return;
      }

      const distance = Math.hypot(anchor.position.x - x, anchor.position.z - z);

      if (distance < bestDistance) {
        bestDistance = distance;
        closest = anchor;
      }
    });

    return closest;
  }

  addRockOutcrops() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x7a6c57,
      roughness: 0.95,
    });
    const rocks = [
      [-25, -18, 6.4, 1.5, 5.1, 0.2],
      [18, -16, 7.5, 1.1, 5.4, -0.35],
      [-4, 21, 5.2, 0.9, 4.4, 0.5],
      [23, 25, 8.0, 1.2, 5.2, -0.4],
      [8, -30, 6.2, 0.8, 4.8, 0.3],
    ];

    rocks.forEach(([x, z, width, height, depth, rotation]) => {
      const y = this.getGroundHeightAt(x, z);
      const rock = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);

      rock.position.set(x, y + height / 2 - 0.15, z);
      rock.rotation.y = rotation;
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
      this.addCollider(x, z, Math.max(width, depth) * 0.38);
    });
  }

  addBiomeForests() {
    const mataCiliar = this.generateTreePositions(130, 3.8, "mata_ciliar");
    const varzea = this.generateTreePositions(140, 5.0, "varzea");
    const terraFirme = this.generateTreePositions(90, 10.5, "terra_firme");
    const positions = [...mataCiliar, ...varzea, ...terraFirme];

    positions.forEach(({ position, biome }, index) => {
      if (position.distanceTo(PATA_DE_VACA_POSITION) < 13) {
        return;
      }

      this.addTreeVariant(position, index, biome);
    });
  }

  generateTreePositions(count, minDistance, biome) {
    const positions = [];
    let attempts = 0;

    while (positions.length < count && attempts < count * 80) {
      attempts += 1;

      const x = THREE.MathUtils.randFloat(this.bounds.minX + 6, this.bounds.maxX - 6);
      const z = THREE.MathUtils.randFloat(this.bounds.minZ + 6, this.bounds.maxZ - 6);
      const y = this.getGroundHeightAt(x, z);
      const riverDistance = Math.abs(x - this.getRiverCenterX(z));
      const candidate = new THREE.Vector3(x, y, z);

      if (this.isWaterAt(x, z) || y < 0.2) {
        continue;
      }

      if (this.getBiomeAt(x, z) !== biome) {
        continue;
      }

      if (candidate.distanceTo(new THREE.Vector3(0, y, 10)) < 15) {
        continue;
      }

      if (Math.abs(x - 11) < 11 && Math.abs(z + 6) < 10) {
        continue;
      }

      const closeToOtherTree = positions.some((entry) => entry.position.distanceTo(candidate) < minDistance);

      if (!closeToOtherTree) {
        positions.push({ position: candidate, biome });
      }
    }

    return positions;
  }

  addTreeVariant(position, index, biome) {
    const speciesPool = TREE_SPECIES.filter((species) => species.biomes?.includes(biome));
    const baseSpecies = speciesPool[index % speciesPool.length];
    const variant = this.createTreeFromSpecies(baseSpecies, biome);
    const treeIsInteractive = this.shouldInteractWithTree(variant, index, biome);

    if (variant.family === "palm") {
      this.addPalmTree(position, index, variant, biome, treeIsInteractive);
      return;
    }

    if (variant.family === "cecropia") {
      this.addCecropiaTree(position, index, variant, biome, treeIsInteractive);
      return;
    }

    this.addCanopyTree(position, index, variant, biome, treeIsInteractive);
  }

  shouldInteractWithTree(variant, index, biome) {
    if (biome !== "terra_firme") {
      return false;
    }

    if (!["angelim", "angelim_jovem", "macacauba", "macacauba_alta"].includes(variant.key)) {
      return false;
    }

    return index % 11 === 0;
  }

  registerTreeInteractable(group, position, variant) {
    const label =
      variant.key.includes("angelim") ? "Angelim" :
      variant.key.includes("macacauba") ? "Macacauba" :
      variant.name;

    this.registerInteractable({
      type: "plant",
      key: `${variant.key}-${Math.round(position.x)}-${Math.round(position.z)}`,
      label,
      prompt: `Ler sobre ${label.toLowerCase()}`,
      title: label,
      eyebrow: "Arvore da Terra Firme",
      body:
        `${label} aparece aqui como exemplar de terra firme, com porte mais alto, tronco robusto e copa ampla. Este individuo foi gerado com idade aproximada de ${variant.age} anos.`,
      link:
        label === "Angelim"
          ? "https://pt.wikipedia.org/wiki/Angelim"
          : "https://pt.wikipedia.org/wiki/Manilkara_huberi",
      object: group,
      position: position.clone(),
      focusPoint: new THREE.Vector3(position.x, position.y + variant.trunkHeight * 0.45, position.z),
      sound: "plant",
      soundIntensity: 0.05,
    });
  }

  registerEucalyptusInteractable(group, position, height, index) {
    this.registerInteractable({
      type: "plant",
      key: `eucalipto-${index}`,
      label: "Eucalipto",
      prompt: "Ler sobre o eucalipto",
      title: "Eucalipto",
      eyebrow: "Plantacao Florestal",
      body:
        "Este exemplar representa uma plantacao de eucalipto, com tronco longo e fino, copas altas e alinhamento regular. E uma arvore muito usada em silvicultura e sistemas produtivos.",
      link: "https://pt.wikipedia.org/wiki/Eucalyptus",
      object: group,
      position: position.clone(),
      focusPoint: new THREE.Vector3(position.x, position.y + Math.min(height * 0.42, 7.5), position.z),
      sound: "plant",
      soundIntensity: 0.04,
    });
  }

  createTreeFromSpecies(baseSpecies, biome) {
    const minAge = baseSpecies.minAge ?? 8;
    const maxAge = baseSpecies.maxAge ?? 120;
    const biomeAgeFactor =
      biome === "terra_firme" ? [0.6, 1] :
      biome === "varzea" ? [0.35, 0.78] :
      [0.18, 0.46];
    const age = THREE.MathUtils.randInt(
      Math.round(THREE.MathUtils.lerp(minAge, maxAge, biomeAgeFactor[0])),
      Math.round(THREE.MathUtils.lerp(minAge, maxAge, biomeAgeFactor[1])),
    );
    const ageRatio = (age - minAge) / Math.max(maxAge - minAge, 1);
    const heightScale = THREE.MathUtils.lerp(0.65, 4, Math.pow(ageRatio, 1.15));
    const spreadScale = Math.pow(heightScale, 0.72);
    const trunkScale = Math.pow(heightScale, 0.82);

    return {
      ...baseSpecies,
      biome,
      age,
      heightScale,
      spreadScale,
      trunkScale,
      trunkHeight: baseSpecies.trunkHeight * heightScale,
      crownBase: baseSpecies.crownBase ? baseSpecies.crownBase * spreadScale : undefined,
      crownScale: baseSpecies.crownScale
        ? baseSpecies.crownScale.map((value) => value * spreadScale)
        : undefined,
      frondLength: baseSpecies.frondLength ? baseSpecies.frondLength * spreadScale : undefined,
      padRadius: baseSpecies.padRadius ? baseSpecies.padRadius * spreadScale : undefined,
    };
  }

  addPalmTree(position, index, variant, biome, isInteractive) {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5b3c28, roughness: 1 });
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.35 + variant.hue, 0.42, 0.31),
      roughness: 0.92,
    });
    const height = variant.trunkHeight;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45 * variant.trunkScale, 0.75 * variant.trunkScale, height, 7),
      trunkMaterial,
    );
    const canopy = new THREE.Group();

    trunk.position.set(position.x, position.y + height / 2, position.z);
    trunk.rotation.z = variant.lean;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    canopy.position.set(position.x, position.y + height + 0.4, position.z);

    for (let i = 0; i < variant.frondCount; i += 1) {
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, variant.frondLength), leafMaterial);

      leaf.position.set(0, 0, 0);
      leaf.rotation.y = (Math.PI * 2 * i) / variant.frondCount + index * 0.13;
      leaf.rotation.x = 0.4 + (i % 2) * 0.1;
      leaf.position.x += Math.sin(leaf.rotation.y) * 3.1;
      leaf.position.z += Math.cos(leaf.rotation.y) * 3.1;
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      canopy.add(leaf);
    }

    tree.add(trunk, canopy);
    this.scene.add(tree);
    this.registerTreeAnchor(position, height + 0.4, biome);
    this.addCollider(position.x, position.z, 0.8 * variant.trunkScale);
    this.maybeAddLantern(position, height, index, biome, 0.22);

    if (isInteractive) {
      this.registerTreeInteractable(tree, position, variant);
    }
  }

  addCanopyTree(position, index, variant, biome, isInteractive) {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3e2c, roughness: 1 });
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.34 + variant.hue, 0.4, 0.29),
      roughness: 0.95,
    });
    const height = variant.trunkHeight;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * variant.trunkScale, 0.95 * variant.trunkScale, height, 7),
      trunkMaterial,
    );
    const canopy = new THREE.Group();
    const crownHeight = height + 2.1;

    trunk.position.set(position.x, position.y + height / 2, position.z);
    trunk.rotation.z = variant.lean;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    for (let layer = 0; layer < 3; layer += 1) {
      const radius = variant.crownBase - layer * 0.45 + (index % 3) * 0.18;
      const crown = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), canopyMaterial);

      crown.position.set(
        position.x + (layer === 1 ? 0.8 : 0),
        position.y + crownHeight - layer * 1.4,
        position.z + (layer === 2 ? -0.6 : 0),
      );
      crown.scale.set(...variant.crownScale);
      crown.castShadow = true;
      crown.receiveShadow = true;
      canopy.add(crown);
    }

    tree.add(trunk, canopy);
    this.scene.add(tree);
    this.registerTreeAnchor(position, crownHeight + 1.4, biome);
    this.addCollider(position.x, position.z, 1.05 * variant.trunkScale);
    this.maybeAddLantern(position, height, index, biome, 0.3);

    if (isInteractive) {
      this.registerTreeInteractable(tree, position, variant);
    }
  }

  addCecropiaTree(position, index, variant, biome, isInteractive) {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6a4c36, roughness: 1 });
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.36 + variant.hue, 0.42, 0.36),
      roughness: 0.95,
    });
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.38 * variant.trunkScale,
        0.68 * variant.trunkScale,
        variant.trunkHeight,
        6,
      ),
      trunkMaterial,
    );
    const canopy = new THREE.Group();
    const tree = new THREE.Group();

    trunk.position.set(position.x, position.y + variant.trunkHeight / 2, position.z);
    trunk.rotation.z = variant.lean;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    canopy.position.set(position.x, position.y + variant.trunkHeight + 0.25, position.z);

    for (let indexLeaf = 0; indexLeaf < variant.padCount; indexLeaf += 1) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(variant.padRadius, variant.padRadius, 0.12, 8),
        leafMaterial,
      );

      pad.position.set(0, 0, 0);
      pad.rotation.x = Math.PI / 2.9;
      pad.rotation.z = (Math.PI * 2 * indexLeaf) / variant.padCount;
      pad.position.x += Math.cos(pad.rotation.z) * 3.2;
      pad.position.z += Math.sin(pad.rotation.z) * 3.2;
      pad.castShadow = true;
      pad.receiveShadow = true;
      canopy.add(pad);
    }

    tree.add(trunk, canopy);
    this.scene.add(tree);
    this.registerTreeAnchor(position, variant.trunkHeight + 1.8, biome);
    this.addCollider(position.x, position.z, 0.72 * variant.trunkScale);
    this.maybeAddLantern(position, variant.trunkHeight, index, biome, 0.16);

    if (isInteractive) {
      this.registerTreeInteractable(tree, position, variant);
    }
  }

  maybeAddLantern(position, trunkHeight, index, biome, probability) {
    const shouldAdd =
      biome !== "terra_firme" &&
      trunkHeight > 7 &&
      (index + Math.round(position.x + position.z)) % 5 === 0 &&
      Math.abs(Math.sin(index * 12.97 + position.x * 0.43 + position.z * 0.17)) < probability;

    if (!shouldAdd) {
      return;
    }

    const group = new THREE.Group();
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x6a492d, roughness: 1 });
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd77a,
      emissive: 0xffc55a,
      emissiveIntensity: 0,
      roughness: 0.7,
    });
    const hook = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.42), frameMaterial);
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.34), glowMaterial);
    const light = new THREE.PointLight(0xffc56b, 0, 10, 1.8);

    hook.position.set(0, 0, -0.21);
    core.position.set(0, -0.32, -0.44);
    group.add(hook, core, light);
    group.position.set(position.x, position.y + trunkHeight * 0.46, position.z);
    group.rotation.y = ((index % 8) / 8) * Math.PI * 2;
    this.scene.add(group);
    this.lanterns.push({ group, light, glowMaterial, swayOffset: index * 0.31 });
  }

  getHabitatCellCount(spec) {
    let cells = 0;

    for (let z = this.bounds.minZ; z <= this.bounds.maxZ; z += BIOMASS_CELL_SIZE) {
      for (let x = this.bounds.minX; x <= this.bounds.maxX; x += BIOMASS_CELL_SIZE) {
        const biome = this.getBiomeAt(x, z);
        const inBiome = spec.biomes.includes(biome);
        const isWater = this.isWaterAt(x, z);
        const valid =
          spec.kind === "river" ? isWater :
          spec.kind === "water_edge" ? inBiome && (isWater || Math.abs(x - this.getRiverCenterX(z)) < this.getRiverWidth(z) + 5) :
          inBiome && !isWater;

        if (valid) {
          cells += 1;
        }
      }
    }

    return cells;
  }

  getPopulationCount(spec, candidateCount) {
    const cells = this.getHabitatCellCount(spec);
    const maxByBiomass = Math.max(1, Math.floor((cells * 300) / spec.weightKg));
    const desired = Math.max(
      1,
      Math.floor((cells * 300 * DISPLAY_BIOMASS_FACTOR * spec.occupancy) / spec.weightKg),
    );
    const minimum = spec.key === "macaco" ? 3 : 1;

    return Math.min(candidateCount, maxByBiomass, Math.max(minimum, desired));
  }

  sampleFaunaPositions(spec, requestedCount) {
    const positions = [];
    let attempts = 0;

    while (positions.length < requestedCount && attempts < requestedCount * 120) {
      attempts += 1;
      const x = THREE.MathUtils.randFloat(this.bounds.minX + 4, this.bounds.maxX - 4);
      const z = THREE.MathUtils.randFloat(this.bounds.minZ + 4, this.bounds.maxZ - 4);
      const biome = this.getBiomeAt(x, z);
      const groundY = this.getGroundHeightAt(x, z);
      const nearRiver = Math.abs(x - this.getRiverCenterX(z)) < this.getRiverWidth(z) + 5;
      const inWater = this.isWaterAt(x, z);

      if (spec.kind === "river") {
        if (!inWater) {
          continue;
        }
      } else if (spec.kind === "water_edge") {
        if (!(inWater || nearRiver)) {
          continue;
        }
      } else {
        if (inWater) {
          continue;
        }
      }

      if (!spec.biomes.includes(biome)) {
        continue;
      }

      if (Math.abs(x - 11) < 10 && Math.abs(z + 6) < 10) {
        continue;
      }

      const candidate = new THREE.Vector3(x, groundY, z);
      const minDistance =
        spec.kind === "bird" ? 8 :
        spec.kind === "river" ? 10 :
        spec.kind === "wader" ? 9 :
        spec.kind === "water_edge" ? 14 :
        7;
      const tooClose = positions.some((position) => position.distanceTo(candidate) < minDistance);

      if (!tooClose) {
        positions.push(candidate);
      }
    }

    return positions;
  }

  addWildlife() {
    FAUNA_SPECIES.forEach((spec) => {
      const seedCandidates = Math.max(6, this.getHabitatCellCount(spec));
      const positions = this.sampleFaunaPositions(spec, seedCandidates);
      const count = this.getPopulationCount(spec, positions.length);

      positions.slice(0, count).forEach((position, index) => {
        if (spec.key === "capivara") {
          this.addCapybara(position.x, position.z, THREE.MathUtils.randFloat(-Math.PI, Math.PI));
          return;
        }

        if (spec.key === "cotia") {
          this.addAgouti(position.x, position.z, THREE.MathUtils.randFloat(-Math.PI, Math.PI));
          return;
        }

        if (spec.key === "onca") {
          this.addJaguar(position.x, position.z, THREE.MathUtils.randFloat(-Math.PI, Math.PI));
          return;
        }

        if (spec.key === "macaco") {
          this.addMonkey(position.x, position.z);
          return;
        }

        if (spec.key === "iguana") {
          this.addIguana(position.x, position.z, index);
          return;
        }

        if (spec.key === "mucura") {
          this.addMucura(position.x, position.z, index);
          return;
        }

        if (spec.key === "porco-do-mato") {
          this.addPeccary(position.x, position.z, index);
          return;
        }

        if (spec.key === "jabuti") {
          this.addTortoise(position.x, position.z, index);
          return;
        }

        if (spec.key === "bufalo") {
          this.addBuffalo(position.x, position.z, index);
          return;
        }

        if (spec.key === "arara") {
          this.addMacaw(position.clone(), 7 + (index % 3), 3 + (index % 2) * 0.7, index);
          return;
        }

        if (spec.key === "bem-te-vi") {
          this.addBemTeVi(position.clone(), index);
          return;
        }

        if (spec.key === "garca") {
          this.addHeron(position.clone(), index);
          return;
        }

        this.addRiverCreature(spec.key, position.clone(), index);
      });
    });
  }

  addBroadleafClusters() {
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4a382a, roughness: 1 });
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x3e8a4d, roughness: 0.95 });
    const clusters = [
      [-18, -22],
      [17, -10],
      [28, 3],
      [-23, 17],
      [14, 18],
      [4, -24],
    ];

    clusters.forEach(([x, z], index) => {
      const baseY = this.getGroundHeightAt(x, z);

      for (let i = 0; i < 4; i += 1) {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 5), stemMaterial);
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 2.8), leafMaterial);
        const offsetX = Math.sin(index + i) * 0.7;
        const offsetZ = Math.cos(index * 0.8 + i) * 0.7;
      const groundY = this.getGroundHeightAt(x + offsetX, z + offsetZ);

        if (this.getBiomeAt(x + offsetX, z + offsetZ) === "terra_firme") {
          continue;
        }

        stem.position.set(x + offsetX, groundY + 0.8, z + offsetZ);
        leaf.position.set(x + offsetX, groundY + 1.7, z + offsetZ);
        leaf.rotation.y = index + i * 0.7;
        leaf.rotation.x = 0.22 + i * 0.08;
        stem.castShadow = true;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        this.scene.add(stem, leaf);
      }
    });
  }

  addGroundPlants() {
    const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5c34, roughness: 1 });
    const patchPositions = [
      [-21, -27],
      [15, -14],
      [26, 12],
      [-20, 18],
      [9, 22],
      [19, -30],
      [-9, -8],
    ];

    patchPositions.forEach(([x, z], index) => {
      for (let i = 0; i < 5; i += 1) {
        const bladeHeight = 1 + i * 0.12;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, bladeHeight, 0.16), plantMaterial);
        const px = x + Math.sin(index + i) * 0.5;
        const pz = z + Math.cos(index - i) * 0.5;
        const py = this.getGroundHeightAt(px, pz);

        if (this.getBiomeAt(px, pz) === "terra_firme") {
          continue;
        }

        blade.position.set(px, py + bladeHeight / 2 + i * 0.04, pz);
        blade.rotation.z = -0.14 + i * 0.06;
        blade.rotation.y = i * 0.8;
        blade.castShadow = true;
        this.scene.add(blade);
      }
    });
  }

  addGroundCover() {
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x315f34, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x3d6e3f, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x517c43, roughness: 1 }),
    ];

    for (let patch = 0; patch < 260; patch += 1) {
      const centerX = THREE.MathUtils.randFloat(this.bounds.minX + 4, this.bounds.maxX - 4);
      const centerZ = THREE.MathUtils.randFloat(this.bounds.minZ + 4, this.bounds.maxZ - 4);
      const groundY = this.getGroundHeightAt(centerX, centerZ);
      const riverDistance = Math.abs(centerX - this.getRiverCenterX(centerZ));
      const biome = this.getBiomeAt(centerX, centerZ);

      if (this.isWaterAt(centerX, centerZ) || groundY < 0.2) {
        continue;
      }

      if (biome === "terra_firme") {
        continue;
      }

      if (Math.hypot(centerX, centerZ - 10) < 12) {
        continue;
      }

      for (let bladeIndex = 0; bladeIndex < 6; bladeIndex += 1) {
        const bladeHeight = THREE.MathUtils.randFloat(0.4, 1.2);
        const px = centerX + THREE.MathUtils.randFloatSpread(1.4);
        const pz = centerZ + THREE.MathUtils.randFloatSpread(1.4);
        const py = this.getGroundHeightAt(px, pz);
        const tuft = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, bladeHeight, 0.18),
          materials[(patch + bladeIndex) % materials.length],
        );

        tuft.position.set(px, py + bladeHeight / 2 + bladeIndex * 0.03, pz);
        tuft.rotation.z = THREE.MathUtils.randFloat(-0.22, 0.22);
        tuft.rotation.y = THREE.MathUtils.randFloat(0, Math.PI);
        tuft.castShadow = true;
        this.scene.add(tuft);
      }

      if (patch % 4 === 0) {
        this.addFern(centerX, centerZ);
      }
    }
  }

  addFern(x, z) {
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 1 });
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x3f7b43, roughness: 1 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.9, 5), stemMaterial);
    const groundY = this.getGroundHeightAt(x, z);

    stem.position.set(x, groundY + 0.45, z);
    stem.castShadow = true;
    this.scene.add(stem);

    for (let leafIndex = 0; leafIndex < 5; leafIndex += 1) {
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 1.7), leafMaterial);

      leaf.position.set(x, groundY + 0.92, z);
      leaf.rotation.y = (Math.PI * 2 * leafIndex) / 5;
      leaf.rotation.x = 0.4;
      leaf.position.x += Math.sin(leaf.rotation.y) * 0.42;
      leaf.position.z += Math.cos(leaf.rotation.y) * 0.42;
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      this.scene.add(leaf);
    }
  }

  addMonkey(x, z) {
    const anchor = this.findNearestTreeAnchor(x, z, "terra_firme");
    const baseY = this.getGroundHeightAt(x, z);
    const perch = anchor ?? {
      position: new THREE.Vector3(x, baseY, z),
      canopyY: baseY + 7.2,
      biome: "terra_firme",
    };
    const canopyHeight = perch.canopyY - perch.position.y;
    const trunkAngle = Math.sin((perch.position.x + perch.position.z) * 0.13) * Math.PI;
    const perchRadius = THREE.MathUtils.clamp(canopyHeight * 0.16, 1.5, 2.4);
    const targetHeightAboveGround = THREE.MathUtils.clamp(canopyHeight * 0.42, 3, 7);
    const perchY = THREE.MathUtils.clamp(perch.position.y + targetHeightAboveGround, perch.position.y + 3, perch.position.y + 7);
    const monkey = new THREE.Group();
    const furMaterial = new THREE.MeshStandardMaterial({ color: 0x5f4631, roughness: 1 });
    const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xc79c73, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.8), furMaterial);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), faceMaterial);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.8, 6), furMaterial);

    body.position.set(0, 0, 0);
    head.position.set(0, 0.95, 0.08);
    tail.position.set(-0.35, 0.2, -0.7);
    tail.rotation.z = -0.95;
    monkey.add(body, head, tail);

    for (let i = 0; i < 4; i += 1) {
      const limb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.16), furMaterial);

      limb.position.set(i < 2 ? -0.26 : 0.26, i < 2 ? -0.7 : -0.62, i % 2 === 0 ? -0.16 : 0.16);
      monkey.add(limb);
    }

    monkey.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    monkey.position.set(
      perch.position.x + Math.cos(trunkAngle) * perchRadius,
      perchY,
      perch.position.z + Math.sin(trunkAngle) * perchRadius,
    );
    monkey.rotation.y = trunkAngle + Math.PI;
    this.scene.add(monkey);
    this.registerInteractable({
      type: "animal",
      key: `macaco-${Math.round(perch.position.x)}-${Math.round(perch.position.z)}`,
      label: "Guariba",
      prompt: "Observar o macaco",
      title: "Guariba",
      eyebrow: "Fauna Amazonica",
      body:
        "O guariba, tambem chamado de bugio, ocupa o dossel da floresta e usa vocalizacoes fortes para marcar presenca e manter contato a longa distancia.",
      link: "https://pt.wikipedia.org/wiki/Bugio",
      object: monkey,
      position: monkey.position,
      focusPoint: monkey.position.clone().add(new THREE.Vector3(0, 0.8, 0)),
      focusYOffset: 0.8,
      sound: "monkey",
      soundIntensity: 0.12,
    });
    this.ambientCreatures.push({
      group: monkey,
      kind: "monkey",
      home: monkey.position.clone(),
      treeBase: perch.position.clone(),
      perchY,
      orbitRadius: perchRadius,
      trunkAngle,
      timerOffset: 1.6 + x * 0.03,
    });
  }

  addJeep() {
    const x = 24;
    const z = -24;
    const groundY = this.getGroundHeightAt(x, z);
    const jeep = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x49634a, roughness: 0.9 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x1e211d, roughness: 1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.1, 2.2), bodyMaterial);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.9), bodyMaterial);

    body.position.set(0, 1.2, 0);
    cabin.position.set(-0.2, 2, 0);
    jeep.add(body, cabin);

    for (let i = 0; i < 4; i += 1) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.45, 14), darkMaterial);

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(i < 2 ? -1.2 : 1.2, 0.5, i % 2 === 0 ? -1.1 : 1.1);
      jeep.add(wheel);
    }

    jeep.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    jeep.position.set(x, groundY, z);
    jeep.rotation.y = -0.55;
    this.scene.add(jeep);
    this.addCollider(x, z, 2.4);
  }

  addRiversideHouse() {
    const z = 4;
    const x = this.getRiverCenterX(z) + this.getRiverWidth(z) + 7;
    const groundY = this.getGroundHeightAt(x, z);
    const house = new THREE.Group();
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8e6f4b, roughness: 1 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x6c4b2e, roughness: 1 });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.34, 5.2), woodMaterial);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.6, 4), roofMaterial);

    floor.position.set(0, 2.1, 0);
    roof.position.set(0, 5.15, 0);
    roof.rotation.y = Math.PI / 4;
    house.add(floor, roof);

    for (let i = 0; i < 6; i += 1) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.1, 6), woodMaterial);
      const px = i < 3 ? -2.6 + i * 2.6 : -2.6 + (i - 3) * 2.6;
      const pz = i < 3 ? -2 : 2;

      post.position.set(px, 1, pz);
      house.add(post);
    }

    const dock = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.18, 1.5), woodMaterial);
    dock.position.set(-4.8, 1.9, 0);
    house.add(dock);

    house.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    house.position.set(x, groundY, z);
    house.rotation.y = -0.2;
    this.scene.add(house);
    this.addCollider(x, z, 3.4);
  }

  addVictoriaRegiaField() {
    const padMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b8e47,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const flowerMaterial = new THREE.MeshStandardMaterial({ color: 0xf3efe4, roughness: 0.8 });
    const startZ = this.bounds.maxZ - 58;

    for (let index = 0; index < 32; index += 1) {
      const z = THREE.MathUtils.randFloat(startZ, this.bounds.maxZ + 10);
      const centerX = this.getRiverCenterX(z);
      const spread = this.getRiverWidth(z) * 0.45;
      const x = centerX + THREE.MathUtils.randFloatSpread(spread * 2);

      if (!this.isWaterAt(x, z)) {
        continue;
      }

      const padRadius = THREE.MathUtils.randFloat(0.65, 1.35);
      const victoria = new THREE.Group();
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(padRadius, padRadius, 0.05, 20), padMaterial);
      pad.position.set(0, 0, 0);
      pad.rotation.x = THREE.MathUtils.randFloat(-0.04, 0.04);
      pad.rotation.z = THREE.MathUtils.randFloat(-0.04, 0.04);
      pad.castShadow = true;
      pad.receiveShadow = true;
      victoria.add(pad);

      if (index % 3 === 0) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), flowerMaterial);
        flower.position.set(0, 0.14, 0);
        flower.castShadow = true;
        victoria.add(flower);
      }

      victoria.position.set(x, WATER_LEVEL + 0.02, z);
      this.scene.add(victoria);

      if (index % 4 === 0) {
        this.registerInteractable({
          type: "plant",
          key: `vitoria-regia-${index}`,
          label: "Vitoria-regia",
          prompt: "Observar a vitoria-regia",
          title: "Vitoria-regia",
          eyebrow: "Flora do Lago",
          body:
            "A vitoria-regia e uma planta aquatica de folhas flutuantes muito largas, associada a lagos, remansos e aguas calmas da planicie inundavel.",
          link: "https://pt.wikipedia.org/wiki/Vit%C3%B3ria-r%C3%A9gia",
          object: victoria,
          position: victoria.position,
          focusPoint: victoria.position.clone().add(new THREE.Vector3(0, 0.18, 0)),
          sound: "plant",
          soundIntensity: 0.04,
        });
      }
    }
  }

  addBiomeSign() {
    const biomeDetails = {
      mata_ciliar: {
        title: "Mata Ciliar",
        body: "Faixa umida junto ao rio, com igapos, arbustos e vegetacao de menor porte adaptada a cheias.",
      },
      varzea: {
        title: "Varzea",
        body: "Planicie inundavel com arvores medias, frutos e transicao entre a margem ativa e a floresta alta.",
      },
      terra_firme: {
        title: "Terra Firme",
        body: "Setor mais alto e montanhoso, com arvores mais velhas, maiores e solo fora do pulso direto das aguas.",
      },
      lago: {
        title: "Lago",
        body: "Trecho terminal mais aberto e calmo, com remanso, vitoria-regia e fauna aquatica de agua lenta.",
      },
    };
    const biomeKeys = Object.keys(biomeDetails);
    const chosenBiome = biomeKeys[Math.floor(Math.random() * biomeKeys.length)];
    let chosenPosition = null;

    for (let attempt = 0; attempt < 220; attempt += 1) {
      const x = THREE.MathUtils.randFloat(this.bounds.minX + 8, this.bounds.maxX - 8);
      const z = THREE.MathUtils.randFloat(this.bounds.minZ + 8, this.bounds.maxZ - 8);
      const biome = this.getBiomeAt(x, z);
      const nearWater = Math.abs(x - this.getRiverCenterX(z)) < this.getRiverWidth(z) + 6;

      if (biome !== chosenBiome) {
        continue;
      }

      if (chosenBiome === "lago") {
        if (this.isWaterAt(x, z) || !nearWater) {
          continue;
        }
      } else if (this.isWaterAt(x, z)) {
        continue;
      }

      if (Math.hypot(x, z - 10) < 14) {
        continue;
      }

      chosenPosition = new THREE.Vector3(x, this.getGroundHeightAt(x, z), z);
      break;
    }

    if (!chosenPosition) {
      return;
    }

    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x7a5a37, roughness: 1 });
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    context.fillStyle = "#d8c59a";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#6d5435";
    context.lineWidth = 8;
    context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    context.fillStyle = "#3a2b18";
    context.font = "bold 28px Trebuchet MS";
    context.textAlign = "center";
    context.fillText(biomeDetails[chosenBiome].title, canvas.width / 2, 54);
    context.font = "18px Trebuchet MS";
    context.fillText("Bioma", canvas.width / 2, 92);

    const signMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(canvas),
      roughness: 0.95,
    });
    const sign = new THREE.Group();
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), postMaterial);
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 0.1), signMaterial);

    post.position.set(0, 1.2, 0);
    board.position.set(0, 2.1, 0);
    sign.add(post, board);
    sign.position.copy(chosenPosition);
    sign.rotation.y = Math.sin(chosenPosition.x * 0.11 + chosenPosition.z * 0.07) * 0.8;
    sign.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.scene.add(sign);
    this.addCollider(chosenPosition.x, chosenPosition.z, 0.8);

    this.registerInteractable({
      type: "plant",
      key: `biome-sign-${chosenBiome}`,
      label: `Placa: ${biomeDetails[chosenBiome].title}`,
      prompt: "Ler a placa do bioma",
      title: biomeDetails[chosenBiome].title,
      eyebrow: "Placa de Bioma",
      body: biomeDetails[chosenBiome].body,
      link: "https://pt.wikipedia.org/wiki/Amaz%C3%B4nia",
      object: sign,
      position: sign.position,
      focusPoint: sign.position.clone().add(new THREE.Vector3(0, 2.1, 0)),
      sound: "plant",
      soundIntensity: 0.03,
    });
  }

  addRiverCreature(key, position, index) {
    const entries = {
      tracaja: { color: 0x596441, size: [0.78, 0.2, 0.62], speed: 0.18, radius: 3.1 },
      matamata: { color: 0x695640, size: [0.92, 0.18, 0.74], speed: 0.12, radius: 2.6 },
      aracu: { color: 0xd1c18f, size: [0.8, 0.35, 0.18], speed: 0.38, radius: 4.8 },
      pacu: { color: 0x88949b, size: [1.1, 0.5, 0.24], speed: 0.32, radius: 4.5 },
      tamata: { color: 0x71573f, size: [0.9, 0.28, 0.2], speed: 0.26, radius: 3.6 },
      tucunare: { color: 0x94a83c, size: [1.0, 0.42, 0.22], speed: 0.44, radius: 5.6 },
      boto: { color: 0xd6a7b1, size: [2.8, 0.82, 0.92], speed: 0.22, radius: 6.8 },
      sucuri: { color: 0x53633f, size: [3.4, 0.28, 0.28], speed: 0.19, radius: 3.8 },
      jacare: { color: 0x4b5c3a, size: [2.8, 0.34, 0.7], speed: 0.16, radius: 4.2 },
    };
    const entry = entries[key];
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: entry.color, roughness: 0.95 });
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(...entry.size), bodyMaterial);

    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    if (key === "jacare") {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.26, 0.6), bodyMaterial);
      head.position.set(1.75, 0.02, 0);
      group.add(head);
    }

    if (key === "tracaja" || key === "matamata") {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(key === "matamata" ? 0.42 : 0.34, 10, 8), bodyMaterial);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.22), bodyMaterial);
      shell.scale.y = 0.45;
      shell.position.set(0, 0.08, 0);
      head.position.set(entry.size[0] * 0.42, 0.04, 0);
      group.add(shell, head);
    }

    if (key === "boto") {
      const dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.18), bodyMaterial);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.36, 0.36), bodyMaterial);
      dorsal.position.set(0, 0.45, 0);
      head.position.set(1.45, 0.08, 0);
      group.add(dorsal, head);
    }

    if (key === "sucuri") {
      for (let i = 0; i < 4; i += 1) {
        const coil = new THREE.Mesh(new THREE.SphereGeometry(0.2 + i * 0.02, 8, 8), bodyMaterial);

        coil.position.set(-1 + i * 0.75, 0, Math.sin(i) * 0.12);
        group.add(coil);
      }
    }

    group.position.copy(position);
    group.position.y =
      key === "boto"
        ? WATER_LEVEL + 0.18
        : key === "jacare"
          ? WATER_LEVEL - 0.06
          : key === "tracaja" || key === "matamata"
            ? WATER_LEVEL - 0.12
            : WATER_LEVEL - 0.28 - index * 0.02;
    this.scene.add(group);
    const labels = {
      tracaja: "Tracaja",
      matamata: "Matamata",
      aracu: "Aracu",
      pacu: "Pacu",
      tamata: "Tamata",
      tucunare: "Tucunare",
      boto: "Boto",
      sucuri: "Sucuri",
      jacare: "Jacare",
    };
    const bodies = {
      tracaja:
        "O tracaja e um quelonio de agua doce muito ligado a rios, lagos e praias baixas, onde toma sol, se alimenta e usa remansos mais lentos.",
      matamata:
        "A matamata e uma tartaruga de aspecto muito peculiar, adaptada a aguas lentas, fundos lodacentos e margens com vegetacao alagada.",
      aracu:
        "O aracu representa peixes de cardume que percorrem margens e remansos, aproveitando sementes, frutos e materia organica trazidos pela agua.",
      pacu:
        "O pacu frequenta rios, lagos e areas de inundacao, consumindo frutos, sementes e materia vegetal que cai na agua.",
      tamata:
        "O tamatauata aparece aqui como peixe de fundo e de agua calma, ligado a remansos, lagos marginais e trechos mais protegidos do rio.",
      tucunare:
        "O tucunare e um peixe predador de agua doce, associado a lagos, ressacas e canais, reconhecivel pelo corpo robusto e pela perseguicao rapida da presa.",
      boto:
        "O boto ocupa rios largos, furos e lagos associados a planicies inundaveis, surgindo na superficie em deslocamentos lentos e elegantes.",
      sucuri:
        "A sucuri e uma grande serpente semiaquatica, muito ligada a rios, igapos e areas alagadas, onde nada e se desloca com discricao.",
      jacare:
        "O jacare ocupa beiradas de rio e enseadas rasas, ficando quase invisivel na linha d'agua enquanto observa o entorno.",
    };
    const links = {
      tracaja: "https://pt.wikipedia.org/wiki/Podocnemis_unifilis",
      matamata: "https://pt.wikipedia.org/wiki/Chelus_fimbriata",
      aracu: "https://pt.wikipedia.org/wiki/Leporinus",
      pacu: "https://pt.wikipedia.org/wiki/Piaractus_mesopotamicus",
      tamata: "https://pt.wikipedia.org/wiki/Hoplosternum_littorale",
      tucunare: "https://pt.wikipedia.org/wiki/Cichla",
      boto: "https://pt.wikipedia.org/wiki/Boto-cor-de-rosa",
      sucuri: "https://pt.wikipedia.org/wiki/Sucuri",
      jacare: "https://pt.wikipedia.org/wiki/Jacar%C3%A9",
    };
    this.registerInteractable({
      type: "animal",
      key,
      label: labels[key],
      prompt: `Observar ${["sucuri", "garca", "matamata"].includes(key) ? "a" : "o"} ${labels[key].toLowerCase()}`,
      title: labels[key],
      eyebrow: "Fauna do Rio",
      body: bodies[key],
      link: links[key],
      object: group,
      position: group.position,
      focusPoint: group.position.clone(),
      focusYOffset: 0,
      sound: key === "sucuri" ? "snake" : key === "jacare" ? "jacare" : key === "boto" ? "boto" : "fish",
      soundIntensity: key === "jacare" || key === "boto" ? 0.12 : 0.08,
    });
    this.riverLife.push({
      group,
      key,
      basePosition: group.position.clone(),
      speed: entry.speed,
      radius: entry.radius,
      timerOffset: index * 1.7,
    });
  }

  addTortoise(x, z, index) {
    const groundY = this.getGroundHeightAt(x, z);
    const jabuti = new THREE.Group();
    const shellMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4a2f, roughness: 1 });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0x9d8d63, roughness: 0.95 });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 10), shellMaterial);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.26), skinMaterial);

    shell.scale.y = 0.58;
    shell.position.set(0, 0.34, 0);
    head.position.set(0, 0.2, 0.46);
    jabuti.add(shell, head);

    for (let i = 0; i < 4; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), skinMaterial);
      leg.position.set(i < 2 ? -0.24 : 0.24, 0.08, i % 2 === 0 ? -0.2 : 0.2);
      jabuti.add(leg);
    }

    jabuti.position.set(x, groundY, z);
    jabuti.rotation.y = index * 0.4;
    this.scene.add(jabuti);
    const collider = this.addCollider(x, z, 0.58);
    this.registerInteractable({
      type: "animal",
      key: `jabuti-${index}`,
      label: "Jabuti",
      prompt: "Observar o jabuti",
      title: "Jabuti",
      eyebrow: "Fauna da Terra Firme",
      body:
        "O jabuti ocupa o chao da floresta, caminhando devagar entre folhas, frutos caidos e trechos mais secos de varzea alta e terra firme.",
      link: "https://pt.wikipedia.org/wiki/Jabuti",
      object: jabuti,
      position: jabuti.position,
      focusPoint: jabuti.position.clone().add(new THREE.Vector3(0, 0.35, 0)),
      focusYOffset: 0.35,
      sound: "small-mammal",
      soundIntensity: 0.04,
    });
    this.movingAnimals.push({
      group: jabuti,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: index * 0.4,
      moveRadius: 1.2,
      pace: 0.14,
      bob: 0.004,
      stepHeight: 0.003,
      timerOffset: index * 0.7,
    });
  }

  addCapybara(x, z, rotation) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x7f6246, roughness: 1 });
    const groundY = this.getGroundHeightAt(x, z);
    const capybara = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 3), bodyMaterial);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), bodyMaterial);

    body.position.set(0, 0.9, 0);
    head.position.set(0, 1.05, 1.65);
    body.castShadow = true;
    body.receiveShadow = true;
    head.castShadow = true;
    head.receiveShadow = true;

    for (let i = 0; i < 4; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.28), bodyMaterial);

      leg.position.set(i < 2 ? -0.55 : 0.55, 0.4, i % 2 === 0 ? -0.8 : 0.8);
      leg.castShadow = true;
      capybara.add(leg);
    }

    capybara.add(body, head);
    capybara.position.set(x, groundY, z);
    capybara.rotation.y = rotation;
    this.scene.add(capybara);
    const collider = this.addCollider(x, z, 1.35);
    this.registerInteractable({
      type: "animal",
      key: "capivara",
      label: "Capivara",
      prompt: "Observar a capivara",
      title: "Capivara",
      eyebrow: "Fauna Amazonica",
      body:
        "A capivara e o maior roedor do mundo e costuma viver perto de rios, lagos e areas alagadas, onde descansa, se alimenta e escapa com rapidez para a agua.",
      link: "https://pt.wikipedia.org/wiki/Capivara",
      object: capybara,
      position: capybara.position,
      focusPoint: new THREE.Vector3(x, groundY + 1, z),
      focusYOffset: 1,
      sound: "capybara",
      soundIntensity: 0.11,
    });
    this.movingAnimals.push({
      group: capybara,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: rotation,
      moveRadius: 3.6,
      pace: 0.32,
      bob: 0.03,
      stepHeight: 0.02,
      timerOffset: 0.7,
    });
  }

  addAgouti(x, z, rotation) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x7a6042, roughness: 1 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x4b3827, roughness: 1 });
    const groundY = this.getGroundHeightAt(x, z);
    const agouti = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 1.45), bodyMaterial);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.6), bodyMaterial);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 1.0), darkMaterial);

    body.position.set(0, 0.58, 0);
    head.position.set(0, 0.62, 0.9);
    back.position.set(0, 0.88, -0.05);
    agouti.add(body, head, back);

    for (let i = 0; i < 4; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.46, 0.12), darkMaterial);

      leg.position.set(i < 2 ? -0.24 : 0.24, 0.23, i % 2 === 0 ? -0.38 : 0.36);
      agouti.add(leg);
    }

    const earLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.08), darkMaterial);
    const earRight = earLeft.clone();

    earLeft.position.set(-0.12, 0.9, 0.98);
    earRight.position.set(0.12, 0.9, 0.98);
    agouti.add(earLeft, earRight);

    agouti.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    agouti.position.set(x, groundY, z);
    agouti.rotation.y = rotation;
    this.scene.add(agouti);
    const collider = this.addCollider(x, z, 0.75);
    this.registerInteractable({
      type: "animal",
      key: "cotia",
      label: "Cotia",
      prompt: "Observar a cotia",
      title: "Cotia",
      eyebrow: "Fauna Amazonica",
      body:
        "A cotia e um roedor agil de mata, conhecido por circular entre clareiras e bordas de floresta em busca de frutos e sementes, muitas vezes enterrando parte do alimento.",
      link: "https://pt.wikipedia.org/wiki/Dasyprocta",
      object: agouti,
      position: agouti.position,
      focusPoint: new THREE.Vector3(x, groundY + 0.7, z),
      focusYOffset: 0.7,
      sound: "agouti",
      soundIntensity: 0.08,
    });
    this.movingAnimals.push({
      group: agouti,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: rotation,
      moveRadius: 4.2,
      pace: 0.58,
      bob: 0.045,
      stepHeight: 0.035,
      timerOffset: 1.9,
    });
  }

  addJaguar(x, z, rotation) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xc7964b, roughness: 0.95 });
    const spotMaterial = new THREE.MeshStandardMaterial({ color: 0x2f2217, roughness: 1 });
    const groundY = this.getGroundHeightAt(x, z);
    const jaguar = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 3.2), bodyMaterial);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.7, 0.92), bodyMaterial);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 1.5), bodyMaterial);

    body.position.set(0, 0.92, 0);
    head.position.set(0, 1.02, 2.0);
    tail.position.set(0, 1.02, -2.15);
    tail.rotation.x = 0.45;
    jaguar.add(body, head, tail);

    for (let i = 0; i < 4; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.84, 0.18), bodyMaterial);

      leg.position.set(i < 2 ? -0.42 : 0.42, 0.42, i % 2 === 0 ? -0.95 : 0.95);
      jaguar.add(leg);
    }

    for (let i = 0; i < 8; i += 1) {
      const spot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), spotMaterial);

      spot.position.set(
        (i % 2 === 0 ? -0.34 : 0.34) + Math.sin(i) * 0.05,
        1 + (i % 3) * 0.08,
        -1.1 + i * 0.28,
      );
      jaguar.add(spot);
    }

    jaguar.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    jaguar.position.set(x, groundY, z);
    jaguar.rotation.y = rotation;
    this.scene.add(jaguar);
    const collider = this.addCollider(x, z, 1.2);
    this.registerInteractable({
      type: "animal",
      key: "onca",
      label: "Onca-pintada",
      prompt: "Observar a onca",
      title: "Onca-pintada",
      eyebrow: "Fauna Amazonica",
      body:
        "A onca-pintada e um grande felino neotropical associado a matas densas, varzeas e margens de rios. E um predador de emboscada, silencioso e territorial.",
      link: "https://pt.wikipedia.org/wiki/On%C3%A7a-pintada",
      object: jaguar,
      position: jaguar.position,
      focusPoint: new THREE.Vector3(x, groundY + 1.15, z),
      focusYOffset: 1.15,
      sound: "jaguar",
      soundIntensity: 0.14,
    });
    this.movingAnimals.push({
      group: jaguar,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: rotation,
      moveRadius: 3.1,
      pace: 0.24,
      bob: 0.025,
      stepHeight: 0.018,
      timerOffset: 3.2,
    });
  }

  addMacaw(position, wingSpeed, radius, index) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xd2442e, roughness: 0.85 });
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x1f4f8d, roughness: 0.85 });
    const bird = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 1.1), bodyMaterial);
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.45), wingMaterial);
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.45), wingMaterial);

    leftWing.position.set(-0.65, 0, 0);
    rightWing.position.set(0.65, 0, 0);
    bird.add(body, leftWing, rightWing);
    bird.position.copy(position);
    this.scene.add(bird);
    this.registerInteractable({
      type: "animal",
      key: `arara-${index}`,
      label: "Arara",
      prompt: "Observar a arara",
      title: "Arara",
      eyebrow: "Fauna Amazonica",
      body:
        "As araras usam o espaco aberto sobre a floresta e as margens de rio para deslocamento, vocalizacao e procura de frutos em copas altas.",
      link: "https://pt.wikipedia.org/wiki/Arara",
      object: bird,
      position: bird.position,
      focusPoint: bird.position.clone(),
      focusYOffset: 0,
      sound: "macaw",
      soundIntensity: 0.11,
    });

    this.floatingLife.push({
      group: bird,
      leftWing,
      rightWing,
      basePosition: position.clone(),
      wingSpeed,
      radius,
      mode: "bird",
    });
  }

  addBemTeVi(position, index) {
    const bird = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xd6c142, roughness: 0.9 });
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x3d3427, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.58), bodyMaterial);
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.18), wingMaterial);
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.18), wingMaterial);

    leftWing.position.set(-0.18, 0, 0);
    rightWing.position.set(0.18, 0, 0);
    bird.add(body, leftWing, rightWing);
    bird.position.copy(position).setY(position.y + 3.2);
    this.scene.add(bird);
    this.registerInteractable({
      type: "animal",
      key: `bem-te-vi-${index}`,
      label: "Bem-te-vi",
      prompt: "Observar o bem-te-vi",
      title: "Bem-te-vi",
      eyebrow: "Fauna da Varzea",
      body:
        "O bem-te-vi frequenta bordas de mata, areas abertas e margens d'agua, vocalizando muito e pousando em galhos expostos para observar o entorno.",
      link: "https://pt.wikipedia.org/wiki/Bem-te-vi",
      object: bird,
      position: bird.position,
      focusPoint: bird.position.clone(),
      focusYOffset: 0,
      sound: "bird",
      soundIntensity: 0.07,
    });
    this.floatingLife.push({
      group: bird,
      leftWing,
      rightWing,
      basePosition: bird.position.clone(),
      wingSpeed: 15 + (index % 3),
      radius: 1.2,
      mode: "butterfly",
    });
  }

  addHeron(position, index) {
    const bird = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xd9dde0, roughness: 0.95 });
    const beakMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a23c, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.7, 0.8), bodyMaterial);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.16), bodyMaterial);
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.06), beakMaterial);

    body.position.set(0, 0.9, 0);
    neck.position.set(0, 1.55, 0.18);
    beak.position.set(0, 1.7, 0.44);
    bird.add(body, neck, beak);

    for (let i = 0; i < 2; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.15, 0.05), beakMaterial);

      leg.position.set(i === 0 ? -0.08 : 0.08, 0.42, 0);
      bird.add(leg);
    }

    bird.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    bird.position.set(position.x, Math.max(position.y, WATER_LEVEL), position.z);
    bird.rotation.y = (index % 6) * 0.7;
    this.scene.add(bird);
    this.registerInteractable({
      type: "animal",
      key: `garca-${index}`,
      label: "Garca",
      prompt: "Observar a garca",
      title: "Garca",
      eyebrow: "Fauna da Mata Ciliar",
      body:
        "Garcas patrulham margens rasas e remansos, caminhando devagar na agua ou no barro em busca de peixes, insetos e pequenos vertebrados.",
      link: "https://pt.wikipedia.org/wiki/Gar%C3%A7a",
      object: bird,
      position: bird.position,
      focusPoint: bird.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
      focusYOffset: 1.2,
      sound: "bird",
      soundIntensity: 0.08,
    });
    this.ambientCreatures.push({
      group: bird,
      kind: "heron",
      home: bird.position.clone(),
      timerOffset: index * 0.8,
    });
  }

  addIguana(x, z, index) {
    const groundY = this.getGroundHeightAt(x, z);
    const iguana = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x5b7d44, roughness: 1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.36), bodyMaterial);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.1), bodyMaterial);

    body.position.set(0, 0.25, 0);
    tail.position.set(-1.05, 0.18, 0);
    tail.rotation.y = 0.2;
    iguana.add(body, tail);

    for (let i = 0; i < 4; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), bodyMaterial);

      leg.position.set(i < 2 ? -0.22 : 0.22, 0.12, i % 2 === 0 ? -0.13 : 0.13);
      iguana.add(leg);
    }

    iguana.position.set(x, groundY, z);
    iguana.rotation.y = index * 0.6;
    this.scene.add(iguana);
    const collider = this.addCollider(x, z, 0.55);
    this.registerInteractable({
      type: "animal",
      key: `iguana-${index}`,
      label: "Iguana",
      prompt: "Observar a iguana",
      title: "Iguana",
      eyebrow: "Fauna da Mata Ciliar",
      body:
        "Iguanas e grandes lagartos de ambientes quentes e umidos, comuns em bordas de rio, clareiras e vegetacao mais baixa, onde tomam sol e se refugiam rapido.",
      link: "https://pt.wikipedia.org/wiki/Iguana",
      object: iguana,
      position: iguana.position,
      focusPoint: iguana.position.clone().add(new THREE.Vector3(0, 0.3, 0)),
      focusYOffset: 0.3,
      sound: "lizard",
      soundIntensity: 0.05,
    });
    this.movingAnimals.push({
      group: iguana,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: index * 0.6,
      moveRadius: 1.8,
      pace: 0.42,
      bob: 0.01,
      stepHeight: 0.01,
      timerOffset: index * 0.4,
    });
  }

  addMucura(x, z, index) {
    const groundY = this.getGroundHeightAt(x, z);
    const mucura = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8d8b84, roughness: 1 });
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xc7b7a7, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.36, 0.3), bodyMaterial);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), tailMaterial);

    body.position.set(0, 0.32, 0);
    tail.position.set(-0.78, 0.25, 0);
    tail.rotation.y = -0.3;
    mucura.add(body, tail);

    mucura.position.set(x, groundY, z);
    mucura.rotation.y = index * 0.5;
    this.scene.add(mucura);
    const collider = this.addCollider(x, z, 0.45);
    this.registerInteractable({
      type: "animal",
      key: `mucura-${index}`,
      label: "Mucura",
      prompt: "Observar a mucura",
      title: "Mucura",
      eyebrow: "Fauna da Varzea",
      body:
        "A mucura e um marsupial oportunista, muito adaptavel, encontrado em bordas de mata, varzea e proximidades da agua, quase sempre em deslocamentos discretos.",
      link: "https://pt.wikipedia.org/wiki/Gamb%C3%A1",
      object: mucura,
      position: mucura.position,
      focusPoint: mucura.position.clone().add(new THREE.Vector3(0, 0.35, 0)),
      focusYOffset: 0.35,
      sound: "small-mammal",
      soundIntensity: 0.05,
    });
    this.movingAnimals.push({
      group: mucura,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: index * 0.5,
      moveRadius: 2.1,
      pace: 0.46,
      bob: 0.015,
      stepHeight: 0.012,
      timerOffset: index * 0.9,
    });
  }

  addPeccary(x, z, index) {
    const groundY = this.getGroundHeightAt(x, z);
    const peccary = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4d3d2d, roughness: 1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.72, 2), bodyMaterial);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.58, 0.9), bodyMaterial);

    body.position.set(0, 0.78, 0);
    head.position.set(0, 0.76, 1.2);
    peccary.add(body, head);

    for (let i = 0; i < 4; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.16), bodyMaterial);

      leg.position.set(i < 2 ? -0.36 : 0.36, 0.32, i % 2 === 0 ? -0.6 : 0.6);
      peccary.add(leg);
    }

    peccary.position.set(x, groundY, z);
    peccary.rotation.y = index * 0.45;
    this.scene.add(peccary);
    const collider = this.addCollider(x, z, 1.05);
    this.registerInteractable({
      type: "animal",
      key: `porco-do-mato-${index}`,
      label: "Porco-do-mato",
      prompt: "Observar o porco-do-mato",
      title: "Porco-do-mato",
      eyebrow: "Fauna da Terra Firme",
      body:
        "O porco-do-mato percorre o sub-bosque em grupos ou pequenos conjuntos, cruzando varzeas e terra firme em busca de frutos, raizes e sementes.",
      link: "https://pt.wikipedia.org/wiki/Tayassuidae",
      object: peccary,
      position: peccary.position,
      focusPoint: peccary.position.clone().add(new THREE.Vector3(0, 0.8, 0)),
      focusYOffset: 0.8,
      sound: "peccary",
      soundIntensity: 0.1,
    });
    this.movingAnimals.push({
      group: peccary,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: index * 0.45,
      moveRadius: 3.6,
      pace: 0.34,
      bob: 0.02,
      stepHeight: 0.016,
      timerOffset: index * 1.2,
    });
  }

  addBuffalo(x, z, index) {
    const groundY = Math.max(this.getGroundHeightAt(x, z), WATER_LEVEL - 0.2);
    const buffalo = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x42413e, roughness: 1 });
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xb7a887, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.9, 1.8), bodyMaterial);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.1), bodyMaterial);

    body.position.set(0, 1.8, 0);
    head.position.set(0, 1.95, 1.4);
    buffalo.add(body, head);

    for (let i = 0; i < 2; i += 1) {
      const horn = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.12), hornMaterial);

      horn.position.set(i === 0 ? -0.62 : 0.62, 2.38, 1.55);
      horn.rotation.z = i === 0 ? 0.28 : -0.28;
      buffalo.add(horn);
    }

    buffalo.position.set(x, groundY, z);
    buffalo.rotation.y = index * 0.38;
    this.scene.add(buffalo);
    const collider = this.addCollider(x, z, 1.9);
    this.registerInteractable({
      type: "animal",
      key: `bufalo-${index}`,
      label: "Bufalo",
      prompt: "Observar o bufalo",
      title: "Bufalo na agua",
      eyebrow: "Fauna das Margens",
      body:
        "Bufalos costumam entrar na agua e em terrenos alagados para aliviar o calor, cruzando margens e baixios de forma lenta, pesada e muito visivel.",
      link: "https://pt.wikipedia.org/wiki/B%C3%BAbalo",
      object: buffalo,
      position: buffalo.position,
      focusPoint: buffalo.position.clone().add(new THREE.Vector3(0, 1.8, 0)),
      focusYOffset: 1.8,
      sound: "buffalo",
      soundIntensity: 0.13,
    });
    this.movingAnimals.push({
      group: buffalo,
      collider,
      home: new THREE.Vector3(x, groundY, z),
      heading: index * 0.38,
      moveRadius: 2.4,
      pace: 0.18,
      bob: 0.01,
      stepHeight: 0.008,
      timerOffset: index * 1.1,
    });
  }

  addButterflies() {
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xf1bb3b, roughness: 0.9 });
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x34281b, roughness: 1 });
    const butterflies = [
      new THREE.Vector3(-6, this.getGroundHeightAt(-6, 6) + 2.2, 6),
      new THREE.Vector3(18, this.getGroundHeightAt(18, -9) + 2.5, -9),
      new THREE.Vector3(-24, this.getGroundHeightAt(-24, 28) + 2.1, 28),
    ];

    butterflies.forEach((position, index) => {
      const insect = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.4), bodyMaterial);
      const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.35), wingMaterial);
      const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.35), wingMaterial);

      leftWing.position.set(-0.2, 0, 0);
      rightWing.position.set(0.2, 0, 0);
      insect.add(body, leftWing, rightWing);
      insect.position.copy(position);
      this.scene.add(insect);
      this.registerInteractable({
        type: "animal",
        key: `borboleta-${index}`,
        label: "Borboleta",
        prompt: "Observar a borboleta",
        title: "Borboleta",
        eyebrow: "Fauna da Varzea",
        body:
          "Borboletas acompanham clareiras umidas, bordas de mata e floracoes baixas, cruzando o caminho do observador em voos curtos e irregulares.",
        link: "https://pt.wikipedia.org/wiki/Borboleta",
        object: insect,
        position: insect.position,
        focusPoint: insect.position.clone(),
        sound: "butterfly",
        soundIntensity: 0.04,
      });

      this.floatingLife.push({
        group: insect,
        leftWing,
        rightWing,
        basePosition: position.clone(),
        wingSpeed: 12 + index,
        radius: 0.5 + index * 0.16,
        mode: "butterfly",
      });
    });
  }

  addForestEdge() {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0xb59a7b, roughness: 0.96 });
    const barkMaterial = new THREE.MeshStandardMaterial({ color: 0xcbb59c, roughness: 0.92 });
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x5f8f56, roughness: 0.94 });

    for (let index = 0; index < 38; index += 1) {
      const angle = (Math.PI * 2 * index) / 38;
      const radiusX = 82 + (index % 4) * 3;
      const radiusZ = 244 + (index % 5) * 7;
      const x = Math.cos(angle) * radiusX;
      const z = Math.sin(angle) * radiusZ;
      const groundY = this.getGroundHeightAt(x, z);
      const height = 18 + (index % 5) * 3.2 + Math.sin(index * 0.8) * 1.2;
      const trunkRadius = 0.28 + (index % 3) * 0.04;
      const eucalyptus = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, height, 7),
        trunkMaterial,
      );
      const barkStrip = new THREE.Mesh(
        new THREE.CylinderGeometry(trunkRadius * 0.84, trunkRadius * 1.02, height * 0.44, 6),
        barkMaterial,
      );

      trunk.position.set(0, height / 2, 0);
      barkStrip.position.set(0.04, height * 0.58, 0.02);
      barkStrip.rotation.z = 0.04;
      eucalyptus.add(trunk, barkStrip);

      for (let layer = 0; layer < 4; layer += 1) {
        const canopy = new THREE.Mesh(
          new THREE.SphereGeometry(1.9 + layer * 0.18, 8, 8),
          leafMaterial,
        );

        canopy.position.set(
          Math.sin(index + layer) * 0.45,
          height - 3.6 + layer * 1.35,
          Math.cos(index * 0.7 + layer) * 0.38,
        );
        canopy.scale.set(0.82, 1.28, 0.82);
        canopy.castShadow = true;
        canopy.receiveShadow = true;
        eucalyptus.add(canopy);
      }

      eucalyptus.position.set(x, groundY, z);
      eucalyptus.rotation.y = angle + Math.sin(index * 0.31) * 0.16;
      eucalyptus.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      this.scene.add(eucalyptus);

      if (index % 6 === 0) {
        this.registerEucalyptusInteractable(eucalyptus, eucalyptus.position, height, index);
      }
    }
  }

  addPataDeVaca() {
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x61422c, roughness: 1 });
    const branchMaterial = new THREE.MeshStandardMaterial({ color: 0x6f4a31, roughness: 1 });
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: 0x62b562,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const flowerMaterial = new THREE.MeshStandardMaterial({ color: 0xe7b9d8, roughness: 0.8 });
    const group = new THREE.Group();
    const position = PATA_DE_VACA_POSITION.clone();
    const groundY = this.getGroundHeightAt(position.x, position.z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 5.2, 6), trunkMaterial);
    const leafShape = new THREE.Shape();

    leafShape.moveTo(0, 1.45);
    leafShape.bezierCurveTo(0.82, 1.34, 1.34, 0.68, 1.2, -0.14);
    leafShape.bezierCurveTo(1.06, -0.82, 0.56, -1.18, 0.12, -1.42);
    leafShape.bezierCurveTo(0.06, -0.82, 0.02, -0.34, 0, 0.2);
    leafShape.bezierCurveTo(-0.02, -0.34, -0.06, -0.82, -0.12, -1.42);
    leafShape.bezierCurveTo(-0.56, -1.18, -1.06, -0.82, -1.2, -0.14);
    leafShape.bezierCurveTo(-1.34, 0.68, -0.82, 1.34, 0, 1.45);

    const leafGeometry = new THREE.ShapeGeometry(leafShape, 18);

    trunk.position.set(0, 2.6, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    for (let branchIndex = 0; branchIndex < 7; branchIndex += 1) {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.11, 2.6 + (branchIndex % 2) * 0.5, 5),
        branchMaterial,
      );
      const angle = -0.8 + branchIndex * 0.28;
      const radius = 1.2 + (branchIndex % 3) * 0.45;

      branch.position.set(Math.sin(angle) * radius, 5.3 + (branchIndex % 3) * 0.28, Math.cos(angle) * radius);
      branch.rotation.z = 0.55 - (branchIndex % 2) * 0.2;
      branch.rotation.y = angle;
      branch.castShadow = true;
      branch.receiveShadow = true;
      group.add(branch);
    }

    for (let index = 0; index < 22; index += 1) {
      const leaf = new THREE.Mesh(leafGeometry, canopyMaterial);
      const angle = index * 0.55;
      const radius = 1.9 + (index % 4) * 0.36;

      leaf.position.set(Math.cos(angle) * radius, 6.2 + (index % 5) * 0.26, Math.sin(angle) * radius);
      leaf.rotation.x = -Math.PI / 2 + 0.3 + (index % 3) * 0.05;
      leaf.rotation.z = Math.sin(angle) * 0.22;
      leaf.scale.setScalar(1.1 + (index % 4) * 0.16);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      group.add(leaf);
    }

    for (let index = 0; index < 8; index += 1) {
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), flowerMaterial);
      const angle = index * 0.78;

      flower.position.set(
        Math.cos(angle) * 1.9,
        5.85 + (index % 2) * 0.5,
        Math.sin(angle) * 1.8,
      );
      flower.castShadow = true;
      group.add(flower);
    }

    group.position.set(position.x, groundY, position.z);
    group.userData = {
      type: "plant",
      key: "pata-de-vaca",
      label: "Pata-de-vaca",
      prompt: "Ler sobre a pata-de-vaca",
      title: "Pata-de-vaca",
      eyebrow: "Flora Amazonica",
      body:
        "A pata-de-vaca e uma arvore de copa arredondada, muito reconhecida pelas folhas bilobadas, abertas em dois lobos, lembrando a marca de um casco bovino.",
      link: "https://pt.wikipedia.org/wiki/Bauhinia_forficata",
      sound: "plant",
      soundIntensity: 0.06,
      position: group.position.clone(),
      focusPoint: new THREE.Vector3(position.x, groundY + 5.8, position.z),
    };

    this.registerInteractable({
      ...group.userData,
      object: group,
      position: group.position.clone(),
    });

    this.scene.add(group);
    this.addCollider(position.x, position.z, 1.4);
  }

  getInteractables() {
    return this.interactables;
  }

  interactWith(interactable) {
    if (!interactable) {
      return;
    }

    if (interactable.type !== "animal") {
      return;
    }

    const entry = this.movingAnimals.find((animal) => animal.group === interactable.object);

    if (!entry) {
      return;
    }

    entry.heading += Math.PI * 0.7;
    entry.timerOffset += 2.3;
  }

  getSurfaceType(position) {
    return this.isWaterAt(position.x, position.z) ? "water" : "earth";
  }

  updateEnvironment(deltaSeconds) {
    this.timeOfDay = (this.timeOfDay + deltaSeconds / this.dayDuration) % 1;
    this.weatherClock += deltaSeconds;

    if (this.weatherClock >= this.weatherInterval) {
      this.weatherClock = 0;
      this.weatherInterval = THREE.MathUtils.randFloat(18, 34);
      this.targetRain = this.targetRain > 0.2 ? 0 : THREE.MathUtils.randFloat(0.45, 1);
    }

    this.rainAmount = THREE.MathUtils.lerp(this.rainAmount, this.targetRain, 0.02);

    const angle = this.timeOfDay * Math.PI * 2;
    const sunHeight = Math.sin(angle - Math.PI / 2);
    const daylight = THREE.MathUtils.clamp(sunHeight * 1.15 + 0.15, 0, 1);
    const duskStrength = 1 - Math.abs(daylight - 0.5) * 2;
    const skyColor = NIGHT_COLOR.clone().lerp(DUSK_COLOR, duskStrength * 0.6).lerp(DAY_COLOR, daylight);
    const fogColor = NIGHT_FOG.clone().lerp(DAY_FOG, daylight);

    this.scene.background = skyColor;
    if (this.scene.fog) {
      this.scene.fog.color.copy(fogColor);
      this.scene.fog.near = THREE.MathUtils.lerp(26, 42, daylight);
      this.scene.fog.far = THREE.MathUtils.lerp(110, 170, daylight);
    }

    this.hemiLight.intensity = THREE.MathUtils.lerp(0.24, 1.95, daylight);
    this.sunLight.intensity = THREE.MathUtils.lerp(0.05, 1.45, daylight) * (1 - this.rainAmount * 0.35);
    this.sunLight.position.set(Math.cos(angle) * 28, 12 + Math.max(0, sunHeight) * 34, Math.sin(angle) * 18);
    this.moonLight.intensity = THREE.MathUtils.lerp(0.45, 0.03, daylight);
    this.moonLight.position.set(-Math.cos(angle) * 24, 10 + Math.max(0, -sunHeight) * 26, -Math.sin(angle) * 16);

    const lanternFactor = THREE.MathUtils.clamp((0.42 - daylight) / 0.42, 0, 1);

    this.lanterns.forEach((lantern, index) => {
      lantern.group.rotation.z = Math.sin(this.timeOfDay * Math.PI * 10 + lantern.swayOffset) * 0.03;
      lantern.light.intensity = lanternFactor * (1.2 + (index % 3) * 0.18);
      lantern.light.distance = 8 + lanternFactor * 10;
      lantern.glowMaterial.emissiveIntensity = lanternFactor * 1.8;
    });

    this.rain.material.opacity = this.rainAmount * 0.8;
    this.rain.visible = this.rainAmount > 0.02;
    this.updateRain(deltaSeconds);
  }

  updateRain(deltaSeconds) {
    if (!this.rain || this.rainAmount <= 0.02) {
      return;
    }

    for (let index = 0; index < this.rainSpeeds.length; index += 1) {
      const base = index * 3;
      this.rainPositions[base + 1] -= this.rainSpeeds[index] * deltaSeconds * (0.3 + this.rainAmount * 0.9);
      this.rainPositions[base] += Math.sin(index * 0.37 + this.timeOfDay * 12) * deltaSeconds * 0.8;

      if (this.rainPositions[base + 1] < this.getGroundHeightAt(this.rainPositions[base], this.rainPositions[base + 2])) {
        this.rainPositions[base] = THREE.MathUtils.randFloat(this.bounds.minX - 12, this.bounds.maxX + 12);
        this.rainPositions[base + 1] = THREE.MathUtils.randFloat(12, 32);
        this.rainPositions[base + 2] = THREE.MathUtils.randFloat(this.bounds.minZ - 18, this.bounds.maxZ + 18);
      }
    }

    this.rain.geometry.attributes.position.needsUpdate = true;
  }

  update(deltaSeconds) {
    this.updateEnvironment(deltaSeconds);

    this.movingAnimals.forEach((animal) => {
      animal.timerOffset += deltaSeconds;

      const time = animal.timerOffset;
      const moveGate = Math.sin(time * animal.pace) > 0.15 ? 1 : 0;
      const orbit = Math.sin(time * animal.pace) * animal.moveRadius * moveGate;
      const strafe = Math.cos(time * animal.pace * 0.6) * animal.moveRadius * 0.35 * moveGate;
      const x = animal.home.x + Math.cos(animal.heading) * orbit - Math.sin(animal.heading) * strafe;
      const z = animal.home.z + Math.sin(animal.heading) * orbit + Math.cos(animal.heading) * strafe;

      animal.group.position.x = x;
      animal.group.position.z = z;
      animal.group.position.y = this.getGroundHeightAt(x, z) + Math.abs(Math.sin(time * 4.2)) * animal.stepHeight;
      animal.group.rotation.y = animal.heading + Math.sin(time * 0.9) * 0.4;
      animal.collider.x = x;
      animal.collider.z = z;

      const interactable = this.interactables.find((item) => item.object === animal.group);

      if (interactable) {
        interactable.position.copy(animal.group.position);
        interactable.focusPoint.set(
          animal.group.position.x,
          animal.group.position.y + (interactable.focusYOffset ?? 1),
          animal.group.position.z,
        );
      }
    });

    this.ambientCreatures.forEach((creature) => {
      creature.timerOffset += deltaSeconds;

      if (creature.kind === "monkey") {
        const orbitAngle = creature.trunkAngle + Math.sin(creature.timerOffset * 0.42) * 0.65;
        creature.group.position.x = creature.treeBase.x + Math.cos(orbitAngle) * creature.orbitRadius;
        creature.group.position.z = creature.treeBase.z + Math.sin(orbitAngle) * creature.orbitRadius;
        creature.group.position.y = creature.perchY + Math.sin(creature.timerOffset * 1.7) * 0.14;
        creature.group.rotation.y = orbitAngle + Math.PI * 0.9;
        const interactable = this.interactables.find((item) => item.object === creature.group);

        if (interactable) {
          interactable.position.copy(creature.group.position);
          interactable.focusPoint.copy(creature.group.position).add(new THREE.Vector3(0, interactable.focusYOffset ?? 0.8, 0));
        }
      }

      if (creature.kind === "heron") {
        creature.group.position.x = creature.home.x + Math.sin(creature.timerOffset * 0.35) * 1.2;
        creature.group.position.z = creature.home.z + Math.cos(creature.timerOffset * 0.28) * 0.8;
        creature.group.rotation.y = Math.sin(creature.timerOffset * 0.5) * 0.3;
        const interactable = this.interactables.find((item) => item.object === creature.group);

        if (interactable) {
          interactable.position.copy(creature.group.position);
          interactable.focusPoint.copy(creature.group.position).add(new THREE.Vector3(0, interactable.focusYOffset ?? 1.2, 0));
        }
      }
    });

    this.riverLife.forEach((creature, index) => {
      creature.timerOffset += deltaSeconds;
      const z = creature.basePosition.z + Math.sin(creature.timerOffset * creature.speed) * creature.radius;
      const x =
        this.getRiverCenterX(z) +
        Math.cos(creature.timerOffset * creature.speed * 0.7 + index) *
          (this.getRiverWidth(z) * 0.24);

      creature.group.position.x = x;
      creature.group.position.z = z;
      creature.group.position.y =
        creature.key === "boto"
          ? WATER_LEVEL + 0.12 + Math.sin(creature.timerOffset * 1.6 + index) * 0.09
          : creature.key === "tracaja" || creature.key === "matamata"
            ? WATER_LEVEL - 0.1 + Math.sin(creature.timerOffset * 0.9 + index) * 0.03
            : creature.key === "jacare"
              ? WATER_LEVEL - 0.05 + Math.sin(creature.timerOffset * 0.8 + index) * 0.02
              : WATER_LEVEL - 0.28 + Math.sin(creature.timerOffset * 1.4 + index) * 0.05;
      creature.group.rotation.y = Math.sin(creature.timerOffset * creature.speed + index) * 0.7;
      const interactable = this.interactables.find((item) => item.object === creature.group);

      if (interactable) {
        interactable.position.copy(creature.group.position);
        interactable.focusPoint.copy(creature.group.position);
      }
    });

    this.floatingLife.forEach((creature, index) => {
      const time = performance.now() * 0.001;

      creature.group.position.x = creature.basePosition.x + Math.cos(time * 0.7 + index) * creature.radius;
      creature.group.position.z = creature.basePosition.z + Math.sin(time * 0.9 + index) * creature.radius;
      const animatedY =
        creature.basePosition.y +
        (creature.mode === "bird" ? Math.sin(time * 1.2 + index) * 0.5 : Math.sin(time * 2.4 + index) * 0.25);
      const minimumY =
        this.getGroundHeightAt(creature.group.position.x, creature.group.position.z) +
        (creature.mode === "bird" ? 2 : 1.1);

      creature.group.position.y = Math.max(animatedY, minimumY);
      creature.group.rotation.y = Math.sin(time + index) * 0.4;
      const interactable = this.interactables.find((item) => item.object === creature.group);

      if (interactable) {
        interactable.position.copy(creature.group.position);
        interactable.focusPoint.copy(creature.group.position);
      }

      const flap = Math.sin(time * creature.wingSpeed) * 0.8;
      creature.leftWing.rotation.z = flap;
      creature.rightWing.rotation.z = -flap;
    });
  }
}
