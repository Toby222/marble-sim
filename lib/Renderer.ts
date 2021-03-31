import { UserData } from "./Interfaces/UserData";
import { UIShape } from "./UI/UIShape";

type drawStyle = CanvasGradient | CanvasPattern | string;

interface RendererOptions {
  lineWidth: number;
  scale: number;
  fillStyle: {
    dynamic: drawStyle;
    kinematic: drawStyle
    static: drawStyle;
  };
  strokeStyle: {
    dynamic: drawStyle;
    static: drawStyle;
    kinematic: drawStyle;
  };
  wireframe: boolean;
}

import * as planck from "planck-js";
declare module "planck-js" {
  export interface Body {
    render?: {
      /** @returns wether or not to use default rendering after call */
      custom?: (
        ctx: CanvasRenderingContext2D,
        pos: planck.Vec2,
        size: {
          width: number;
          height: number;
        }
      ) => boolean | undefined;
      fill?: drawStyle;
      hidden?: boolean;
      stroke?: drawStyle;
      text?: drawStyle;
    };
  }
}

export class Renderer {
  static readonly zoomMultiplier = 1.1;
  options: RendererOptions;
  world: planck.World;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  draw?: (ctx: CanvasRenderingContext2D) => void;
  offset: planck.Vec2 = new planck.Vec2();

  constructor(
    world: planck.World,
    ctx: CanvasRenderingContext2D,
    options: Partial<RendererOptions> = {}
  ) {
    const defaultScale = 16;
    const defaultOptions: RendererOptions = {
      fillStyle: {
        dynamic: "black",
        kinematic: "gray",
        static: "red",
      },
      lineWidth: NaN,
      scale: defaultScale,
      strokeStyle: {
        dynamic: "black",
        kinematic: "gray",
        static: "red",
      },
      wireframe: true,
    };

    this.options = Object.assign(defaultOptions, options);
    if (!options.lineWidth) {
      this.options.lineWidth = 1 / this.options.scale;
    }

    this.world = world;
    this.ctx = ctx;
    ctx.textBaseline = "top"
    this.canvas = ctx.canvas;

    this.draw = undefined;
  }

  clear(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  zoom(level: number) {
    const bottomRightBefore = new planck.Vec2(
      this.canvas.clientWidth / this.options.scale,
      this.canvas.clientHeight / this.options.scale
    );
    this.options.scale = Renderer.zoomMultiplier ** level;
    const bottomRightAfter = new planck.Vec2(
      this.canvas.clientWidth / this.options.scale,
      this.canvas.clientHeight / this.options.scale
    );

    this.offset.add(bottomRightAfter.sub(bottomRightBefore).mul(1 / 2));
  }

  renderWorld() {
    const { ctx, canvas, options } = this;
    this.clear(canvas, ctx);

    this.draw?.(ctx);

    let _offset = new planck.Vec2();
    const _scale = this.options.scale;
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      if ((body.getUserData() as UserData)?.isUI) {
        _offset = this.offset;
        this.options.scale = 1;
        this.offset = new planck.Vec2();
      }
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        if (body.render?.hidden) {
          continue;
        }

        if (body.isDynamic()) {
          ctx.strokeStyle = options.strokeStyle.dynamic;
          ctx.fillStyle = options.fillStyle.dynamic;
        } else if (body.isKinematic()) {
          ctx.strokeStyle = options.strokeStyle.kinematic;
          ctx.fillStyle = options.fillStyle.kinematic;
        } else if (body.isStatic()) {
          ctx.strokeStyle = options.strokeStyle.static;
          ctx.fillStyle = options.fillStyle.static;
        }
        ctx.font = getComputedStyle(canvas).font;

        if (body.render?.stroke !== undefined) {
          ctx.strokeStyle = body.render.stroke;
        }
        if (body.render?.fill !== undefined) {
          ctx.fillStyle = body.render.fill;
        }
        if (body.render?.text !== undefined) {
          ctx.font = body.render.text.toString();
        }

        const type = fixture.getType();
        const shape = fixture.getShape();

        ctx.save();
        ctx.scale(this.options.scale, this.options.scale);
        ctx.lineWidth = options.lineWidth;

        switch (type) {
          case "circle":
            this.drawCircle(body, shape as planck.Circle);
            break;
          case "edge":
            this.drawEdge(body, shape as planck.Edge);
            break;
          case "polygon":
            this.drawPolygon(body, shape as planck.Polygon);
            break;
          case "chain":
            this.drawPolygon(body, shape as planck.Chain);
            break;
          case "ui":
            this.drawUI(body, shape as UIShape);
            break;
        }

        ctx.restore();
      }
      if ((body.getUserData() as UserData)?.isUI) {
        this.offset = _offset;
        this.options.scale = _scale;
      }
    }

    for (
      let joint = this.world.getJointList();
      joint;
      joint = joint.getNext()
    ) {
      ctx.save();
      ctx.scale(this.options.scale, this.options.scale);
      this.drawJoint(joint);
      ctx.restore();
    }
  }

  drawCircle(body: planck.Body, shape: planck.Circle) {
    const ctx = this.ctx;
    const lineWidth = this.options.lineWidth;

    const radius = shape.getRadius();
    const pos = planck.Vec2(body.getPosition()).add(this.offset);
    const angle = body.getAngle();

    ctx.translate(pos.x + lineWidth, pos.y + lineWidth);
    ctx.rotate(angle);

    if (body.render?.custom) {
      const diameter = radius * 2 + lineWidth * 2;
      const pos = planck.Vec2(-radius - lineWidth * 2, -radius - lineWidth * 2);

      const size2 = {
        height: diameter,
        width: diameter,
      };

      if (!body.render.custom(ctx, pos, size2)) {
        return;
      }
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    if (!this.options.wireframe) ctx.fill();
    else ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.restore();
  }

  drawEdge(_body: planck.Body, shape: planck.Edge) {
    const ctx = this.ctx;

    const v1 = planck.Vec2(shape.m_vertex1);
    const v2 = planck.Vec2(shape.m_vertex2);
    v1.add(this.offset);
    v2.add(this.offset);

    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.lineCap = "round";
    if (!this.options.wireframe) ctx.fill();
    ctx.stroke();
  }

  drawPolygon(body: planck.Body, shape: planck.Polygon | planck.Chain) {
    const ctx = this.ctx;
    const lineWidth = this.options.lineWidth;

    const vertices = shape.m_vertices;
    if (!vertices.length) {
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const v of vertices) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const pos = planck.Vec2(body.getPosition()).add(this.offset);
    const angle = body.getAngle();

    ctx.translate(pos.x + lineWidth * 2, pos.y + lineWidth * 2);
    ctx.rotate(angle);

    if (body.render?.custom) {
      const size = {
        height: height + lineWidth * 2,
        width: width + lineWidth * 2,
      };
      const pos = planck.Vec2(minX - lineWidth, minY - lineWidth);

      if (!body.render.custom(ctx, pos, size)) {
        return;
      }
    }

    ctx.beginPath();
    for (let i = 0; i < vertices.length; ++i) {
      const v = vertices[i];
      const x = v.x - lineWidth;
      const y = v.y - lineWidth;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    if (vertices.length > 2) {
      ctx.closePath();
    }

    if (!this.options.wireframe && !(shape instanceof planck.Chain)) ctx.fill();
    ctx.stroke();
  }

  drawUI(body: planck.Body, shape: UIShape) {
    shape.render(this);
  }

  drawJoint(joint: planck.Joint) {
    const ctx = this.ctx;

    const a = joint.getAnchorA();
    const b = joint.getAnchorB();

    ctx.beginPath();
    ctx.moveTo(a.x + this.offset.x, a.y + this.offset.y);
    ctx.lineTo(b.x + this.offset.x, b.y + this.offset.y);

    if (!this.options.wireframe) ctx.fill();
    ctx.stroke();
  }

  drawText(pos: planck.Vec2, text: string) {
    const ctx = this.ctx;

    if (this.options.wireframe) {
      ctx.strokeText(text, pos.x, pos.y);
    } else {
      ctx.fillText(text, pos.x, pos.y);
    }
  }
}
