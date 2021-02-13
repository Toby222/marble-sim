import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

export class CreateMarble extends BaseTool {
  readonly toolName = "Create Marble";

  private static gradient: CanvasGradient;
  click(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    const body = world.createDynamicBody({
      position: Util.getCursorPositionInCanvas(canvas, event),
    });

    const ctx = canvas.getContext("2d");

    if (!CreateMarble.gradient) {
      CreateMarble.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      CreateMarble.gradient.addColorStop(0, "cyan");
      CreateMarble.gradient.addColorStop(1, "white");
    }

    body.render = {
      fill: CreateMarble.gradient,
    };

    body.createFixture({
      shape: new planck.Circle(planck.Vec2(), 20),
      restitution: 0.5,
      friction: 0.6,
      density: 1,
    });
  }
}
