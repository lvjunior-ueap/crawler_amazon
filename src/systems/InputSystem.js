export class InputSystem {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Set();
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.pointerLocked = false;
    this.justPressed = new Set();
    this.virtualMove = { x: 0, y: 0 };
    this.touchLook = { active: false };
    this.touchJumpPressed = false;
    this.touchRunPressed = false;
    this.touchInteractPressed = false;
    this.touchDevice =
      window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

    this.onKeyDown = (event) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault();
      }

      if (!this.keys.has(event.code)) {
        this.justPressed.add(event.code);
      }

      this.keys.add(event.code);
    };

    this.onKeyUp = (event) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault();
      }

      this.keys.delete(event.code);
    };

    this.onMouseMove = (event) => {
      if (!this.pointerLocked) {
        return;
      }

      this.lookDeltaX += event.movementX;
      this.lookDeltaY += event.movementY;
    };

    this.onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === this.domElement;
    };

    this.onClick = () => {
      if (!this.pointerLocked && !this.touchDevice) {
        this.domElement.requestPointerLock();
      }
    };

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.domElement.addEventListener("click", this.onClick);
  }

  update() {
    if (!this.pointerLocked && !this.touchDevice) {
      this.lookDeltaX = 0;
      this.lookDeltaY = 0;
    }
  }

  isPressed(code) {
    if (code === "KeyW") {
      return this.keys.has(code) || this.virtualMove.y < -0.18;
    }

    if (code === "KeyS") {
      return this.keys.has(code) || this.virtualMove.y > 0.18;
    }

    if (code === "KeyA") {
      return this.keys.has(code) || this.virtualMove.x < -0.18;
    }

    if (code === "KeyD") {
      return this.keys.has(code) || this.virtualMove.x > 0.18;
    }

    if (code === "ShiftLeft" || code === "ShiftRight") {
      return this.keys.has(code) || this.touchRunPressed;
    }

    return this.keys.has(code);
  }

  isLocked() {
    return this.pointerLocked || this.touchDevice;
  }

  isTouchDevice() {
    return this.touchDevice;
  }

  consumeInteract() {
    if (!this.justPressed.has("KeyE") && !this.touchInteractPressed) {
      return false;
    }

    this.justPressed.delete("KeyE");
    this.touchInteractPressed = false;
    return true;
  }

  consumeJump() {
    return this.isPressed("Space") || this.touchJumpPressed;
  }

  setVirtualMove(x, y) {
    this.virtualMove.x = x;
    this.virtualMove.y = y;
  }

  setTouchLookDelta(deltaX, deltaY) {
    this.lookDeltaX += deltaX;
    this.lookDeltaY += deltaY;
  }

  setTouchJumpPressed(active) {
    this.touchJumpPressed = active;
  }

  setTouchRunPressed(active) {
    this.touchRunPressed = active;
  }

  triggerTouchInteract() {
    this.touchInteractPressed = true;
  }

  endFrame() {
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.justPressed.clear();
    this.touchJumpPressed = false;
    this.touchInteractPressed = false;
  }
}
