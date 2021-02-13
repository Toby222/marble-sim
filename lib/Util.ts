import planck from "planck-js";
import { AnyTool } from "./tool/BaseTool";
import { CreateBlock } from "./tool/CreateBlock";
import { CreateMarble } from "./tool/CreateMarble";
import { DoNothing } from "./tool/DoNothing";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Util {
  export function getCursorPositionInCanvas(
    canvas: HTMLCanvasElement,
    event: MouseEvent
  ) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return planck.Vec2(x, y);
  }

  export const tools: AnyTool[] = [
    new DoNothing(),
    new CreateMarble(),
    new CreateBlock(),
  ];
}
