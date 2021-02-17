import React from "react";

import planck from "planck-js";
import { Renderer } from "../lib/Renderer";
import { Runner } from "../lib/Runner";

import { Util } from "../lib/Util";
import { AnyTool } from "../lib/tool/BaseTool";
import { ToolBar } from "./ToolBar";

type Props = Record<string, never>;

interface State {
  tool: AnyTool;
}

interface UserData {
  markedForDeletion: boolean;
}

export class Scene extends React.Component<Props, State> {
  canvas: React.RefObject<HTMLCanvasElement>;
  toolbar: React.RefObject<HTMLDivElement>;
  fpsCounter: React.RefObject<HTMLSpanElement>;

  world?: planck.World;
  renderer?: Renderer;
  runner?: Runner;

  edge?: planck.Body;

  constructor(props: Props) {
    super(props);
    this.world = new planck.World({
      gravity: new planck.Vec2(0, 10),
      // allowSleep: false,
    });

    this.state = {
      tool: Util.tools[0],
    };

    this.canvas = React.createRef();
    this.toolbar = React.createRef();
    this.fpsCounter = React.createRef();

    Util.globals.scene = this;
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    this.runner?.stop();

    delete this.renderer;
    delete this.runner;
    delete this.world;
  }

  componentDidMount() {
    if (this.world === undefined) {
      throw new Error("Scene.world is undefined, this shouldn't happen.");
    }
    if (this.canvas.current === null) {
      throw new Error(
        "Scene.canvas is null after mount, this shouldn't happen."
      );
    }

    const context = this.canvas.current.getContext("2d");
    if (context === null) {
      (this.canvas.current.parentElement ?? document).append(
        "CanvasRenderingContext2D not supported."
      );
      this.canvas.current.remove();

      return;
    }

    this.handleResize();

    const clientWidth = this.canvas.current.clientWidth;
    const clientHeight = this.canvas.current.clientHeight;
    const corners = [
      planck.Vec2(0, 0), // NW
      planck.Vec2(clientWidth, 0), // NE
      planck.Vec2(clientWidth, clientHeight), // SE
      planck.Vec2(0, clientHeight), // SW
    ];

    this.edge = this.world.createBody();
    this.edge.createFixture(planck.Chain([...corners, corners[0]]));

    this.edge.render = { hidden: false };

    this.world.on("begin-contact", (contact: planck.Contact) => {
      if (
        contact.getFixtureA().getBody() === this.edge &&
        contact.getFixtureA().isSensor()
      ) {
        contact
          .getFixtureB()
          .getBody()
          .setUserData({ markedForDeletion: true });
      }

      if (
        contact.getFixtureA().getBody() === this.edge &&
        contact.getFixtureB().isSensor()
      ) {
        contact
          .getFixtureA()
          .getBody()
          .setUserData({ markedForDeletion: true });
      }
    });

    this.renderer = new Renderer(this.world, context, {
      scale: 1,
      wireframe: false,
      lineWidth: 2,
    });
    this.runner = new Runner(this.world, { fps: 30, speed: 30 });

    window.addEventListener("resize", () => this.handleResize());

    this.canvas.current.addEventListener("click", (ev: MouseEvent) => {
      if (this.world !== undefined && this.canvas.current !== null)
        this.state.tool?.click?.(ev, this.world, this.canvas.current);
    });
    this.canvas.current.addEventListener("mousedown", (ev: MouseEvent) => {
      if (this.world !== undefined && this.canvas.current !== null)
        this.state.tool?.mousedown?.(ev, this.world, this.canvas.current);
    });
    this.canvas.current.addEventListener("mouseup", (ev: MouseEvent) => {
      if (this.world !== undefined && this.canvas.current !== null)
        this.state.tool?.mouseup?.(ev, this.world, this.canvas.current);
    });
    this.canvas.current.addEventListener("mousemove", (ev: MouseEvent) => {
      if (this.world !== undefined && this.canvas.current !== null)
        this.state.tool?.mousemove?.(ev, this.world, this.canvas.current);
    });
    this.canvas.current.addEventListener("keydown", (_ev: KeyboardEvent) => {
      // TODO: Move camera here
    });

    let zoomLevel = 1;
    this.canvas.current.addEventListener(
      "wheel",
      (ev: WheelEvent) => {
        if (this.renderer === undefined) return;

        zoomLevel -= ev.deltaY / 40;
        this.renderer.options.scale = 1.1 ** zoomLevel;
      },
      { passive: true }
    );

    const render = () => {
      this.renderer?.renderWorld();
      if (!this.runner) return;
      if (this.fpsCounter.current)
        this.fpsCounter.current.innerText = `FPS: ${Math.round(
          this.runner.fps
        )}; Bodies: ${this.world?.getBodyCount()}`;
    };

    const update = () => {
      for (let body = this.world?.getBodyList(); body; body = body.getNext()) {
        if ((body.getUserData() as UserData)?.markedForDeletion) {
          body.getWorld().destroyBody(body);
        }
      }
    };

    this.runner.start(render, update);
  }

  handleResize() {
    if (this.canvas.current === null) {
      return console.debug("canvas is not defined. This shouldn't happen.");
    }
    this.canvas.current.width = window.innerWidth;
    this.canvas.current.height =
      window.innerHeight - this.canvas.current.getBoundingClientRect().top;
  }

  render() {
    return (
      <>
        <ToolBar scene={this} />
        <canvas id="marble-sim" ref={this.canvas} />
      </>
    );
  }
}
