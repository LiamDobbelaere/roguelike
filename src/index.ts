import { data_tileset1 } from "./tileset1.rlt";
import { TileMap } from "./tilemap/tilemap";
import { LevelGenerator } from "./generation/level-generator";

const tileMap = TileMap.decompress(data_tileset1());

const generator = new LevelGenerator(12, 12, 12, tileMap);
console.log(generator.generate());
