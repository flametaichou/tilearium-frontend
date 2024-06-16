import * as PIXI from 'pixi.js';

export class CellObject {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.cellObjectType = 'TREE';
        this.rendered = false;
    }

    x: number;
    y: number;
    cellObjectType: string;
    rendered: boolean;
    meta: object;
}

export class ObjectTree {
    meta: {
        size: number,
        type: string
    };
}
