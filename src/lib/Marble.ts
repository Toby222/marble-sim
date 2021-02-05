import Matter from "matter-js";

export class Marble {
  body: Matter.Body;

  constructor(
    world: Matter.World,
    x: number,
    y: number,
    r: number,
    options?: Matter.IBodyDefinition
  ) {
    this.body = Matter.Bodies.circle(x, y, r, options, 100);
    Matter.World.addBody(world, this.body);
  }
}
