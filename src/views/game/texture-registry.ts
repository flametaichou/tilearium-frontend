import { SpriteInfo, WSSprite } from './sprite';
import * as PIXI from 'pixi.js';
import { CellObject, ObjectTree, ObjectTiling } from '@/classes/cell-object';

const TILE_NUMBERS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export class TextureRegistry {
    path: string;
    sprites:  Map<string, WSSprite>;

    constructor(path: string) {
        this.path = path;
        this.sprites = new Map();
    }

    async init(): Promise<void> {
        let sprites: SpriteInfo[] = [];

        try {
            const response = await fetch(`${this.path}/sprites.json`);
            const data = await response.json();

            sprites = data as SpriteInfo[];

        } catch (e) {
            alert('Error on loading sprites ' + e);
        }

        await Promise.all(sprites.map(async (sprite) => {
            this.addSprite(sprite);

            if (sprite.tiled) {
                // TODO: filter by sprite.tilesMapping
                await Promise.all(TILE_NUMBERS.map(async (code) => {
                    await this.loadTexture(sprite, code);
                }));
            } else {
                await this.loadTexture(sprite);
            }
        }));
    }

    addSprite(texture: SpriteInfo): void {
        if (!texture.path) {
            texture.path = '';
        }

        const t: WSSprite = texture as WSSprite;

        t.textures = new Map();

        this.sprites.set(`${texture.name}`, t);
    }

    async loadTexture(texture: SpriteInfo, code?: number): Promise<void> {
        let texturePath = '';
        const hasCode = code !== undefined && code !== null;

        if (hasCode) {
            texturePath = `${this.path}/${texture.path}/${texture.name}_${code}.png`;

        } else {
            texturePath = `${this.path}/${texture.path}/${texture.name}.png`;
        }

        //PIXI.Assets.load(texturePath);
        //PIXI.Texture.addToCache(texture, textureName);

        //var tile = PIXI.Sprite.fromFrame(filename);
        //var tile = PIXI.Sprite.fromImage(filename);

        try {
            await PIXI.Assets.load(texturePath).then((result) => {
                //const texture: PIXI.Texture = PIXI.Texture.from(texturePath, true);
                if (hasCode) {
                    this.sprites.get(texture.name).textures.set(code, result);

                } else {
                    this.sprites.get(texture.name).texture = result;
                }

                console.log('Loaded texture ' + texturePath);
            });
                    
        } catch (e) {
            console.error('Error on loading texture: ' + texturePath);

            await PIXI.Assets.load(`${this.path}/empty.png`).then((result) => {
                if (hasCode) {
                    this.sprites.get(texture.name).textures.set(code, result);

                } else {
                    this.sprites.get(texture.name).texture = result;
                }
            });
        }

    }

    getTexture(textureName: string, tile?: number): PIXI.Texture {
        if (this.sprites.get(textureName)) {
            const sprite: WSSprite = this.sprites.get(textureName);
            const hasTile: boolean = tile !== undefined && tile !== null;

            if (hasTile) {
                if (sprite.tilesMapping) {
                    tile = Object(sprite.tilesMapping)[tile.toString()];
                }

                // TODO: why as?
                return sprite.textures.get(tile) as PIXI.Texture;
            } else {
                // TODO: why as?
                return sprite.texture as PIXI.Texture;
            }
        }

        console.warn('No texture found for: ' + textureName);

        return this.sprites.get('empty').texture as PIXI.Texture ;
    }

    getTextureForObject(cellObject: CellObject): PIXI.Texture {
        let textureName = cellObject?.cellObjectType?.toLowerCase();

        if (this.hasType(cellObject)) {
            const type = (cellObject as ObjectTree).meta?.type;

            if (type) {
                textureName += `_${type.toLowerCase()}`;
            }
        }

        const sprite: WSSprite = this.sprites.get(textureName);

        if (sprite.tiled) {
            const tile = (cellObject as ObjectTiling).meta?.tile || 0;

            return this.getTexture(textureName, tile);
        }

        return this.getTexture(textureName);
    }

    hasType(cellObject: CellObject): boolean {
        return ['TREE', 'FLOWER', 'DEAD_TREE', 'GRASS', 'MUSHROOM', 'WATER_PLANT'].includes(cellObject.cellObjectType);
    }
}