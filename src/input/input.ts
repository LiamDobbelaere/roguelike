export type KeyMap =  { [keyCode: number]: boolean }

export enum Key {
  CONFIRM = 88,
  CANCEL = 90,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40 
}

export class Input {
  private keyMap: KeyMap = {};
  private keyMapPressed: KeyMap = {};
  private pressedKeys: Key[] = [];

  private allowedKeys = Object.values(Key);

  constructor() {
    window.addEventListener("keydown", this.onKeyInput.bind(this));
    window.addEventListener("keyup", this.onKeyInput.bind(this));  
  }

  public isKeyDown(key: Key) {
    return this.keyMap[key];
  }

  public isKeyPressed(key: Key) {
    return this.keyMapPressed[key];
  }

  public clearPressedKeys() {
    this.pressedKeys.forEach(pressedKey => {
      delete this.keyMapPressed[pressedKey];
    });

    this.pressedKeys = [];
  }

  private onKeyInput(e: KeyboardEvent) {
    if (!this.allowedKeys.includes(e.keyCode)) {
      return;
    }

    e.preventDefault();

    if (e.type === 'keydown') {
      if (!this.keyMap[e.keyCode]) {
        this.keyMapPressed[e.keyCode] = true;
        this.pressedKeys.push(e.keyCode);
      }
    }

    this.keyMap[e.keyCode] = e.type == "keydown";
  }
}