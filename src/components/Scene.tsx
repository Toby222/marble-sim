import React from "react";

import planck from "planck-js";
import { CanvasRenderer as Renderer } from "../lib/renderer";
import { Runner } from "../lib/runner";

type Props = Record<string, never>;

export class Scene extends React.Component<Props> {
  canvas: React.RefObject<HTMLCanvasElement>;
  toolbar: React.RefObject<HTMLDivElement>;
  world: planck.World;

  constructor(props: Props) {
    super(props);
    this.world = new planck.World();
    this.world.setGravity(new planck.Vec2(0, 10));

    const groundBody = this.world.createBody({
      position: new planck.Vec2(0, 50),
      angle: 0.02 * Math.PI,
    });
    const groundBox = new planck.Box(100, 10);
    groundBody.createFixture(groundBox);

    const body = this.world.createBody({
      type: "dynamic",
      position: new planck.Vec2(0, 4),
    });

    const dynamicBox = new planck.Circle(planck.Vec2(), 4);
    body.createFixture({
      shape: dynamicBox,
      density: 100,
    });

    this.canvas = React.createRef();
    this.toolbar = React.createRef();
  }

  componentDidMount() {
    const context = this.canvas.current.getContext("2d");

    const renderer = new Renderer(this.world, context, { scale: 1 });
    const runner = new Runner(this.world, { fps: 30 });

    window.addEventListener("resize", () => this.handleResize());
    this.handleResize();

    this.canvas.current.addEventListener("click", (event: MouseEvent) => {
      this.world
        .createBody({
          type: "dynamic",
          position: this.getCursorPositionInCanvas(event),
        })
        .createFixture({
          shape: new planck.Circle(planck.Vec2(), 3),
          density: 100,
        });
    });

    runner.options.speed = 5;
    runner.start(() => renderer.renderWorld());
  }
  getCursorPositionInCanvas(event: MouseEvent) {
    const rect = this.canvas.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return planck.Vec2(x, y);
  }

  handleResize() {
    if (!(this.canvas?.current ?? false)) {
      return console.debug("canvas is not defined. This shouldn't happen.");
    }
    this.canvas.current.width = window.innerWidth;
    this.canvas.current.height = window.innerHeight - 50;
  }

  render() {
    return (
      <>
        <div id="toolbar" ref={this.toolbar}>
          <label htmlFor="tools">Select a tool</label>
          <select name="tools" id="tools">
            <option>Marble</option>
          </select>
        </div>
        <canvas id="marble-sim" ref={this.canvas}></canvas>
      </>
    );
  }
}
