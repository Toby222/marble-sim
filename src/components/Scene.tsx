import React from "react";

import planck from "planck-js";
import { CanvasRenderer } from "../lib/renderer";
import { Runner } from "../lib/runner";

export class Scene extends React.Component<Record<string, never>> {
  canvas: React.RefObject<HTMLCanvasElement>;
  world: planck.World;

  constructor(props) {
    super(props);
    this.world = new planck.World();
    const groundBody = this.world.createBody({
      position: new planck.Vec2(0, -10),
    });
    const groundBox = new planck.Box(50, 10);
    groundBody.createFixture(groundBox);

    const body = this.world.createBody({
      type: "dynamic",
      position: new planck.Vec2(0, 4),
    });

    const dynamicBox = new planck.Box(1, 1);
    body.createFixture({
      shape: dynamicBox,
      density: 1,
      friction: 0.3,
    });

    this.canvas = React.createRef();
  }

  componentDidMount() {
    const context = this.canvas.current.getContext("2d");

    const renderer = new CanvasRenderer(this.world, context);
    const runner = new Runner(this.world, { fps: 30 });

    const handleResize = () => {
      this.canvas.current.width = window.innerWidth;
      this.canvas.current.height = window.innerHeight - 50;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    runner.start(() => renderer.renderWorld());
  }

  render() {
    return <canvas id="marble-sim" ref={this.canvas}></canvas>;
  }
}
