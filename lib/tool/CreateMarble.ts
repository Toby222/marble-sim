import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

export class CreateMarble extends BaseTool {
  readonly toolName = "Create Marble";

  click(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    world
      .createBody({
        type: "dynamic",
        position: Util.getCursorPositionInCanvas(canvas, event),
      })
      .createFixture({
        shape: new planck.Circle(planck.Vec2(), 20),
        restitution: 1,
        friction: 1,
        density: 1,
      });
  }
}
