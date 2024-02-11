import * as PIXI from 'pixi.js';

export class CellObject {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.cellObjectType = 'TREE';
        this.sprite = undefined;
    }

    x: number;
    y: number;
    cellObjectType: string;
    sprite: PIXI.Sprite;
}
