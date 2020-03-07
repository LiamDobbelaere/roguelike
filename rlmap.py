# Written in Python 3.8, with numpy and Pillow installed
import json
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
        if tileBIndex not in tiles_neighbours[tileAIndex]["right"]:
            tiles_neighbours[tileAIndex]["right"].append(tileBIndex)
        if tileAIndex not in tiles_neighbours[tileBIndex]["left"]:
            tiles_neighbours[tileBIndex]["left"].append(tileAIndex)

    if validation["left"]:
        if tileBIndex not in tiles_neighbours[tileAIndex]["left"]:
            tiles_neighbours[tileAIndex]["left"].append(tileBIndex)
        if tileAIndex not in tiles_neighbours[tileBIndex]["right"]:
            tiles_neighbours[tileBIndex]["right"].append(tileAIndex)

    if validation["bottom"]:
        if tileBIndex not in tiles_neighbours[tileAIndex]["bottom"]:
            tiles_neighbours[tileAIndex]["bottom"].append(tileBIndex)
        if tileAIndex not in tiles_neighbours[tileBIndex]["top"]:
            tiles_neighbours[tileBIndex]["top"].append(tileAIndex)

    if validation["top"]:
        if tileBIndex not in tiles_neighbours[tileAIndex]["top"]:
            tiles_neighbours[tileAIndex]["top"].append(tileBIndex)
        if tileAIndex not in tiles_neighbours[tileBIndex]["bottom"]:
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
    for j in range(i, len(tiles_extended)):
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


def would_gain_something(inp, total_len):
    return len(inp) > total_len // 2


def inverse(a, target):
    result = []
    # return all elements of target that are not in a
    for target_item in target:
        if target_item not in a:
            result.append(target_item)

    return result


json_export_array = []
for idx, tile in enumerate(tiles_extended):
    tile_data = []
    for y in range(0, len(tile)):
        tile_data.append(int("".join([str(min(i, 1)) for i in tile[y]]), 2))

    minimum_x = -1
    for i in range(0, len(tile_data)):
        if tile_data[i] == 0:
            minimum_x = i
        else:
            break

    minimum_x = min(minimum_x + 1, len(tile_data) - 1)

    tile_data = tile_data[minimum_x:]

    top_key = "t"
    right_key = "r"
    bottom_key = "b"
    left_key = "l"

    nb_top = tiles_neighbours[idx]["top"]
    nb_right = tiles_neighbours[idx]["right"]
    nb_bottom = tiles_neighbours[idx]["bottom"]
    nb_left = tiles_neighbours[idx]["left"]

    target = range(len(tiles_extended))

    if would_gain_something(nb_top, len(tiles_extended)):
        nb_top = inverse(nb_top, target)
        top_key = "T"

    if would_gain_something(nb_right, len(tiles_extended)):
        nb_right = inverse(nb_right, target)
        right_key = "R"

    if would_gain_something(nb_bottom, len(tiles_extended)):
        nb_bottom = inverse(nb_bottom, target)
        bottom_key = "B"

    if would_gain_something(nb_left, len(tiles_extended)):
        nb_left = inverse(nb_left, target)
        left_key = "L"

    json_export_object = {
        "d": tile_data,
        "k": [item for sublist in tiles_keylocations[idx] for item in sublist],
    }

    if len(nb_top) > 0:
        json_export_object[top_key] = nb_top
    if len(nb_right) > 0:
        json_export_object[right_key] = nb_right
    if len(nb_bottom) > 0:
        json_export_object[bottom_key] = nb_bottom
    if len(nb_left) > 0:
        json_export_object[left_key] = nb_left

    json_export_array.append(json_export_object)


def to_json(o, level=0):
    ret = ""
    NEWLINE = "\n"
    INDENT = 0
    SPACE = ""

    if isinstance(o, dict):
        ret += "{" + NEWLINE
        comma = ""
        for k, v in o.items():
            ret += comma
            comma = "," + NEWLINE
            ret += SPACE * INDENT * (level + 1)
            ret += '"' + str(k) + '":' + SPACE
            ret += to_json(v, level + 1)

        ret += NEWLINE + SPACE * INDENT * level + "}"
    elif isinstance(o, str):
        ret += '"' + o + '"'
    elif isinstance(o, list):
        ret += "[" + ",".join([to_json(e, level + 1) for e in o]) + "]"
    elif isinstance(o, bool):
        ret += "true" if o else "false"
    elif isinstance(o, int):
        ret += str(o)
    elif isinstance(o, float):
        ret += "%.7g" % o
    elif isinstance(o, numpy.ndarray) and numpy.issubdtype(o.dtype, numpy.integer):
        ret += "[" + ",".join(map(str, o.flatten().tolist())) + "]"
    elif isinstance(o, numpy.ndarray) and numpy.issubdtype(o.dtype, numpy.inexact):
        ret += "[" + ",".join(map(lambda x: "%.7g" % x, o.flatten().tolist())) + "]"
    elif o is None:
        ret += "null"
    else:
        raise TypeError("Unknown type '%s' for json serialization" % str(type(o)))
    return ret


with open(sys.argv[2], "w") as file:
    file.write(
        "function data_"
        + sys.argv[1].split(".")[0]
        + "() { return "
        + to_json(json_export_array)
        + " } "
    )

