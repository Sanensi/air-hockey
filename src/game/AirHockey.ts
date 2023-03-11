import { Graphics, Sprite } from "pixi.js";
import { PixiApplicationBase } from "../libraries/PixiApplicationBase";
import { Vec2 } from "../libraries/Vec2";
import { assert } from "./Assertion";

import background_image from "./assets/background.png";
import handle_image from "./assets/handle.png";
import { Bodies, Composite, Engine } from "matter-js";
import { Handle } from "./Handle";

const OUTER_SIZE = new Vec2(1012, 1594);

const INNER_SIZE = new Vec2(930, 1521);
const INNER_TOP_LEFT = new Vec2(42, 37).substract(OUTER_SIZE.divide(2));
const INNER_BOTTOM_RIGHT = INNER_TOP_LEFT.add(INNER_SIZE);

const LEFT_BOUNDS = Bodies.rectangle(
  -INNER_SIZE.x,
  0,
  INNER_SIZE.x,
  INNER_SIZE.y,
  { isStatic: true,  }
);

const RIGHT_BOUNDS = Bodies.rectangle(
  INNER_SIZE.x,
  0,
  INNER_SIZE.x,
  INNER_SIZE.y,
  { isStatic: true,  }
);

const UPPER_BOUNDS = Bodies.rectangle(
  0,
  -INNER_SIZE.y,
  INNER_SIZE.x,
  INNER_SIZE.y,
  { isStatic: true,  }
);

const LOWER_BOUNDS = Bodies.rectangle(
  0,
  INNER_SIZE.y,
  INNER_SIZE.x,
  INNER_SIZE.y,
  { isStatic: true,  }
);

const HANDLE_POSITION = new Vec2(0, 185 * 2);
const HANDLE_RADIUS = 185 / 2;
const MIN_HANDLE_POSITION = INNER_TOP_LEFT.add(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));
const MAX_HANDLE_POSITION = INNER_BOTTOM_RIGHT.substract(new Vec2(HANDLE_RADIUS, HANDLE_RADIUS));

const DEBUG_GRAPHICS = new Graphics();

export class AirHockey extends PixiApplicationBase {
  private engine = Engine.create({ gravity: { scale: 0 } })
  private background = new Sprite();

  private handle1 = new Handle({ 
    name: "handle-1",
    parent: this.background,
    startingPosition: HANDLE_POSITION,
    radius: HANDLE_RADIUS,
    minHandlePosition: MIN_HANDLE_POSITION,
    maxHandlePosition: MAX_HANDLE_POSITION,
  });

  private handle2 = new Handle({ 
    name: "handle-2",
    parent: this.background,
    startingPosition: HANDLE_POSITION.scale(-1),
    radius: HANDLE_RADIUS,
    minHandlePosition: MIN_HANDLE_POSITION,
    maxHandlePosition: MAX_HANDLE_POSITION,
  });

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

    this.app.stage.addChild(this.background);
    this.background.addChild(this.handle1);
    this.background.addChild(this.handle2);
    // this.background.addChild(DEBUG_GRAPHICS);

    Composite.add(
      this.engine.world,
      [
        this.handle1.body,
        this.handle2.body,
        LEFT_BOUNDS,
        RIGHT_BOUNDS,
        UPPER_BOUNDS,
        LOWER_BOUNDS
      ]
    );

    this.resize();
  }

  protected update(): void {
    const deltaMs = this.app.ticker.deltaMS;
    Engine.update(this.engine, deltaMs);
    this.handle1.update(deltaMs);
    this.handle2.update(deltaMs);
    // this.updateDebug();
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

  private updateDebug() {
    DEBUG_GRAPHICS.clear();
    DEBUG_GRAPHICS.lineStyle(1, 0xff0000);
    
    const bodies = Composite.allBodies(this.engine.world);
    for (const { vertices } of bodies) {
      DEBUG_GRAPHICS.beginFill(0xffffff, 0);
      DEBUG_GRAPHICS.moveTo(vertices[0].x, vertices[0].y);

      for (const vertice of vertices) {
        DEBUG_GRAPHICS.lineTo(vertice.x, vertice.y);
      }

      DEBUG_GRAPHICS.lineTo(vertices[0].x, vertices[0].y);
      DEBUG_GRAPHICS.endFill();
    }
  }
}
