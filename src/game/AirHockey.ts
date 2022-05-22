import { Circle, InteractionEvent, Rectangle, Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";
import { Vec2 } from "../libraries/Vec2";

import background_image from "./assets/background.png";
import handle_image from "./assets/handle.png";
import { circleToBoundsCollisionTest, circleToCircleCollisionTest } from "./Collision";
import { fullyElasticCollision } from "./Reaction";

type Buffer<T, Size extends number, Acc extends T[] = []> = Acc["length"] extends Size ? Acc : Buffer<T, Size, [...Acc, T]>

const OUTER_SIZE = new Vec2(1012, 1594);

const INNER_SIZE = new Vec2(930, 1521);
const INNER_TOP_LEFT = new Vec2(42, 37);
const INNER_BOTTOM_RIGHT = INNER_TOP_LEFT.add(INNER_SIZE);

const HANDLE_RADIUS = 185 / 2;
const MIN_HANDLE_POSITION = INNER_TOP_LEFT.add(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS)).substract(OUTER_SIZE.divide(2));
const MAX_HANDLE_POSITION = INNER_BOTTOM_RIGHT.substract(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS)).substract(OUTER_SIZE.divide(2));

const ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER = 7;

class Handle extends Sprite {
  public pointerId: number | null = null;
  public velocity = new Vec2();
  public positionMeasurments: Buffer<Vec2, 2> = [Vec2.ZERO, Vec2.ZERO];
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
    // Calculate handle1 instant velocity when it is held
    if (this.handle1.pointerId !== null) {
      this.measureHandleInstantVelocity(this.handle1);
    }
    // Calculate handle1 position and velocity when it is not held
    else {
      const previous = new Vec2(this.handle1.position);
      const previous2 = new Vec2(this.handle2.position);
      const next = previous.add(this.handle1.velocity.scale(this.app.ticker.deltaMS));

      const handle1 = new Circle(next.x, next.y, this.handle1.texture.width / 2);
      const topLeft = INNER_TOP_LEFT.substract(OUTER_SIZE.divide(2));
      const bounds = new Rectangle(topLeft.x, topLeft.y, INNER_SIZE.x, INNER_SIZE.y);

      switch (circleToBoundsCollisionTest(handle1, bounds)) {
        case "no-collision":
          this.handle1.position.copyFrom(next);
          break;
        case "left":
        case "right": {
          this.handle1.velocity = new Vec2(-this.handle1.velocity.x, this.handle1.velocity.y);
          const next = previous.add(this.handle1.velocity.scale(this.app.ticker.deltaMS));
          this.handle1.position.copyFrom(next);
          break;
        }
        case "top":
        case "bottom": {
          this.handle1.velocity = new Vec2(this.handle1.velocity.x, -this.handle1.velocity.y);
          const next = previous.add(this.handle1.velocity.scale(this.app.ticker.deltaMS));
          this.handle1.position.copyFrom(next);
          break;
        }
      }

      const handle2 = new Circle(this.handle2.x, this.handle2.y, this.handle2.width / 2);
      if (circleToCircleCollisionTest(handle1, handle2) === "collision") {
        const p1 = new Vec2(this.handle1);
        const p2 = new Vec2(this.handle2);
        const v1_prime = fullyElasticCollision(1, 1, this.handle1.velocity, this.handle2.velocity, p1, p2);
        const v2_prime = fullyElasticCollision(1, 1, this.handle2.velocity, this.handle1.velocity, p2, p1);
        this.handle1.velocity = v1_prime;
        this.handle2.velocity = v2_prime;

        const next1 = previous.add(this.handle1.velocity.scale(this.app.ticker.deltaMS));
        const next2 = previous2.add(this.handle2.velocity.scale(this.app.ticker.deltaMS));
        this.handle1.position.copyFrom(next1);
        this.handle2.position.copyFrom(next2);
      }

      // Apply friction
      this.handle1.velocity = (this.handle1.velocity.length() > 0.001) ? this.handle1.velocity.scale(1 - this.friction) : Vec2.ZERO;
    }

    // Calculate handle2 instant velocity when it is held
    if (this.handle2.pointerId !== null) {
      this.measureHandleInstantVelocity(this.handle2);
    }
    // Calculate handle2 position and velocity when it is not held
    else {
      const previous = new Vec2(this.handle2.position);
      const previous2 = new Vec2(this.handle1.position);
      const next = previous.add(this.handle2.velocity.scale(this.app.ticker.deltaMS));

      const handle2 = new Circle(next.x, next.y, this.handle2.texture.width / 2);
      const topLeft = INNER_TOP_LEFT.substract(OUTER_SIZE.divide(2));
      const bounds = new Rectangle(topLeft.x, topLeft.y, INNER_SIZE.x, INNER_SIZE.y);

      switch (circleToBoundsCollisionTest(handle2, bounds)) {
        case "no-collision":
          this.handle2.position.copyFrom(next);
          break;
        case "left":
        case "right": {
          this.handle2.velocity = new Vec2(-this.handle2.velocity.x, this.handle2.velocity.y);
          const next = previous.add(this.handle2.velocity.scale(this.app.ticker.deltaMS));
          this.handle2.position.copyFrom(next);
          break;
        }
        case "top":
        case "bottom": {
          this.handle2.velocity = new Vec2(this.handle2.velocity.x, -this.handle2.velocity.y);
          const next = previous.add(this.handle2.velocity.scale(this.app.ticker.deltaMS));
          this.handle2.position.copyFrom(next);
          break;
        }
      }

      const handle1 = new Circle(this.handle1.x, this.handle1.y, this.handle1.width / 2);
      if (circleToCircleCollisionTest(handle2, handle1) === "collision") {
        const p1 = new Vec2(this.handle2);
        const p2 = new Vec2(this.handle1);
        const v1_prime = fullyElasticCollision(1, 1, this.handle2.velocity, this.handle1.velocity, p1, p2);
        const v2_prime = fullyElasticCollision(1, 1, this.handle1.velocity, this.handle2.velocity, p2, p1);
        this.handle2.velocity = v1_prime;
        this.handle1.velocity = v2_prime;

        const next1 = previous.add(this.handle2.velocity.scale(this.app.ticker.deltaMS));
        const next2 = previous2.add(this.handle1.velocity.scale(this.app.ticker.deltaMS));
        this.handle2.position.copyFrom(next1);
        this.handle1.position.copyFrom(next2);
      }

      // Apply friction
      this.handle2.velocity = (this.handle2.velocity.length() > 0.001) ? this.handle2.velocity.scale(1 - this.friction) : Vec2.ZERO;
    }
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

  private measureHandleInstantVelocity(handle: Handle) {
    const [_, p1] = handle.positionMeasurments;
    const p2 = new Vec2(handle.position);
    handle.velocity = p2.substract(p1).divide(this.app.ticker.deltaMS * ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER);
    handle.positionMeasurments = [p1, p2];
  }
}
