import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import Util from "../Util";

export class ClickAndDrag extends BaseTool {
  readonly toolName = "Click and Drag";

  private static start?: planck.Vec2;
  mousedown(ev: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    ClickAndDrag.start = Util.getCursorPositionInCanvas(canvas, ev);
  }

  mousemove(ev: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    const offset = Util.getCursorPositionInCanvas(canvas, ev).sub(ClickAndDrag.start);
  }

  mouseup(_ev: MouseEvent, _world: planck.World, _canvas: HTMLCanvasElement) {
    ClickAndDrag.start = null;
  }
}
