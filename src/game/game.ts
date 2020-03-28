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
    this.renderer.addFont("default", {
      spaceWidth: 4,
      characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ.!:;?1234567890",
      characterHeight: 6,
      coordsXYW: [
        0, 0, 3, 4, 0, 3, 8, 0, 3, 12, 0, 3, 16, 0, 2, 19, 0, 2, 22, 0, 4, 27, 0, 3, 
        31, 0, 3, 35, 0, 3, 39, 0, 3, 43, 0, 3, 47, 0, 5, 53, 0, 4, 58, 0, 3, 62, 0, 3, 
        66, 0, 3, 70, 0, 3, 74, 0, 3, 78, 0, 3, 82, 0, 4, 87, 0, 3, 91, 0, 5, 97, 0, 3, 
        101, 0, 3, 105, 0, 3, 0, 7, 1, 2, 7, 1, 4, 7, 1, 6, 7, 1, 8, 7, 3, 12, 7, 2, 15, 
        7, 3, 19, 7, 3, 23, 7, 3, 27, 7, 3, 31, 7, 3, 35, 7, 3, 39, 7, 3, 43, 7, 3, 47, 7, 3
      ]
    });

    this.renderer.camX = this.currentLevel.order[0].x * TILE_SIZE * TILE_SIZE;
    this.renderer.camY = this.currentLevel.order[0].y * TILE_SIZE * TILE_SIZE;

    requestAnimationFrame(this.frame.bind(this));
  }

  private frame(frameTime: number) {
    const deltaTime = frameTime - this.lastFrameTime;

    this.currentLevel.entities.forEach(entity =>
      entity.update(deltaTime, this.input, this.renderer, this.currentLevel)
    );
    this.renderer.render(deltaTime, this.input, this.renderer, this.currentLevel);
    this.input.clearPressedKeys();

    this.lastFrameTime = frameTime;

    requestAnimationFrame(this.frame.bind(this));
  }
}
