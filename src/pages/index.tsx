import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import decomp from "poly-decomp";

import Head from "next/head";

import {
  Engine,
  Render,
  Bodies,
  World,
  Mouse,
  MouseConstraint,
  Runner,
} from "matter-js";

export default class MarbleSim extends React.Component<
  Record<string, never>,
  { dimensions: { height: number; width: number } }
> {
  engine: Engine = Engine.create();

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      dimensions: {
        height: 100,
        width: 100,
      },
    };
  }

  componentWillUnmount() {
    this.engine.world.bodies = [];
  }

  componentDidMount() {
    const canvas = document.querySelector<HTMLCanvasElement>(
      "canvas#marble-sim"
    );

    if (!canvas) return;
    const engine = this.engine;
    const render = Render.create({
      canvas,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    const circle = Bodies.circle(
      300,
      200,
      80,
      {
        restitution: 0.9,
        frictionAir: 0,
        frictionStatic: 0,
      },
      100
    );

    const platform = Bodies.rectangle(
      canvas.width / 2,
      canvas.height * 0.75,
      canvas.width / 2,
      canvas.height / 10,
      {
        isStatic: true,
      }
    );

    const ceiling = Bodies.rectangle(
      canvas.width / 2,
      -25,
      canvas.width + 10,
      50,
      {
        isStatic: true,
      }
    );

    const wallLeft = Bodies.rectangle(
      -25,
      canvas.height / 2,
      50,
      canvas.height + 10,
      { isStatic: true }
    );
    const wallRight = Bodies.rectangle(
      canvas.width + 25,
      canvas.height / 2,
      50,
      canvas.height + 10,
      { isStatic: true }
    );

    const ground = Bodies.rectangle(
      canvas.width / 2,
      canvas.height + 25,
      canvas.width + 10,
      50,
      {
        isStatic: true,
      }
    );

    const runner = Runner.create();
    Runner.run(runner, engine);

    // add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
    });
    mouseConstraint.constraint.render.visible = false;

    World.add(engine.world, mouseConstraint);
    World.add(engine.world, [
      circle,
      platform,
      ceiling,
      ground,
      wallLeft,
      wallRight,
    ]);

    Engine.run(engine);
    Render.run(render);

    window.addEventListener("resize", () => {
      this.setState({
        dimensions: {
          height: window.innerHeight,
          width: window.innerWidth,
        },
      });
    });
  }
  render() {
    return (
      <>
        <Head>
          <title>Marbles 4 Catgirls</title>
        </Head>
        <canvas
          id="marble-sim"
          width={this.state.dimensions.width}
          height={this.state.dimensions.height}
        >
          test
        </canvas>
      </>
    );
  }
}
