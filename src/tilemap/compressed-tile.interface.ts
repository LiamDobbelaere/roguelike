export interface CompressedTile {
  /**
   * Compressed tile data.
   * Convert to binary to get the tile mask for that row
   */
  d: number[];

  /**
   * Key locations as pairs of x, y
   */
  k: number[];

  /**
   * Top neighbour indices
   */
  t?: number[];

  /**
   * Right neighbour indices
   */
  r?: number[];

  /**
   * Bottom neighbour indices
   */
  b?: number[];

  /**
   * Left neighbour indices
   */
  l?: number[];

  /**
   * Top non-neighbour indices (exclusive version of t)
   */
  T?: number[];

  /**
   * Right non-neighbour indices (exclusive version of r)
   */
  R?: number[];

  /**
   * Bottom non-neighbour indices (exclusive version of b)
   */
  B?: number[];

  /**
   * Left non-neighbour indices (exclusive version of L)
   */
  L?: number[];
}
