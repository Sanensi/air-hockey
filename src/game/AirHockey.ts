import { InteractionEvent, Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";
import { Vec2 } from "../libraries/Vec2";

import background_image from "./assets/background.png";
import handle_image from "./assets/handle.png";

type Buffer<T, Size extends number, Acc extends T[] = []> = Acc["length"] extends Size ? Acc : Buffer<T, Size, [...Acc, T]>

const ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER = 7;

export class AirHockey extends PixiApplicationBase {
  private background = new Sprite();
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
    this.background.anchor.set(0.5);
    this.handle1.anchor.set(0.5);
    this.handle1.position.set(0, 185 * 2);
    this.handle2.anchor.set(0.5);
    this.handle2.position.set(0, -185 * 2);

    this.app.stage.addChild(this.background);
    this.background.addChild(this.handle1);
    this.background.addChild(this.handle2);
    this.resize();

    this.handle1.interactive = true;
    this.handle1.addListener("pointerdown", (e: InteractionEvent) => { this.handle1PointerId = e.data.pointerId; });
    this.handle1.addListener("pointerup", () => { this.handle1PointerId = null; });
    this.handle1.addListener("pointermove", (e: InteractionEvent) => {
      if (e.data.pointerId === this.handle1PointerId) {
        const position = e.data.getLocalPosition(this.background);
        this.handle1.position.copyFrom(position);
      }
    });

    this.handle2.interactive = true;
    this.handle2.addListener("pointerdown", (e: InteractionEvent) => { this.handle2PointerId = e.data.pointerId; });
    this.handle2.addListener("pointerup", () => { this.handle2PointerId = null; });
    this.handle2.addListener("pointermove", (e: InteractionEvent) => {
      if (e.data.pointerId === this.handle2PointerId) {
        const position = e.data.getLocalPosition(this.background);
        this.handle2.position.copyFrom(position);
      }
    });
  }

  protected update(): void {
    if (this.handle1PointerId === null) {
      const previous = new Vec2(this.handle1.position);
      const next = previous.add(this.handle1Velocity.scale(this.app.ticker.deltaMS));
      this.handle1.position.copyFrom(next);
      this.handle1Velocity = (this.handle1Velocity.length() > 0.001) ? this.handle1Velocity.scale(1 - this.friction) : Vec2.ZERO;
    }
    else {
      const [_, p1] = this.handle1PositionMeasurments;
      const p2 = new Vec2(this.handle1.position);
      this.handle1Velocity = p2.substract(p1).divide(this.app.ticker.deltaMS * ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER);
      this.handle1PositionMeasurments = [p1, p2];
    }

    if (this.handle2PointerId === null) {
      const previous = new Vec2(this.handle2.position);
      const next = previous.add(this.handle2Velocity.scale(this.app.ticker.deltaMS));
      this.handle2.position.copyFrom(next);
      this.handle2Velocity = (this.handle2Velocity.length() > 0.001) ? this.handle2Velocity.scale(1 - this.friction) : Vec2.ZERO;
    }
    else {
      const [_, p1] = this.handle2PositionMeasurments;
      const p2 = new Vec2(this.handle2.position);
      this.handle2Velocity = p2.substract(p1).divide(this.app.ticker.deltaMS * ESCAPE_VELOCITY_REDUCER_MAGIC_NUMBER);
      this.handle2PositionMeasurments = [p1, p2];
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
}
