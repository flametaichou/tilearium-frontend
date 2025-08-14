import * as PIXI from 'pixi.js';

export class SpriteInfo {
    name: string;
    path: string;
    tiled: boolean;
    variationsCount: number;
    tilesMapping: object;
}

export class WSSprite extends SpriteInfo {
    texture: PIXI.Texture;
    textures: Map<number, PIXI.Texture>;
}