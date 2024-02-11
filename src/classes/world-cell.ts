import * as PIXI from 'pixi.js';

export class WorldCell {
    constructor(x: number, y: number, height: number) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.cellType = 'DIRT';
        this.sprite = undefined;
    }

    x: number;
    y: number;
    height: number;
    cellType: string;
    sprite: PIXI.Sprite;
}
