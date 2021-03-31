import * as planck from "planck-js";

import { Renderer } from "../Renderer";

declare module "planck-js" {}

export abstract class UIShape extends planck.Edge {
  constructor(pos: planck.Vec2) {
    super(new planck.Vec2(), new planck.Vec2());
    this.m_type = "ui";
    this.pos = pos;
  }
  pos: planck.Vec2;

  abstract render(renderer: Renderer): void
}
UIShape.TYPE = "ui";
