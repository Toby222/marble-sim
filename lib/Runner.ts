interface RunnerOptions {
  fps: number;
  speed: number;
}

export class Runner {
  options: RunnerOptions;
  world: planck.World;
  fps: number;
  runId?: number;

  render?: () => void;
  update?: (step: number) => void;

  constructor(world: planck.World, options: Partial<RunnerOptions> = {}) {
    const defaultOptions = {
      fps: 60,
      speed: 1,
    };
    this.options = Object.assign(defaultOptions, options);
    this.world = world;

    this.fps = 0;
  }

  start(render?: () => void, update?: (step: number) => void) {
    if (this.runId) {
      return;
    }

    if (render) {
      this.render = render;
    }

    if (update) {
      this.update = update;
    }

    let last = performance.now();
    let dt = 0;
    let now: number;
    let delta: number;

    const tick = () => {
      now = performance.now();
      if (this.options.speed > 0) {
        dt = dt + Math.min(1, (now - last) / 1000);
        while (dt > this.slowStep) {
          this.world.step(this.step);
          this.update?.(this.step);
          dt -= this.slowStep;
        }
        delta = (now - last) / 1000;
        this.fps = 1 / delta;
      }
      last = now;

      this.render?.call(this);
      this.runId = requestAnimationFrame(tick);
    };

    this.runId = requestAnimationFrame(tick);
  }

  get step() {
    return 1 / this.options.fps;
  }
  get slowStep() {
    return this.step / this.options.speed;
  }

  stop() {
    if (this.runId) {
      cancelAnimationFrame(this.runId);
      this.runId = undefined;
    }
  }
}
