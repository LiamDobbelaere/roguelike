import { TileMap } from "./tilemap";
import { CompressedTile } from "./compressed-tile.interface";
import { Tile } from "./tile.interface";

describe("TileMap", () => {
  describe("decompress", () => {
    const inputData: CompressedTile[] = [
      {
        d: [4095, 4095],
        k: [5, 10, 5, 11],
        r: [0],
        B: [1],
        l: [0, 1]
      },
      {
        d: [4095, 3, 3],
        k: [2, 4, 3, 4, 5, 6],
        t: [1],
        R: [0, 1],
        b: [0],
        L: [0]
      }
    ];

    it("should decompress compressed tiles", () => {
      const result = TileMap.decompress(inputData);

      expect(result).toEqual([
        {
          index: 0,
          data: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
          ],
          keyLocations: [
            [5, 10],
            [5, 11]
          ],
          top: [],
          right: [0],
          bottom: [0],
          left: [0, 1]
        },
        {
          index: 1,
          data: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
          ],
          keyLocations: [
            [2, 4],
            [3, 4],
            [5, 6]
          ],
          top: [1],
          right: [],
          bottom: [0],
          left: [1]
        }
      ] as Tile[]);
    });
  });

  describe("decompressTileData", () => {
    it("should decompress tile data", () => {
      const input = [4095, 3, 2, 1];
      const result = TileMap.decompressTileData(input);

      expect(result).toEqual([
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
      ]);
    });
  });

  describe("decompressNeighbours", () => {
    it("should decompress neighbours - inclusive", () => {
      const input = [0, 2, 3];
      const totalLength = 5;
      const result = TileMap.decompressNeighbours(totalLength, input);

      expect(result).toEqual(input);
    });

    it("should decompress neighbours - exclusive", () => {
      const input = [0, 2, 3];
      const totalLength = 5;
      const result = TileMap.decompressNeighbours(
        totalLength,
        undefined,
        input
      );

      expect(result).toEqual([1, 4]);
    });
  });
});
