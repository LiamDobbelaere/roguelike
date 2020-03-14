import { Level, TILE_SIZE } from "../generation/level-generator";

export class Renderer {
  private gfxTileset : HTMLImageElement;
  private gfxObjects : HTMLImageElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  public camX = 0;
  public camY = 0;

  constructor() {
    this.gfxTileset = document.getElementById("tileset") as HTMLImageElement;
    this.gfxObjects = document.getElementById("objects") as HTMLImageElement;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(4, 4);
    this.ctx.imageSmoothingEnabled = false;
  }

  public render(level: Level) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const clampedStartX = Math.min(
      Math.max(Math.round((this.camX - TILE_SIZE) / TILE_SIZE), 0),
      level.map[0].length
    );
    const clampedStartY = Math.min(
      Math.max(Math.round((this.camY - TILE_SIZE) / TILE_SIZE), 0),
      level.map.length
    );

    const clampedEndX = Math.max(
      Math.min(
        clampedStartX +
          Math.round((this.canvas.width + TILE_SIZE * 2 * 4) / (TILE_SIZE * 4)),
        level.map[0].length
      ),
      0
    );
    const clampedEndY = Math.max(
      Math.min(
        clampedStartY +
          Math.round((this.canvas.height + TILE_SIZE * 2 * 4) / (TILE_SIZE * 4)),
        level.map.length
      ),
      0
    );

    for (let y = clampedStartY; y < clampedEndY; y++) {
      for (let x = clampedStartX; x < clampedEndX; x++) {
        const tiledata = level.map[y][x];
        const mapX = Math.floor(x / TILE_SIZE);
        const mapY = Math.floor(y / TILE_SIZE);
        let color = (mapX + mapY) % 3;

        if (tiledata) {
          this.drawTile(x, y, this.gfxTileset, 20 + color);
        } else {
          const nt = +(y - 1 >= 0 ? !level.map[y - 1][x] : false);
          const nr =
            +(x + 1 < level.map[y].length ? !level.map[y][x + 1] : false);
          const nb =
            +(y + 1 < level.map.length ? !level.map[y + 1][x] : false);
          const nl = +(x - 1 >= 0 ? !level.map[y][x - 1] : false);

          const idx = nl * 1 + nb * 2 + nr * 4 + nt * 8;

          this.drawTile(x, y, this.gfxTileset, idx);
        }
      }
    }

    level.objects.forEach(object => {
      this.drawTile(object.location.x, object.location.y, this.gfxObjects, object.type);
    });
  }

  private drawTile(x: number, y: number, tileset: HTMLImageElement, tileIndex: number) {
    const tileX = tileIndex % 10;
    const tileY = Math.floor(tileIndex / 10);
  
    this.ctx.drawImage(
      tileset,
      tileX * TILE_SIZE,
      tileY * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE,
      x * TILE_SIZE - this.camX,
      y * TILE_SIZE - this.camY,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}