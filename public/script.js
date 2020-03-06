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

  let level, visited, addedTiles, nextTile, firstTime, stuck, order, objects;

  initialize();
  while (addedTiles < levelLength || stuck) {
    initialize();
    while (nextTile.length && addedTiles < levelLength) {
      generate();
    }
  }

  return {
    level,
    order,
    levelExpanded: expandLevel(level),
    objects
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
    objects = [];
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

      for (let aa = 0; aa < 2; aa++) {
        const keyLocations = tiles[randomTile].keyLocations;
        const randomObject =
          keyLocations[Math.floor(Math.random() * keyLocations.length)];
        let objecttype = 10;
        if (addedTiles === levelLength) {
          objecttype = 0;
        }

        objects.push({
          x,
          y,
          object: {
            x: randomObject[0],
            y: randomObject[1],
            type: objecttype
          }
        });
      }
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
const objects = document.getElementById("objects");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.scale(4, 4);
ctx.imageSmoothingEnabled = false;

let camX = 0;
let camY = 0;

const keyMap = {};
const usedKeys = [37, 38, 39, 40];
const keyInputFn = function(e) {
  e = e || event;

  if (usedKeys.includes(e.keyCode)) {
    e.preventDefault();
  }

  keyMap[e.keyCode] = e.type == "keydown";
};

window.addEventListener("keydown", keyInputFn);
window.addEventListener("keyup", keyInputFn);

function redrawCanvas(olevel) {
  const level = olevel.level;
  const first = olevel.order[0];
  const last = olevel.order[olevel.order.length - 1];

  //ctx.clearRect(0, 0, canvas.width / 4, canvas.height / 4);

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
function frame(t, level) {
  const dt = t - last_t;

  if (keyMap[37]) camX -= 0.2 * dt;
  if (keyMap[38]) camY -= 0.2 * dt;
  if (keyMap[39]) camX += 0.2 * dt;
  if (keyMap[40]) camY += 0.2 * dt;

  render(level);

  last_t = t;

  requestAnimationFrame(t => {
    frame(t, level);
  });
}

function render(level) {
  const expandedLevel = level.levelExpanded;

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
      clampedStartX +
        Math.round((canvas.width + tileSize * 2 * 4) / (tileSize * 4)),
      expandedLevel[0].length
    ),
    0
  );
  const clampedEndY = Math.max(
    Math.min(
      clampedStartY +
        Math.round((canvas.height + tileSize * 2 * 4) / (tileSize * 4)),
      expandedLevel.length
    ),
    0
  );

  for (let y = clampedStartY; y < clampedEndY; y++) {
    for (let x = clampedStartX; x < clampedEndX; x++) {
      const tiledata = expandedLevel[y][x];
      const mapX = Math.floor(x / 12);
      const mapY = Math.floor(y / 12);
      let color = (mapX + mapY) % 3;

      if (tiledata) {
        drawTile(ctx, x, y, camX, camY, 20 + color);
      } else {
        const nt = y - 1 >= 0 ? !expandedLevel[y - 1][x] : false;
        const nr =
          x + 1 < expandedLevel[y].length ? !expandedLevel[y][x + 1] : false;
        const nb =
          y + 1 < expandedLevel.length ? !expandedLevel[y + 1][x] : false;
        const nl = x - 1 >= 0 ? !expandedLevel[y][x - 1] : false;

        const idx = nl * 1 + nb * 2 + nr * 4 + nt * 8;

        drawTile(ctx, x, y, camX, camY, idx);
      }
    }
  }

  level.objects.forEach(object => {
    const expandedX = object.x * tileSize + object.object.x;
    const expandedY = object.y * tileSize + object.object.y;

    drawObject(ctx, expandedX, expandedY, camX, camY, object.object.type);
  });
}

function drawTile(ctx, x, y, camX, camY, tileIndex) {
  const tileX = tileIndex % 10;
  const tileY = Math.floor(tileIndex / 10);

  ctx.drawImage(
    tileset,
    tileX * tileSize,
    tileY * tileSize,
    tileSize,
    tileSize,
    x * tileSize - camX,
    y * tileSize - camY,
    tileSize,
    tileSize
  );
}

function drawObject(ctx, x, y, camX, camY, tileIndex) {
  const tileX = tileIndex % 10;
  const tileY = Math.floor(tileIndex / 10);

  ctx.drawImage(
    objects,
    tileX * tileSize,
    tileY * tileSize,
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
function expandLevel(level) {
  const width = level[0].length;
  const height = level.length;
  const expandedLevel = new Array(height * tileSize);
  for (let i = 0; i < expandedLevel.length; i++) {
    expandedLevel[i] = new Array(width);
  }

  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      const currentTile = tiles[level[y][x]];

      if (currentTile) {
        for (let yy = 0; yy < tileSize; yy++) {
          for (let xx = 0; xx < tileSize; xx++) {
            expandedLevel[y * tileSize + yy][x * tileSize + xx] =
              currentTile.data[yy][xx];
          }
        }
      } else {
        for (let yy = 0; yy < tileSize; yy++) {
          for (let xx = 0; xx < tileSize; xx++) {
            expandedLevel[y * tileSize + yy][x * tileSize + xx] = 0;
          }
        }
      }
    }
  }

  return expandedLevel;
}

let level = generateLevel(12);
let start = level.order[0];

camX = start[0] * tileSize * tileSize;
camY = start[1] * tileSize * tileSize;

requestAnimationFrame(t => {
  frame(t, level);
});

function RogueGame() {}

/*
Terran Empire    
earth with very hi tech plasma weaponry, mechs and hover aircrafts and tanks kinda like JDA from Dark Reign 2

the reich
super industrial fascists from a colony that made a empire with WW2 theme military and mechanical mechs

Bandidos
outlaw bandit kingdom that rose from neglected anarchist worlds that uses shitty weaponry but excellent guerilla and weapon tactics    kinda like Orks

the vermin 
humanoid super intelligent rat species that developed interstellar space travel super fast in their evolution and uses a lot of mechs and power armors         kinda like Tau

space undead
revived ultra ancient skeletons and zombies from a extinct human warrior race, looks like heavily armored vikings.
uses huge flesh/bone golems with ancient magic powers for siege and artillery


the bots
a hive mind robot race that was engineered by a unknown faction. they use huge turtle spider like hive robots to produce and control the lesser bots. travels from planet to planet to kill all opposition and consume all resources to produce more bots.

TODO:
- Need more level generation parameters, you need to be able to add items like 
logs (with messages in them), weapons (with stats), enemy types, enemy population etc..
Also put the player location somewhere
- Given a generated level, create a Game class that enables you to control the player and move him around,
that allows logs to be played, weapons to be collected, enemies to be attacked, all in a turn based manner
Enemies should also move after every turn.
After every turn, there's a list of things that need to appear on the screen, mostly attack messages, pickup messages and log messages
The level needs to be rerendered as objects are shifted around in the level
- The game window needs to send input to the Game

*/
