export class Loop {
  constructor({ update, render }) {
    this.update = update;
    this.render = render;
    this.lastTime = 0;
    this.isRunning = false;
    this.frameId = null;
    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.isRunning = false;

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  tick(currentTime) {
    if (!this.isRunning) {
      return;
    }

    const deltaSeconds = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(deltaSeconds);
    this.render();

    this.frameId = requestAnimationFrame(this.tick);
  }
}
