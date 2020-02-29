const tiles = tileset1;

function findRandomTileChoices(x, y, level, levelWidth, levelHeight) {
  let xToRight = x + 1;
  let xToLeft = x - 1;
  let yToBottom = y + 1;
  let yToTop = y - 1;

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

function generateLevel(levelLength) {
  const levelWidth = 24;
  const levelHeight = 24;
  const startX = Math.floor(levelWidth / 2);
  const startY = Math.floor(levelHeight / 2);

  let level, visited, addedTiles, nextTile, firstTime;

  initialize();
  while (addedTiles < levelLength) {
    initialize();
    while (nextTile.length && addedTiles < levelLength) {
      generate();
    }
  }

  return level;

  function initialize() {
    level = new Array(levelHeight);
    visited = new Array(levelHeight);
    for (let i = 0; i < level.length; i++) {
      level[i] = new Array(levelWidth);
      visited[i] = new Array(levelWidth);
    }

    nextTile = [[startY, startX, "none"]];
    visited[startY][startX] = true;

    addedTiles = 0;
    firstTime = true;
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

    let randomTile =
      tileChoices[Math.floor(Math.random() * tileChoices.length)];

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

    if (randomTile) {
      addedTiles += 1;
    }

    level[y][x] = randomTile;

    let scheduledNextTiles = [];

    const topEntropy =
      yToTop >= 0
        ? findRandomTileChoices(x, yToTop, level, levelWidth, levelHeight)
            .length
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
        ? findRandomTileChoices(xToLeft, y, level, levelWidth, levelHeight)
            .length
        : 0;

    const checks = shuffle([
      () => {
        if (topEntropy && yToTop >= 0 && !visited[yToTop][x]) {
          scheduledNextTiles.push([yToTop, x, topEntropy]);
          visited[yToTop][x] = true;

          return true;
        }

        return false;
      },
      () => {
        if (rightEntropy && xToRight < levelWidth && !visited[y][xToRight]) {
          scheduledNextTiles.push([y, xToRight, rightEntropy]);
          visited[y][xToRight] = true;

          return true;
        }

        return false;
      },
      () => {
        if (
          bottomEntropy &&
          yToBottom < levelHeight &&
          !visited[yToBottom][x]
        ) {
          scheduledNextTiles.push([yToBottom, x, bottomEntropy]);
          visited[yToBottom][x] = true;

          return true;
        }

        return false;
      },
      () => {
        if (leftEntropy && xToLeft >= 0 && !visited[y][xToLeft]) {
          scheduledNextTiles.push([y, xToLeft, leftEntropy]);
          visited[y][xToLeft] = true;

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
}

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

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.scale(4, 4);
ctx.translate(0, 0);

function redrawCanvas(level) {
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

let level = generateLevel(32);
console.log(level);
redrawCanvas(level);
let level2 = generateLevel(32);
console.log(level2);
redrawCanvas(level2);
