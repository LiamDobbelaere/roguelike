import { TileMap } from "../tilemap/tilemap";
import { data_tileset1 } from "../tileset1.rlt";
import {
  LevelGenerator,
  Level,
  TILE_SIZE
} from "../generation/level-generator";
import { Renderer } from "../rendering/renderer";
import { Input, KeyMap, Key } from "../input/input";
import { data_tileset2 } from "../tileset2.rlt";

export class Game {
  private lastFrameTime: number;
  private lastDeltaTime: number;
  private renderer: Renderer;
  private input: Input;
  private currentLevel: Level;

  constructor() {
    const tileMap = TileMap.decompress(data_tileset1());

    const generator = new LevelGenerator(12, 12, 12, tileMap);

    this.currentLevel = generator.generate();
    this.input = new Input();
    this.renderer = new Renderer();

    this.renderer.camX = this.currentLevel.order[0].x * TILE_SIZE * TILE_SIZE;
    this.renderer.camY = this.currentLevel.order[0].y * TILE_SIZE * TILE_SIZE;

    requestAnimationFrame(this.frame.bind(this));
  }

  private frame(frameTime: number) {
    const deltaTime = frameTime - this.lastFrameTime;

    /*if (this.input.isKeyDown(Key.LEFT)) this.renderer.camX -= 0.2 * deltaTime;
    if (this.input.isKeyDown(Key.UP)) this.renderer.camY -= 0.2 * deltaTime;
    if (this.input.isKeyDown(Key.RIGHT)) this.renderer.camX += 0.2 * deltaTime;
    if (this.input.isKeyDown(Key.DOWN)) this.renderer.camY += 0.2 * deltaTime;*/

    this.currentLevel.entities.forEach(entity =>
      entity.update(deltaTime, this.input, this.renderer, this.currentLevel)
    );
    this.renderer.render(this.currentLevel);
    this.input.clearPressedKeys();

    this.lastFrameTime = frameTime;

    requestAnimationFrame(this.frame.bind(this));
  }
}
