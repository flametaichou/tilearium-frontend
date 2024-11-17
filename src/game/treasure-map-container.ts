import { Container } from 'pixi.js';
import { WorldSimGame } from './game';
import * as PIXI from 'pixi.js';
import { Point2D } from '@/classes/point2d';
import { WorldCell } from '@/classes/world-cell';
import { CellObject, ObjectTree } from '@/classes/cell-object';

export class TreasureMapContainer {

    game: WorldSimGame;

    elem: HTMLDivElement;

    constructor(game: WorldSimGame) {
        this.game = game;

        this.elem = document.createElement('div');
        this.elem.classList.add('game__dialog');
        this.game.wrapper.appendChild(this.elem);

        const canvas = document.createElement('canvas');

        canvas.classList.add('game__canvas');
        canvas.classList.add('game__treasure-map');
        this.elem.appendChild(canvas);

        const close = document.createElement('button');

        close.classList.add('primary');
        close.textContent = 'Close';
        close.onclick = () => {
            this.game.wrapper.removeChild(this.elem);
            this.game.treasureMapContainer = undefined;
        };

        this.elem.appendChild(close);

        const cellSize = 32;

        const app = new PIXI.Application({
            width: canvas.clientWidth,
            height: canvas.clientHeight,
            view: canvas
        });

        const container = new Container();

        container.sortableChildren = true;
        //container.x = app.screen.width / 2;
        //container.y = app.screen.height / 2;
        container.x = 0;
        container.y = 0;

        app.stage.addChild(container as PIXI.Container);

        for (const key of game.treasureMap.cells.keys()) {
            const p: Point2D = game.parseKey(key);
            const cell: WorldCell = game.treasureMap.cells.get(key);

            const textureName = cell.cellType.toLowerCase();
            const texture = game.getTexture(textureName);
            const sprite = new PIXI.Sprite(texture);

            sprite.x = p.x * cellSize;
            sprite.y = p.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0);
            sprite.zIndex = p.y * cellSize;

            container.addChild(sprite);

            //game.treasureMap.cells.delete(key);
        }

        for (const key of game.treasureMap.cellObjects.keys()) {
            const p: Point2D = game.parseKey(key);
            const cellObject: CellObject = game.treasureMap.cellObjects.get(key);

            if (!cellObject) {
                continue;
            }

            const texture = game.getTextureForObject(cellObject);
            const sprite = new PIXI.Sprite(texture);

            if (cellObject.cellObjectType === 'TREE') {
                const size = (cellObject as ObjectTree).meta?.size || 1;

                sprite.width = sprite.width * size;
                sprite.height = sprite.height * size;
            }

            sprite.x = p.x * cellSize - (sprite.width > cellSize ? (sprite.width - cellSize) / 2 : 0);
            sprite.y = p.y * cellSize - (sprite.height > cellSize ? (sprite.height - cellSize) : 0);
            sprite.zIndex = p.y * cellSize;

            container.addChild(sprite);

            //game.treasureMap.cellObjects.delete(key);
        }
    }

    update(): void {
    }
}