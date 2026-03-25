import * as THREE from "three";

export class GameCamera {
  constructor() {
    this.instance = new THREE.PerspectiveCamera(75, 1, 0.1, 120);
  }

  resize(width, height) {
    this.instance.aspect = width / height;
    this.instance.updateProjectionMatrix();
  }
}
