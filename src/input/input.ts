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
  private _keyMap: KeyMap = {};
  get keymap(): KeyMap {
    // Return a copy to prevent unexpected mutations mid-frame
    return {
      ...this._keyMap
    };
  }

  private allowedKeys = [
    37, 38, 39, 40, // arrow keys
    90, 88 // z, x
  ];

  constructor() {
    window.addEventListener("keydown", this.onKeyInput.bind(this));
    window.addEventListener("keyup", this.onKeyInput.bind(this));  
  }

  private onKeyInput(e: KeyboardEvent) {
    if (!this.allowedKeys.includes(e.keyCode)) {
      return;
    }

    e.preventDefault();
  
    this._keyMap[e.keyCode] = e.type == "keydown";
  }
}