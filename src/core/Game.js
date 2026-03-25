import * as THREE from "three";
import { Loop } from "./Loop.js";
import { Renderer } from "./Renderer.js";
import { GameCamera } from "../scene/Camera.js";
import { Player } from "../scene/Player.js";
import { World } from "../scene/World.js";
import { InputSystem } from "../systems/InputSystem.js";
import { MovementSystem } from "../systems/MovementSystem.js";

export class Game {
  constructor(container = document.querySelector("#app")) {
    if (!container) {
      throw new Error("Container #app not found.");
    }

    this.container = container;
    this.scene = this.createScene();
    this.renderer = new Renderer(container);
    this.camera = new GameCamera();
    this.player = new Player(this.camera.instance);
    this.world = new World(this.scene);
    this.input = new InputSystem(this.renderer.renderer.domElement);
    this.movement = new MovementSystem({
      player: this.player,
      input: this.input,
      bounds: this.world.bounds,
    });

    this.scene.add(this.player.object);
    this.world.build();
    this.setupHud();

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
    scene.background = new THREE.Color(0x8fb1ba);
    scene.fog = new THREE.Fog(0x8fb1ba, 18, 60);
    return scene;
  }

  setupHud() {
    const crosshair = document.createElement("div");
    crosshair.className = "crosshair";
    crosshair.setAttribute("aria-hidden", "true");

    const hud = document.createElement("div");
    hud.className = "hud";
    hud.innerHTML = `
      <div class="hud__panel">
        <h1 class="hud__title">Crawler Amazon Arena</h1>
        <p class="hud__text">Clique para capturar o mouse.</p>
        <p class="hud__text">WASD move, Space pula, Shift acelera, Esc libera o cursor.</p>
      </div>
    `;

    this.container.append(crosshair, hud);
    this.crosshair = crosshair;
    this.hud = hud;
  }

  start() {
    this.loop.start();
  }

  update(deltaSeconds) {
    this.input.update();
    this.player.look(this.input.lookDeltaX, this.input.lookDeltaY);
    this.movement.update(deltaSeconds);
    this.world.update(deltaSeconds);
    this.syncHud();
  }

  render() {
    this.renderer.render(this.scene, this.camera.instance);
  }

  syncHud() {
    const active = this.input.isLocked();
    this.container.classList.toggle("is-playing", active);
    this.hud.classList.toggle("hud--hidden", active);
  }

  handleResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.resize(width, height);
    this.renderer.handleResize();
  }
}
