import { InteractionEvent, Sprite } from "pixi.js";
import { Vec2 } from "../libraries/Vec2";
import { IMMOVABLE_MASS } from "./Reaction";

type Buffer<T, Size extends number, Acc extends T[] = []> = Acc["length"] extends Size ? Acc : Buffer<T, Size, [...Acc, T]>
const makeBuffer = <T, Size extends number>(size: Size, defaultValue: T) => Array.from({ length: size }, () => defaultValue) as Buffer<T, Size>;

const ROLLING_AVERAGE_WINDOW_LENGHT = 3;

type Props = {
  name: string;
  startingPosition: Vec2;
  minHandlePosition: Vec2;
  maxHandlePosition: Vec2;
}

export class Handle extends Sprite {
  private readonly MIN_HANDLE_POSITION: Vec2;
  private readonly MAX_HANDLE_POSITION: Vec2;

  public pointerId: number | null = null;
  public velocity = new Vec2();
  public positionMeasurments = makeBuffer(2, Vec2.ZERO);
  public velocityRollingWindow = makeBuffer(ROLLING_AVERAGE_WINDOW_LENGHT, Vec2.ZERO)
  
  public get held() { return this.pointerId !== null; }
  public get mass() { return this.held ? IMMOVABLE_MASS : 1; }

  public constructor({ name , startingPosition, minHandlePosition, maxHandlePosition }: Props) {
    super();

    this.MIN_HANDLE_POSITION = minHandlePosition;
    this.MAX_HANDLE_POSITION = maxHandlePosition;

    this.name = name;
    this.anchor.set(0.5);
    this.position.set(startingPosition.x, startingPosition.y);
    this.interactive = true;
    this.addListener("pointerdown", this.acquirePointer);
    this.addListener("pointermove", this.moveIfHeld);
  }

  private acquirePointer = (e: InteractionEvent) => {
    this.pointerId = e.data.pointerId;
    this.velocityRollingWindow = makeBuffer(ROLLING_AVERAGE_WINDOW_LENGHT, Vec2.ZERO);
    this.velocity = Vec2.ZERO;
  }

  private moveIfHeld = (e: InteractionEvent) => {
    if (e.data.pointerId === this.pointerId) {
      const position = new Vec2(e.data.getLocalPosition(this.parent));
      const clampedPosition = position.rectangleClamp(this.MIN_HANDLE_POSITION, this.MAX_HANDLE_POSITION);
      this.position.copyFrom(clampedPosition);
    }
  }
}
