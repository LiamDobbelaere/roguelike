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
