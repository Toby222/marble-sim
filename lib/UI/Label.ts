import * as planck from "planck-js";

import { Renderer } from "../Renderer";

import { UIShape } from "./UIShape";

export class Label extends UIShape {
  text: string;
  constructor(pos: planck.Vec2, text: string) {
    super(pos);
    this.text = text;
  }

  render(renderer: Renderer) {
    const lines = this.text.split("\n");
    const lineHeight = parseFloat(getComputedStyle(renderer.canvas).fontSize);
    for (let i = 0, line = lines[i]; i < lines.length; line = lines[++i])
      renderer.drawText(new planck.Vec2(0, lineHeight * i).add(this.pos), line);
  }
}
