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
  { dimensions: { height: number; width: number }; matter: { engine: Engine } }
> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      dimensions: {
        height: 100,
        width: 100,
      },
      matter: {
        engine: Engine.create(),
      },
    };
  }

  componentDidMount() {
    const canvas = document.querySelector<HTMLCanvasElement>(
      "canvas#marble-sim"
    );

    if (!canvas) return;
    const engine = this.state.matter.engine;
    const render = Render.create({
      canvas,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    const polygon = Bodies.polygon(900, 200, 100, 80, {
      restitution: 1,
      frictionAir: 0,
    });
    const ground = Bodies.rectangle(900, 610, 810, 60, {
      isStatic: true,
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    // add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
    });
    mouseConstraint.constraint.render.visible = false;

    World.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    // render.mouse = mouse;

    World.add(engine.world, [polygon, ground]);

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
        ></canvas>
      </>
    );
  }
}
