import * as THREE from "three";
import { Loop } from "./Loop.js";
import { Renderer } from "./Renderer.js";

export class Game {
  constructor(container = document.querySelector("#app")) {
    if (!container) {
      throw new Error("Container #app not found.");
    }

    this.container = container;
    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = new Renderer(container);
    this.cube = this.createCube();

    this.scene.add(this.cube);
    this.addLights();

    this.loop = new Loop({
      update: (deltaSeconds) => this.update(deltaSeconds),
      render: () => this.render(),
    });

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9fc5d1);
    scene.fog = new THREE.Fog(0x9fc5d1, 8, 22);
    return scene;
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 1.2, 4);
    return camera;
  }

  createCube() {
    const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2f7d4f,
      roughness: 0.7,
      metalness: 0.05,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.3;
    return cube;
  }

  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    const directionalLight = new THREE.DirectionalLight(0xfff2cc, 2.4);

    directionalLight.position.set(3, 4, 5);

    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  start() {
    this.loop.start();
  }

  update(deltaSeconds) {
    this.cube.rotation.x += deltaSeconds * 0.8;
    this.cube.rotation.y += deltaSeconds * 1.2;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.handleResize();
  }
}
