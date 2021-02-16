/* eslint-disable @typescript-eslint/no-unused-vars */
import { World } from "planck-js";

export type AnyTool = BaseTool;

export abstract class BaseTool {
  abstract readonly toolName: string;

  toString(): string {
    return this.toolName;
  }

  click?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
  mousedown?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
  mousemove?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
  mouseup?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
}
