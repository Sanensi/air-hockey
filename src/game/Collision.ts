import { Circle, Rectangle } from "pixi.js";
import { Vec2 } from "../libraries/Vec2";

export function circleToBoundsCollisionTest(circle: Circle, bounds: Rectangle) {
  const topLeft = new Vec2(bounds.left, bounds.top);
  const bottomRight = new Vec2(bounds.right, bounds.bottom);
  const min = topLeft.add(new Vec2(circle.radius, circle.radius));
  const max = bottomRight.substract(new Vec2(circle.radius, circle.radius));

  if (min.x >= circle.x) {
    return "left";
  }
  else if (min.y >= circle.y) {
    return "top";
  }
  else if (circle.x >= max.x) {
    return "right";
  }
  else if (circle.y >= max.y) {
    return "bottom";
  }
  else {
    return "no-collision";
  }
}

export function circleToCircleCollisionTest(circle1: Circle, circle2: Circle) {
  const p1 = new Vec2(circle1);
  const p2 = new Vec2(circle2);
  const difference = p2.substract(p1);
  const distance = difference.length();
  if (distance <= circle1.radius + circle2.radius) {
    return "collision";
  }
  else {
    return "no-collision";
  }
}