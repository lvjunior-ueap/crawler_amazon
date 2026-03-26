import * as THREE from "three";

const FORWARD = new THREE.Vector3();
const RIGHT = new THREE.Vector3();
const COLLISION_POSITION = new THREE.Vector3();

export class MovementSystem {
  constructor({ player, input, bounds, world }) {
    this.player = player;
    this.input = input;
    this.bounds = bounds;
    this.world = world;
  }

  update(deltaSeconds) {
    if (!this.input.isLocked()) {
      this.player.velocity.x = 0;
      this.player.velocity.z = 0;
      this.input.endFrame();
      return;
    }

    const moveX = Number(this.input.isPressed("KeyD")) - Number(this.input.isPressed("KeyA"));
    const moveZ = Number(this.input.isPressed("KeyW")) - Number(this.input.isPressed("KeyS"));
    const isRunning = this.input.isPressed("ShiftLeft") || this.input.isPressed("ShiftRight");
    const speed = isRunning ? this.player.runSpeed : this.player.walkSpeed;

    FORWARD.set(0, 0, -1).applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.player.object.rotation.y);
    RIGHT.set(1, 0, 0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.player.object.rotation.y);

    this.player.moveDirection
      .copy(FORWARD)
      .multiplyScalar(moveZ)
      .addScaledVector(RIGHT, moveX);

    if (this.player.moveDirection.lengthSq() > 1) {
      this.player.moveDirection.normalize();
    }

    this.player.velocity.x = this.player.moveDirection.x * speed;
    this.player.velocity.z = this.player.moveDirection.z * speed;

    if (this.player.isGrounded && this.input.consumeJump()) {
      this.player.velocity.y = this.player.jumpSpeed;
      this.player.isGrounded = false;
    }

    if (!this.player.isGrounded) {
      this.player.velocity.y -= this.player.gravity * deltaSeconds;
    }

    this.player.object.position.addScaledVector(this.player.velocity, deltaSeconds);

    COLLISION_POSITION.copy(
      this.world.resolvePlayerCollision(this.player.object.position),
    );
    this.player.object.position.x = COLLISION_POSITION.x;
    this.player.object.position.z = COLLISION_POSITION.z;

    const floorHeight = this.world.getFloorHeightAt(
      this.player.object.position.x,
      this.player.object.position.z,
    );

    if (this.player.object.position.y <= floorHeight) {
      this.player.object.position.y = floorHeight;
      this.player.velocity.y = 0;
      this.player.isGrounded = true;
    }

    this.player.object.position.x = THREE.MathUtils.clamp(
      this.player.object.position.x,
      this.bounds.minX,
      this.bounds.maxX,
    );
    this.player.object.position.z = THREE.MathUtils.clamp(
      this.player.object.position.z,
      this.bounds.minZ,
      this.bounds.maxZ,
    );
  }
}
