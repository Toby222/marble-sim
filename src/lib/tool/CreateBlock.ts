import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

export class CreateBlock extends BaseTool {
  readonly toolName = "Create Block";

  click(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    world
      .createBody({
        type: "dynamic",
        position: Util.getCursorPositionInCanvas(canvas, event),
      })
      .createFixture({
        shape: new planck.Box(
          20,
          20,
          planck.Vec2(),
          planck.Math.random(0, 2 * Math.PI)
        ),
        restitution: 1,
        friction: 1,
      });
  }
}
