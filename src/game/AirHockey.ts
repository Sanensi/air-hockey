import { Circle, InteractionEvent, Rectangle, Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";
import { Vec2 } from "../libraries/Vec2";

import background_image from "./assets/background.png";
import handle_image from "./assets/handle.png";
import { circleToBoundsCollisionTest, circleToCircleCollisionTest } from "./Collision";
import { fullyElasticCollision, IMMOVABLE_MASS } from "./Reaction";

type Buffer<T, Size extends number, Acc extends T[] = []> = Acc["length"] extends Size ? Acc : Buffer<T, Size, [...Acc, T]>

const OUTER_SIZE = new Vec2(1012, 1594);

const INNER_SIZE = new Vec2(930, 1521);
const INNER_TOP_LEFT = new Vec2(42, 37).substract(OUTER_SIZE.divide(2));
const INNER_BOTTOM_RIGHT = INNER_TOP_LEFT.add(INNER_SIZE);
const INNER_BOUNDS = new Rectangle(INNER_TOP_LEFT.x, INNER_TOP_LEFT.y, INNER_SIZE.x, INNER_SIZE.y);

const HANDLE_RADIUS = 185 / 2;
const MIN_HANDLE_POSITION = INNER_TOP_LEFT.add(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));
const MAX_HANDLE_POSITION = INNER_BOTTOM_RIGHT.substract(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));

const ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER = 7;

class Handle extends Sprite {
  public pointerId: number | null = null;
  public velocity = new Vec2();
  public positionMeasurments: Buffer<Vec2, 2> = [Vec2.ZERO, Vec2.ZERO];
  public get held() { return this.pointerId !== null; }
  public get mass() { return this.held ? IMMOVABLE_MASS : 1; }
}

export class AirHockey extends PixiApplicationBase {
  private background = new Sprite();
  private friction = 0.01;

  private handle1 = new Handle();
  private handle2 = new Handle();

  public onUpdate = () => { /** noop */ }

  public get loading() { return this.app.loader.loading; }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { antialias: true, backgroundColor: 0xffffff });
    this.app.loader.add([background_image, handle_image]);
    this.app.loader.load((_, resources) => {
      this.onUpdate();
      this.background = new Sprite(resources[background_image].texture);
      this.handle1 = new Handle(resources[handle_image].texture);
      this.handle2 = new Handle(resources[handle_image].texture);
      this.init();
    });
  }

  protected start(): void {
    // Initialize game objects
    this.background.anchor.set(0.5);
    this.initializeHandle(this.handle1, new Vec2(0, 185 * 2));
    this.initializeHandle(this.handle2, new Vec2(0, -185 * 2));

    this.app.stage.addChild(this.background);
    this.background.addChild(this.handle1);
    this.background.addChild(this.handle2);
    this.resize();
  }

  protected update(): void {
    this.updateHandle(this.handle1, this.handle2);
    this.updateHandle(this.handle2, this.handle1);
  }

  protected resize(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const proportion = this.background.texture.width / this.background.texture.height;
    const fillWidth = w / h < proportion;

    const width = fillWidth ? w : h * proportion;
    const height = !fillWidth ? h : w / proportion;

    this.background.position.set(w / 2, h / 2);
    this.background.height = height;
    this.background.width = width;
  }

  private initializeHandle(handle: Handle, startingPosition: Vec2) {
    handle.anchor.set(0.5);
    handle.position.set(startingPosition.x, startingPosition.y);

    handle.interactive = true;
    handle.addListener("pointerdown", (e: InteractionEvent) => { handle.pointerId = e.data.pointerId; });
    handle.addListener("pointerup", () => { handle.pointerId = null; });
    handle.addListener("pointermove", (e: InteractionEvent) => {
      if (e.data.pointerId === handle.pointerId) {
        const position = new Vec2(e.data.getLocalPosition(this.background));
        const clampedPosition = position.rectangleClamp(MIN_HANDLE_POSITION, MAX_HANDLE_POSITION);
        handle.position.copyFrom(clampedPosition);
      }
    });
  }

  private updateHandle(handle: Handle, oppositeHandle: Handle) {
    if (handle.held) {
      this.measureHandleInstantVelocity(handle);
    }
    else {
      const previousPosition = new Vec2(handle.position);
      const nextPosition = previousPosition.add(handle.velocity.scale(this.app.ticker.deltaMS));
      const handleCollider = new Circle(nextPosition.x, nextPosition.y, handle.texture.width / 2);

      switch (circleToBoundsCollisionTest(handleCollider, INNER_BOUNDS)) {
        case "no-collision":
          handle.position.copyFrom(nextPosition);
          break;
        case "left":
        case "right": {
          handle.velocity = new Vec2(-handle.velocity.x, handle.velocity.y);
          const nextPosition = previousPosition.add(handle.velocity.scale(this.app.ticker.deltaMS));
          handle.position.copyFrom(nextPosition);
          break;
        }
        case "top":
        case "bottom": {
          handle.velocity = new Vec2(handle.velocity.x, -handle.velocity.y);
          const nextPosition = previousPosition.add(handle.velocity.scale(this.app.ticker.deltaMS));
          handle.position.copyFrom(nextPosition);
          break;
        }
      }

      const oppositePreviousPosition = new Vec2(oppositeHandle.position);
      const oppositeHandleCollider = new Circle(oppositeHandle.x, oppositeHandle.y, oppositeHandle.width / 2);
      if (circleToCircleCollisionTest(handleCollider, oppositeHandleCollider) === "collision") {
        const p1 = new Vec2(handle);
        const p2 = new Vec2(oppositeHandle);
        const v1_prime = fullyElasticCollision(handle.mass, oppositeHandle.mass, handle.velocity, oppositeHandle.velocity, p1, p2);
        const v2_prime = fullyElasticCollision(oppositeHandle.mass, handle.mass, oppositeHandle.velocity, handle.velocity, p2, p1);
        handle.velocity = v1_prime;
        oppositeHandle.velocity = v2_prime;

        const nextPosition = previousPosition.add(handle.velocity.scale(this.app.ticker.deltaMS));
        const oppositeNextPosition = oppositePreviousPosition.add(oppositeHandle.velocity.scale(this.app.ticker.deltaMS));
        handle.position.copyFrom(nextPosition);
        oppositeHandle.position.copyFrom(oppositeNextPosition);
      }

      this.applyFriction(handle, this.friction);
    }
  }

  private measureHandleInstantVelocity(handle: Handle) {
    const [_, p1] = handle.positionMeasurments;
    const p2 = new Vec2(handle.position);
    handle.velocity = p2.substract(p1).divide(this.app.ticker.deltaMS * ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER);
    handle.positionMeasurments = [p1, p2];
  }

  private applyFriction(handle: Handle, friction: number) {
    handle.velocity = (handle.velocity.length() > 0.001) ? handle.velocity.scale(1 - friction) : Vec2.ZERO;
  }
}
