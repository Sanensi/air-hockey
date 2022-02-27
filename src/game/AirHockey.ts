import { Application, Graphics } from "pixi.js";


export class AirHockey {
  private readonly canvas: HTMLCanvasElement;
  private readonly app: Application;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.app = new Application({ view: canvas, backgroundColor: 0xffffff, antialias: true });
    this.app.resizeTo = this.canvas;
    window.addEventListener("resize", this.resize);
  }

  public start() {
    const sqrt_3 = Math.sqrt(3);
    const triangle = new Graphics();
    triangle
      .beginFill(0x0)
      .moveTo(0, 1)
      .lineTo(sqrt_3 / 2, -1 / 2)
      .lineTo(-sqrt_3 / 2, -1 / 2)
      .closePath()
      .endFill();
    
    triangle.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    triangle.scale.set(100);
    this.app.stage.addChild(triangle);
  }

  public destroy() {
    this.app.destroy(false, true);
    window.removeEventListener("resize", this.resize);
  }

  private resize = () => {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.app.renderer.resize(width, height);
    this.app.stage.getChildAt(0).position.set(width / 2, height / 2);
  }
}
