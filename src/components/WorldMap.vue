<template>
    <div class="world-map__wrapper">
        <div class="world-map__fps">
            FPS: {{ fps }}
        </div>
        <canvas
            id="pixi"
            class="world-map"
        ></canvas>

        <!--
        <div class="world-map__buttons">
            <button @click="moveMap2(0)">
                Влево
            </button>
            <button @click="moveMap2(1)">
                Вправо
            </button>
            <button @click="moveMap2(2)">
                Вниз
            </button>
            <button @click="moveMap2(3)">
                Вверх
            </button>
        </div>
        -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as PIXI from 'pixi.js';
import { Point2D } from '@/classes/point2d';
import { WorldCell } from '@/classes/world-cell';
import { Direction } from '@/classes/Direction';
import { $WebSocketService } from '@/service/websocket.service';
import { EntityMove } from '@/classes/entity-move';
import { Entity } from '@/classes/entity';
import { CellObject } from '@/classes/cell-object';
import { WSNotification } from '@/classes/notification';
import { WorldPart } from '@/classes/worldpart';
import { IPointData } from 'pixi.js';

const cellSize = 32;
const maxFps = 60;

export default defineComponent({
    name: 'WorldMap',

    props: {
        id: {
            type: String,
            required: true
        }
    },

    data: () => ({
        loading: false as boolean,
        initialized: false as boolean,
        stopped: false as boolean,
        fps: 0 as number,

        app: new PIXI.Application() as PIXI.Application,
        appLayoutLandscape: new PIXI.Container() as PIXI.Container,

        //world: undefined as World | undefined,

        hints: [
            new Point2D(-11, -11),
            new Point2D(-11, 11)
        ],
        
        center: new Point2D(0, 0) as Point2D,
        
        data: {
            cells: new Map() as Map<string, WorldCell>,
            cellObjects: new Map() as Map<string, CellObject>,
            entities: new Map() as Map<string, Entity>
        },
        
        view: {
            cells: new Map() as Map<string, PIXI.Sprite>,
            cellObjects: new Map() as Map<string, PIXI.Sprite>,
            entities: new Map() as Map<string, PIXI.Sprite>
        }
    }),

    computed: {
        canvas: function (): HTMLCanvasElement {
            return document.getElementById('pixi') as HTMLCanvasElement;
        },

        worldWidth: function (): number {
            return Math.ceil(this.app.screen.width / cellSize) + 1;
        },

        worldHeight: function (): number {
            return Math.ceil(this.app.screen.height / cellSize) + 1;
        },

        zero: function (): Point2D {
            return new Point2D(
                this.center.x - Math.ceil(this.worldWidth / 2),
                this.center.y - Math.ceil(this.worldHeight / 2)
            );
        }
    },

    mounted() {
        this.app = new PIXI.Application({
            width: this.canvas.clientWidth,
            height: this.canvas.clientHeight,
            antialias: true,
            transparent: true,
            view: this.canvas
        });

        this.appLayoutLandscape = new PIXI.Container();
        this.appLayoutLandscape.sortableChildren = true;
        this.appLayoutLandscape.x = this.app.screen.width / 2;
        this.appLayoutLandscape.y = this.app.screen.height / 2;

        this.app.stage?.addChild(this.appLayoutLandscape as PIXI.Container);

        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_grass.png'), 'grass');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_dirt.png'), 'dirt');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_sand.png'), 'sand');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_water.png'), 'water');

        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_tree.png'), 'tree');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_storage.png'), 'storage');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_house.png'), 'house');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_wall.png'), 'wall');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_road.png'), 'road');
        PIXI.Texture.addToCache(PIXI.Texture.from('/cell_tree.png'), 'tree');

        PIXI.Texture.addToCache(PIXI.Texture.from('/entity.png'), 'entity');

        this.clearPixi();

        $WebSocketService.init().then(() => {
            $WebSocketService.subscribe(
                (notification: WSNotification) => {
                    switch (notification.type) {
                        case 'MAP_PART':
                            const worldPart: WorldPart = notification.body as WorldPart;

                            this.center = worldPart.center;

                            if (!this.initialized) {
                                this.initialized = true;
                                this.centerPixi();
                            }

                            const cells: WorldCell[] = worldPart.cells;

                            this.data.cells = new Map([...this.data.cells, ...this.transformCells(cells)]);

                            const cellObjects: CellObject[] = worldPart.cellObjects;

                            this.data.cellObjects = new Map([...this.data.cellObjects, ...this.transformCellObjects(cellObjects)]);

                            // 1-2ms here

                            break;

                        case 'ENTITY':
                            const entityMove: EntityMove = notification.body as EntityMove;

                            // FIXME: sprites can be not removed from pixi
                            this.data.entities = new Map([
                                ...this.data.entities,
                                ...this.transformEntities([new Entity(entityMove.id, entityMove.x, entityMove.y)])
                            ]);

                            break;

                        case 'CELL_OBJECT':
                            //const cellObject: EntityMove = notification.body as EntityMove;
                            //TODO: draw

                            break;

                        default:
                            alert('UNKNOWN NOTIFICATION: ' + notification.type);
                    }
                },
                false
            );

            $WebSocketService.send('/game/map-control', {
                type: 'SET_SETTINGS',
                body: {
                    worldId: this.id,
                    width: this.worldWidth,
                    height: this.worldHeight
                }
            });

            this.render();
        });

        document.addEventListener('keydown', this.onKeyPressed);
    },

    beforeUnmount(): void {
        this.stopped = true;
        document.removeEventListener('keydown', this.onKeyPressed);
    },

    methods: {
        onKeyPressed(event: KeyboardEvent): void {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.movePlayer(Direction.UP);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.movePlayer(Direction.DOWN);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.movePlayer(Direction.LEFT);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.movePlayer(Direction.RIGHT);
                    break;
                default:
                    break;
            }
        },

        movePlayer(direction: Direction) {
            let dir = '';

            switch (direction) {
                case Direction.UP:
                    dir = 'UP';
                    break;

                case Direction.DOWN:
                    dir = 'DOWN';
                    break;

                case Direction.RIGHT:
                    dir = 'RIGHT';
                    break;

                case Direction.LEFT:
                    dir = 'LEFT';
                    break;
            }

            //console.log(`Move ${dir}, new center is ${JSON.stringify(this.center)}, new zero is ${JSON.stringify(this.zero)}`);

            $WebSocketService.send('/game/map-control', {
                type: 'MOVE_PLAYER',
                body: {
                    direction: dir
                }
            });
        },

        /*
        moveMap2(direction: Direction) {
            let dir = '';

            switch (direction) {
                case Direction.UP:
                    this.center.y--;
                    dir = 'UP';
                    break;

                case Direction.DOWN:
                    this.center.y++;
                    dir = 'DOWN';
                    break;

                case Direction.RIGHT:
                    this.center.x++;
                    dir = 'RIGHT';
                    break;

                case Direction.LEFT:
                    this.center.x--;
                    dir = 'LEFT';
                    break;
            }

            console.log(`Move ${dir}, new center is ${JSON.stringify(this.center)}, new zero is ${JSON.stringify(this.zero)}`);

            $WebSocketService.send('/game/map-control', {
                type: 'MOVE_MAP',
                body: {
                    direction: dir,
                    step: 1
                }
            });
        },
        */

        mergeIntoMap() {
            
        },

        // eslint-disable-next-line @typescript-eslint/ban-types
        transformCells: function (cells: WorldCell[]): Map<string, WorldCell> {
            //const time: Date = new Date();

            const cellsMap: Map<string, WorldCell> = new Map<string, WorldCell>();

            for (let cellCounter = 0; cellCounter < cells.length; cellCounter++) {
                const cell: WorldCell = cells[cellCounter];
                const point: Point2D = new Point2D(cell.x, cell.y);

                cellsMap.set(JSON.stringify(point), cell);
            }

            //console.log('Преобразование: ' + (new Date().getTime() - time.getTime()) + 'мс');

            return cellsMap;
        },

        transformCellObjects: function (cells: CellObject[]): Map<string, CellObject> {
            //const time: Date = new Date();

            const cellsMap: Map<string, CellObject> = new Map<string, CellObject>();

            for (let cellCounter = 0; cellCounter < cells.length; cellCounter++) {
                const cell: CellObject = cells[cellCounter];
                const point: Point2D = new Point2D(cell.x, cell.y);

                cellsMap.set(JSON.stringify(point), cell);
            }

            //console.log('Преобразование 2: ' + (new Date().getTime() - time.getTime()) + 'мс');

            return cellsMap;
        },

        transformEntities: function (entities: Entity[]): Map<string, Entity> {
            const entityMap: Map<string, Entity> = new Map<string, Entity>();

            for (let entityCounter = 0; entityCounter < entities.length; entityCounter++) {
                const entity: Entity = entities[entityCounter];

                entityMap.set(entity.id, entity);
            }

            return entityMap;
        },

        clearPixi() {
            for (const key of this.view.cells.keys()) {
                const sprite: PIXI.Sprite = this.view.cells.get(key) as PIXI.Sprite;

                this.appLayoutLandscape.removeChild(sprite);
                this.view.cells.delete(key);
            }

            for (const key of this.view.cellObjects.keys()) {
                const sprite: PIXI.Sprite = this.view.cellObjects.get(key) as PIXI.Sprite;

                this.appLayoutLandscape.removeChild(sprite);
                this.view.cellObjects.delete(key);
            }

            for (const key of this.view.entities.keys()) {
                const sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;

                this.appLayoutLandscape.removeChild(sprite);
                this.view.entities.delete(key);
            }

            this.appLayoutLandscape.removeChildren();

            const zeroText = new PIXI.Text(
                '0:0',
                { fontSize: '24px' }
            );

            zeroText.x = 0;
            zeroText.y = 0;
            zeroText.zIndex = 9999;
            console.log('Added new text sprite');
            this.appLayoutLandscape.addChild(zeroText);

            for (const hint of this.hints) {

                const hintText = new PIXI.Text(
                    JSON.stringify(hint),
                    { fontSize: '12px' }
                );

                hintText.x = hint.x * cellSize;
                hintText.y = hint.y * cellSize;
                hintText.zIndex = 9999;
                console.log('Added new hint text sprite');
                this.appLayoutLandscape.addChild(hintText);
            }

            //this.appLayoutLandscape.updateTransform();
        },

        centerPixi() {
            // TODO: тут центрирование, разобраться
            // Move container to the center
            //this.appLayoutLandscape.x = this.app.screen.width / 2;
            //this.appLayoutLandscape.y = this.app.screen.height / 2;

            // Center bunny sprite in local container coordinates
            this.appLayoutLandscape.pivot.x = this.center.x * cellSize;
            this.appLayoutLandscape.pivot.y = this.center.y * cellSize;
        },

        /**
         * Make one frame of movement to point
         *
         * @param sprite    object to move
         * @param point     point to move the object
         */
        moveSmooth(sprite: IPointData, point: Point2D) {
            // FIXME: if another move started or coords changed?
            let stepX = Math.abs(point.x - sprite.x) / 6;

            if (Math.abs(sprite.x - point.x) < stepX) {
                stepX = Math.abs(sprite.x - point.x);
            }

            if (sprite.x < point.x) {
                sprite.x += stepX;
            } else if (sprite.x > point.x) {
                sprite.x -= stepX;
            }

            let stepY = Math.abs(point.y - sprite.y) / 6;

            if (Math.abs(sprite.y - point.y) < stepY) {
                stepY = Math.abs(sprite.y - point.y);
            }

            if (sprite.y < point.y) {
                sprite.y += stepY;
            } else if (sprite.y > point.y) {
                sprite.y -= stepY;
            }

            if (sprite.x === point.x && sprite.y === point.y) {
                return;

            }/* else {
                //this.appLayoutLandscape.updateTransform();
                setTimeout(() => {
                    this.moveSmooth(sprite, point);
                }, 1);
            }*/
        },

        getColorForPercentage3(percent: number) {
            const r = Math.floor(0xFF * percent);
            const g = Math.floor(0xFF * percent);
            const b = Math.floor(0xFF * percent);

            return r * 0x010000 + g * 0x000100 + b * 0x000001;
        },

        getPercentageForHeight(height: number) {
            const maxHeight = 25;
            const minHeight = 50;

            height = height + minHeight;
            if (height > minHeight + maxHeight) {
                height = minHeight + maxHeight;
            } else if (height <= 0) {
                height = 1;
            }

            return height / (minHeight + maxHeight);
        },

        // check https://github.com/kittykatattack/smoothie
        render() {
            if (this.stopped) {
                console.log('Commit stop');

                return;
            }

            const timer = new Date();

            this.drawAll();

            const frameTime = new Date().getTime() - timer.getTime();

            if (frameTime >= 1000 / maxFps) {
                console.warn(`Frame time is ${frameTime}ms`);
                this.fps = Math.round(1000 / frameTime);
                this.render();

            } else {
                setTimeout(() => {
                    /*
                    const frameTime2 = new Date().getTime() - timer.getTime();
                    this.fps = Math.round(1000 / frameTime2);
                    */
                    this.fps = maxFps;

                    this.render();
                }, 1000 / maxFps - frameTime);
            }
        },

        drawAll() {
            // Обрезать лишние
            // Вставить все пришедшие

            /*
            console.log(`cells: ${this.data.cells.size} (${this.view.cells.size})`);
            console.log(`cellObjects: ${this.data.cellObjects.size} (${this.view.cellObjects.size})`);
            console.log(`entities: ${this.data.entities.size} (${this.view.entities.size})`);
            */

            /*
            const spritesToRemove = [];
            const spritesToAdd = [];
            */

            for (const key of this.data.cells.keys()) {
                const p: Point2D = JSON.parse(key);

                if ((p.x < this.zero.x || p.x > (this.zero.x + this.worldWidth - 1))
                    || (p.y < this.zero.y || p.y > (this.zero.y + this.worldHeight - 1))) {

                    this.data.cells.delete(key);

                    if (this.view.cells.get(key)) {
                        const sprite: PIXI.Sprite = this.view.cells.get(key) as PIXI.Sprite; // FIXME: why as?

                        //this.appLayoutLandscape.removeChild(sprite);
                        //spritesToRemove.push(sprite);
                        sprite.visible = false;

                        this.view.cells.delete(key);
                    }

                } else {
                    const cell: WorldCell = this.data.cells.get(key) as WorldCell; // FIXME: why as?

                    if (!cell.rendered) {
                        // TODO: if cell type changed
                        // TODO: if sprite already exist
                        const textureName = cell.cellType.toLowerCase();
                        const texture = PIXI.Texture.from(textureName);
                        const sprite = new PIXI.Sprite(texture);

                        sprite.x = p.x * cellSize;
                        sprite.y = p.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0);
                        sprite.zIndex = p.y + p.x;
                        sprite.tint = this.getColorForPercentage3(this.getPercentageForHeight(cell.height));

                        cell.rendered = true;

                        this.view.cells.set(key, sprite);

                        this.appLayoutLandscape.addChild(sprite);
                        //spritesToAdd.push(sprite);
                    } else {
                        //console.log('cell already rendered');
                    }
                }
            }

            for (const key of this.data.cellObjects.keys()) {
                const p: Point2D = JSON.parse(key);

                if ((p.x < this.zero.x || p.x > (this.zero.x + this.worldWidth - 1))
                    || (p.y < this.zero.y || p.y > (this.zero.y + this.worldHeight - 1))) {

                    this.data.cellObjects.delete(key);

                    if (this.view.cellObjects.get(key)) {
                        const sprite: PIXI.Sprite = this.view.cellObjects.get(key) as PIXI.Sprite;  // FIXME: why as?

                        //this.appLayoutLandscape.removeChild(sprite);
                        //spritesToRemove.push(sprite);
                        sprite.visible = false;

                        this.view.cellObjects.delete(key);
                    }

                } else {
                    const cellObject: CellObject = this.data.cellObjects.get(key) as CellObject;  // FIXME: why as?

                    if (!cellObject) {
                        continue;
                    }

                    if (!cellObject.rendered) {
                        // TODO: if cellObject type changed
                        // TODO: if sprite already exist
                        const textureName = cellObject.cellObjectType.toLowerCase();
                        const texture = PIXI.Texture.from(textureName);
                        const sprite = new PIXI.Sprite(texture);

                        sprite.x = p.x * cellSize;
                        sprite.y = p.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0);
                        sprite.zIndex = p.y + p.x;
                        //sprite.tint = this.getColorForPercentage3(this.getPercentageForHeight(cell.height));

                        cellObject.rendered = true;

                        this.view.cellObjects.set(key, sprite);

                        this.appLayoutLandscape.addChild(sprite);
                        //spritesToAdd.push(sprite);
                    } else {
                        //console.log('cell object already rendered');
                    }
                }
            }

            for (const key of this.data.entities.keys()) {
                const entity: Entity = this.data.entities.get(key) as Entity; // FIXME: why as?

                if ((entity.x < this.zero.x || entity.x > (this.zero.x + this.worldWidth - 1))
                    || (entity.y < this.zero.y || entity.y > (this.zero.y + this.worldHeight - 1))) {

                    this.data.entities.delete(key);

                    if (this.view.entities.get(key)) {
                        const sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;  // FIXME: why as?

                        //this.appLayoutLandscape.removeChild(sprite);
                        //spritesToRemove.push(sprite);
                        sprite.visible = false;

                        this.view.entities.delete(key);
                    }

                } else {
                    if (!entity) {
                        continue;
                    }

                    if (!entity.rendered) {
                        const textureName = 'entity';
                        const texture = PIXI.Texture.from(textureName);
                        let sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;

                        if (!sprite) {
                            sprite = new PIXI.Sprite(texture);

                            this.view.entities.set(key, sprite);

                            this.appLayoutLandscape.addChild(sprite);
                            //spritesToAdd.push(sprite);
                        }

                        //sprite.x = entity.x * cellSize;
                        //sprite.y = entity.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0);
                        sprite.zIndex = entity.y + entity.x + 20;

                        // TODO: move stepped only if it is not creation
                        this.moveSmooth(sprite, new Point2D(
                            entity.x * cellSize,
                            entity.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0)
                        ));

                        entity.rendered = true;

                    } else {
                        // FIXME: it's smoother but code is not good enough
                        const textureName = 'entity';
                        const texture = PIXI.Texture.from(textureName);
                        const sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;

                        this.moveSmooth(sprite, new Point2D(
                            entity.x * cellSize,
                            entity.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0)
                        ));

                        //console.log('cell object already rendered');
                    }
                }
            }

            /*
            if (spritesToRemove && spritesToRemove.length) {
                // FIXME: 100ms
                //this.appLayoutLandscape.removeChild(...spritesToRemove);

                // FIXME: not deleting it, but if faster
                // 1-2ms
                for (const sprite of spritesToRemove) {
                    if (sprite) {
                        sprite.visible = false;
                    } else {
                        console.error('Attempt to delete sprite that does not exist');
                    }
                }
            }

            if (spritesToAdd && spritesToAdd.length) {
                // 1-2ms
                this.appLayoutLandscape.addChild(...spritesToAdd);
            }
            */

            const targetX = Math.round(this.center.x * cellSize);
            const targetY = Math.round(this.center.y * cellSize);

            this.moveSmooth(this.appLayoutLandscape.pivot, new Point2D(
                targetX,
                targetY
            ));
        }
    }

});
</script>

<style scoped lang='scss'>
    /*
    .cell {
        &__wrapper {
            position: relative;
            margin: 10vw 5vh;
            border: 1px solid lightgray;
            min-height: 200px;
        }

        position: absolute;
        height: 5px;
        width: 5px;
        background-color: gray;
    }
    */

    .world-map {
        width: 100%;
        height: 100%;
        //border: 1px solid gray;

        &__wrapper {
            width: 100%;
            height: 100%;

            //background-color: black;
            background: radial-gradient(circle at bottom, #00212f 0, black 100%);

            //background: rgb(0,0,48);
            //background: radial-gradient(circle, rgba(0,0,48,1) 0%, rgba(0,50,108,1) 100%);
        }

        &__fps {
            position: absolute;
            top: 5px;
            left: 5px;
            background-color: rgba(255, 255, 255, 0.7);
            border: 1px solid gray;
            padding: 5px;
        }
    }
</style>
