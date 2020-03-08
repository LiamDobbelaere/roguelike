import { padArray, toPairs } from "./utils";

describe("padArray", () => {
  it("should pad an array", () => {
    const input = [3, 3];
    const result = padArray(12, 0, input);

    expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3]);
  });

  it("should pad an array - source length equal to target length", () => {
    const input = [1, 3, 3];
    const result = padArray(3, 0, input);

    expect(result).toEqual([1, 3, 3]);
  });

  it("should pad an array - empty source", () => {
    const input: number[] = [];
    const result = padArray(3, 0, input);

    expect(result).toEqual([0, 0, 0]);
  });
});

describe("toPairs", () => {
  it("should convert a 1d array to pairs", () => {
    const input = [0, 5, 9, 10, 6, 4];
    const result = toPairs(input);

    expect(result).toEqual([
      [0, 5],
      [9, 10],
      [6, 4]
    ]);
  });
});
