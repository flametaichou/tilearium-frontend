<template>
    <div class="world-map__wrapper">
        <canvas
            id="pixi"
            class="world-map"
        ></canvas>

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

const cellSize = 32;

export default defineComponent({
    name: 'WorldMap',

    props: {
        id: String
    },

    data() {
        return {
            loading: false as boolean,

            timer: new Date as Date,

            app: new PIXI.Application() as PIXI.Application,
            appLayoutLandscape: new PIXI.Container() as PIXI.Container,

            //world: undefined as World | undefined,

            hints: [
                new Point2D(-11, -11),
                new Point2D(-11, 11)
            ],

            cells: new Map() as Map<string, WorldCell>,
            cellObjects: new Map() as Map<string, CellObject>,
            entities: new Map() as Map<string, Entity>,
            center: new Point2D(0, 0) as Point2D
        };
    },

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

        this.loadWorld();

        $WebSocketService.init().then(() => {
            $WebSocketService.subscribe(
                '/game',
                (notification: WSNotification) => {
                    switch (notification.type) {
                        case 'MAP_PART':
                            // Обрезать лишние
                            // Вставить все пришедшие

                            console.log(`Answer time: ${new Date().getTime() - this.timer.getTime()}ms`);

                            this.timer = new Date();

                            const worldPart: WorldPart = notification.body as WorldPart;

                            this.center = worldPart.center;

                            const cells: WorldCell[] = worldPart.cells;

                            this.cells = new Map([...this.cells, ...this.transformCells(cells)]);

                            console.log(`Prepare cells 1 time: ${new Date().getTime() - this.timer.getTime()}ms`);

                            this.timer = new Date();

                            for (const key of this.cells.keys()) {
                                const p: Point2D = JSON.parse(key);

                                if ((p.x < this.zero.x || p.x > (this.zero.x + this.worldWidth - 1))
                                    || (p.y < this.zero.y || p.y > (this.zero.y + this.worldHeight - 1))) {

                                    const sprite = this.cells.get(key).sprite;

                                    setTimeout(() => {
                                        this.appLayoutLandscape.removeChild(sprite);
                                    });
                                    this.cells.delete(key);
                                }
                            }

                            // FIXME: the most time here
                            console.log(`Prepare cells 2 time: ${new Date().getTime() - this.timer.getTime()}ms`);

                            this.timer = new Date();

                            this.drawCells(this.zero, this.worldWidth - 1, this.worldHeight - 1);

                            console.log(worldPart);

                            console.log(`Draw cells time: ${new Date().getTime() - this.timer.getTime()}ms`);

                            this.timer = new Date();

                            const cellObjects: CellObject[] = worldPart.cellObjects;

                            this.cellObjects = new Map([...this.cellObjects, ...this.transformCellObjects(cellObjects)]);

                            for (const key of this.cellObjects.keys()) {
                                const p: Point2D = JSON.parse(key);

                                if ((p.x < this.zero.x || p.x > (this.zero.x + this.worldWidth - 1))
                                    || (p.y < this.zero.y || p.y > (this.zero.y + this.worldHeight - 1))) {

                                    const sprite = this.cellObjects.get(key).sprite;

                                    setTimeout(() => {
                                        this.appLayoutLandscape.removeChild(sprite);
                                    });
                                    this.cellObjects.delete(key);
                                }
                            }

                            console.log(`Prepare objects time: ${new Date().getTime() - this.timer.getTime()}ms`);

                            this.timer = new Date();

                            this.drawObjects(this.zero, this.worldWidth - 1, this.worldHeight - 1);

                            console.log(`Draw objects time: ${new Date().getTime() - this.timer.getTime()}ms`);

                            this.timer = new Date();

                            /*
                            console.log('size: ' + this.worldWidth * this.worldHeight);
                            console.log('cells: ' + this.cells.size);
                            console.log('layout: ' + this.appLayoutLandscape.children.length);
                             */

                            this.centerPixi();
                            console.log(`Other time: ${new Date().getTime() - this.timer.getTime()}ms`);
                            this.loading = false;
                            break;

                        case 'ENTITY':
                            const entityMove: EntityMove = notification.body as EntityMove;

                            /*
                            if (entityMove.type === 'ENTITY_PLAYER') {
                                // set center
                            }
                            */

                            this.drawEntity(entityMove);

                            break;

                        case 'CELL_OBJECT':
                            const cellObject: EntityMove = notification.body as EntityMove;

                            //TODO: draw

                            break;

                        default:
                            alert('UNKNOWN NOTIFICATION: ' + notification.type);
                    }
                },
                false
            );

            this.loading = true;
            this.timer = new Date();
            $WebSocketService.send('/game/map-control', {
                type: 'SET_SETTINGS',
                body: {
                    worldId: this.id,
                    width: this.worldWidth,
                    height: this.worldHeight
                }
            });
        });

        document.addEventListener('keydown', this.onKeyPressed);
    },

    beforeUnmount(): void {
        document.removeEventListener('keydown', this.onKeyPressed);
    },

    methods: {
        onKeyPressed(event: KeyboardEvent): void {
            switch (event.code) {
                case 'ArrowUp':
                    this.movePlayer(Direction.UP);
                    break;
                case 'ArrowDown':
                    this.movePlayer(Direction.DOWN);
                    break;
                case 'ArrowLeft':
                    this.movePlayer(Direction.LEFT);
                    break;
                case 'ArrowRight':
                    this.movePlayer(Direction.RIGHT);
                    break;
                default:
                    break;
            }
        },

        movePlayer(direction: Direction) {
            if (this.loading) {
                console.error('already loading!');

                return;
            }

            //this.loading = true;

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

            console.log(`Move ${dir}, new center is ${JSON.stringify(this.center)}, new zero is ${JSON.stringify(this.zero)}`);

            this.timer = new Date();

            $WebSocketService.send('/game/map-control', {
                type: 'MOVE_PLAYER',
                body: {
                    direction: dir
                }
            });
        },

        moveMap2(direction: Direction) {
            alert('MOVE MAP');
            if (this.loading) {
                console.error('already loading!');

                return;
            }

            this.loading = true;

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

            this.timer = new Date();

            $WebSocketService.send('/game/map-control', {
                type: 'MOVE_MAP',
                body: {
                    direction: dir,
                    step: 1
                }
            });
        },

        // eslint-disable-next-line @typescript-eslint/ban-types
        transformCells: function (cells: WorldCell[]): Map<string, WorldCell> {
            const time: Date = new Date();

            const cellsMap: Map<string, WorldCell> = new Map<string, WorldCell>();

            for (let cellCounter = 0; cellCounter < cells.length; cellCounter++) {
                const cell: WorldCell = cells[cellCounter];
                const point: Point2D = new Point2D(cell.x, cell.y);

                cellsMap.set(JSON.stringify(point), cell);
            }

            console.log('Преобразование: ' + (new Date().getTime() - time.getTime()) + 'мс');

            return cellsMap;
        },

        transformCellObjects: function (cells: CellObject[]): Map<string, CellObject> {
            const time: Date = new Date();

            const cellsMap: Map<string, CellObject> = new Map<string, CellObject>();

            for (let cellCounter = 0; cellCounter < cells.length; cellCounter++) {
                const cell: CellObject = cells[cellCounter];
                const point: Point2D = new Point2D(cell.x, cell.y);

                cellsMap.set(JSON.stringify(point), cell);
            }

            console.log('Преобразование 2: ' + (new Date().getTime() - time.getTime()) + 'мс');

            return cellsMap;
        },

        loadWorld: function () {

        },

        redwaw() {

        },

        drawEntity(entityMove: EntityMove) {
            let found = false;

            for (const [entityId, entity] of this.entities) {
                if (entityId === entityMove.id) {
                    found = true;
                    entity.x = entityMove.x;
                    entity.y = entityMove.y;

                    const textureName = 'entity';
                    const texture = PIXI.Texture.from(textureName);

                    entity.sprite.x = entity.x * cellSize;
                    entity.sprite.y = entity.y * cellSize - (texture.height - cellSize);
                    entity.sprite.zIndex = entity.y + entity.x + 20;
                }
            }

            if (!found) {
                console.log('create entity');

                const entity: Entity = new Entity(entityMove.id, entityMove.x, entityMove.y);

                const textureName = 'entity';
                const texture = PIXI.Texture.from(textureName);
                const sprite = new PIXI.Sprite(texture);

                sprite.x = entity.x * cellSize;
                sprite.y = entity.y * cellSize - (texture.height - cellSize);
                sprite.zIndex = entity.y + entity.x + 20;

                entity.sprite = sprite;

                console.log('Added new entity sprite');
                this.appLayoutLandscape.addChild(sprite);

                this.entities.set(entity.id, entity);
            }

            //this.appLayoutLandscape.updateTransform();
        },

        clearPixi() {
            for (const cell of this.cells.values()) {
                if (cell.sprite) {
                    cell.sprite = undefined;
                }
            }

            for (const cellObject of this.cellObjects.values()) {
                if (cellObject.sprite) {
                    cellObject.sprite = undefined;
                }
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
            this.appLayoutLandscape.x = this.app.screen.width / 2;
            this.appLayoutLandscape.y = this.app.screen.height / 2;

            // Center bunny sprite in local container coordinates
            this.appLayoutLandscape.pivot.x = this.center.x * cellSize;
            this.appLayoutLandscape.pivot.y = this.center.y * cellSize;
        },

        /**
         * TODO: выгружать ячейки которые не видно
         * TODO: не рисовать ячейки которые уже нарисованы
         *
         * @param start
         * @param width
         * @param height
         * @param clear
         */
        drawCells(start: Point2D, width: number, height: number) {
            if (this.cells) {
                for (let { x } = start; x <= start.x + width; x++) {
                    for (let { y } = start; y <= start.y + height; y++) {
                        const coordinates: Point2D = new Point2D(x, y);
                        const cell: WorldCell = this.cells.get(JSON.stringify(coordinates));

                        if (!cell) {
                            const error = `No cell at coords x:${x}, y:${y}! Zero:${JSON.stringify(start)}, width:${width}, height:${height}`;

                            console.error(error);
                            continue;
                        }

                        if (!cell.sprite) {
                            // TODO: if cell type changed
                            const textureName = cell.cellType.toLowerCase();
                            const texture = PIXI.Texture.from(textureName);
                            const sprite = new PIXI.Sprite(texture);

                            sprite.x = coordinates.x * cellSize;
                            sprite.y = coordinates.y * cellSize - (texture.height - cellSize);
                            sprite.zIndex = coordinates.y + coordinates.x;
                            sprite.tint = this.getColorForPercentage3(this.getPercentageForHeight(cell.height));

                            cell.sprite = sprite;

                            setTimeout(() => {
                                this.appLayoutLandscape.addChild(sprite);
                            });
                        } else {
                            //console.log('cell already rendered');
                        }
                    }
                }

                //this.appLayoutLandscape.updateTransform();
            }
        },

        drawObjects(start: Point2D, width: number, height: number) {
            if (this.cellObjects) {
                for (let { x } = start; x <= start.x + width; x++) {
                    for (let { y } = start; y <= start.y + height; y++) {
                        const coordinates: Point2D = new Point2D(x, y);
                        const cellObject: CellObject = this.cellObjects.get(JSON.stringify(coordinates));

                        if (!cellObject) {
                            continue;
                        }

                        if (!cellObject.sprite) {
                            // TODO: if cellObject type changed
                            const textureName = cellObject.cellObjectType.toLowerCase();
                            const texture = PIXI.Texture.from(textureName);
                            const sprite = new PIXI.Sprite(texture);

                            sprite.x = coordinates.x * cellSize;
                            sprite.y = coordinates.y * cellSize - (texture.height - cellSize);
                            sprite.zIndex = coordinates.y + coordinates.x;
                            //sprite.tint = this.getColorForPercentage3(this.getPercentageForHeight(cell.height));

                            cellObject.sprite = sprite;

                            setTimeout(() => {
                                this.appLayoutLandscape.addChild(sprite);
                            });
                        } else {
                            //console.log('cell object already rendered');
                        }
                    }
                }

                //this.appLayoutLandscape.updateTransform();
            }
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
        }
    }

});
</script>

<style scoped lang='scss'>
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

    .world-map {
        //width: 100%;
        height: 100%;
        border: 1px solid gray;

        &__wrapper {
            //width: 100%;
            height: 100%;
        }
    }
</style>
