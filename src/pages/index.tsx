import React from "react";
import Matter from "matter-js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import decomp from "poly-decomp";

export default class MarbleSim extends React.Component {
  componentDidMount() {
    const engine = Matter.Engine.create();

    const canvas = document.querySelector<HTMLCanvasElement>(
      "canvas#marble-sim"
    );

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    if (!canvas) return;
    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    const circle = Matter.Bodies.circle(50, 50, 80);
    const ground = Matter.Bodies.rectangle(400, 610, 810, 60, {
      isStatic: true,
    });

    Matter.World.add(engine.world, [circle, ground]);
    Matter.Engine.run(engine);
    Matter.Render.run(render);
  }
  render() {
    return <canvas id="marble-sim"></canvas>;
  }
}
