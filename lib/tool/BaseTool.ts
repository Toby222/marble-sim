/* eslint-disable @typescript-eslint/no-unused-vars */
import { World } from "planck-js";

export type AnyTool = BaseTool;

export abstract class BaseTool {
  abstract readonly toolName: string;
  // static readonly instance: AnyTool;
  static get instance(): Readonly<BaseTool> {
    throw new Error("instance is an abstract member");
  }

  toString(): string {
    return this.toolName;
  }

  click?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
  mousedown?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
  mousemove?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
  mouseup?(event: MouseEvent, world: World, canvas: HTMLCanvasElement): void;
}
