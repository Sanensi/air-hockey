import { Circle, Rectangle } from "pixi.js";
import { circleToBoundsCollisionTest } from "./Collision";

describe("circleToBoundsCollisionTest", () => {
  test('given a small circle inside a large boundary, when collisionTest, then return "no-collision"', () => {
    const smallCircle = new Circle(0, 0, 1);
    const largeBoundary = new Rectangle(-100, -100, 200, 200);

    const testResult = circleToBoundsCollisionTest(smallCircle, largeBoundary);

    expect(testResult).toEqual("no-collision");
  });

  test('given a circle barely touching the left bound, when collisionTest, then return "left"', () => {
    const circle = new Circle(0, 0, 1);
    const bounds = new Rectangle(-1, -100, 200, 200);

    const testResult = circleToBoundsCollisionTest(circle, bounds);

    expect(testResult).toEqual("left");
  });

  test('given a circle barely touching the top bound, when collisionTest, then return "top"', () => {
    const circle = new Circle(0, 0, 1);
    const bounds = new Rectangle(-100, -1, 200, 200);

    const testResult = circleToBoundsCollisionTest(circle, bounds);

    expect(testResult).toEqual("top");
  });

  test('given a circle barely touching the right bound, when collisionTest, then return "right"', () => {
    const circle = new Circle(0, 0, 1);
    const bounds = new Rectangle(-199, -100, 200, 200);

    const testResult = circleToBoundsCollisionTest(circle, bounds);

    expect(testResult).toEqual("right");
  });

  test('given a circle barely touching the bottom bound, when collisionTest, then return "bottom"', () => {
    const circle = new Circle(0, 0, 1);
    const bounds = new Rectangle(-100, -199, 200, 200);

    const testResult = circleToBoundsCollisionTest(circle, bounds);

    expect(testResult).toEqual("bottom");
  });

  test('given a circle barely touching bounds on all sides, when collisionTest, then the result is an undetermined side', () => {
    const circle = new Circle(0, 0, 1);
    const bounds = new Rectangle(-1, -1, 2, 2);

    const testResult = circleToBoundsCollisionTest(circle, bounds);

    expect(["left", "right", "top", "bottom"]).toContain(testResult);
  });
});