import { BaseTool } from "./BaseTool";
import planck from "planck-js";
import { Util } from "../Util";

class CreateBlock extends BaseTool {
  readonly toolName = "Create Block";

  private static gradient: CanvasGradient;
  click(event: MouseEvent, world: planck.World, canvas: HTMLCanvasElement) {
    const body = world.createDynamicBody({
      position: Util.getCursorPositionInCanvas(canvas, event, true),
    });

    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    if (!CreateBlock.gradient) {
      CreateBlock.gradient = ctx.createLinearGradient(-10, -10, 10, 10);
      CreateBlock.gradient.addColorStop(0, "pink");
      CreateBlock.gradient.addColorStop(1, "white");
    }

    body.render = {
      fill: CreateBlock.gradient,
      stroke: CreateBlock.gradient,
    };

    body.createFixture({
      shape: new planck.Box(
        20,
        20,
        planck.Vec2(),
        planck.Math.random(0, 2 * Math.PI)
      ),
      restitution: 0.5,
      friction: 0.9,
      density: 1,
    });
  }
}

const instance = new CreateBlock();
Object.freeze(instance);
export default instance;
