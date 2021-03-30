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

  world: planck.World;
  uiBody: planck.Body;

  renderer?: Renderer;
  runner?: Runner;

  constructor(props: Props) {
    super(props);
    this.world = new planck.World({
      gravity: new planck.Vec2(0, 10),
      // allowSleep: false,
    });

    this.uiBody = this.world.createBody({
      active: false,
      fixedRotation: true,
      gravityScale: 0,
      type: "static",
      userData: {
        isUI: true,
      },
    });

    this.state = {
      tool: Util.tools[0],
    };

    this.canvas = React.createRef();
    this.toolbar = React.createRef();

    Util.globals.scene = this;
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    this.runner?.stop();

    delete this.renderer;
    delete this.runner;
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

    this.renderer = new Renderer(this.world, context, {
      fillStyle: {
        dynamic: "black",
        kinematic: "gray",
        static: "white",
        text: "20px Sans-Serif",
      },
      scale: 1,
      wireframe: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisScene = this;
    this.renderer.draw = function (_ctx: CanvasRenderingContext2D) {
      const fpsInfo = `FPS: ${Math.round(thisScene.runner?.fps ?? NaN)}`;
      const bodyInfo = `Bodies: ${this.world?.getBodyCount()}`;
      const posInfo = `Position: [x:${-Math.round(
        this.offset.x ?? 0
      )}, y:${-Math.round(this.offset.y ?? 0)}]`;
      const scaleInfo = `Scale: ${
        Math.round((this.options.scale ?? 0) * 100) / 100
      }`;
      const info = [fpsInfo, bodyInfo, posInfo, scaleInfo];
      for (let i = 0; i < info.length; i++) {
        this.drawText(new planck.Vec2(0, 20 * (i + 1)), info[i]);
      }
    };
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

    let zoomLevel = 0;
    this.canvas.current.addEventListener(
      "wheel",
      (ev: WheelEvent) => {
        if (this.renderer === undefined || this.canvas.current === null) return;

        zoomLevel -= ev.deltaY / 100;
        this.renderer.zoom(zoomLevel);
      },
      { passive: true }
    );

    const render = () => {
      this.renderer?.renderWorld();
      if (!this.runner) return;
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
      return console.warn("canvas is not defined. This shouldn't happen.");
    }
    this.canvas.current.width = window.innerWidth;
    this.canvas.current.height =
      window.innerHeight - this.canvas.current.getBoundingClientRect().top;
  }

  render() {
    return (
      <>
        <ToolBar scene={this} />
        <canvas tabIndex={1} id="marble-sim" ref={this.canvas} />
      </>
    );
  }
}
