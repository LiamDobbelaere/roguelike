import { Level, TILE_SIZE } from "../generation/level-generator";
import { Input } from "../input/input";

export interface FontConfig {
  spaceWidth: number;
  characters: string;
  characterHeight: number;
  coordsXYW: number[];
}

export interface Font {
  spaceWidth: number;
  characterHeight: number;
  charMap: Map<string, FontCharacter>;
}

export interface FontCharacter {
  x: number;
  y: number;
  width: number;
}

export class Renderer {
  private gfxFont: HTMLImageElement;
  private gfxTileset: HTMLImageElement;
  private gfxObjects: HTMLImageElement;
  private gfxShadows: HTMLImageElement;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale = 4;
  
  private fonts: Map<string, Font>;

  public camX = 0;
  public camY = 0;

  constructor() {
    this.gfxFont = document.getElementById("font") as HTMLImageElement;
    this.gfxTileset = document.getElementById("tileset") as HTMLImageElement;
    this.gfxObjects = document.getElementById("objects") as HTMLImageElement;
    this.gfxShadows = document.getElementById("shadows") as HTMLImageElement;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(this.scale, this.scale);
    this.ctx.imageSmoothingEnabled = false;

    this.fonts = new Map<string, Font>();
  }

  public addFont(name: string, config: FontConfig) {
    const newFont: Font = {
      spaceWidth: config.spaceWidth,
      characterHeight: config.characterHeight,
      charMap: new Map<string, FontCharacter>()
    };

    config.characters.split('').forEach((char, index) => {
      const x = config.coordsXYW[index * 3];
      const y = config.coordsXYW[index * 3 + 1];
      const w = config.coordsXYW[index * 3 + 2];
      
      const newChar: FontCharacter = {
        x,
        y,
        width: w
      };

      newFont.charMap.set(char, newChar);
    });

    this.fonts.set(name, newFont);
  }

  public render(dt: number, input: Input, renderer: Renderer, level: Level) {
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

    level.entities.forEach(entity => {
      if (entity.visible) {
        this.drawTile(entity.location.x, entity.location.y, this.gfxObjects, entity.spriteIndex);
        entity.draw(dt, input, renderer, level);
      }
    });
  }

  public drawText(fontName: string, x: number, y: number, text: string) {
    const font = this.fonts.get(fontName);
    const hsep = 1;
    const vsep = 1;
    let nextX = 0;
    let nextY = 0;

    text.split('').forEach((char) => {
      if (char === ' ') {
        nextX += font.spaceWidth;
        return;
      }

      if (char === '\n') {
        nextX = 0;
        nextY += font.characterHeight + vsep;
        return;
      }


      const fontCharacter = font.charMap.get(char);

      this.ctx.drawImage(
        this.gfxFont,
        fontCharacter.x,
        fontCharacter.y,
        fontCharacter.width,
        font.characterHeight,
        x + nextX,
        y + nextY,
        fontCharacter.width,
        font.characterHeight
      );

      nextX += fontCharacter.width + hsep;
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