import { TileMap } from "../tilemap/tilemap";
import { data_tileset1 } from "../tileset1.rlt";
import { LevelGenerator, Level, TILE_SIZE } from "../generation/level-generator";
import { Renderer } from "../rendering/renderer";

export class Game {
  private lastFrameTime: number;
  private lastDeltaTime: number;
  private renderer: Renderer;
  private currentLevel: Level;

  constructor() {
    const tileMap = TileMap.decompress(data_tileset1());

    const generator = new LevelGenerator(12, 12, 12, tileMap);
    
    this.currentLevel = generator.generate();
    this.renderer = new Renderer();

    this.renderer.camX = this.currentLevel.order[0].x * TILE_SIZE * TILE_SIZE;
    this.renderer.camY = this.currentLevel.order[0].y * TILE_SIZE * TILE_SIZE;

    requestAnimationFrame(this.frame.bind(this));
  }

  private frame(frameTime: number) {
    const deltaTime = frameTime - this.lastFrameTime;

    /*if (keyMap[37]) camX -= 0.2 * dt;
    if (keyMap[38]) camY -= 0.2 * dt;
    if (keyMap[39]) camX += 0.2 * dt;
    if (keyMap[40]) camY += 0.2 * dt;*/

    this.renderer.render(this.currentLevel);

    this.lastFrameTime = frameTime;

    requestAnimationFrame(this.frame.bind(this));
  }

}