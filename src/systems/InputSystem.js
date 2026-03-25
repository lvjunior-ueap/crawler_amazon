export class InputSystem {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Set();
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.pointerLocked = false;

    this.onKeyDown = (event) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault();
      }

      this.keys.add(event.code);
    };

    this.onKeyUp = (event) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) {
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
      if (!this.pointerLocked) {
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
    if (!this.pointerLocked) {
      this.lookDeltaX = 0;
      this.lookDeltaY = 0;
    }
  }

  isPressed(code) {
    return this.keys.has(code);
  }

  isLocked() {
    return this.pointerLocked;
  }

  consumeJump() {
    return this.isPressed("Space");
  }

  endFrame() {
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
  }
}
