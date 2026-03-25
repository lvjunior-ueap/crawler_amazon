import * as THREE from "three";

export class Renderer {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(this.renderer.domElement);

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  dispose() {
    window.removeEventListener("resize", this.handleResize);
    this.renderer.dispose();
  }
}
