import React, { FormEvent } from "react";

import planck from "planck-js";
import { CanvasRenderer as Renderer } from "../lib/renderer";
import { Runner } from "../lib/runner";

type Props = Record<string, never>;

interface UserData {
  markedForDeletion: boolean;
}

export class Scene extends React.Component<Props> {
  canvas: React.RefObject<HTMLCanvasElement>;
  toolbar: React.RefObject<HTMLDivElement>;
  fpsCounter: React.RefObject<HTMLSpanElement>;

  world: planck.World;
  renderer: Renderer;
  runner: Runner;

  edges: planck.Body;

  constructor(props: Props) {
    super(props);
    this.world = new planck.World();
    this.world.setGravity(new planck.Vec2(0, 10));

    this.canvas = React.createRef();
    this.toolbar = React.createRef();
    this.fpsCounter = React.createRef();
  }

  componentWillUnmount() {
    this.canvas.current.style.visibility = "none";
    this.runner.stop();
    delete this.renderer;
    delete this.runner;
    delete this.world;
    window.removeEventListener("resize", this.handleResize);
  }

  componentDidMount() {
    const context = this.canvas.current.getContext("2d");
    this.handleResize();

    const corners = [
      planck.Vec2(0, 0), // NW
      planck.Vec2(0, this.canvas.current.clientHeight), // SW
      planck.Vec2(this.canvas.current.clientWidth, 0), // NE
      planck.Vec2(
        this.canvas.current.clientWidth,
        this.canvas.current.clientHeight
      ), // SE
    ];

    const edge = this.world.createBody();
    const edgeFixtures = [
      edge.createFixture(planck.Edge(corners[0], corners[1])), // W
      edge.createFixture(planck.Edge(corners[1], corners[3])), // S
      edge.createFixture(planck.Edge(corners[2], corners[3])), // E
      edge.createFixture(planck.Edge(corners[0], corners[2])), // N
    ];
    edge.render = { hidden: true };
    this.edges = edge;

    this.world.on("begin-contact", (contact: planck.Contact) => {
      if (
        edgeFixtures.includes(contact.getFixtureA()) &&
        contact.getFixtureA().isSensor()
      ) {
        contact
          .getFixtureB()
          .getBody()
          .setUserData({ markedForDeletion: true });
      }

      if (
        edgeFixtures.includes(contact.getFixtureB()) &&
        contact.getFixtureB().isSensor()
      ) {
        contact
          .getFixtureA()
          .getBody()
          .setUserData({ markedForDeletion: true });
      }
    });

    this.renderer = new Renderer(this.world, context, { scale: 1 });
    this.runner = new Runner(this.world, { fps: 30, speed: 30 });

    window.addEventListener("resize", () => this.handleResize());

    this.canvas.current.addEventListener("click", (event: MouseEvent) => {
      this.world
        .createBody({
          type: "dynamic",
          position: this.getCursorPositionInCanvas(event),
        })
        .createFixture({
          shape: new planck.Circle(planck.Vec2(), 20),
          restitution: 1,
          friction: 0,
        });
    });

    const render = () => {
      this.renderer.renderWorld();
      if (this.fpsCounter.current)
        this.fpsCounter.current.innerText = `FPS: ${Math.round(
          this.runner.fps
        )}; Bodies: ${this.world.getBodyCount()}`;
    };

    const update = () => {
      for (let body = this.world.getBodyList(); body; body = body.getNext()) {
        if ((body.getUserData() as UserData)?.markedForDeletion) {
          this.world.destroyBody(body);
        }
      }
    };

    this.runner.start(render, update);
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
          <span ref={this.fpsCounter} />
          &nbsp;
          <label htmlFor="tools">Select a tool</label>
          &nbsp;
          <select name="tools" >
            <option>Marble</option>
          </select>
          <label htmlFor="change-speed">Adjust speed:</label>
          &nbsp;
          <input
            name="change-speed"
            type="range"
            min={0}
            max={100}
            defaultValue={30}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const value = (event.target as HTMLInputElement).valueAsNumber;
              this.runner.options.speed = value;
            }}
          />
          <input
            type="checkbox"
            defaultChecked={true}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const checked = (event.target as HTMLInputElement).checked;
              for (
                let edge = this.edges.getFixtureList();
                edge;
                edge = edge.getNext()
              ) {
                edge.setSensor(!checked);
              }
            }}
          />
        </div>
        <canvas id="marble-sim" ref={this.canvas} />
      </>
    );
  }
}
