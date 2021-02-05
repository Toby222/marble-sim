import React from "react";

import {
  Engine,
  Render,
  World,
  Bodies,
  Mouse,
  MouseConstraint,
  Body,
} from "matter-js";
import { Marble } from "../lib/Marble";

export class MatterScene extends React.Component<any, any> {
  canvas: React.RefObject<HTMLCanvasElement>;
  engine: Engine = Engine.create();

  bodies: Map<string, Body> = new Map();

  constructor(props) {
    super(props);
    this.canvas = React.createRef<HTMLCanvasElement>();
  }

  componentDidMount() {
    const engine = this.engine;

    const render = Render.create({
      canvas: this.canvas.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight - 50,
        wireframes: false,
      },
    });

    new Marble(engine.world, 210, 100, 30, { restitution: 1, friction: 0, frictionStatic: 0, frictionAir: 0 });
    new Marble(engine.world, 110, 130, 30, { restitution: 1, friction: 0, frictionStatic: 0, frictionAir: 0 });

    const canvas = this.canvas.current;

    // walls
    const wallTop = Bodies.rectangle(
      canvas.width / 2,
      0,
      canvas.width + 10,
      50,
      {
        isStatic: true,
      }
    );
    const wallBottom = Bodies.rectangle(
      canvas.width / 2,
      canvas.height,
      canvas.width + 10,
      50,
      {
        isStatic: true,
      }
    );
    const wallLeft = Bodies.rectangle(
      0,
      canvas.height / 2,
      50,
      canvas.height + 10,
      {
        isStatic: true,
      }
    );
    const wallRight = Bodies.rectangle(
      canvas.width,
      canvas.height / 2,
      50,
      canvas.height + 10,
      { isStatic: true }
    );

    this.bodies.set("wallTop", wallTop);
    this.bodies.set("wallBottom", wallBottom);
    this.bodies.set("wallLeft", wallLeft);
    this.bodies.set("wallRight", wallRight);

    World.add(engine.world, [wallTop, wallBottom, wallLeft, wallRight]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, { mouse });
    mouseConstraint.constraint.stiffness = 0.2;
    mouseConstraint.constraint.render.visible = false;

    World.add(engine.world, mouseConstraint);

    /*
    Matter.Events.on(mouseConstraint, "mousedown", (_event) => {
      World.add(engine.world, Bodies.circle(150, 50, 30, { restitution: 0.9 }));
    });
    */

    Engine.run(engine);
    Render.run(render);

    window.addEventListener("resize", () => {
      this.canvas.current.width = window.innerWidth;
      this.canvas.current.height = window.innerHeight - 50;
    });

    this.setState({ engine, render });
  }

  render() {
    return <canvas id="marble-sim" ref={this.canvas}></canvas>;
  }
}
