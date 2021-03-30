import * as planck from "planck-js";
import { AnyTool } from "./tool/BaseTool";

import { DragCamera } from "./tool/DragCamera";
import { Grab } from "./tool/Grab";
import { CreateMarble } from "./tool/CreateMarble";
import { CreateBlock } from "./tool/CreateBlock";
import { DrawLine } from "./tool/DrawLine";

import { Renderer } from "./Renderer";
import { Scene } from "../components/Scene";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Util {
  export const globals: {
    scene?: Scene;
  } = {};

  export function getCursorPositionInCanvas(
    canvas: HTMLCanvasElement,
    event: MouseEvent,
    renderer?: Renderer | boolean
  ) {
    if (renderer === true) {
      renderer = globals?.scene?.renderer;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const result = planck.Vec2(x, y);
    if (renderer) {
      result.mul(1 / renderer.options.scale);
      result.sub(renderer.offset);
    }
    return result;
  }

  export const tools: AnyTool[] = [
    DragCamera.instance,
    Grab.instance,
    CreateMarble.instance,
    CreateBlock.instance,
    DrawLine.instance,
  ];

  export function findBody(
    world: planck.World,
    point: planck.Vec2,
    callback: (body: planck.Body | null) => unknown
  ) {
    const aabb = planck.AABB(point, point);

    const queryCallback = (fixture: planck.Fixture) => {
      if (!fixture.getBody().isDynamic() || !fixture.testPoint(point)) {
        callback(null);
        return false;
      }
      callback(fixture.getBody());
      return true;
    };

    world.queryAABB(aabb, queryCallback);
  }
}
export default Util;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).util = Util;
