const tiles = tileset1;

function findRandomTileChoices(x, y, level, levelWidth, levelHeight) {
  let xToRight = x + 1;
  let xToLeft = x - 1;
  let yToBottom = y + 1;
  let yToTop = y - 1;

  console.log({
    y,
    xToRight,
    levelWidth
  });
  let tileRight =
    xToRight >= levelWidth ? undefined : tiles[level[y][xToRight]];
  let tileLeft = xToLeft < 0 ? undefined : tiles[level[y][xToLeft]];
  let tileTop = yToTop < 0 ? undefined : tiles[level[yToTop][x]];
  let tileBottom =
    yToBottom >= levelHeight ? undefined : tiles[level[yToBottom][x]];

  const rightChoices = tileRight ? tileRight.left : [];
  const leftChoices = tileLeft ? tileLeft.right : [];
  const topChoices = tileTop ? tileTop.bottom : [];
  const bottomChoices = tileBottom ? tileBottom.top : [];

  const totalChoices = Array.from(Array(tiles.length).keys());

  const choices = totalChoices.reduce((acc, currentChoice) => {
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
  }, []);

  return choices;
}

const levelWidth = 24;
const levelHeight = 24;

const level = new Array(levelHeight);
const visited = new Array(levelHeight);
for (let i = 0; i < level.length; i++) {
  level[i] = new Array(levelWidth);
  visited[i] = new Array(levelWidth);
}

let startX = Math.floor(levelWidth / 2);
let startY = Math.floor(levelHeight / 2);
let addedTiles = 1;

let nextTile = [[startY, startX, "none"]];
visited[startY][startX] = true;
let firstTime = true;

const tileset = document.getElementById("tileset");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let camX = 0;

ctx.imageSmoothingEnabled = false;
ctx.scale(2, 2);
ctx.translate(0, 0);

let simulateSlow = true;

while (!simulateSlow && nextTile.length) {
  generate();
}

function generate() {
  let [y, x] = nextTile.pop();

  let xToRight = x + 1;
  let xToLeft = x - 1;
  let yToBottom = y + 1;
  let yToTop = y - 1;

  // Generate new tile based on the options
  const tileChoices = findRandomTileChoices(
    x,
    y,
    level,
    levelWidth,
    levelHeight
  );

  let randomTile = tileChoices[Math.floor(Math.random() * tileChoices.length)];

  if (!randomTile) {
    if (firstTime) {
      randomTile = Math.floor(Math.random() * tiles.length);
    } else {
      console.warn(
        "I'm stuck, they call me gaseous clay. Leaving tile blank :("
      );
      return;
    }
  }

  level[y][x] = randomTile;

  let scheduledNextTiles = [];

  const topEntropy =
    yToTop >= 0
      ? findRandomTileChoices(x, yToTop, level, levelWidth, levelHeight).length
      : 0;
  const rightEntropy =
    xToRight < levelWidth
      ? findRandomTileChoices(xToRight, y, level, levelWidth, levelHeight)
          .length
      : 0;
  const bottomEntropy =
    yToBottom < levelHeight
      ? findRandomTileChoices(x, yToBottom, level, levelWidth, levelHeight)
          .length
      : 0;
  const leftEntropy =
    xToLeft >= 0
      ? findRandomTileChoices(xToLeft, y, level, levelWidth, levelHeight).length
      : 0;

  console.log({
    topEntropy,
    leftEntropy,
    rightEntropy,
    bottomEntropy
  });
  const checks = shuffle([
    () => {
      if (topEntropy && yToTop >= 0 && !visited[yToTop][x]) {
        scheduledNextTiles.push([yToTop, x, topEntropy]);
        visited[yToTop][x] = true;

        addedTiles += 1;
        return true;
      }

      return false;
    },
    () => {
      if (rightEntropy && xToRight < levelWidth && !visited[y][xToRight]) {
        scheduledNextTiles.push([y, xToRight, rightEntropy]);
        visited[y][xToRight] = true;

        addedTiles += 1;
        return true;
      }

      return false;
    },
    () => {
      if (bottomEntropy && yToBottom < levelHeight && !visited[yToBottom][x]) {
        scheduledNextTiles.push([yToBottom, x, bottomEntropy]);
        visited[yToBottom][x] = true;

        addedTiles += 1;
        return true;
      }

      return false;
    },
    () => {
      if (leftEntropy && xToLeft >= 0 && !visited[y][xToLeft]) {
        scheduledNextTiles.push([y, xToLeft, leftEntropy]);
        visited[y][xToLeft] = true;

        addedTiles += 1;
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
    return b[2]() - a[2]();
  });

  scheduledNextTiles.forEach(tile => {
    tile.pop(); // Remove entropy value
    nextTile.push(tile);
  });

  firstTime = false;
}

const interval = setInterval(() => {
  if (!nextTile.length) {
    //clearInterval(interval);
    //console.log(level);

    redrawCanvas();

    return;
  }

  if (simulateSlow) {
    generate();
  }

  redrawCanvas();
}, 10);

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      const currentTile = tiles[level[y][x]];

      if (currentTile) {
        for (let yy = 0; yy < 12; yy++) {
          for (let xx = 0; xx < 12; xx++) {
            if (currentTile.data[yy][xx]) {
              ctx.fillRect(x * 12 + xx, y * 12 + yy, 1, 1);
            }
          }
        }
      }
    }
  }
}
