import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import Util from "../Util";

class ClickAndDrag extends BaseTool {
  readonly toolName = "Click and Drag";

  private static start: planck.Vec2 | null = null;
  private static startOffset: planck.Vec2 | null = null;

  mousedown(ev: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    if (Util.globals.scene?.renderer === undefined) return;

    ClickAndDrag.start = Util.getCursorPositionInCanvas(canvas, ev).mul(
      1 / Util.globals.scene.renderer.options.scale
    );
    ClickAndDrag.startOffset = Util.globals.scene.renderer.offset;
  }

  mousemove(ev: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    if ((ev.buttons & (1 | (1 << 2))) === 0) {
      ClickAndDrag.start = null;
      ClickAndDrag.startOffset = null;
      return;
    }

    if (
      ClickAndDrag.start === null ||
      ClickAndDrag.startOffset === null ||
      Util.globals.scene?.renderer === undefined
    )
      return;

    const offset = Util.getCursorPositionInCanvas(canvas, ev)
      .mul(1 / Util.globals.scene.renderer.options.scale)
      .sub(ClickAndDrag.start)
      .add(ClickAndDrag.startOffset);

    Util.globals.scene.renderer.offset = offset;
  }

  mouseup(_ev: MouseEvent, _world: planck.World, _canvas: HTMLCanvasElement) {
    ClickAndDrag.start = null;
    ClickAndDrag.startOffset = null;
  }
}

const instance = new ClickAndDrag();
Object.freeze(instance);
export default instance;
