import { Component } from "./component";
import { Renderer } from "../../rendering/renderer";
import { Level, TILE_SIZE } from "../../generation/level-generator";
import { Input, Key } from "../../input/input";
import { Entity } from "../entity";

export class PlayerComponent implements Component {
  update(dt: number, input: Input, renderer: Renderer, level: Level, entity: Entity): void {    
    if (input.isKeyPressed(Key.LEFT)) {
      entity.location.x -= 1;
    }

    if (input.isKeyPressed(Key.RIGHT)) {
      entity.location.x += 1;
    }
    
    if (input.isKeyPressed(Key.UP)) {
      entity.location.y -= 1;
    }
    
    if (input.isKeyPressed(Key.DOWN)) {
      entity.location.y += 1;
    }
    
    renderer.camX = entity.location.x * TILE_SIZE - (6 * TILE_SIZE);
    renderer.camY = entity.location.y * TILE_SIZE - (5 * TILE_SIZE);
  }
}