import * as THREE from "three";

const PLAYER_HEIGHT = 1.7;
const MAX_PITCH = Math.PI / 2 - 0.05;

export class Player {
  constructor(camera) {
    this.object = new THREE.Object3D();
    this.pitchPivot = new THREE.Object3D();
    this.camera = camera;
    this.velocity = new THREE.Vector3();
    this.moveDirection = new THREE.Vector3();
    this.isGrounded = true;
    this.walkSpeed = 8;
    this.runSpeed = 12;
    this.jumpSpeed = 7;
    this.gravity = 22;

    this.object.position.set(0, PLAYER_HEIGHT, 10);
    this.pitchPivot.position.y = 0;
    this.camera.position.set(0, 0, 0);

    this.pitchPivot.add(this.camera);
    this.object.add(this.pitchPivot);
  }

  look(deltaX, deltaY) {
    this.object.rotation.y -= deltaX * 0.0022;
    this.pitchPivot.rotation.x -= deltaY * 0.0022;
    this.pitchPivot.rotation.x = THREE.MathUtils.clamp(
      this.pitchPivot.rotation.x,
      -MAX_PITCH,
      MAX_PITCH,
    );
  }
}
