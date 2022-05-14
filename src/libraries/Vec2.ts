interface Point {
  x: number;
  y: number;
}

export class Vec2 {
  public static readonly ZERO = new Vec2();
  public static readonly ONE = new Vec2(1, 1);
  public static readonly UNIT_I = new Vec2(1, 0);
  public static readonly UNIT_J = new Vec2(0, 1);

  readonly x: number;
  readonly y: number;

  constructor(point: Point)
  constructor(x?: number, y?: number)
  constructor(pointOrX: Point | number = 0, y = 0) {
    if (typeof pointOrX === "number") {
      this.x = pointOrX;
      this.y = y;
    }
    else {
      this.x = pointOrX.x;
      this.y = pointOrX.y;
    }
  }

  public add(v: Vec2) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  public substract(v: Vec2) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  public scale(s: number | Vec2) {
    if (s instanceof Vec2) {
      return new Vec2(this.x * s.x, this.y * s.y);
    }
    else {
      return new Vec2(this.x * s, this.y * s);
    }
  }

  public divide(s: number | Vec2) {
    if (s instanceof Vec2) {
      return new Vec2(this.x / s.x, this.y / s.y);
    }
    else {
      return new Vec2(this.x / s, this.y / s);
    }
  }

  public dot(v: Vec2) {
    return this.x * v.x + this.y * v.y;
  }

  public map(f: (a: number) => number) {
    return new Vec2(f(this.x), f(this.y));
  }

  public equals(o: Vec2) {
    if (o === undefined) return false;

    return this.x === o.x && this.y === o.y;
  }

  public rotate(theta: number) {
    const cosTheta = Math.cos(degToRad(theta));
    const sinTheta = Math.sin(degToRad(theta));

    return new Vec2(
      this.x * cosTheta - this.y * sinTheta,
      this.x * sinTheta + this.y * cosTheta
    );
  }

  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize() {
    const length = this.length();
    return length <= 0.001 ? Vec2.ZERO : this.divide(length);
  }

  public rectangleClamp(min: number, max: number): Vec2
  public rectangleClamp(min: Vec2, max: Vec2): Vec2
  public rectangleClamp(min: number | Vec2, max: number | Vec2) {
    if (typeof min === "number" && typeof max === "number") {
      console.assert(!(max - min < 0), `Can't clamp when min > max: ${min} is greater than ${max}`);
      return new Vec2(Math.min(Math.max(this.x, min), max), Math.min(Math.max(this.y, min), max));
    }
    else if (min instanceof Vec2 && max instanceof Vec2) {
      const difference = max.substract(min);
      console.assert(!(difference.x < 0 || difference.y < 0), "Can't clamp when min > max", min, max, difference);
      return new Vec2(Math.min(Math.max(this.x, min.x), max.x), Math.min(Math.max(this.y, min.y), max.y));
    }
  }

  public static angleBetween(a: Vec2, b: Vec2) {
    const sin = a.x * b.y - b.x * a.y;
    const cos = a.x * b.x + a.y * b.y;

    return radToDeg(Math.atan2(sin, cos));
  }

  public neighbors() {
    return UNIT_VECTORS.map((v) => this.add(v));
  }
}

function radToDeg(theta: number) {
  return theta * 180 / Math.PI;
}

function degToRad(theta: number) {
  return theta * Math.PI / 180;
}

const UNIT_VECTORS = [
  new Vec2(1, 0),
  new Vec2(1, 1),
  new Vec2(0, 1),
  new Vec2(-1, 1),
  new Vec2(-1, 0),
  new Vec2(-1, -1),
  new Vec2(0, -1),
  new Vec2(1, -1)
];
