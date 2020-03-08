export interface Tile {
  /**
   * The tile's index in the tilemap
   */
  index: number;

  /**
   * Bitmap of which tiles go where, y-first.
   */
  data: number[][];

  /**
   * List of compatible top neighbour indices
   */
  top: number[];

  /**
   * List of compatible right neighbour indices
   */
  right: number[];

  /**
   * List of compatible bottom neighbour indices
   */
  bottom: number[];

  /**
   * List of compatible left neighbour indices
   */
  left: number[];

  /**
   * [X, Y] pairs of key locations
   */
  keyLocations: number[][];
}
