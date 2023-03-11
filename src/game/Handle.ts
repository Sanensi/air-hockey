import { Bodies, Body } from "matter-js";
import { DisplayObject, InteractionEvent, Sprite } from "pixi.js";
import { Vec2 } from "../libraries/Vec2";

type Buffer<T, Size extends number, Acc extends T[] = []> = Acc["length"] extends Size ? Acc : Buffer<T, Size, [...Acc, T]>
const makeBuffer = <T, Size extends number>(size: Size, defaultValue: T) => Array.from({ length: size }, () => defaultValue) as Buffer<T, Size>;

const FRICTION = 0.01;

type Props = {
  name: string;
  parent: DisplayObject;
  startingPosition: Vec2;
  radius: number;
  minHandlePosition: Vec2;
  maxHandlePosition: Vec2;
}

export class Handle extends Sprite {
  private readonly MIN_HANDLE_POSITION: Vec2;
  private readonly MAX_HANDLE_POSITION: Vec2;

  public readonly body: Body;

  private pointerId: number | null = null;
  private positionMeasurments = makeBuffer(2, Vec2.ZERO);
  
  private get held() { return this.pointerId !== null; }

  public constructor({ name, parent, startingPosition, radius, minHandlePosition, maxHandlePosition }: Props) {
    super();
    
    this.MIN_HANDLE_POSITION = minHandlePosition;
    this.MAX_HANDLE_POSITION = maxHandlePosition;

    this.body = Bodies.circle(
      startingPosition.x,
      startingPosition.y,
      radius,
      {
        friction: 0,
        frictionAir: FRICTION,
        restitution: 1
      }
    );

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
    Body.setVelocity(this.body, Vec2.ZERO);
    Body.setStatic(this.body, true);
  }

  private releasePointer = (e: InteractionEvent) => {
    if (this.pointerId === e.data.pointerId) {
      this.pointerId = null;
      Body.setStatic(this.body, false);
    }
  }

  private moveIfHeld = (e: InteractionEvent) => {
    if (e.data.pointerId === this.pointerId) {
      const position = new Vec2(e.data.getLocalPosition(this.parent));
      const clampedPosition = position.rectangleClamp(this.MIN_HANDLE_POSITION, this.MAX_HANDLE_POSITION);
      this.position.copyFrom(clampedPosition);
      Body.setPosition(this.body, clampedPosition);
    }
  }

  public update(deltaMS: number) {
    if (this.held) {
      this.updateInstantVelocity(deltaMS);
    }
    else {
      this.position.copyFrom(this.body.position);
    }
  }

  private updateInstantVelocity(deltaMS: number) {
    const [_, p1] = this.positionMeasurments;
    const p2 = new Vec2(this.position);
    this.positionMeasurments = [p1, p2];
    const velocity = p2.substract(p1).divide(deltaMS);
    Body.setVelocity(this.body, velocity);
  }
}