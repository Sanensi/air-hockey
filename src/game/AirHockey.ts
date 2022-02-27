import { Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";

import background_image from "./assets/background.png";

export class AirHockey extends PixiApplicationBase {
  private background = new Sprite();
  public onUpdate = () => { /** noop */ }

  public get loading() { return this.app.loader.loading; }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { antialias: true, backgroundColor: 0xffffff });
    this.app.loader.add(background_image);
    this.app.loader.load((_, resources) => {
      this.onUpdate();
      this.background = new Sprite(resources[background_image].texture);
      this.init();
    });
  }

  protected start(): void {
    this.background.anchor.set(0.5);
    this.app.stage.addChild(this.background);
    this.resize();
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
