import { Graphics } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";


export class AirHockey extends PixiApplicationBase {
  private triangle = new Graphics();

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { antialias: true, backgroundColor: 0xffffff });
  }

  protected start() {
    const sqrt_3 = Math.sqrt(3);
    this.triangle
      .beginFill(0x0)
      .moveTo(0, 1)
      .lineTo(sqrt_3 / 2, -1 / 2)
      .lineTo(-sqrt_3 / 2, -1 / 2)
      .closePath()
      .endFill();
    
    this.triangle.position.set(this.canvas.width / 2, this.canvas.height / 2);
    this.triangle.scale.set(100);

    this.app.stage.addChild(this.triangle);
  }

  protected update() {
    this.triangle.angle = this.triangle.angle + 120 * this.app.ticker.deltaMS / 1000;
  }

  protected resize() {
    this.triangle.position.set(this.canvas.width / 2, this.canvas.height / 2);
  }
}
