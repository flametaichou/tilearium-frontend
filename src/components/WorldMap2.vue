<template>
    <div class="world-map__wrapper">
        <!--
        Canvas
        <div>
            x: {{ appLayoutLandscape.x }}
        </div>
        <div>
            y: {{ appLayoutLandscape.y }}
        </div>
        center
        <div>
            x: {{ center.x }}
        </div>
        <div>
            y: {{ center.y }}
        </div>
        -->
        <!--

            @mouseup="toggleMapMoving"
            @mousedown="toggleMapMoving"
            @mousemove="moveMap2"
            -->
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
    import { $WorldApi } from '@/api/world.api';
    import { Point2D } from '@/classes/point2d';
    import { WorldCell } from '@/classes/world-cell';
    import { Direction } from '@/classes/Direction';
    import { $WebSocketService } from '@/service/websocket.service';
    import { EntityMove } from '@/classes/entity-move';
    import { Entity } from '@/classes/entity';
    import { CellObject } from '@/classes/cell-object';

    const cellSize = 32;

    export default defineComponent({
        name: 'WorldMap',

        props: {
            id: String
        },

        data() {
            return {
                loading: false as boolean,

                app: new PIXI.Application() as PIXI.Application,
                appLayoutLandscape: new PIXI.Container() as PIXI.Container,

                //world: undefined as World | undefined,

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
            console.log(typeof this);
            console.log(Object.getPrototypeOf(this));

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

            PIXI.Texture.addToCache(PIXI.Texture.from('/entity.png'), 'entity');

            this.loadWorld();

            $WebSocketService.subscribe(
                '/entity',
                (entityMove: EntityMove) => {
                    this.drawEntity(entityMove);
                },
                false
            );

            document.addEventListener('keydown', this.onKeyPressed);
        },

        beforeUnmount(): void {
            alert('destroy');
            document.removeEventListener('keydown', this.onKeyPressed);
        },

        methods: {
            onKeyPressed(event: KeyboardEvent): void {
                switch (event.code) {
                    case 'ArrowUp':
                        this.moveMap2(2);
                        break;
                    case 'ArrowDown':
                        this.moveMap2(3);
                        break;
                    case 'ArrowLeft':
                        this.moveMap2(0);
                        break;
                    case 'ArrowRight':
                        this.moveMap2(1);
                        break;
                    default:
                        break;
                }
            },

            moveMap2(direction: Direction) {
                let time: Date = new Date();

                const from: Point2D = new Point2D(
                    direction === Direction.LEFT
                        ? this.zero.x - 1
                        : (direction === Direction.RIGHT ? this.zero.x + this.worldWidth : this.zero.x),
                    direction === Direction.DOWN
                        ? this.zero.y - 1
                        : (direction === Direction.UP ? this.zero.y + this.worldHeight : this.zero.y)
                );

                const loadingWidth = direction === Direction.LEFT || direction === Direction.RIGHT ? 1 : this.worldWidth;
                const loadingHeight = direction === Direction.DOWN || direction === Direction.UP ? 1 : this.worldHeight;

                this.loading = true;

                $WorldApi.getPart(this.id as string, from, loadingWidth, loadingHeight).then(
                    (response) => {
                        console.log('Запрос (+): ' + (new Date().getTime() - time.getTime()) + 'мс');
                        time = new Date();

                        switch (direction) {
                            case Direction.LEFT:
                                this.center.x--;
                                break;

                            case Direction.RIGHT:
                                this.center.x++;
                                break;

                            case Direction.DOWN:
                                this.center.y--;
                                break;

                            case Direction.UP:
                                this.center.y++;
                                break;
                        }

                        //this.world.addCells(response.data.cells);
                        console.log('cells (+): ' + response.data.cells.length);
                        console.log('cellObjects (+): ' + response.data.cellObjects.length);
                        this.cells = new Map([...this.cells, ...this.transformCells(response.data.cells)]);
                        this.cellObjects = new Map([...this.cellObjects, ...this.transformCellObjects(response.data.cellObjects)]);

                        //this.drawCells(from, loadingWidth, loadingHeight);
                        //this.drawObjects(from, loadingWidth, loadingHeight);

                        this.clearPixi(); // TODO: если не чистить - будет зависать, а если чистить - лишние перерисовки одного и того же
                        this.drawCells(this.zero, this.worldWidth, this.worldHeight);
                        this.drawObjects(this.zero, this.worldWidth, this.worldHeight);

                        this.centerPixi();
                        console.log('Рендер (+): ' + (new Date().getTime() - time.getTime()) + 'мс');

                        this.loading = false;
                    },
                    (error) => {
                        this.loading = false;
                        alert(error);
                    }
                );
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
                this.loading = true;

                let time: Date = new Date();

                $WorldApi.getPart(this.id as string, this.zero, this.worldWidth, this.worldHeight).then(
                    (response) => {
                        console.log('Запрос: ' + (new Date().getTime() - time.getTime()) + 'мс');
                        time = new Date();
                        //this.world = new World(response.data.id, response.data.name, response.data.cells);
                        this.cells = this.transformCells(response.data.cells);
                        this.cellObjects = this.transformCellObjects(response.data.cellObjects);

                        this.clearPixi();
                        this.drawCells(this.zero, this.worldWidth, this.worldHeight);
                        this.drawObjects(this.zero, this.worldWidth, this.worldHeight);
                        this.centerPixi();
                        console.log('Рендер: ' + (new Date().getTime() - time.getTime()) + 'мс');

                        this.loading = false;
                    },
                    (error) => {
                        this.loading = false;
                        alert(error);
                    }
                );
            },

            redwaw() {

            },

            drawEntity(entityMove: EntityMove) {
                console.log(entityMove);

                let found = false;

                for (const [entityId, entity] of this.entities) {
                    if (entityId === entityMove.id) {
                        console.log('found entity');

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

                    this.appLayoutLandscape.addChild(sprite);

                    this.entities.set(entity.id, entity);
                }

                this.appLayoutLandscape.updateTransform();
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
                this.appLayoutLandscape.addChild(zeroText);

                this.appLayoutLandscape.updateTransform();
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
                    console.log('cells: ' + this.cells.size);

                    for (let { x } = start; x < start.x + width; x++) {
                        for (let { y } = start; y < start.y + height; y++) {

                            setTimeout(() => {
                                const coordinates: Point2D = new Point2D(x, y);
                                const cell: WorldCell = this.cells.get(JSON.stringify(coordinates));

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

                                    this.appLayoutLandscape.addChild(sprite);
                                } else {
                                    console.log('cell already rendered');
                                }
                            }, 5);

                            //console.log('x: ' + cell.x + ', y:' + cell.y + ' ready');

                        }
                    }

                    this.appLayoutLandscape.updateTransform();
                }
            },

            drawObjects(start: Point2D, width: number, height: number) {
                if (this.cellObjects) {
                    console.log('cellObjects: ' + this.cells.size);

                    for (let { x } = start; x < start.x + width; x++) {
                        for (let { y } = start; y < start.y + height; y++) {

                            setTimeout(() => {
                                const coordinates: Point2D = new Point2D(x, y);
                                const cellObject: CellObject = this.cellObjects.get(JSON.stringify(coordinates));

                                if (!cellObject) {
                                    return;
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

                                    this.appLayoutLandscape.addChild(sprite);
                                } else {
                                    console.log('cell object already rendered');
                                }

                            }, 5);

                            //console.log('x: ' + cell.x + ', y:' + cell.y + ' ready');
                        }
                    }

                    this.appLayoutLandscape.updateTransform();
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
