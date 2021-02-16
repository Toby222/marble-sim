import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

export class DrawLine extends BaseTool {
  toolName = "Draw Line";
  private startPos: planck.Vec2;

  private static body: planck.Body;

  mousedown(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    if (!DrawLine.body) {
      DrawLine.body = world.createBody();
      DrawLine.body.render = {
        hidden: false,
        stroke: "pink",
      };
    }
    this.startPos = Util.getCursorPositionInCanvas(canvas, event);
  }

  mouseup(event: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    DrawLine.body.createFixture(
      new planck.Edge(
        this.startPos,
        Util.getCursorPositionInCanvas(canvas, event)
      )
    );
  }
}
