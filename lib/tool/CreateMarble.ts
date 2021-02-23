import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

export class CreateMarble extends BaseTool {
  readonly toolName = "Create Marble";
  static readonly instance = new CreateMarble();

  private static gradient: CanvasGradient;
  click(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    const body = world.createDynamicBody({
      position: Util.getCursorPositionInCanvas(canvas, event, true),
    });

    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    if (!CreateMarble.gradient) {
      CreateMarble.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      CreateMarble.gradient.addColorStop(0, "cyan");
      CreateMarble.gradient.addColorStop(1, "white");
    }

    body.render = {
      fill: CreateMarble.gradient,
      stroke: CreateMarble.gradient,
    };

    body.createFixture({
      density: 1,
      friction: 0.6,
      restitution: 0.5,
      shape: new planck.Circle(planck.Vec2(), 20),
    });
  }
}

export default Object.freeze(new CreateMarble());
