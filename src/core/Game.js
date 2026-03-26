import * as THREE from "three";
import { Loop } from "./Loop.js";
import { Renderer } from "./Renderer.js";
import { GameCamera } from "../scene/Camera.js";
import { Player } from "../scene/Player.js";
import { World } from "../scene/World.js";
import { InputSystem } from "../systems/InputSystem.js";
import { MovementSystem } from "../systems/MovementSystem.js";
import { SoundSystem } from "../systems/SoundSystem.js";

const INTERACTABLE_DISTANCE = 5.5;

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
      world: this.world,
    });
    this.sound = new SoundSystem({
      domElement: this.renderer.renderer.domElement,
      world: this.world,
    });

    this.scene.add(this.player.object);
    this.world.build();
    this.setupHud();
    this.activeInteractable = null;

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
    scene.fog = new THREE.Fog(0x8fb1ba, 42, 150);
    return scene;
  }

  setupHud() {
    const crosshair = document.createElement("div");
    crosshair.className = "crosshair";
    crosshair.setAttribute("aria-hidden", "true");
    crosshair.innerHTML = `<div class="crosshair__star">✦</div>`;

    const viewmodel = document.createElement("div");
    viewmodel.className = "viewmodel";
    viewmodel.setAttribute("aria-hidden", "true");
    viewmodel.innerHTML = `
      <div class="viewmodel__arms">
        <div class="viewmodel__arm viewmodel__arm--left">
          <div class="viewmodel__hand"></div>
          <div class="viewmodel__sleeve"></div>
        </div>
        <div class="viewmodel__arm viewmodel__arm--right">
          <div class="viewmodel__hand"></div>
          <div class="viewmodel__sleeve"></div>
        </div>
      </div>
    `;

    const hud = document.createElement("div");
    hud.className = "hud";
    hud.innerHTML = `
      <div class="hud__panel">
        <h1 class="hud__title">Crawler Amazon</h1>
        <p class="hud__text">Clique para capturar o mouse.</p>
        <p class="hud__text">Explore a mata, a agua rasa e os caminhos abertos da floresta.</p>
        <p class="hud__text">WASD move, Space pula, Shift acelera, Esc libera o cursor.</p>
      </div>
    `;

    const prompt = document.createElement("div");
    prompt.className = "prompt";
    prompt.innerHTML = `
      <div class="prompt__chip">E</div>
      <div class="prompt__text">Ler sobre a planta</div>
    `;

    const infoPanel = document.createElement("aside");
    infoPanel.className = "info-panel";
    infoPanel.innerHTML = `
      <button class="info-panel__close" type="button" aria-label="Fechar painel">x</button>
      <p class="info-panel__eyebrow">Flora Amazonica</p>
      <h2 class="info-panel__title">Pata-de-vaca</h2>
      <p class="info-panel__body">
        A pata-de-vaca e uma arvore ou arbusto do genero Bauhinia, conhecida pelas folhas
        bilobadas que lembram o casco de um bovino. E muito citada na medicina popular e
        aparece em paisagismo e em ambientes tropicais da America do Sul.
      </p>
      <a
        class="info-panel__link"
        href="https://pt.wikipedia.org/wiki/Bauhinia_forficata"
        target="_blank"
        rel="noreferrer"
      >
        Abrir artigo na Wikipedia
      </a>
    `;

    const touchControls = document.createElement("div");
    touchControls.className = "touch-controls";
    touchControls.innerHTML = `
      <div class="touch-controls__left">
        <div class="touch-joystick" aria-hidden="true">
          <div class="touch-joystick__base">
            <div class="touch-joystick__stick"></div>
          </div>
        </div>
      </div>
      <div class="touch-controls__right">
        <div class="touch-lookpad">
          <span class="touch-lookpad__label">Arraste para olhar</span>
        </div>
        <div class="touch-actions">
          <button class="touch-button touch-button--run" type="button">Correr</button>
          <button class="touch-button touch-button--jump" type="button">Pular</button>
          <button class="touch-button touch-button--interact" type="button">Interagir</button>
        </div>
      </div>
    `;

    infoPanel
      .querySelector(".info-panel__close")
      .addEventListener("click", () => this.closeInfoPanel());

    this.container.append(crosshair, viewmodel, hud, prompt, infoPanel, touchControls);
    this.crosshair = crosshair;
    this.viewmodel = viewmodel;
    this.hud = hud;
    this.prompt = prompt;
    this.promptText = prompt.querySelector(".prompt__text");
    this.infoPanel = infoPanel;
    this.infoPanelEyebrow = infoPanel.querySelector(".info-panel__eyebrow");
    this.infoPanelTitle = infoPanel.querySelector(".info-panel__title");
    this.infoPanelBody = infoPanel.querySelector(".info-panel__body");
    this.infoPanelLink = infoPanel.querySelector(".info-panel__link");
    this.touchControls = touchControls;
    this.touchInteractButton = touchControls.querySelector(".touch-button--interact");
    this.setupTouchControls();
  }

  setupTouchControls() {
    if (!this.input.isTouchDevice()) {
      this.touchControls.remove();
      this.touchControls = null;
      this.touchInteractButton = null;
      return;
    }

    const joystick = this.touchControls.querySelector(".touch-joystick__base");
    const joystickStick = this.touchControls.querySelector(".touch-joystick__stick");
    const lookpad = this.touchControls.querySelector(".touch-lookpad");
    const jumpButton = this.touchControls.querySelector(".touch-button--jump");
    const runButton = this.touchControls.querySelector(".touch-button--run");
    const interactButton = this.touchInteractButton;
    const joystickState = {
      pointerId: null,
      centerX: 0,
      centerY: 0,
      radius: 0,
    };
    const lookState = {
      pointerId: null,
      lastX: 0,
      lastY: 0,
    };

    const updateJoystick = (clientX, clientY) => {
      const rect = joystick.getBoundingClientRect();
      joystickState.centerX = rect.left + rect.width / 2;
      joystickState.centerY = rect.top + rect.height / 2;
      joystickState.radius = rect.width * 0.34;

      const offsetX = clientX - joystickState.centerX;
      const offsetY = clientY - joystickState.centerY;
      const distance = Math.hypot(offsetX, offsetY);
      const clamped = Math.min(distance, joystickState.radius);
      const angle = distance > 0 ? Math.atan2(offsetY, offsetX) : 0;
      const moveX = joystickState.radius > 0 ? (Math.cos(angle) * clamped) / joystickState.radius : 0;
      const moveY = joystickState.radius > 0 ? (Math.sin(angle) * clamped) / joystickState.radius : 0;

      joystickStick.style.transform = `translate(${Math.cos(angle) * clamped}px, ${Math.sin(angle) * clamped}px)`;
      this.input.setVirtualMove(moveX, moveY);
    };

    const resetJoystick = () => {
      joystickState.pointerId = null;
      joystickStick.style.transform = "translate(0, 0)";
      this.input.setVirtualMove(0, 0);
    };

    joystick.addEventListener("pointerdown", (event) => {
      joystickState.pointerId = event.pointerId;
      joystick.setPointerCapture(event.pointerId);
      updateJoystick(event.clientX, event.clientY);
    });

    joystick.addEventListener("pointermove", (event) => {
      if (joystickState.pointerId !== event.pointerId) {
        return;
      }

      updateJoystick(event.clientX, event.clientY);
    });

    const releaseJoystick = (event) => {
      if (joystickState.pointerId !== event.pointerId) {
        return;
      }

      resetJoystick();
    };

    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);

    lookpad.addEventListener("pointerdown", (event) => {
      lookState.pointerId = event.pointerId;
      lookState.lastX = event.clientX;
      lookState.lastY = event.clientY;
      lookpad.setPointerCapture(event.pointerId);
    });

    lookpad.addEventListener("pointermove", (event) => {
      if (lookState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - lookState.lastX;
      const deltaY = event.clientY - lookState.lastY;
      lookState.lastX = event.clientX;
      lookState.lastY = event.clientY;
      this.input.setTouchLookDelta(deltaX * 1.3, deltaY * 1.3);
    });

    const releaseLook = (event) => {
      if (lookState.pointerId !== event.pointerId) {
        return;
      }

      lookState.pointerId = null;
    };

    lookpad.addEventListener("pointerup", releaseLook);
    lookpad.addEventListener("pointercancel", releaseLook);

    jumpButton.addEventListener("pointerdown", () => this.input.setTouchJumpPressed(true));
    runButton.addEventListener("pointerdown", () => this.input.setTouchRunPressed(true));
    runButton.addEventListener("pointerup", () => this.input.setTouchRunPressed(false));
    runButton.addEventListener("pointercancel", () => this.input.setTouchRunPressed(false));
    interactButton.addEventListener("pointerdown", () => this.input.triggerTouchInteract());
  }

  start() {
    this.loop.start();
  }

  update(deltaSeconds) {
    this.input.update();
    const reading = this.infoPanel.classList.contains("info-panel--visible");

    if (!reading) {
      this.player.look(this.input.lookDeltaX, this.input.lookDeltaY);
      this.movement.update(deltaSeconds);
    } else {
      this.player.velocity.x = 0;
      this.player.velocity.z = 0;
    }

    this.world.update(deltaSeconds);
    this.sound.update({
      player: this.player,
      deltaSeconds,
    });
    this.updateInteraction();
    this.syncHud();
    this.updateViewmodelAnimation(deltaSeconds);
    this.input.endFrame();
  }

  render() {
    this.renderer.render(this.scene, this.camera.instance);
  }

  syncHud() {
    const active = this.input.isLocked();
    const touch = this.input.isTouchDevice();
    const reading = this.infoPanel.classList.contains("info-panel--visible");
    this.container.classList.toggle("is-playing", active);
    this.hud.classList.toggle("hud--hidden", active);
    this.viewmodel.classList.toggle("viewmodel--visible", active);
    this.prompt.classList.toggle("prompt--visible", active && Boolean(this.activeInteractable) && !reading && !touch);
    this.promptText.textContent = this.activeInteractable?.prompt ?? "Interagir";

    if (this.touchControls) {
      this.touchControls.classList.toggle("touch-controls--visible", !reading);
      this.touchInteractButton.classList.toggle(
        "touch-button--visible",
        Boolean(this.activeInteractable) && !reading,
      );
      this.touchInteractButton.textContent = this.activeInteractable?.prompt ?? "Interagir";
    }
  }

  updateInteraction() {
    if (this.infoPanel.classList.contains("info-panel--visible")) {
      this.activeInteractable = null;
      this.world.setFocusedInteractable(null);
      return;
    }

    this.activeInteractable = this.findInteractable();
    this.world.setFocusedInteractable(this.activeInteractable);

    if (this.activeInteractable && this.input.consumeInteract()) {
      this.world.interactWith(this.activeInteractable);
      this.sound.playInteractionSound(this.activeInteractable);
      this.openInfoPanel(this.activeInteractable);
    }
  }

  findInteractable() {
    const interactables = this.world.getInteractables();
    let closest = null;
    let bestDistance = Infinity;

    for (const interactable of interactables) {
      const targetPosition = interactable.focusPoint ?? interactable.position;
      const dx = targetPosition.x - this.player.object.position.x;
      const dz = targetPosition.z - this.player.object.position.z;
      const distance = Math.hypot(dx, dz);

      if (distance > INTERACTABLE_DISTANCE) {
        continue;
      }

      if (distance < bestDistance) {
        closest = interactable;
        bestDistance = distance;
      }
    }

    return closest;
  }

  openInfoPanel(interactable) {
    this.infoPanelEyebrow.textContent = interactable.eyebrow;
    this.infoPanelTitle.textContent = interactable.title;
    this.infoPanelBody.textContent = interactable.body;
    this.infoPanelLink.href = interactable.link;
    this.infoPanelLink.textContent =
      interactable.type === "animal" ? "Abrir artigo sobre o animal" : "Abrir artigo sobre a especie";
    this.infoPanel.classList.add("info-panel--visible");
  }

  closeInfoPanel() {
    this.infoPanel.classList.remove("info-panel--visible");
  }

  updateViewmodelAnimation(deltaSeconds) {
    const speed = Math.hypot(this.player.velocity.x, this.player.velocity.z);
    const normalizedSpeed = Math.min(speed / this.player.runSpeed, 1);
    const isMoving = normalizedSpeed > 0.08 && this.player.isGrounded;
    this.viewmodelTime = (this.viewmodelTime ?? 0) + deltaSeconds * (isMoving ? 7 + normalizedSpeed * 7 : 2.5);
    const cycle = this.viewmodelTime;
    const swayX = isMoving ? Math.sin(cycle) * (8 + normalizedSpeed * 12) : 0;
    const swayY = isMoving ? Math.abs(Math.cos(cycle * 2)) * (6 + normalizedSpeed * 8) : 0;
    const leftAngle = -18 + (isMoving ? Math.sin(cycle + 0.5) * (6 + normalizedSpeed * 10) : 0);
    const rightAngle = 18 + (isMoving ? Math.sin(cycle + Math.PI + 0.5) * (6 + normalizedSpeed * 10) : 0);

    this.viewmodel.style.setProperty("--vm-sway-x", `${swayX.toFixed(2)}px`);
    this.viewmodel.style.setProperty("--vm-sway-y", `${swayY.toFixed(2)}px`);
    this.viewmodel.style.setProperty("--vm-left-rot", `${leftAngle.toFixed(2)}deg`);
    this.viewmodel.style.setProperty("--vm-right-rot", `${rightAngle.toFixed(2)}deg`);
  }

  handleResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.resize(width, height);
    this.renderer.handleResize();
  }
}
