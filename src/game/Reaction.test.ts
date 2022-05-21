import { Vec2 } from "../libraries/Vec2";
import { fullyElasticCollision, IMMOVABLE_MASS } from "./Reaction";
import { format } from "util";

type Particle = {
  m: number,
  v: Vec2,
  x: Vec2
}

type TestCase = {
  name: string,
  obj1: Particle,
  obj2: Particle,
  expected_v1_prime: Vec2
  expected_v2_prime?: Vec2
  precision?: number
}

const testCases: TestCase[] = [
  {
    name: "Given two object with no velocity",
    obj1: { m: 1, v: Vec2.ZERO, x: Vec2.ZERO },
    obj2: { m: 1, v: Vec2.ZERO, x: new Vec2(1, 0) },
    expected_v1_prime: Vec2.ZERO,
    expected_v2_prime: Vec2.ZERO
  },
  {
    name: "Given a moving object comming straight at an immovable object",
    obj1: { m: 1, v: new Vec2(1, 0), x: Vec2.ZERO },
    obj2: { m: IMMOVABLE_MASS, v: Vec2.ZERO, x: new Vec2(1, 0) },
    expected_v1_prime: new Vec2(-1, 0),
    expected_v2_prime: Vec2.ZERO
  },
  {
    name: "Given an object comming in on an immovable object at an angle",
    obj1: { m: 1, v: new Vec2(1, 1), x: Vec2.ZERO },
    obj2: { m: IMMOVABLE_MASS, v: Vec2.ZERO, x: new Vec2(1, 0) },
    expected_v1_prime: new Vec2(-1, 1),
    expected_v2_prime: Vec2.ZERO
  },
  {
    name: "Given two object moving on a straight collision course",
    obj1: { m: 1, v: new Vec2(1, 0), x: new Vec2(-1, 0) },
    obj2: { m: 1, v: new Vec2(-1, 0), x: new Vec2(1, 0) },
    expected_v1_prime: new Vec2(-1, 0),
    expected_v2_prime: new Vec2(1, 0)
  },
  {
    name: "Given two object comming in at an angle",
    obj1: { m: 1, v: new Vec2(1, 1), x: new Vec2(-1, 0) },
    obj2: { m: 1, v: new Vec2(-1, 1), x: new Vec2(1, 0) },
    expected_v1_prime: new Vec2(-1, 1),
    expected_v2_prime: new Vec2(1, 1)
  },
  {
    name: "Given two object of different mass comming in at a complex angle",
    obj1: { m: 0.42, v: new Vec2(30, 10), x: new Vec2(-3, -1) },
    obj2: { m: 7, v: new Vec2(-20, -30), x: new Vec2(2, 3) },
    expected_v1_prime: new Vec2(-64.34, -65.47),
    expected_v2_prime: new Vec2(-14.34, -25.47),
    precision: 2
  },
];

describe("Fully elastic collision", () => {
  describe.each(testCases)("$name", ({ expected_v1_prime, expected_v2_prime, obj1, obj2, precision }) => {
    test(format("then the resulting velocity of object 1 is %o", expected_v1_prime), () => {
      const v1_prime = fullyElasticCollision(obj1.m, obj2.m, obj1.v, obj2.v, obj1.x, obj2.x);

      assertVectorEqual(expected_v1_prime, v1_prime, precision);
    });

    if (expected_v2_prime) {
      test(format("then the resulting velocity of object 2 is %o", expected_v2_prime), () => {
        const v2_prime = fullyElasticCollision(obj2.m, obj1.m, obj2.v, obj1.v, obj2.x, obj1.x);

        assertVectorEqual(expected_v2_prime, v2_prime, precision);
      });
    }
  });
});

const assertVectorEqual = (expected: Vec2, actual: Vec2, precision = 16) => {
  try {
    expect(actual).toEqual(expected);
  }
  catch {
    expect(actual.x).toBeCloseTo(expected.x, precision);
    expect(actual.y).toBeCloseTo(expected.y, precision);
  }
};