import { Level, TILE_SIZE } from "../generation/level-generator";

export class Renderer {
  private gfxTileset : HTMLImageElement;
  private gfxObjects : HTMLImageElement;
  private gfxShadows : HTMLImageElement;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale = 4;
  
  public camX = 0;
  public camY = 0;

  constructor() {
    this.gfxTileset = document.getElementById("tileset") as HTMLImageElement;
    this.gfxObjects = document.getElementById("objects") as HTMLImageElement;
    this.gfxShadows = document.getElementById("shadows") as HTMLImageElement;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(this.scale, this.scale);
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
          Math.round((this.canvas.width + TILE_SIZE * 2 * this.scale) / (TILE_SIZE * this.scale)),
        level.map[0].length
      ),
      0
    );
    const clampedEndY = Math.max(
      Math.min(
        clampedStartY +
          Math.round((this.canvas.height + TILE_SIZE * 2 * this.scale) / (TILE_SIZE * this.scale)),
        level.map.length
      ),
      0
    );

    const inRangeX = (x: number) => {
      return x >= 0 && x < level.map[0].length
    }

    const inRangeY = (y: number) => {
      return y >= 0 && y < level.map.length
    }

    for (let y = clampedStartY; y < clampedEndY; y++) {
      for (let x = clampedStartX; x < clampedEndX; x++) {
        const tiledata = level.map[y][x];
        const mapX = Math.floor(x / TILE_SIZE);
        const mapY = Math.floor(y / TILE_SIZE);
        let color = 1; //(mapX + mapY) % 3;

        // Neighbour calculation
        const nt = +(inRangeY(y - 1) ? !level.map[y - 1][x] : false);
        const nr =
          +(inRangeX(x + 1) ? !level.map[y][x + 1] : false);
        const nb =
          +(inRangeY(y + 1) ? !level.map[y + 1][x] : false);
        const nl = +(inRangeX(x - 1) ? !level.map[y][x - 1] : false);

        const ntl = +(inRangeX(x - 1) && inRangeY(y - 1) ? !level.map[y - 1][x - 1] : false);
        const ntr = +(inRangeX(x + 1) && inRangeY(y - 1) ? !level.map[y - 1][x + 1] : false);
        const nbl = +(inRangeX(x - 1) && inRangeY(y + 1) ? !level.map[y + 1][x - 1] : false);
        const nbr = +(inRangeX(x + 1) && inRangeY(y + 1) ? !level.map[y + 1][x + 1] : false);

        if (tiledata) {
          this.drawTile(x, y, this.gfxTileset, 20 + color);

          // Shadows
          const shadowIdx = (nl * 1 + nt * 2) || (ntl + 4);
          this.drawTile(x, y, this.gfxShadows, shadowIdx);
        } else {          
          const idx = nl * 1 + nb * 2 + nr * 4 + nt * 8;

          this.drawTile(x, y, this.gfxTileset, idx);

          if (nt && nl && !ntl) {
            this.drawTile(x, y, this.gfxTileset, 16);  
          }

          
          if (nt && nr && !ntr) {
            this.drawTile(x, y, this.gfxTileset, 17);  
          }
          
          
          if (nb && nl && !nbl) {
            this.drawTile(x, y, this.gfxTileset, 18);  
          }
          
          
          if (nb && nr && !nbr) {
            this.drawTile(x, y, this.gfxTileset, 19);  
          }
          
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