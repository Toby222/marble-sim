import { BaseTool } from "./BaseTool";
import * as planck from "planck-js";
import Util from "../Util";

export class DragCamera extends BaseTool {
  readonly toolName = "Drag Camera";
  static readonly instance: DragCamera = new DragCamera();

  private static start: planck.Vec2 | null = null;
  private static startOffset: planck.Vec2 | null = null;

  mousedown(ev: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    if (Util.globals.scene?.renderer === undefined) return;

    DragCamera.start = Util.getCursorPositionInCanvas(canvas, ev).mul(
      1 / Util.globals.scene.renderer.options.scale
    );
    DragCamera.startOffset = Util.globals.scene.renderer.offset;
  }

  mousemove(ev: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    if ((ev.buttons & (1 | (1 << 2))) === 0) {
      DragCamera.start = null;
      DragCamera.startOffset = null;
      return;
    }

    if (
      DragCamera.start === null ||
      DragCamera.startOffset === null ||
      Util.globals.scene?.renderer === undefined
    )
      return;

    const offset = Util.getCursorPositionInCanvas(canvas, ev)
      .mul(1 / Util.globals.scene.renderer.options.scale)
      .sub(DragCamera.start)
      .add(DragCamera.startOffset);

    Util.globals.scene.renderer.offset = offset;
  }

  mouseup(_ev: MouseEvent, _world: planck.World, _canvas: HTMLCanvasElement) {
    DragCamera.start = null;
    DragCamera.startOffset = null;
  }
}
