export function padArray(length: number, padValue: any, value: any[]) {
  return [...Array(length - value.length).fill(padValue), ...value];
}

export function toPairs(input: any[]) {
  const result: any[] = [];

  for (let i = 0; i < input.length; i += 2) {
    result.push([input[i], input[i + 1]]);
  }

  return result;
}

export function shuffle(input: any[]) {
  let j: number;
  let x: any;

  for (let i = input.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = input[i];
    input[i] = input[j];
    input[j] = x;
  }

  return input;
}
