import { CompressedTile } from "./compressed-tile.interface";
import { Tile } from "./tile.interface";
import { padArray, toPairs } from "../utils/utils";

export class TileMap {
  public static decompress(tiles: CompressedTile[]): Tile[] {
    return tiles.map(
      (compressedTile, index): Tile => {
        return {
          index,
          data: TileMap.decompressTileData(compressedTile.d),
          keyLocations: toPairs(compressedTile.k),
          right: TileMap.decompressNeighbours(
            tiles.length,
            compressedTile.r,
            compressedTile.R
          ),
          left: TileMap.decompressNeighbours(
            tiles.length,
            compressedTile.l,
            compressedTile.L
          ),
          top: TileMap.decompressNeighbours(
            tiles.length,
            compressedTile.t,
            compressedTile.T
          ),
          bottom: TileMap.decompressNeighbours(
            tiles.length,
            compressedTile.b,
            compressedTile.B
          )
        };
      }
    );
  }

  public static decompressTileData(tileData: number[]): number[][] {
    // 1. Pad data to be 12 long
    // 2. Convert decimals to binary string
    // 3. Split binary string into bits
    // 4. Pad bits to be 12 long
    // 5. Convert bits to numbers

    return padArray(12, 0, tileData).map(e =>
      padArray(12, 0, e.toString(2).split("")).map((i: string) => parseInt(i))
    );
  }

  public static decompressNeighbours(
    totalLength: number,
    inclusive?: number[],
    exclusive?: number[]
  ): number[] {
    if (exclusive) {
      const total = [...Array(totalLength).keys()];

      return total.filter(item => !exclusive.includes(item));
    } else {
      return inclusive || [];
    }
  }
}
