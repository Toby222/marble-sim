import * as planck from "planck-js";

import { Renderer } from "../Renderer";

declare module "planck-js" {}

export abstract class UIShape implements planck.Shape {
  m_type = "ui";
  m_radius = 0;

  pos: planck.Vec2;
  constructor(pos: planck.Vec2) {
    this.pos = pos;
  }

  getRadius() {
    return this.m_radius;
  }
  getType() {
    return this.m_type;
  }
  getChildCount() {
    return 0;
  }

  computeAABB() {
    return new planck.AABB();
  }
  computeMass() {
    return 0;
  }
  computeDistanceProxy() {
    return 0;
  }

  rayCast() {
    return false;
  }

  isValid() {
    return false;
  }
  testPoint(): false {
    return false;
  }

  abstract render(renderer: Renderer): void;
}
