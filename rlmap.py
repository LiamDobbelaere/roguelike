# Written in Python 3.8, with numpy and Pillow installed

import numpy as np
from PIL import Image
import sys

im = Image.open(sys.argv[1], "r")
width, height = im.size
pixel_values = list(im.getdata())


def matchColor(col, r, g, b):
    return col[0] == r and col[1] == g and col[2] == b


for n in range(0, width * height):
    newvalue = 0
    if matchColor(pixel_values[n], 255, 255, 255):
        newvalue = 1
    elif matchColor(pixel_values[n], 0, 0, 255):
        newvalue = 2
    pixel_values[n] = newvalue

arrpixels = np.array(pixel_values).reshape((width, height))

# Read the tiles into tiles[], skipping blank tiles
tiles = []
for ty in range(0, height, 12):
    for tx in range(0, width, 12):
        newtile = []
        is_filled = False
        for y in range(0, 12):
            newtile_row = []
            for x in range(0, 12):
                pv = arrpixels[ty + y][tx + x]
                if pv > 0:
                    is_filled = True
                newtile_row.append(pv)
            newtile.append(newtile_row)
        if is_filled:
            tiles.append(newtile)

print(str(len(tiles)) + " tiles read")

# Create an extended tileset by rotating and flipping
tiles_extended = []
for tile in tiles:
    tiles_extended.append(tile)
    tiles_extended.append(np.rot90(tile, 1))
    tiles_extended.append(np.rot90(tile, 2))
    tiles_extended.append(np.rot90(tile, 3))

    flippedud = np.flipud(tile)
    tiles_extended.append(flippedud)
    tiles_extended.append(np.rot90(flippedud, 1))
    tiles_extended.append(np.rot90(flippedud, 2))
    tiles_extended.append(np.rot90(flippedud, 3))

    flippedlr = np.fliplr(tile)
    tiles_extended.append(np.rot90(flippedlr, 1))
    tiles_extended.append(np.rot90(flippedlr, 2))
    tiles_extended.append(np.rot90(flippedlr, 3))

print(str(len(tiles_extended)) + " extended tiles created")

# Reduce the extended tileset by only taking the unique tiles
tiles_extended = np.unique(tiles_extended, axis=0)

print(str(len(tiles_extended)) + " unique tiles written")

# Calculate possible neighbouring tiles
tiles_neighbours = {}


def calculateValidConnections(tileA, tileAIndex, tileB, tileBIndex, validatorfunc):
    if tileAIndex not in tiles_neighbours:
        tiles_neighbours[tileAIndex] = {
            "top": [],
            "right": [],
            "bottom": [],
            "left": [],
        }

    if tileBIndex not in tiles_neighbours:
        tiles_neighbours[tileBIndex] = {
            "top": [],
            "right": [],
            "bottom": [],
            "left": [],
        }

    validation = validatorfunc(tileA, tileB)

    # we always add the reverse relation too, if a.right matches with b.left, then b.left matches with a.right
    if validation["right"]:
        tiles_neighbours[tileAIndex]["right"].append(tileBIndex)
        tiles_neighbours[tileBIndex]["left"].append(tileAIndex)

    if validation["left"]:
        tiles_neighbours[tileAIndex]["left"].append(tileBIndex)
        tiles_neighbours[tileBIndex]["right"].append(tileAIndex)

    if validation["bottom"]:
        tiles_neighbours[tileAIndex]["bottom"].append(tileBIndex)
        tiles_neighbours[tileBIndex]["top"].append(tileAIndex)

    if validation["top"]:
        tiles_neighbours[tileAIndex]["top"].append(tileBIndex)
        tiles_neighbours[tileBIndex]["bottom"].append(tileAIndex)


def arrayOrWithValue(a, b, v):
    for i in range(0, len(a)):
        if a[i] == v and a[i] == b[i]:
            return True
    return False


def tile2sides(tile):
    sides = {}

    sides["top"] = tile[0]
    sides["bottom"] = tile[len(tile) - 1]

    sides["left"] = []
    for i in range(0, len(tile)):
        sides["left"].append(tile[i][0])

    sides["right"] = []
    for i in range(0, len(tile)):
        sides["right"].append(tile[i][len(tile[i]) - 1])

    return sides


def oneMatchingBorderBlockValidator(tileA, tileB):
    validation = {"top": False, "right": False, "bottom": False, "left": False}

    aSides = tile2sides(tileA)
    bSides = tile2sides(tileB)

    if arrayOrWithValue(aSides["left"], bSides["right"], 1):
        validation["left"] = True

    if arrayOrWithValue(aSides["right"], bSides["left"], 1):
        validation["right"] = True

    if arrayOrWithValue(aSides["top"], bSides["bottom"], 1):
        validation["top"] = True

    if arrayOrWithValue(aSides["bottom"], bSides["top"], 1):
        validation["bottom"] = True

    return validation


tiles_keylocations = {}


def calculateKeyLocations(tile, index):
    if index not in tiles_keylocations:
        tiles_keylocations[index] = []

    for y in range(0, len(tile)):
        for x in range(0, len(tile[y])):
            if tile[y][x] == 2:
                tiles_keylocations[index].append([x, y])


print("Calculating neighbours and key locations...")
# first time we run through 0 to n, then 1 to n, 2 to n,..
# this is because with tiles A-B-C, only A-A, A-B, A-C, B-B, B-C, C-C needs to be calculated
# since the reverse relation can be inferred, A-B = B-A for instance
for i in range(0, len(tiles_extended)):
    for j in range(0, len(tiles_extended)):
        calculateValidConnections(
            tiles_extended[i], i, tiles_extended[j], j, oneMatchingBorderBlockValidator,
        )
        neighbour_count = (
            len(tiles_neighbours[i]["top"])
            + len(tiles_neighbours[i]["right"])
            + len(tiles_neighbours[i]["bottom"])
            + len(tiles_neighbours[i]["left"])
        )
    calculateKeyLocations(tiles_extended[i], i)

min_neighbours = 1000000
max_neighbours = 0
total_neighbours = 0
for i in tiles_neighbours:
    neighbour_count = (
        len(tiles_neighbours[i]["top"])
        + len(tiles_neighbours[i]["right"])
        + len(tiles_neighbours[i]["bottom"])
        + len(tiles_neighbours[i]["left"])
    )

    total_neighbours += neighbour_count

    if neighbour_count == 0:
        print("Warning: Tile with index " + str(i) + " has no neighbours!")

    if neighbour_count < min_neighbours:
        min_neighbours = neighbour_count

    if neighbour_count > max_neighbours:
        max_neighbours = neighbour_count

print("min_neighbours:" + str(min_neighbours))
print("max_neighbours:" + str(max_neighbours))
print("total_neighbours:" + str(total_neighbours))

# Write all gathered info to a js file
with open(sys.argv[1].split(".")[0] + ".rlt.js", "w") as file:
    file.write("const " + sys.argv[1].split(".")[0] + " = [\n")
    n = 0
    for idx, tile in enumerate(tiles_extended):
        n += 1
        need_open = True
        for y in range(0, 12):
            openb = ""
            closeb = ""
            endcomma = ","
            if need_open:
                openb = "new Tile(" + str(idx) + ",[\n"
            if y == 11:
                topnb = (
                    ",\n["
                    + ",".join([str(i) for i in tiles_neighbours[idx]["top"]])
                    + "]"
                )
                rightnb = (
                    ",\n["
                    + ",".join([str(i) for i in tiles_neighbours[idx]["right"]])
                    + "]"
                )
                bottomnb = (
                    ",\n["
                    + ",".join([str(i) for i in tiles_neighbours[idx]["bottom"]])
                    + "]"
                )
                leftnb = (
                    ",\n["
                    + ",".join([str(i) for i in tiles_neighbours[idx]["left"]])
                    + "]"
                )
                keylocs = (
                    ",\n[" + ",".join([str(i) for i in tiles_keylocations[idx]]) + "]"
                )

                closeb = "]" + topnb + rightnb + bottomnb + leftnb + keylocs + ")"
            if y == 11 and n == len(tiles_extended):
                endcomma = ""

            file.write(
                openb
                + "["
                + ",".join([str(i) for i in tile[y]])
                + "]"
                + closeb
                + endcomma
                + "\n"
            )
            need_open = False
    file.write("];")
