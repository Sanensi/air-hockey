import { InteractionEvent, Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";
import { Vec2 } from "../libraries/Vec2";

import background_image from "./assets/background.png";
import handle_image from "./assets/handle.png";

type Buffer<T, Size extends number, Acc extends T[] = []> = Acc["length"] extends Size ? Acc : Buffer<T, Size, [...Acc, T]>

const INNER_SIZE = new Vec2(930, 1521);
const INNER_TOP_LEFT = new Vec2(42, 37);
const INNER_BOTTOM_RIGHT = INNER_TOP_LEFT.add(INNER_SIZE);

const HANDLE_RADIUS = 185 / 2;
const MIN_HANDLE_POSITION = INNER_TOP_LEFT.add(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));
const MAX_HANDLE_POSITION = INNER_BOTTOM_RIGHT.substract(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));

const ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER = 7;

export class AirHockey extends PixiApplicationBase {
  private background = new Sprite();
  private get minHandlePosition() {
    const offset = new Vec2(this.background.texture.width / 2, this.background.texture.height / 2);
    return MIN_HANDLE_POSITION.substract(offset);
  }
  private get maxHandlePosition() {
    const offset = new Vec2(this.background.texture.width / 2, this.background.texture.height / 2);
    return MAX_HANDLE_POSITION.substract(offset);
  }
  private friction = 0.01;

  private handle1 = new Sprite();
  private handle1PointerId: number | null = null;
  private handle1Velocity = new Vec2();
  private handle1PositionMeasurments: Buffer<Vec2, 2> = [Vec2.ZERO, Vec2.ZERO];

  private handle2 = new Sprite();
  private handle2PointerId: number | null = null;
  private handle2Velocity = new Vec2();
  private handle2PositionMeasurments: Buffer<Vec2, 2> = [Vec2.ZERO, Vec2.ZERO];

  public onUpdate = () => { /** noop */ }

  public get loading() { return this.app.loader.loading; }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { antialias: true, backgroundColor: 0xffffff });
    this.app.loader.add([background_image, handle_image]);
    this.app.loader.load((_, resources) => {
      this.onUpdate();
      this.background = new Sprite(resources[background_image].texture);
      this.handle1 = new Sprite(resources[handle_image].texture);
      this.handle2 = new Sprite(resources[handle_image].texture);
      this.init();
    });
  }

  protected start(): void {
    // Initialize game objects
    this.background.anchor.set(0.5);
    this.handle1.anchor.set(0.5);
    this.handle1.position.set(0, 185 * 2);
    this.handle2.anchor.set(0.5);
    this.handle2.position.set(0, -185 * 2);

    this.app.stage.addChild(this.background);
    this.background.addChild(this.handle1);
    this.background.addChild(this.handle2);
    this.resize();

    // Initialize handle1 interactivity
    this.handle1.interactive = true;
    this.handle1.addListener("pointerdown", (e: InteractionEvent) => { this.handle1PointerId = e.data.pointerId; });
    this.handle1.addListener("pointerup", () => { this.handle1PointerId = null; });
    this.handle1.addListener("pointermove", (e: InteractionEvent) => {
      if (e.data.pointerId === this.handle1PointerId) {
        const position = new Vec2(e.data.getLocalPosition(this.background));
        const clampedPosition = position.rectangleClamp(this.minHandlePosition, this.maxHandlePosition);
        this.handle1.position.copyFrom(clampedPosition);
      }
    });

    // Initialize handle2 interactivity
    // this.handle2.interactive = true;
    // this.handle2.addListener("pointerdown", (e: InteractionEvent) => { this.handle2PointerId = e.data.pointerId; });
    // this.handle2.addListener("pointerup", () => { this.handle2PointerId = null; });
    // this.handle2.addListener("pointermove", (e: InteractionEvent) => {
    //   if (e.data.pointerId === this.handle2PointerId) {
    //     const position = e.data.getLocalPosition(this.background);
    //     this.handle2.position.copyFrom(position);
    //   }
    // });
  }

  protected update(): void {
    // Calculate handle1 instant velocity when it is held
    if (this.handle1PointerId !== null) {
      const [_, p1] = this.handle1PositionMeasurments;
      const p2 = new Vec2(this.handle1.position);
      this.handle1Velocity = p2.substract(p1).divide(this.app.ticker.deltaMS * ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER);
      this.handle1PositionMeasurments = [p1, p2];
    }
    // Calculate handle1 position and velocity when it is not held
    else {
      const previous = new Vec2(this.handle1.position);
      const next = previous.add(this.handle1Velocity.scale(this.app.ticker.deltaMS));

      // Detect collision with inner bounds and apply proper reaction
      if (
        this.minHandlePosition.x < next.x && next.x >= this.maxHandlePosition.x &&
        this.minHandlePosition.y < next.y && next.y < this.maxHandlePosition.y
      ) {
        this.handle1Velocity = new Vec2(-this.handle1Velocity.x, this.handle1Velocity.y);
        const next = previous.add(this.handle1Velocity.scale(this.app.ticker.deltaMS));
        this.handle1.position.copyFrom(next);
      }
      else if (
        this.minHandlePosition.x >= next.x && next.x < this.maxHandlePosition.x &&
        this.minHandlePosition.y < next.y && next.y < this.maxHandlePosition.y
      ) {
        this.handle1Velocity = new Vec2(-this.handle1Velocity.x, this.handle1Velocity.y);
        const next = previous.add(this.handle1Velocity.scale(this.app.ticker.deltaMS));
        this.handle1.position.copyFrom(next);
      }
      else if (
        this.minHandlePosition.x < next.x && next.x < this.maxHandlePosition.x &&
        this.minHandlePosition.y < next.y && next.y >= this.maxHandlePosition.y
      ) {
        this.handle1Velocity = new Vec2(this.handle1Velocity.x, -this.handle1Velocity.y);
        const next = previous.add(this.handle1Velocity.scale(this.app.ticker.deltaMS));
        this.handle1.position.copyFrom(next);
      }
      else if (
        this.minHandlePosition.x < next.x && next.x < this.maxHandlePosition.x &&
        this.minHandlePosition.y >= next.y && next.y < this.maxHandlePosition.y
      ) {
        this.handle1Velocity = new Vec2(this.handle1Velocity.x, -this.handle1Velocity.y);
        const next = previous.add(this.handle1Velocity.scale(this.app.ticker.deltaMS));
        this.handle1.position.copyFrom(next);
      }
      // Apply basic movement if no collision
      else if (
        this.minHandlePosition.x < next.x && next.x < this.maxHandlePosition.x &&
        this.minHandlePosition.y < next.y && next.y < this.maxHandlePosition.y
      ) {
        this.handle1.position.copyFrom(next);
      }

      // Apply friction
      this.handle1Velocity = (this.handle1Velocity.length() > 0.001) ? this.handle1Velocity.scale(1 - this.friction) : Vec2.ZERO;
    }

    // if (this.handle2PointerId === null) {
    //   const previous = new Vec2(this.handle2.position);
    //   const next = previous.add(this.handle2Velocity.scale(this.app.ticker.deltaMS));
    //   this.handle2.position.copyFrom(next);
    //   this.handle2Velocity = (this.handle2Velocity.length() > 0.001) ? this.handle2Velocity.scale(1 - this.friction) : Vec2.ZERO;
    // }
    // else {
    //   const [_, p1] = this.handle2PositionMeasurments;
    //   const p2 = new Vec2(this.handle2.position);
    //   this.handle2Velocity = p2.substract(p1).divide(this.app.ticker.deltaMS * ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER);
    //   this.handle2PositionMeasurments = [p1, p2];
    // }
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
}
