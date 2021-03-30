import { BaseTool } from "./BaseTool";
import * as planck from "planck-js";
import Util from "../Util";
export class Grab extends BaseTool {
  readonly toolName = "Grab";
  static readonly instance: Grab = new Grab();

  static mouseJoint: planck.MouseJoint | null = null;
  static mouseGround: planck.Body;

  mousedown(ev: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    if (Grab.mouseGround === undefined) {
      Grab.mouseGround = world.createBody();
    }
    const mousePos = Util.getCursorPositionInCanvas(canvas, ev, true);
    Util.findBody(world, mousePos, (clickedBody) => {
      if (clickedBody === null) return;
      clickedBody.setFixedRotation(true);

      if (Grab.mouseJoint !== null) {
        world.destroyJoint(Grab.mouseJoint);
        Grab.mouseJoint = null;
      }

      Grab.mouseJoint = world.createJoint(
        new planck.MouseJoint(
          { dampingRatio: 0, maxForce: 1e100 },
          Grab.mouseGround,
          clickedBody,
          mousePos
        )
      );
    });
  }

  mousemove(ev: MouseEvent, _world: planck.World, canvas: HTMLCanvasElement) {
    if (Grab.mouseJoint === null) return;
    const mousePos = Util.getCursorPositionInCanvas(canvas, ev, true);
    Grab.mouseJoint.setTarget(mousePos);
  }

  mouseup(_ev: MouseEvent, world: planck.World, _canvas: HTMLCanvasElement) {
    if (Grab.mouseJoint === null) return;
    Grab.mouseJoint.getBodyB().setFixedRotation(false);
    world.destroyJoint(Grab.mouseJoint);
    Grab.mouseJoint = null;
  }
}
