type drawStyle = CanvasGradient | CanvasPattern | string;

interface RendererOptions {
  scale: number;
  lineWidth: number;
  wireframe: boolean;
  strokeStyle: {
    dynamic: drawStyle;
    static: drawStyle;
    kinematic: drawStyle;
  };
  fillStyle: {
    dynamic: drawStyle;
    static: drawStyle;
    kinematic: drawStyle;
  };
}

import planck from "planck-js";
declare module "planck-js" {
  export interface Body {
    render?: {
      stroke?: drawStyle;
      fill?: drawStyle;
      custom?: (
        ctx: CanvasRenderingContext2D,
        pos: planck.Vec2,
        size: {
          width: number;
          height: number;
        }
      ) => boolean | undefined;
      hidden?: boolean;
    };
  }
}

export class Renderer {
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
      scale: defaultScale,
      lineWidth: 1 / defaultScale,
      wireframe: true,
      strokeStyle: {
        dynamic: "black",
        static: "black",
        kinematic: "black",
      },
      fillStyle: {
        dynamic: "black",
        static: "black",
        kinematic: "black",
      },
    };

    this.options = Object.assign(defaultOptions, options);
    if (!options.lineWidth) {
      this.options.lineWidth = 1 / this.options.scale;
    }

    this.world = world;
    this.ctx = ctx;
    this.canvas = ctx.canvas;

    this.draw = undefined;
  }

  clear(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  renderWorld() {
    const { ctx, canvas, options } = this;
    this.clear(canvas, ctx);

    this.draw?.(ctx);

    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
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

        if (body.render?.stroke !== undefined) {
          ctx.strokeStyle = body.render.stroke;
        }
        if (body.render?.fill !== undefined) {
          ctx.fillStyle = body.render.fill;
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
        }

        ctx.restore();
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
        width: diameter,
        height: diameter,
      };

      if (!body.render.custom(ctx, pos, size2)) {
        return;
      }
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    if (!this.options.wireframe) ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawEdge(_body: planck.Body, shape: planck.Edge) {
    const ctx = this.ctx;

    const v1 = planck.Vec2(shape.m_vertex1);
    const v2 = planck.Vec2(shape.m_vertex2);
    v1.add(this.offset);
    v2.add(this.offset)

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

    const vertices = shape.m_vertices // .map(vx => planck.Vec2(vx).add(this.offset));
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
        width: width + lineWidth * 2,
        height: height + lineWidth * 2,
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

  drawJoint(joint: planck.Joint) {
    const ctx = this.ctx;

    const a = joint.getAnchorA();
    const b = joint.getAnchorB();

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    if (!this.options.wireframe) ctx.fill();
    ctx.stroke();
  }
}
