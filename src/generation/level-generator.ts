import { Tile } from "../tilemap/tile.interface";
import { shuffle } from "../utils/utils";

export const TILE_SIZE = 12;

interface Coordinate {
  x: number;
  y: number;
}

interface LevelObject {
  location: Coordinate;
  type: number;
}

export interface Level {
  map: number[][];
  order: Coordinate[];
  objects: LevelObject[];
}

export class LevelGenerator {
  private startX = 0;
  private startY = 0;

  private level: number[][] = [];
  private visited: boolean[][] = [];

  private addedTiles = 0;
  private stuck = false;
  private nextTile: Coordinate[] = [];
  private order: Coordinate[] = [];
  private objects: LevelObject[] = [];

  constructor(
    private width: number,
    private height: number,
    private length: number,
    private tileMap: Tile[]
  ) {
    this.initialize();
  }

  private initialize() {
    this.startX = Math.floor(this.width / 2);
    this.startY = Math.floor(this.height / 2);

    this.level = new Array(this.height).fill(
      new Array(this.width).fill(undefined)
    );
    this.visited = new Array(this.height).fill(new Array(this.width));

    this.level = new Array(this.height);
    this.visited = new Array(this.height);
    for (let i = 0; i < this.level.length; i++) {
      this.level[i] = new Array(this.width).fill(undefined);
      this.visited[i] = new Array(this.width);
    }

    this.addedTiles = 0;
    this.stuck = false;
    this.nextTile = [
      {
        x: this.startX,
        y: this.startY
      }
    ];
    this.visited[this.startY][this.startX] = true;

    this.order = [];
    this.objects = [];
  }

  public generate(): Level {
    this.initialize();
    while (this.addedTiles < this.length || this.stuck) {
      this.initialize();
      while (this.nextTile.length && this.addedTiles < this.length) {
        this.generateStep();
      }
    }

    return {
      map: this.expand(this.level),
      objects: [...this.objects],
      order: [...this.order]
    };
  }

  private generateStep() {
    const coordinate = this.nextTile.pop();
    if (!coordinate) {
      // Should never happen, but you know software
      this.stuck = true;
      return;
    }

    let x = coordinate.x;
    let y = coordinate.y;

    let xToRight = x + 1;
    let xToLeft = x - 1;
    let yToBottom = y + 1;
    let yToTop = y - 1;

    // Generate new tile based on the options
    const tileChoices = this.findRandomTileChoices(x, y);

    let randomTile =
      tileChoices[Math.floor(Math.random() * tileChoices.length)];

    if (!randomTile) {
      if (this.addedTiles === 0) {
        randomTile = Math.floor(Math.random() * this.tileMap.length);
      } else {
        this.stuck = true;
        return;
      }
    }

    if (randomTile) {
      this.addedTiles += 1;
      this.order.push({ x, y });

      for (let aa = 0; aa < 2; aa++) {
        const keyLocations = this.tileMap[randomTile].keyLocations;
        const randomObject =
          keyLocations[Math.floor(Math.random() * keyLocations.length)];
        let objecttype = 10;
        if (this.addedTiles === this.length) {
          objecttype = 0;
        }

        this.objects.push({
          location: {
            x: x * TILE_SIZE + randomObject[0],
            y: y * TILE_SIZE + randomObject[1]
          },
          type: objecttype
        });
      }
    }

    this.level[y][x] = randomTile;

    let scheduledNextTiles: (Coordinate & { entropy: number })[] = [];

    const topEntropy =
      yToTop >= 0 ? this.findRandomTileChoices(x, yToTop).length : 0;
    const rightEntropy =
      xToRight < this.width
        ? this.findRandomTileChoices(xToRight, y).length
        : 0;
    const bottomEntropy =
      yToBottom < this.height
        ? this.findRandomTileChoices(x, yToBottom).length
        : 0;
    const leftEntropy =
      xToLeft >= 0 ? this.findRandomTileChoices(xToLeft, y).length : 0;

    const checks = shuffle([
      () => {
        if (topEntropy && yToTop >= 0 && !this.visited[yToTop][x]) {
          scheduledNextTiles.push({
            x,
            y: yToTop,
            entropy: topEntropy
          });
          this.visited[yToTop][x] = true;

          return true;
        }

        return false;
      },
      () => {
        if (
          rightEntropy &&
          xToRight < this.width &&
          !this.visited[y][xToRight]
        ) {
          scheduledNextTiles.push({
            x: xToRight,
            y,
            entropy: rightEntropy
          });
          this.visited[y][xToRight] = true;

          return true;
        }

        return false;
      },
      () => {
        if (
          bottomEntropy &&
          yToBottom < this.height &&
          !this.visited[yToBottom][x]
        ) {
          scheduledNextTiles.push({
            x,
            y: yToBottom,
            entropy: bottomEntropy
          });
          this.visited[yToBottom][x] = true;

          return true;
        }

        return false;
      },
      () => {
        if (leftEntropy && xToLeft >= 0 && !this.visited[y][xToLeft]) {
          scheduledNextTiles.push({
            x: xToLeft,
            y,
            entropy: leftEntropy
          });
          this.visited[y][xToLeft] = true;

          return true;
        }

        return false;
      }
    ]);

    let lastResult = false;
    let callIdx = 0;
    while (!lastResult && callIdx < checks.length) {
      lastResult = checks[callIdx]();
      callIdx++;
    }

    scheduledNextTiles.sort((a, b) => {
      // Sort by lowest entropy first
      return b.entropy - a.entropy;
    });

    scheduledNextTiles.forEach(tile => {
      this.nextTile.push(tile);
    });
  }

  private findRandomTileChoices(x: number, y: number) {
    let xToRight = x + 1;
    let xToLeft = x - 1;
    let yToBottom = y + 1;
    let yToTop = y - 1;

    let tileRight = this.tileMap[this.level[y] && this.level[y][xToRight]];
    let tileLeft = this.tileMap[this.level[y] && this.level[y][xToLeft]];
    let tileTop = this.tileMap[this.level[yToTop] && this.level[yToTop][x]];
    let tileBottom = this.tileMap[
      this.level[yToBottom] && this.level[yToBottom][x]
    ];

    const rightChoices = tileRight?.left || [];
    const leftChoices = tileLeft?.right || [];
    const topChoices = tileTop?.bottom || [];
    const bottomChoices = tileBottom?.top || [];

    const totalChoices = Array.from(Array(this.tileMap.length).keys());

    const choices = totalChoices.reduce(
      (acc: number[], currentChoice: number) => {
        let shouldAdd = true;

        if (
          (tileRight && !rightChoices.includes(currentChoice)) ||
          (tileLeft && !leftChoices.includes(currentChoice)) ||
          (tileTop && !topChoices.includes(currentChoice)) ||
          (tileBottom && !bottomChoices.includes(currentChoice))
        ) {
          shouldAdd = false;
        }

        if (shouldAdd) {
          acc.push(currentChoice);
        }

        return acc;
      },
      []
    );

    return choices;
  }

  /**
   * Expands a level from tiles into an actual map
   *
  */
  private expand(level: number[][]) {
    const width = level[0].length;
    const height = level.length;
    const expandedLevel = new Array(height * TILE_SIZE);
    for (let i = 0; i < expandedLevel.length; i++) {
      expandedLevel[i] = new Array(width);
    }
  
    for (let y = 0; y < level.length; y++) {
      for (let x = 0; x < level[y].length; x++) {
        const currentTile = this.tileMap[level[y][x]];
  
        if (currentTile) {
          for (let yy = 0; yy < TILE_SIZE; yy++) {
            for (let xx = 0; xx < TILE_SIZE; xx++) {
              expandedLevel[y * TILE_SIZE + yy][x * TILE_SIZE + xx] =
                currentTile.data[yy][xx];
            }
          }
        } else {
          for (let yy = 0; yy < TILE_SIZE; yy++) {
            for (let xx = 0; xx < TILE_SIZE; xx++) {
              expandedLevel[y * TILE_SIZE + yy][x * TILE_SIZE + xx] = 0;
            }
          }
        }
      }
    }
  
    return expandedLevel;
  }
}
