import { Rectangle, Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";
import { Vec2 } from "../libraries/Vec2";
import { assert } from "./Assertion";

import background_image from "./assets/background.png";
import handle_image from "./assets/handle.png";

const OUTER_SIZE = new Vec2(1012, 1594);

const INNER_SIZE = new Vec2(930, 1521);
const INNER_TOP_LEFT = new Vec2(42, 37).substract(OUTER_SIZE.divide(2));
const INNER_BOTTOM_RIGHT = INNER_TOP_LEFT.add(INNER_SIZE);
const INNER_BOUNDS = new Rectangle(INNER_TOP_LEFT.x, INNER_TOP_LEFT.y, INNER_SIZE.x, INNER_SIZE.y);

const HANDLE_RADIUS = 185 / 2;
const MIN_HANDLE_POSITION = INNER_TOP_LEFT.add(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));
const MAX_HANDLE_POSITION = INNER_BOTTOM_RIGHT.substract(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));

export class AirHockey extends PixiApplicationBase {
  private background = new Sprite();
  private handle1 = new Sprite();
  private handle2 = new Sprite();

  public onUpdate = () => { /** noop */ }

  public get loading() { return this.app.loader.loading; }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas, { antialias: true, backgroundColor: 0xffffff });
    this.app.loader.add([background_image, handle_image]);
    this.app.loader.load((_, resources) => {
      this.onUpdate();
      const backgroundTexture = resources[background_image].texture;
      const handleTexture = resources[handle_image].texture;

      assert(backgroundTexture !== undefined);
      assert(handleTexture !== undefined);

      this.background.texture = backgroundTexture;
      this.handle1.texture = handleTexture;
      this.handle2.texture = handleTexture;
      this.init();
    });
  }

  protected start(): void {
    this.background.anchor.set(0.5);
    this.background.interactive = true;

    const startingPosition = new Vec2(0, 185 * 2);
    this.handle1.anchor.set(0.5);
    this.handle1.position.set(startingPosition.x, startingPosition.y);

    this.handle2.anchor.set(0.5);
    this.handle2.position.set(startingPosition.x, -startingPosition.y);

    this.app.stage.addChild(this.background);
    this.background.addChild(this.handle1);
    this.background.addChild(this.handle2);
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
