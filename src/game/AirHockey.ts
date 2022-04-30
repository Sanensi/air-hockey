import { InteractionEvent, Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";

import background_image from "./assets/background.png";
import handle_image from "./assets/handle.png";

export class AirHockey extends PixiApplicationBase {
  private background = new Sprite();

  private handle1 = new Sprite();
  private handle1PointerId: number | null = null;

  private handle2 = new Sprite();
  private handle2PointerId: number | null = null;

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
