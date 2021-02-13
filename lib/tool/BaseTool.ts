import { World } from "planck-js";

export type AnyTool = BaseTool;

export abstract class BaseTool {
  abstract readonly toolName: string;

  toString(): string {
    return this.toolName;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  click(event: MouseEvent, world: World, canvas: HTMLCanvasElement) {
    return;
  }
}
