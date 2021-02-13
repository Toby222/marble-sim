import { BaseTool } from "./BaseTool";
import planck from "planck-js";

export class DoNothing extends BaseTool {
  readonly toolName = "Nothing";

  click(_event: MouseEvent, _world: planck.World, _canvas: HTMLCanvasElement) {
    return;
  }
}
