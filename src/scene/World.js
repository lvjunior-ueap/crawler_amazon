import * as THREE from "three";

export class World {
  constructor(scene) {
    this.scene = scene;
    this.bounds = {
      minX: -22,
      maxX: 22,
      minZ: -22,
      maxZ: 22,
      floorY: 1.7,
    };
    this.rotatingMeshes = [];
  }

  build() {
    this.addLights();
    this.addFloor();
    this.addWalls();
    this.addCoverBlocks();
    this.addTotems();
  }

  addLights() {
    const hemi = new THREE.HemisphereLight(0xcfe8f3, 0x355a3d, 1.8);
    const sun = new THREE.DirectionalLight(0xfff1c1, 1.4);

    sun.position.set(8, 18, 6);

    this.scene.add(hemi, sun);
  }

  addFloor() {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(60, 1, 60),
      new THREE.MeshStandardMaterial({
        color: 0x6b8f57,
        roughness: 1,
      }),
    );

    floor.position.set(0, 0, 0);
    this.scene.add(floor);
  }

  addWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x5f4737,
      roughness: 0.95,
    });
    const wallData = [
      { size: [60, 8, 2], position: [0, 4, -30] },
      { size: [60, 8, 2], position: [0, 4, 30] },
      { size: [2, 8, 60], position: [-30, 4, 0] },
      { size: [2, 8, 60], position: [30, 4, 0] },
    ];

    wallData.forEach(({ size, position }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
      wall.position.set(...position);
      this.scene.add(wall);
    });
  }

  addCoverBlocks() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x7b624e,
      roughness: 0.9,
    });
    const blocks = [
      [-12, 1.5, -8],
      [10, 1.5, -5],
      [-6, 1.5, 9],
      [9, 1.5, 12],
      [0, 1.5, 0],
      [14, 1.5, -14],
      [-15, 1.5, 14],
    ];

    blocks.forEach(([x, y, z], index) => {
      const width = index % 2 === 0 ? 4 : 3;
      const depth = index % 3 === 0 ? 6 : 4;
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(width, 3, depth),
        material,
      );

      block.position.set(x, y, z);
      this.scene.add(block);
    });
  }

  addTotems() {
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d3828,
      roughness: 1,
    });
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b6a3e,
      roughness: 0.85,
    });
    const totems = [
      [-18, 0, -18],
      [18, 0, -18],
      [-18, 0, 18],
      [18, 0, 18],
      [0, 0, -18],
      [0, 0, 18],
    ];

    totems.forEach(([x, y, z], index) => {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.6, 5, 6),
        trunkMaterial,
      );
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 4, 7),
        crownMaterial,
      );

      trunk.position.set(x, y + 2.5, z);
      crown.position.set(x, y + 6.3, z);
      crown.rotation.y = index * 0.35;

      this.rotatingMeshes.push(crown);
      this.scene.add(trunk, crown);
    });
  }

  update(deltaSeconds) {
    this.rotatingMeshes.forEach((mesh, index) => {
      mesh.rotation.y += deltaSeconds * (0.1 + index * 0.015);
    });
  }
}
