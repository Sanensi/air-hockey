import { Circle, DisplayObject, InteractionEvent, Rectangle, Sprite } from "pixi.js";
import { Vec2 } from "../libraries/Vec2";
import { assert } from "./Assertion";
import { circleToBoundsCollisionTest, circleToCircleCollisionTest } from "./Collision";
import { fullyElasticCollision, IMMOVABLE_MASS } from "./Reaction";

type Buffer<T, Size extends number, Acc extends T[] = []> = Acc["length"] extends Size ? Acc : Buffer<T, Size, [...Acc, T]>
const makeBuffer = <T, Size extends number>(size: Size, defaultValue: T) => Array.from({ length: size }, () => defaultValue) as Buffer<T, Size>;

const ROLLING_AVERAGE_WINDOW_LENGHT = 3;
const ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER = 2;
const MAX_HELD_VELOCITY_LENGTH = 1;
const MAX_VELOCITY_LENGHT = 10;
const FRICTION = 0.01;

type Props = {
  name: string;
  parent: DisplayObject;
  startingPosition: Vec2;
  minHandlePosition: Vec2;
  maxHandlePosition: Vec2;
  boundingRectangle: Rectangle;
}

export class Handle extends Sprite {
  private readonly MIN_HANDLE_POSITION: Vec2;
  private readonly MAX_HANDLE_POSITION: Vec2;
  private readonly BOUNDING_RECTANGLE: Rectangle;

  private pointerId: number | null = null;
  private _oppositeHandle: Handle | null = null;
  private velocity = new Vec2();
  private positionMeasurments = makeBuffer(2, Vec2.ZERO);
  private velocityRollingWindow = makeBuffer(ROLLING_AVERAGE_WINDOW_LENGHT, Vec2.ZERO)
  
  private get held() { return this.pointerId !== null; }
  private get mass() { return this.held ? IMMOVABLE_MASS : 1; }

  private get oppositeHandle() {
    assert(this._oppositeHandle !== null);
    return this._oppositeHandle;
  }

  public setOppositeHandle(handle: Handle | null) {
    this._oppositeHandle = handle;
  }

  public constructor({ name, parent, startingPosition, minHandlePosition, maxHandlePosition, boundingRectangle }: Props) {
    super();
    
    this.MIN_HANDLE_POSITION = minHandlePosition;
    this.MAX_HANDLE_POSITION = maxHandlePosition;
    this.BOUNDING_RECTANGLE = boundingRectangle;

    this.name = name;
    this.anchor.set(0.5);
    this.position.set(startingPosition.x, startingPosition.y);
    this.interactive = true;
    this.addListener("pointerdown", this.acquirePointer);
    this.addListener("pointermove", this.moveIfHeld);
    parent.addListener("pointerup", this.releasePointer);
  }

  private acquirePointer = (e: InteractionEvent) => {
    this.pointerId = e.data.pointerId;
    this.velocityRollingWindow = makeBuffer(ROLLING_AVERAGE_WINDOW_LENGHT, Vec2.ZERO);
    this.velocity = Vec2.ZERO;
  }

  private releasePointer = (e: InteractionEvent) => {
    if (this.pointerId === e.data.pointerId) this.pointerId = null;
  }

  private moveIfHeld = (e: InteractionEvent) => {
    if (e.data.pointerId === this.pointerId) {
      const position = new Vec2(e.data.getLocalPosition(this.parent));
      const clampedPosition = position.rectangleClamp(this.MIN_HANDLE_POSITION, this.MAX_HANDLE_POSITION);
      this.position.copyFrom(clampedPosition);
    }
  }

  public update(deltaMS: number) {
    if (this.held) {
      this.updateHandleInstantVelocity(deltaMS);
    }
    else {
      this.applyFreeBodyPhysics(deltaMS);
    }
  }

  private updateHandleInstantVelocity(deltaMS: number) {
    this.measureHandleInstantVelocity(deltaMS);
    this.applyRollingAverageToInstantVelocity();
    this.limitHandleVelocity(MAX_HELD_VELOCITY_LENGTH);
  }

  private measureHandleInstantVelocity(deltaMS: number) {
    const [_, p1] = this.positionMeasurments;
    const p2 = new Vec2(this.position);
    this.positionMeasurments = [p1, p2];
    this.velocity = p2.substract(p1).divide(deltaMS * ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER);
  }

  private applyRollingAverageToInstantVelocity() {
    const [_, ...rest] = this.velocityRollingWindow;
    this.velocityRollingWindow = [...rest, this.velocity];
    const sum = this.velocityRollingWindow.reduce((partialSum, v) => partialSum.add(v), Vec2.ZERO);
    this.velocity = sum.divide(this.velocityRollingWindow.length);
  }

  private limitHandleVelocity(velocityLimit: number) {
    this.velocity = this.velocity.circularClamp(velocityLimit);
  }

  private applyFreeBodyPhysics(deltaMS: number) {
    this.reactToBoundCollision(deltaMS);
    this.moveHandle(deltaMS);
    this.reactToOppositeHandleCollision(deltaMS);
    this.resolveOverlappingHandles();
    this.limitHandleVelocity(MAX_VELOCITY_LENGHT);
    this.applyFriction();
  }

  private reactToBoundCollision(deltaMS: number) {
    const previousPosition = new Vec2(this.position);
    const nextPosition = previousPosition.add(this.velocity.scale(deltaMS));
    const handleCollider = new Circle(nextPosition.x, nextPosition.y, this.texture.width / 2);

    switch (circleToBoundsCollisionTest(handleCollider, this.BOUNDING_RECTANGLE)) {
      case "left":
      case "right": {
        this.velocity = new Vec2(-this.velocity.x, this.velocity.y);
        break;
      }
      case "top":
      case "bottom": {
        this.velocity = new Vec2(this.velocity.x, -this.velocity.y);
        break;
      }
    }
  }

  private moveHandle(deltaMS: number) {
    const previousPosition = new Vec2(this.position);
    const nextPosition = previousPosition.add(this.velocity.scale(deltaMS));
    this.position.copyFrom(nextPosition);
  }

  private reactToOppositeHandleCollision(deltaMS: number) {
    const previousPosition = new Vec2(this.position);
    const nextPosition = previousPosition.add(this.velocity.scale(deltaMS));
    const handleCollider = new Circle(nextPosition.x, nextPosition.y, this.texture.width / 2);

    const oppositePreviousPosition = new Vec2(this.oppositeHandle.position);
    const oppositeHandleCollider = new Circle(this.oppositeHandle.x, this.oppositeHandle.y, this.oppositeHandle.texture.width / 2);
    if (circleToCircleCollisionTest(handleCollider, oppositeHandleCollider) === "collision") {
      const p1 = new Vec2(this);
      const p2 = new Vec2(this.oppositeHandle);
      const v1_prime = fullyElasticCollision(this.mass, this.oppositeHandle.mass, this.velocity, this.oppositeHandle.velocity, p1, p2);
      const v2_prime = fullyElasticCollision(this.oppositeHandle.mass, this.mass, this.oppositeHandle.velocity, this.velocity, p2, p1);
      this.velocity = v1_prime;
      this.oppositeHandle.velocity = v2_prime;

      const nextPosition = previousPosition.add(this.velocity.scale(deltaMS));
      const oppositeNextPosition = oppositePreviousPosition.add(this.oppositeHandle.velocity.scale(deltaMS));
      this.position.copyFrom(nextPosition);
      this.oppositeHandle.position.copyFrom(oppositeNextPosition);
    }
  }

  private resolveOverlappingHandles() {
    const handleCollider = new Circle(this.x, this.y, this.texture.width / 2);
    const oppositeHandleCollider = new Circle(this.oppositeHandle.x, this.oppositeHandle.y, this.oppositeHandle.texture.width / 2);
    if (circleToCircleCollisionTest(handleCollider, oppositeHandleCollider) === "collision") {
      const p1 = new Vec2(this);
      const p2 = new Vec2(this.oppositeHandle);
      const delta = p2.substract(p1);
      const depth = handleCollider.radius + oppositeHandleCollider.radius - delta.length();

      const nextPosition = p1.add(delta.normalize().scale(-1 * depth));
      this.position.copyFrom(nextPosition);
    }
  }

  private applyFriction() {
    this.velocity = (this.velocity.length() > 0.001) ? this.velocity.scale(1 - FRICTION) : Vec2.ZERO;
  }
}
