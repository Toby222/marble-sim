import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

class DrawLine extends BaseTool {
  readonly toolName = "Draw Line";
  private static startPos: planck.Vec2 | null = null;

  private static body: planck.Body;

  mousedown(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    if (!DrawLine.body) {
      DrawLine.body = world.createBody();
      DrawLine.body.render = {
        hidden: false,
        stroke: "pink",
      };
    }
    DrawLine.startPos = Util.getCursorPositionInCanvas(canvas, event);
  }

  mouseup(event: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    if (DrawLine.startPos === null) return;
    DrawLine.body.createFixture(
      new planck.Edge(
        DrawLine.startPos,
        Util.getCursorPositionInCanvas(canvas, event)
      )
    );
  }
}

const instance = new DrawLine();
Object.freeze(instance);
export default instance;
