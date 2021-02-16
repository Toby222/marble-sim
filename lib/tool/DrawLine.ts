import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

class DrawLine extends BaseTool {
  readonly toolName = "Draw Line";
  private static startPos: planck.Vec2 | null = null;

  private static body: planck.Body;
  private static preview: planck.Fixture | null = null;

  mousedown(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    if (!DrawLine.body) {
      DrawLine.body = world.createBody();
      DrawLine.body.render = {
        hidden: false,
        stroke: "pink",
      };
    }
    DrawLine.startPos = Util.getCursorPositionInCanvas(canvas, event, true);
  }

  mousemove(ev: MouseEvent, _w: planck.World, canvas: HTMLCanvasElement) {
    if (DrawLine.preview !== null) {
      DrawLine.body.destroyFixture(DrawLine.preview);
      DrawLine.preview = null;
    }
    if ((ev.buttons & 1) === 0 || DrawLine.startPos === null) {
      DrawLine.startPos = null;
      return;
    }
    DrawLine.preview = DrawLine.body.createFixture(
      new planck.Edge(
        DrawLine.startPos,
        Util.getCursorPositionInCanvas(canvas, ev, true)
      ),
      { isSensor: true }
    );
  }

  mouseup(event: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    if (DrawLine.preview) DrawLine.body.destroyFixture(DrawLine.preview);
    if (DrawLine.startPos === null) return;
    DrawLine.body.createFixture(
      new planck.Edge(
        DrawLine.startPos,
        Util.getCursorPositionInCanvas(canvas, event, true)
      )
    );
  }
}

const instance = new DrawLine();
Object.freeze(instance);
export default instance;
