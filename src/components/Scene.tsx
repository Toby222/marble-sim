import React, { useRef } from "react";

import Matter, {
  Engine,
  Render,
  World,
  Bodies,
  Mouse,
  MouseConstraint,
} from "matter-js";

interface Props {
  _: null;
}

interface State {
  _: null;
}

export class Scene extends React.Component<Props, State> {
  canvas: React.RefObject<HTMLCanvasElement>;
  constructor(props) {
    super(props);
    this.canvas = React.createRef<HTMLCanvasElement>();
  }

  componentDidMount() {
    const engine = Engine.create();
    const render = Render.create({
      canvas: this.canvas.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
      },
    });

    const ballA = Bodies.circle(210, 100, 30, { restitution: 0.8 });
    const ballB = Bodies.circle(110, 130, 30, { restitution: 0.8 });

    World.add(engine.world, [
      // walls
      Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth + 10, 50, {
        isStatic: true,
      }),
      Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight,
        window.innerWidth + 10,
        50,
        { isStatic: true }
      ),
      Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight + 10, {
        isStatic: true,
      }),
      Bodies.rectangle(
        window.innerWidth,
        window.innerHeight / 2,
        50,
        window.innerHeight + 10,
        { isStatic: true }
      ),
    ]);

    World.add(engine.world, [ballA, ballB]);

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
      this.canvas.current.height = window.innerHeight;
    })
  }

  render() {
    return <canvas id="marble-sim" ref={this.canvas}></canvas>;
  }
}
