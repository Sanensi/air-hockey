import { Vec2 } from "../libraries/Vec2";

export const IMMOVABLE_MASS = 8 * Number.MAX_SAFE_INTEGER;

// https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
export const fullyElasticCollision = (m1: number, m2: number, v1: Vec2, v2: Vec2, x1: Vec2, x2: Vec2) => {
  const massCoefficient = 2 * m2 / (m1 + m2);
  const x1_minus_x2 = x1.substract(x2);
  const top = (v1.substract(v2)).dot(x1_minus_x2);
  const bot = (x1_minus_x2).lengthSquared();
  return v1.substract(x1_minus_x2.scale(massCoefficient * (top / bot)));
};