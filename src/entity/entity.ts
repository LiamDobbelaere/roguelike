import { Renderer } from "../rendering/renderer";
import { Level, Coordinate } from "../generation/level-generator";
import { Component } from "./components/component";
import { Input } from "../input/input";

export class Entity {
  public visible = true;
  public spriteIndex = 0;
  public components: Component[] = [];

  constructor(public location: Coordinate, components?: Component[]) {
    if (components) {
      components.forEach(this.addComponent.bind(this));
    }
  }

  public update(dt: number, input: Input, renderer: Renderer, level: Level) {
    this.components.forEach(component => {
      component.update(dt, input, renderer, level, this);
    });
  }

  public draw(dt: number, input: Input, renderer: Renderer, level: Level) {
    this.components.forEach(component => {
      component.draw(dt, input, renderer, level, this);
    });
  }

  public addComponent(component: Component) {
    this.components.push(component);
  }
}
