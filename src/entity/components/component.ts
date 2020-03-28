import { Renderer } from "../../rendering/renderer";
import { Level } from "../../generation/level-generator";
import { Input } from "../../input/input";
import { Entity } from "../entity";

export interface Component {
  update(dt: number, input: Input, renderer: Renderer, level: Level, entity: Entity): void
  draw(dt: number, input: Input, renderer: Renderer, level: Level, entity: Entity): void
}