const tiles = tileset1;

/*
Tileset checklist:
trbl
0000 x
0001 x
0010 x
0011 x
0100 x
0101 x
0110 x
0111 x
1000 x
1001 x
1010 x
1011 x
1100 x
1101 x
1110 x
1111 x
*/

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
  const levelWidth = 12;
  const levelHeight = 12;
  const startX = Math.floor(levelWidth / 2);
  const startY = Math.floor(levelHeight / 2);

  let level, visited, addedTiles, nextTile, firstTime, stuck, order;

  initialize();
  while (addedTiles < levelLength || stuck) {
    initialize();
    while (nextTile.length && addedTiles < levelLength) {
      generate();
    }
  }

  return {
    level,
    order
  };

  function initialize() {
    level = new Array(levelHeight);
    visited = new Array(levelHeight);
    for (let i = 0; i < level.length; i++) {
      level[i] = new Array(levelWidth);
      visited[i] = new Array(levelWidth);

      for (let j = 0; j < level[i].length; j++) {
        level[i][j] = undefined;
      }
    }

    nextTile = [[startY, startX, "none"]];
    visited[startY][startX] = true;

    addedTiles = 0;
    firstTime = true;
    stuck = false;
    order = [];
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
        stuck = true;
        return;
      }
    }

    if (randomTile) {
      addedTiles += 1;
      order.push([x, y]);
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

const tileSize = 12;
const tileset = document.getElementById("tileset");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.scale(4, 4);
ctx.imageSmoothingEnabled = false;

let camX = 0;
let camY = 0;

const keyMap = {};
const keyInputFn = function(e) {
  e = e || event;
  keyMap[e.keyCode] = e.type == "keydown";
};

window.addEventListener("keydown", keyInputFn);
window.addEventListener("keyup", keyInputFn);

function redrawCanvas(olevel) {
  const level = olevel.level;
  const first = olevel.order[0];
  const last = olevel.order[olevel.order.length - 1];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      const currentTile = tiles[level[y][x]];

      if (currentTile) {
        for (let yy = 0; yy < 12; yy++) {
          for (let xx = 0; xx < 12; xx++) {
            if (currentTile.data[yy][xx]) {
              if (first[0] === x && first[1] === y) {
                ctx.fillStyle = "#00ff00";
              } else if (last[0] === x && last[1] === y) {
                ctx.fillStyle = "#ff0000";
              } else {
                ctx.fillStyle = "#000000";
              }

              ctx.fillRect(x * 12 + xx, y * 12 + yy, 1, 1);
            }
          }
        }
      }
    }
  }
}

let last_t = 0;
function frame(t, expandedLevel) {
  const dt = t - last_t;

  if (keyMap[37]) camX -= 0.2 * dt;
  if (keyMap[38]) camY -= 0.2 * dt;
  if (keyMap[39]) camX += 0.2 * dt;
  if (keyMap[40]) camY += 0.2 * dt;

  render(expandedLevel);

  last_t = t;

  requestAnimationFrame(t => {
    frame(t, expandedLevel);
  });
}

function render(expandedLevel) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const clampedStartX = Math.min(
    Math.max(Math.round((camX - tileSize) / tileSize), 0),
    expandedLevel[0].length
  );
  const clampedStartY = Math.min(
    Math.max(Math.round((camY - tileSize) / tileSize), 0),
    expandedLevel.length
  );

  const clampedEndX = Math.max(
    Math.min(
      clampedStartX + Math.round(canvas.width / 12),
      expandedLevel[0].length
    ),
    0
  );
  const clampedEndY = Math.max(
    Math.min(
      clampedStartY + Math.round(canvas.height / 12),
      expandedLevel.length
    ),
    0
  );

  for (let y = clampedStartY; y < clampedEndY; y++) {
    for (let x = clampedStartX; x < clampedEndX; x++) {
      const tiledata = expandedLevel[y][x];

      if (tiledata) {
        drawTile(ctx, x, y, camX, camY, 0);
      } else {
        const nt = y - 1 >= 0 ? !expandedLevel[y - 1][x] : false;
        const nr =
          x + 1 < expandedLevel[y].length ? !expandedLevel[y][x + 1] : false;
        const nb =
          y + 1 < expandedLevel.length ? !expandedLevel[y + 1][x] : false;
        const nl = x - 1 >= 0 ? !expandedLevel[y][x - 1] : false;

        const pattern = `${+nt}${+nr}${+nb}${+nl}`;
        const idx = parseInt(pattern, 2);

        drawTile(ctx, x, y, camX, camY, 1 + idx);
      }
    }
  }
}

function drawTile(ctx, x, y, camX, camY, tileIndex) {
  const tileX = tileIndex % 10;
  const tileY = Math.floor(tileIndex / 10);

  ctx.drawImage(
    tileset,
    tileX * 12,
    tileY * 12,
    tileSize,
    tileSize,
    x * tileSize - camX,
    y * tileSize - camY,
    tileSize,
    tileSize
  );
}

/**
 * Expands a level from tiles into a grid
 *
 * @param {*} level The level returned by generateLevel
 */
function expandLevel(olevel) {
  const level = olevel.level;
  const width = level[0].length;
  const height = level.length;
  const expandedLevel = new Array(height * 12);
  for (let i = 0; i < expandedLevel.length; i++) {
    expandedLevel[i] = new Array(width);
  }

  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      const currentTile = tiles[level[y][x]];

      if (currentTile) {
        for (let yy = 0; yy < 12; yy++) {
          for (let xx = 0; xx < 12; xx++) {
            expandedLevel[y * 12 + yy][x * 12 + xx] = currentTile.data[yy][xx];
          }
        }
      } else {
        for (let yy = 0; yy < 12; yy++) {
          for (let xx = 0; xx < 12; xx++) {
            expandedLevel[y * 12 + yy][x * 12 + xx] = 0;
          }
        }
      }
    }
  }

  return expandedLevel;
}

let level = generateLevel(12);
let expanded = expandLevel(level);
let start = level.order[0];

camX = start[0] * 12 * 12;
camY = start[1] * 12 * 12;

requestAnimationFrame(t => {
  frame(t, expanded);
});

/*

*/

/*setInterval(() => {
  let level = generateLevel(12);

  redrawCanvas(level);
}, 500);*/
