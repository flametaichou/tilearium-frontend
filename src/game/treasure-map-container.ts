import { Container } from 'pixi.js';
import { WorldSimGame } from './game';
import * as PIXI from 'pixi.js';
import { Point2D } from '@/classes/point2d';
import { WorldCell } from '@/classes/world-cell';
import { CellObject, ObjectTree } from '@/classes/cell-object';

const cellSize = 32;

export class TreasureMapContainer {

    game: WorldSimGame;

    elem: HTMLDivElement;

    constructor(game: WorldSimGame) {
        this.game = game;

        this.elem = document.createElement('div');
        this.elem.classList.add('dialog');
        this.elem.classList.add('card');
        this.elem.classList.add('card--shadow');
        this.game.wrapper.appendChild(this.elem);

        const header = document.createElement('div');

        header.classList.add('card__title');
        header.innerHTML = '<h2>Treasure map</h2>';
        this.elem.appendChild(header);

        const content = document.createElement('div');

        content.classList.add('dialog__content');
        content.classList.add('card__content');
        this.elem.appendChild(content);

        const canvas = document.createElement('canvas');

        canvas.classList.add('game__canvas');
        canvas.classList.add('game__treasure-map');
        canvas.style.width = cellSize * 30 + 'px';
        content.appendChild(canvas);

        const actions = document.createElement('div');

        actions.classList.add('dialog__actions');
        actions.classList.add('card__footer');
        this.elem.appendChild(actions);

        const close = document.createElement('button');

        close.classList.add('primary');
        close.textContent = 'Close';
        close.onclick = () => {
            this.game.wrapper.removeChild(this.elem);
            this.game.treasureMapContainer = undefined;
        };

        actions.appendChild(close);

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
            const texture = game.textureRegistry.getTexture(textureName);
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

            const texture = game.textureRegistry.getTextureForObject(cellObject);
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