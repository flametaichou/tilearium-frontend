import { ActionKey } from '@/classes/action-key';
import * as PIXI from 'pixi.js';
import { Point2D } from '@/classes/point2d';
import { WorldCell } from '@/classes/world-cell';
import { CellObject, CellObjectMove, ObjectTree } from '@/classes/cell-object';
import { Entity } from '@/classes/entity';
import { Container } from 'pixi.js';
import { Assets } from 'pixi.js';
import { webSocketService } from '@/service/websocket.service';
import { WSNotification } from '@/classes/notification';
import { WorldPart } from '@/classes/worldpart';
import { EntityMove } from '@/classes/entity-move';
import { removeFromArray } from '@/utils/array-utils';
import { IPointData } from 'pixi.js';
import { dialogService } from '@/service/dialog.service';
import { Path } from '@/classes/path';
import { LogEvent } from '@/classes/log-event';
import { DebugContainer } from './debug-container';
import { LogContainer } from './log-container';
import { ActionsContainer } from './actions-container';
import { TreasureMapContainer } from './treasure-map-container';

const cellSize = 32;
const maxFps = 60;
const debugMode = false;

// Chunks can be useful to work with smaller arrays (faster)
const chunkSize = 16;

const spritesPath = '/sprites/';
const mapSpritesPath = '/sprites-map/';

export class WorldSimGame {
    id: string;
    wrapper: HTMLDivElement;
    canvas: HTMLCanvasElement;
    ui: HTMLDivElement;
    uiUpdateIntervalId: number;

    logContainer: LogContainer;
    info: HTMLDivElement;
    actions: ActionsContainer;
    debug: DebugContainer;
    treasureMapContainer: TreasureMapContainer;

    initializing: boolean;
    loading: boolean;
    initialized: boolean;
    stopped: boolean;
    fps: number;
    log: string[];

    keysPressed:  string[];
    keysMapping: { [key: string]: ActionKey };

    app:  PIXI.Application;
    // TODO: rename to stage
    container:  PIXI.Container;

    /*
    ui:  PIXI.Container;
    uiTimer: PIXI.Text;
    uiInventory: PIXI.Container;
    uiQuest: PIXI.Container;
    */

    chunks: Map<string, PIXI.Container>;

    textures:  Map<string, string>;
    textureRegistry:  Map<string, PIXI.Texture>;

    //world: undefined as World | undefined;

    hints: Point2D[];

    center: Point2D;

    data: {
        cells: Map<string, WorldCell>,
        cellObjects: Map<string, CellObject>,
        entities: Map<string, Entity>,
        effects: Map<string, string>
    };

    viewData: {
        cells: Map<string, WorldCell>,
        cellObjects: Map<string, CellObject>,
        entities: Map<string, Entity>,
        effects: Map<string, string>
    };

    view: {
        cells: Map<string, PIXI.Sprite>,
        cellObjects: Map<string, PIXI.Sprite>,
        entities: Map<string, PIXI.Sprite>,
        effects: Map<string, PIXI.Sprite>
    };

    treasureMap: {
        cells: Map<string, WorldCell>,
        cellObjects: Map<string, CellObject>
    };

    worldWidth: number;
    worldHeight: number;
    zero: Point2D;

    /*
    get worldWidth(): number {
        return Math.ceil(this.app.screen.width / cellSize) + 1;
    };

    get worldHeight(): number {
        return Math.ceil(this.app.screen.height / cellSize) + 1;
    };

    get zero(): Point2D {
        return new Point2D(
            this.center.x - Math.ceil(this.worldWidth / 2),
            this.center.y - Math.ceil(this.worldHeight / 2)
        );
    };
    */

    constructor(wrapper: HTMLDivElement, id: string) {
        this.id = id;

        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('game__canvas');
        
        this.wrapper = wrapper;
        this.wrapper.classList.add('game__wrapper');
        this.wrapper.appendChild(this.canvas);

        this.debug = new DebugContainer(this);
        this.logContainer = new LogContainer(this);
        this.actions = new ActionsContainer(this);

        /*
        const dialogMessage = document.createElement('div');
        const content = document.createTextNode('Hi there and greetings!');

        dialogMessage.classList.add('game-dialog');
        dialogMessage.appendChild(content);

        this.canvas.appendChild(dialogMessage);
        //document.body.insertBefore(this.canvas, dialogMessage);
        */

        this.keysPressed = [];
        this.keysMapping = {
            'ArrowUp': ActionKey.MOVE_UP,
            'KeyW': ActionKey.MOVE_UP,

            'ArrowDown': ActionKey.MOVE_DOWN,
            'KeyS': ActionKey.MOVE_DOWN,

            'ArrowLeft': ActionKey.MOVE_LEFT,
            'KeyA': ActionKey.MOVE_LEFT,

            'ArrowRight': ActionKey.MOVE_RIGHT,
            'KeyD': ActionKey.MOVE_RIGHT
        };

        this.chunks = new Map();
        this.textures = new Map();
        this.textureRegistry = new Map();

        this.hints = [
            new Point2D(-11, -11),
            new Point2D(-11, 11)
        ];

        this.center = new Point2D(0, 0);
        this.updateZero();

        this.data = {
            cells: new Map() as Map<string, WorldCell>,
            cellObjects: new Map() as Map<string, CellObject>,
            entities: new Map() as Map<string, Entity>,
            effects: new Map() as Map<string, string>
        };

        this.viewData = {
            cells: new Map() as Map<string, WorldCell>,
            cellObjects: new Map() as Map<string, CellObject>,
            entities: new Map() as Map<string, Entity>,
            effects: new Map() as Map<string, string>
        };

        this.view = {
            cells: new Map() as Map<string, PIXI.Sprite>,
            cellObjects: new Map() as Map<string, PIXI.Sprite>,
            entities: new Map() as Map<string, PIXI.Sprite>,
            effects: new Map() as Map<string, PIXI.Sprite>
        };

        this.treasureMap = {
            cells: new Map() as Map<string, WorldCell>,
            cellObjects: new Map() as Map<string, CellObject>
        };
    }

    stop(): void {
        this.stopped = true;
        document.removeEventListener('keydown', this.onKeyPressed);
        clearInterval(this.uiUpdateIntervalId);
        // TODO: logout, remove session
    }

    async init(): Promise<void> {
        this.initializing = true;

        this.app = new PIXI.Application({
            width: this.canvas.clientWidth,
            height: this.canvas.clientHeight,
            //antialias: true,
            view: this.canvas
            //clearBeforeRender: false
            //background: '#1099bb',
            //resizeTo: window
        });

        this.updateWorldSize();
        this.updateZero();

        //this.app.ticker.stop();

        //console.log(this.app.renderer);

        console.log(this.app.renderer.options);

        /*
        await this.app.init({
                width: this.canvas.clientWidth,
                height: this.canvas.clientHeight,
                antialias: true,
                canvas: this.canvas
                //background: '#1099bb',
                //resizeTo: window
        });
        */

        this.container = new Container();
        this.container.sortableChildren = true;
        this.container.x = this.app.screen.width / 2;
        this.container.y = this.app.screen.height / 2;
        this.container.interactive = true;
        this.container.on('click', (e) => this.sendMouseClicked(e, this.zero));

        this.app.stage.addChild(this.container as PIXI.Container);

        /*
        this.ui = new Container();

        this.uiTimer = new PIXI.Text(
            '20:00',
            { fontSize: 32 }
        );

        this.uiTimer.x = 0;
        this.uiTimer.y = 0;
        this.uiTimer.zIndex = 9999;
        this.ui.addChild(this.uiTimer);

        this.uiInventory = new PIXI.Container();
        this.ui.addChild(this.uiInventory);

        this.uiQuest = new PIXI.Container();
        this.ui.addChild(this.uiQuest);

        this.app.stage.addChild(this.ui as PIXI.Container);
        */

        // Init textures
        this.loadTexture('grass', 'cell');
        this.loadTexture('dirt', 'cell');
        this.loadTexture('sand', 'cell');
        this.loadTexture('water', 'cell');
        this.loadTexture('ice', 'cell');
        this.loadTexture('snow', 'cell');
        this.loadTexture('leaves', 'cell');

        this.loadTexture('tree', 'object');
        this.loadTexture('tree_cactus', 'object');
        this.loadTexture('tree_maple', 'object');
        this.loadTexture('tree_oak', 'object');
        this.loadTexture('tree_palm', 'object');
        this.loadTexture('tree_pine', 'object');
        this.loadTexture('tree_poplar', 'object');
        this.loadTexture('tree_spruce', 'object');
        this.loadTexture('tree_willow', 'object');

        this.loadTexture('dead_tree', 'object');
        this.loadTexture('dead_tree_tree', 'object');
        this.loadTexture('dead_tree_log', 'object');
        this.loadTexture('dead_tree_stump', 'object');

        this.loadTexture('bush', 'object');

        this.loadTexture('grass_tall_grass', 'object');

        this.loadTexture('flower_daisy', 'object');

        this.loadTexture('mushroom_brown', 'object');
        this.loadTexture('mushroom_red', 'object');

        this.loadTexture('water_plant_water_lily', 'object');
        this.loadTexture('water_plant_cattail', 'object');

        this.loadTexture('cliff', 'object');
        this.loadTexture('rock', 'object');
        this.loadTexture('storage', 'object');
        this.loadTexture('house', 'object');
        this.loadTexture('wall', 'object');
        this.loadTexture('road', 'object', true);

        this.loadTexture('entity_villager', 'entity');
        this.loadTexture('entity_player', 'entity');
        this.loadTexture('entity_item', 'entity');
        this.loadTexture('empty');
        this.loadTexture('path');

        // ---

        /*
        this.loadTreasureMapTexture('grass', 'cell');
        this.loadTreasureMapTexture('dirt', 'cell');
        this.loadTreasureMapTexture('sand', 'cell');
        this.loadTreasureMapTexture('water', 'cell');
        this.loadTreasureMapTexture('ice', 'cell');
        this.loadTreasureMapTexture('snow', 'cell');
        this.loadTreasureMapTexture('leaves', 'cell');

        this.loadTreasureMapTexture('tree', 'object');
        this.loadTreasureMapTexture('dead_tree', 'object');
        this.loadTreasureMapTexture('bush', 'object');
        this.loadTreasureMapTexture('grass', 'object');
        this.loadTreasureMapTexture('flower', 'object');
        this.loadTreasureMapTexture('mushroom', 'object');
        this.loadTreasureMapTexture('water_plant', 'object');
        this.loadTreasureMapTexture('cliff', 'object');
        this.loadTreasureMapTexture('rock', 'object');
        this.loadTreasureMapTexture('storage', 'object');
        this.loadTreasureMapTexture('house', 'object');
        this.loadTreasureMapTexture('road', 'object');

        this.loadTreasureMapTexture('empty');
        */

        for (const textureName of this.textures.keys()) {
            //PIXI.Assets.load(this.textures.get(textureName));
            //PIXI.Texture.addToCache(texture, textureName);

            //var tile = PIXI.Sprite.fromFrame(filename);
            //var tile = PIXI.Sprite.fromImage(filename);

            try {
                await Assets.load(this.textures.get(textureName)).then((result) => {
                    //const texture: PIXI.Texture = PIXI.Texture.from(this.textures.get(textureName), true);
                    this.textureRegistry.set(textureName, result);
                });
            
            } catch (e) {
                console.error('Error on loading texture: ' + textureName);

                await Assets.load(this.textures.get('empty')).then((result) => {
                    this.textureRegistry.set(textureName, result);
                });
            }
        }

        this.clearPixi();

        webSocketService.init().then(() => {
            webSocketService.subscribe(
                (notification: WSNotification) => {
                    switch (notification.type) {
                        case 'MAP_PART':
                            const worldPart: WorldPart = notification.body as WorldPart;

                            this.center = worldPart.center;
                            this.updateZero();

                            if (!this.initialized) {
                                this.initialized = true;
                                this.centerPixi();
                            }

                            const cells: WorldCell[] = worldPart.cells;

                            this.data.cells = new Map([...this.data.cells, ...this.transformCells(cells)]);
                            this.viewData.cells = new Map([...this.data.cells]);

                            const cellObjects: CellObject[] = worldPart.cellObjects;

                            this.data.cellObjects = new Map([...this.data.cellObjects, ...this.transformCellObjects(cellObjects)]);
                            this.viewData.cellObjects = new Map([...this.data.cellObjects]);

                            const entities: EntityMove[] = worldPart.entities;

                            this.data.entities = new Map([...this.data.entities, ...this.transformEntities(entities as Entity[])]);
                            this.viewData.entities = new Map([...this.data.entities]);

                            console.log('-------------------------------------------');
                            console.log(`Cells size: ${cells.length}`);
                            console.log(`Objects size: ${cellObjects.length}`);

                            console.log(`Container size: ${this.container.children.length}`);

                            console.log(`Chunks count: ${this.chunks.size}`);
                            for (const key of this.chunks.keys()) {
                                console.log(`Chunk ${key} size: ${this.chunks.get(key).children.length }`);
                            }

                            console.log(`Textures count: ${this.textures.size}`);
                            console.log(`Textures registry count: ${this.textureRegistry.size}`);

                            console.log(`Data cells count: ${this.data.cells.size}`);
                            console.log(`Data objects count: ${this.data.cellObjects.size}`);
                            console.log(`Data entities count: ${this.data.entities.size}`);

                            console.log(`View cells count: ${this.view.cells.size}`);
                            console.log(`View objects count: ${this.view.cellObjects.size}`);
                            console.log(`View entities count: ${this.view.entities.size}`);

                            console.log(`Keys pressed count: ${this.keysPressed.length}`);

                            console.log('-------------------------------------------');

                            // 1-2ms here

                            break;

                        case 'ENTITY':
                            const entityMove: EntityMove = notification.body as EntityMove;

                            if (entityMove.action === 'REMOVE') {

                                const sprite: PIXI.Sprite = this.view.entities.get(entityMove.id) as PIXI.Sprite;  // FIXME: why as?
                                
                                this.container.removeChild(sprite);

                                this.data.entities.delete(entityMove.id);
                                this.viewData.entities.delete(entityMove.id);
                                this.view.entities.delete(entityMove.id);

                            } else {
                                // FIXME: sprites can be not removed from pixi
                                this.data.entities = new Map([
                                    ...this.data.entities,
                                    ...this.transformEntities([entityMove as Entity])
                                ]);
                                this.viewData.entities = new Map([...this.data.entities]);
                            }

                            break;

                        case 'CELL_OBJECT':
                            const cellObject: CellObjectMove = notification.body as CellObjectMove;

                            if (cellObject.action === 'REMOVE') {

                                const key = this.getKey(cellObject);
                                const sprite: PIXI.Sprite = this.view.cellObjects.get(key) as PIXI.Sprite;
                                
                                this.container.removeChild(sprite);

                                this.data.cellObjects.delete(key);
                                this.viewData.cellObjects.delete(key);
                                this.view.cellObjects.delete(key);

                            } else {
                                this.data.cellObjects = new Map([
                                    ...this.data.cellObjects,
                                    ...this.transformCellObjects([cellObject as CellObject])
                                ]);
                                this.viewData.cellObjects = new Map([...this.data.cellObjects]);
                            }

                            break;

                        case 'PATH':
                            const pathPacket: Path = notification.body as Path;
    
                            const path: Point2D[] = pathPacket.path;
    
                            // FIXME: do not clean all effects
                            this.data.effects =  this.transformEffects(path as Point2D[]);
                            this.viewData.effects = new Map([...this.data.effects]);

                            break;

                        case 'LOG':
                            const logEvent: LogEvent = notification.body as LogEvent;

                            this.log.push(`[${new Date().toLocaleDateString()}] ${logEvent.message}`);

                            if (this.log.length > 10) {
                                this.log.slice(0, 1);
                            }
    
                            break;

                        case 'TREASURE_MAP':
                            const map: WorldPart = notification.body as WorldPart;

                            this.treasureMap.cells = new Map([...this.transformCells(map.cells)]);
                            this.treasureMap.cellObjects = new Map([...this.transformCellObjects(map.cellObjects)]);
        
                            this.treasureMapContainer = new TreasureMapContainer(this);

                            break;

                        default:
                            dialogService.toastError('UNKNOWN NOTIFICATION: ' + notification.type);
                    }
                },
                false
            );

            webSocketService.send('/game/map-control', {
                type: 'SET_SETTINGS',
                body: {
                    worldId: this.id,
                    width: this.worldWidth,
                    height: this.worldHeight
                }
            });

            this.app.ticker.maxFPS = maxFps;
            this.app.ticker.minFPS = 0;

            this.fps = 0;
            this.app.ticker.add((delta) => {
                const newFps = Math.round(this.app.ticker.FPS);

                if (this.fps < newFps) {
                    this.fps++;

                } else if (this.fps > newFps) {
                    this.fps = newFps;
                }

            }, {}, -100);

            this.app.ticker.add((delta) => {
                this.drawAll();
                this.redrawAll();
                this.clearAll();
            }, {}, -100);

            this.log = [];

            //this.render();

            this.uiUpdateIntervalId = setInterval(() => {
                this.debug.update();
                this.logContainer.update();
            }, 300);
        });

        // TODO: check bind
        document.addEventListener('keydown', this.onKeyPressed.bind(this));
        document.addEventListener('keyup', this.onKeyReleased.bind(this));

        this.initializing = false;
    }

    updateWorldSize() {
        this.worldWidth = Math.ceil(this.app.screen.width / cellSize) + 1;
        this.worldHeight = Math.ceil(this.app.screen.height / cellSize) + 1;
    }

    updateZero() {
        this.zero =  new Point2D(
            this.center.x - Math.ceil(this.worldWidth / 2),
            this.center.y - Math.ceil(this.worldHeight / 2)
        );
    }

    onKeyPressed(event: KeyboardEvent): void {
        const action: ActionKey = this.keysMapping[event.code];

        if (action) {
            if (this.keysPressed.includes(event.code)) {
                return;
            }

            this.keysPressed.push(event.code);

            this.sendKeyPressed(action, true);
        }

        /*
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
        */
    }

    onKeyReleased(event: KeyboardEvent): void {
        const action: ActionKey = this.keysMapping[event.code];

        if (action) {
            if (!this.keysPressed.includes(event.code)) {
                console.error('Key was not pressed but was released: ' + event.code);

                return;
            }

            removeFromArray(this.keysPressed, event.code);

            this.sendKeyPressed(this.keysMapping[event.code], false);
        }
    }

    sendKeyPressed(key: ActionKey, state: boolean) {
        console.log(`[Input] (${new Date().toLocaleTimeString()}) Key: ${key} state: ${state}`);
        webSocketService.send('/game/map-control', {
            type: 'KEY_STATE',
            body: {
                action: key,
                state: state
            }
        });
    }

    sendMouseClicked(event: MouseEvent, zero: Point2D) {
        const point: Point2D = new Point2D(
            zero.x + (event.clientX / cellSize), 
            zero.y + (event.clientY / cellSize)
        );

        console.log(`[Input] (${new Date().toLocaleTimeString()}) Point: ${point}`);

        webSocketService.send('/game/map-control', {
            type: 'MOUSE_INPUT',
            body: {
                button: 'LEFT',
                point: point
            }
        });
    }

    sendMouseClickedOnEntity(event: MouseEvent, entity: Entity) {
        console.log(`[Input] (${new Date().toLocaleTimeString()}) Entity: ${entity}`);

        webSocketService.send('/game/map-control', {
            type: 'MOUSE_INPUT',
            body: {
                button: 'LEFT',
                entityId: entity.id
            }
        });

        event.stopPropagation();
    }

    /*
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

    }

    getKey(point: Point2D): string {
        //return JSON.stringify(point);

        return point.x + ':' + point.y;
    }

    parseKey(key: string): Point2D {
        //return JSON.parse(key);
        const parts = key.split(':');

        return new Point2D(Number(parts[0]), Number(parts[1]));
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    transformCells(cells: WorldCell[]): Map<string, WorldCell> {
        //const time: Date = new Date();

        const cellsMap: Map<string, WorldCell> = new Map<string, WorldCell>();

        for (let cellCounter = 0; cellCounter < cells.length; cellCounter++) {
            const cell: WorldCell = cells[cellCounter];
            const point: Point2D = new Point2D(cell.x, cell.y);

            cellsMap.set(this.getKey(point), cell);
        }

        //console.log('Преобразование: ' + (new Date().getTime() - time.getTime()) + 'мс');

        return cellsMap;
    }

    transformCellObjects(cells: CellObject[]): Map<string, CellObject> {
        //const time: Date = new Date();

        const cellsMap: Map<string, CellObject> = new Map<string, CellObject>();

        for (let cellCounter = 0; cellCounter < cells.length; cellCounter++) {
            const cell: CellObject = cells[cellCounter];
            const point: Point2D = new Point2D(cell.x, cell.y);

            cellsMap.set(this.getKey(point), cell);
        }

        //console.log('Преобразование 2: ' + (new Date().getTime() - time.getTime()) + 'мс');

        return cellsMap;
    }

    transformEntities(entities: Entity[]): Map<string, Entity> {
        const entityMap: Map<string, Entity> = new Map<string, Entity>();

        for (let entityCounter = 0; entityCounter < entities.length; entityCounter++) {
            const entity: Entity = entities[entityCounter];

            entityMap.set(entity.id, entity);
        }

        return entityMap;
    }

    // FIXME: not only path effects
    transformEffects(path: Point2D[]): Map<string, string> {
        const map: Map<string, string> = new Map<string, string>();

        for (let counter = 0; counter < path.length; counter++) {
            const p: Point2D = path[counter];

            map.set(this.getKey(p), 'path');
        }
        
        return map;
    }

    clearPixi() {
        for (const key of this.view.cells.keys()) {
            const sprite: PIXI.Sprite = this.view.cells.get(key) as PIXI.Sprite;

            this.container.removeChild(sprite);
            this.view.cells.delete(key);
        }

        for (const key of this.view.cellObjects.keys()) {
            const sprite: PIXI.Sprite = this.view.cellObjects.get(key) as PIXI.Sprite;

            this.container.removeChild(sprite);
            this.view.cellObjects.delete(key);
        }

        for (const key of this.view.entities.keys()) {
            const sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;

            this.container.removeChild(sprite);
            this.view.entities.delete(key);
        }

        this.container.removeChildren();

        if (debugMode) {
            const zeroText = new PIXI.Text(
                '0:0',
                { fontSize: 24 }
            );

            zeroText.x = 0;
            zeroText.y = 0;
            zeroText.zIndex = 9999;
            console.log('Added new text sprite');
            this.container.addChild(zeroText);

            const zeroLineX = new PIXI.Graphics();

            zeroLineX.lineStyle(2, 0xff0000, 1);
            zeroLineX.moveTo(-10 * cellSize, 0);
            zeroLineX.lineTo(5 * cellSize, 0);
            zeroLineX.zIndex = 9999;
            this.container.addChild(zeroLineX);

            const zeroLineY = new PIXI.Graphics();

            zeroLineY.lineStyle(2, 0xff0000, 1);
            zeroLineY.moveTo(0, -10 * cellSize);
            zeroLineY.lineTo(0, 5 * cellSize);
            zeroLineY.zIndex = 9999;
            this.container.addChild(zeroLineY);

            for (const hint of this.hints) {
                const hintText = new PIXI.Text(
                    JSON.stringify(hint),
                    { fontSize: 12 }
                );

                hintText.x = hint.x * cellSize;
                hintText.y = hint.y * cellSize;
                hintText.zIndex = 9999;
                console.log('Added new hint text sprite');
                this.container.addChild(hintText);
            }
        }

        //this.container.updateTransform();
    }

    centerPixi() {
        // TODO: тут центрирование, разобраться
        // Move container to the center
        //this.container.x = this.app.screen.width / 2;
        //this.container.y = this.app.screen.height / 2;

        // Center bunny sprite in local container coordinates
        this.container.pivot.x = this.center.x * cellSize;
        this.container.pivot.y = this.center.y * cellSize;
    }

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
                //this.container.updateTransform();
                setTimeout(() => {
                    this.moveSmooth(sprite, point);
                }, 1);
            }*/
    }

    getColorForPercentage3(percent: number) {
        const r = Math.floor(0xFF * percent);
        const g = Math.floor(0xFF * percent);
        const b = Math.floor(0xFF * percent);

        return r * 0x010000 + g * 0x000100 + b * 0x000001;
    }

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

    /*
    loadTreasureMapTexture(textureName: string, type?: string): void {
        if (!type) {
            type = '';
        }
        type = type + '/';

        this.textures.set(`${textureName}`, `${mapSpritesPath}${type}${textureName}.png`);
    }
    */

    loadTexture(textureName: string, type?: string, tiling?: boolean): void {
        if (!type) {
            type = '';
        }
        type = type + '/';

        if (tiling) {
            const arr: number[] = [4, 7, 13, 14, 15, 21, 22, 23, 28, 29, 30, 31];

            for (const code of arr) {
                this.textures.set(`${textureName}_${code}`, `${spritesPath}${type}${textureName}_${code}.png`);
                this.textures.set(`${textureName}_alt_${code}`, `${spritesPath}${type}${textureName}_alt_${code}.png`);
            }
        } else {
            this.textures.set(`${textureName}`, `${spritesPath}${type}${textureName}.png`);
        }
    }

    getTexture(textureName: string): PIXI.Texture {
        if (this.textureRegistry.get(textureName)) {
            // TODO: why as?
            return this.textureRegistry.get(textureName) as PIXI.Texture ;
        }

        console.warn('No texture found for: ' + textureName);

        return this.textureRegistry.get('empty') as PIXI.Texture ;
    }

    getTextureForObject(cellObject: CellObject): PIXI.Texture {
        let textureName = cellObject?.cellObjectType?.toLowerCase();

        if (['TREE', 'FLOWER', 'DEAD_TREE', 'GRASS', 'MUSHROOM', 'WATER_PLANT'].includes(cellObject.cellObjectType)) {
            const type = (cellObject as ObjectTree).meta?.type;

            if (type) {
                textureName += `_${type.toLowerCase()}`;
            }
        }

        const tiling = this.isTiling(cellObject);

        if (tiling) {
            const tile = this.getTileForObject(cellObject);

            return this.getTexture(`${textureName}_${tile}`);
        }

        return this.getTexture(textureName);
    }

    isTiling(cellObject: CellObject): boolean {
        return ['ROAD'].includes(cellObject.cellObjectType);
    }

    getTileForObject(cellObject: CellObject): string {

        //const cell1: CellObject = this.viewData.cellObjects.get(this.getKey(new Point2D(cellObject.x - 1, cellObject.y - 1)));
        const cell2: CellObject = this.viewData.cellObjects.get(this.getKey(new Point2D(cellObject.x, cellObject.y - 1)));
        //const cell3: CellObject = this.viewData.cellObjects.get(this.getKey(new Point2D(cellObject.x + 1, cellObject.y - 1)));
        const cell4: CellObject = this.viewData.cellObjects.get(this.getKey(new Point2D(cellObject.x - 1, cellObject.y)));
        const cell6: CellObject = this.viewData.cellObjects.get(this.getKey(new Point2D(cellObject.x + 1, cellObject.y)));
        //const cell7: CellObject = this.data.cellObjects.get(this.getKey(new Point2D(cellObject.x - 1, cellObject.y + 1)));
        const cell8: CellObject = this.viewData.cellObjects.get(this.getKey(new Point2D(cellObject.x, cellObject.y + 1)));
        //const cell9: CellObject = this.viewData.cellObjects.get(this.getKey(new Point2D(cellObject.x + 1, cellObject.y + 1)));

        //const byte1 = cell1.cellObjectType === cellObject.cellObjectType;
        const byte2 = cell2?.cellObjectType === cellObject.cellObjectType;
        //const byte3 = cell3.cellObjectType === cellObject.cellObjectType;
        const byte4 = cell4?.cellObjectType === cellObject.cellObjectType;
        const byte5 = true;
        const byte6 = cell6?.cellObjectType === cellObject.cellObjectType;
        //const byte7 = cell7.cellObjectType === cellObject.cellObjectType;
        const byte8 = cell8?.cellObjectType === cellObject.cellObjectType;
        //const byte9 = cell9.cellObjectType === cellObject.cellObjectType;

        // TODO: удаляются из data после отрисовки

        const binaryString = (
            (byte2 ? '1' : '0') 
            + (byte4 ? '1' : '0') 
            + (byte5 ? '1' : '0') 
            + (byte6 ? '1' : '0') 
            + (byte8 ? '1' : '0')
        );

        console.log(binaryString);

        let code = parseInt(binaryString, 2);

        console.log(code);

        if (code === 20 || code === 5) {
            code = 21;
        }

        if (code === 12 || code === 6) {
            code = 14;
        }

        //let inverted = false;

        /*
        if (cellObject.cellObjectType === 'CLIFF') {
            let x = 0;
            let y = 0;

            if (code === 7 || code === 22) {
                x = -1;

            } else if (code === 13 || code === 28) {
                x = 1;    
            }

            if (code === 7 || code === 13) {
                y = -1;

            } else if (code === 22 || code === 28) {
                y = 1;    
            }

            const c1: WorldCell = this.viewData.cells.get(this.getKey(new Point2D(cellObject.x + x, cellObject.y - y)));
            const c2: WorldCell = this.viewData.cells.get(this.getKey(new Point2D(cellObject.x, cellObject.y)));

            if (c1?.height > c2?.height) {
                inverted = true;
            }
        }
        */

        /*
        let topToBottom: boolean = true;
        let leftToRight: boolean = true;

        if (cellObject.cellObjectType === 'CLIFF') {
            topToBottom = (this.data.cells.get(this.getKey(new Point2D(cellObject.x, cellObject.y - 1)))?.height || 0) >
                (this.data.cells.get(this.getKey(new Point2D(cellObject.x, cellObject.y + 1)))?.height || 0);

            leftToRight = (this.data.cells.get(this.getKey(new Point2D(cellObject.x - 1, cellObject.y)))?.height || 0) >
                (this.data.cells.get(this.getKey(new Point2D(cellObject.x + 1, cellObject.y)))?.height || 0);

        }
        */
        
        /*
        if (inverted) {
            return 'alt_' + code.toString();
        }
        */

        return code.toString();
    }

    getChunkForPoint(point: Point2D): PIXI.Container {
        const key = this.getKey(new Point2D(Math.floor(point.x / chunkSize), Math.floor(point.y / chunkSize)));

        let chunk: PIXI.Container = this.chunks.get(key) as PIXI.Container;

        if (!chunk) {
            console.log('Created new chunk: ' + key);
            chunk = new PIXI.Container();
            this.container.addChild(chunk);

            this.chunks.set(key, chunk);
        }

        return chunk;
    }

    render() {
        if (this.stopped) {
            console.log('Commit stop');

            return;
        }

        const timer = new Date();

        this.drawAll();

        //this.app.render(this.container as PIXI.Container);

        const frameTime = new Date().getTime() - timer.getTime();

        if (frameTime >= 1000 / maxFps) {
            console.warn(`Frame time is ${frameTime}ms`);

            //this.fps = Math.round(1000 / frameTime);
            const newFps = Math.round(1000 / frameTime);

            if (this.fps < newFps) {
                this.fps++;

            } else if (this.fps > newFps) {
                this.fps = newFps;
            }

            //console.log('Sprites count: ' + this.container.children.length);

            this.render();

        } else {
            setTimeout(() => {
                /*
                const frameTime2 = new Date().getTime() - timer.getTime();
                this.fps = Math.round(1000 / frameTime2);
                */
                if (this.fps < maxFps) {
                    this.fps++;
                }

                this.render();
            }, 1000 / maxFps - frameTime);
        }
    }

    drawAll() {
        /*
        console.log(`cells: ${this.data.cells.size} (${this.view.cells.size})`);
        console.log(`cellObjects: ${this.data.cellObjects.size} (${this.view.cellObjects.size})`);
        console.log(`entities: ${this.data.entities.size} (${this.view.entities.size})`);
        */

        for (const key of this.data.cells.keys()) {
            const p: Point2D = this.parseKey(key);
            const cell: WorldCell = this.data.cells.get(key) as WorldCell; // FIXME: why as?

            // TODO: the problem was here
            //const rendered = cell.rendered;
            const rendered = this.view.cells.has(key);

            if (!rendered) {
                // TODO: if cell type changed
                // TODO: if sprite already exist
                const textureName = cell.cellType.toLowerCase();
                const texture = this.getTexture(textureName);
                const sprite = new PIXI.Sprite(texture);

                sprite.x = p.x * cellSize;
                sprite.y = p.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0);
                // z-index = bottom edge of the sprite
                //sprite.zIndex = p.y * cellSize + (texture.height > cellSize ? (texture.height - cellSize) : 0);
                sprite.zIndex = p.y * cellSize;
                sprite.tint = this.getColorForPercentage3(this.getPercentageForHeight(cell.height));

                cell.rendered = true;

                //this.viewData.cells.set(key, cell);
                this.view.cells.set(key, sprite);
                this.container.addChild(sprite);

                this.data.cells.delete(key);

                /*
                if (debugMode) {
                    const coordsText = new PIXI.Text(
                        `x:${cell.x.toFixed(2)}\ny:${cell.y.toFixed(2)}`,
                        { fontSize: 9 }
                    );
                    sprite.addChild(coordsText);

                    const rect = new PIXI.Graphics();
                    //rect.beginFill(0xFFFF00);
                    rect.lineStyle(1, 0x000000);
                    rect.drawRect(0, 0, cellSize, cellSize);
                    sprite.addChild(rect);
                }
                */

            } else {
                console.warn(`Cell ${cell} is already rendered!`);
                this.data.cells.delete(key);
            }
        }

        for (const key of this.data.cellObjects.keys()) {
            const p: Point2D = this.parseKey(key);
            const cellObject: CellObject = this.data.cellObjects.get(key) as CellObject;  // FIXME: why as?

            if (!cellObject) {
                continue;
            }

            // TODO: the problem was here
            //const rendered = cellObject.rendered;
            const rendered = this.view.cellObjects.has(key);

            if (!rendered) {
                // TODO: if cellObject type changed
                // TODO: if sprite already exist
                const texture = this.getTextureForObject(cellObject);
                // TODO: use pool
                const sprite = new PIXI.Sprite(texture);

                if (cellObject.cellObjectType === 'TREE') {
                    const size = (cellObject as ObjectTree).meta?.size || 1;

                    sprite.width = sprite.width * size;
                    sprite.height = sprite.height * size;
                }

                sprite.x = p.x * cellSize - (sprite.width > cellSize ? (sprite.width - cellSize) / 2 : 0);
                sprite.y = p.y * cellSize - (sprite.height > cellSize ? (sprite.height - cellSize) : 0);
                // z-index = bottom edge of the sprite
                //sprite.zIndex = p.y * cellSize + (sprite.height > cellSize ? (sprite.height - cellSize) : 0);
                sprite.zIndex = p.y * cellSize;
                //sprite.tint = this.getColorForPercentage3(this.getPercentageForHeight(cell.height));

                cellObject.rendered = true;

                //this.viewData.cellObjects.set(key, cellObject);
                this.view.cellObjects.set(key, sprite);
                this.container.addChild(sprite);

                this.data.cellObjects.delete(key);

                /*
                if (debugMode) {
                    const coordsText = new PIXI.Text(
                        `x:${cellObject.x.toFixed(2)}\ny:${cellObject.y.toFixed(2)}`,
                        { fontSize: 9 }
                    );
                    sprite.addChild(coordsText);

                    const rect = new PIXI.Graphics();
                    //rect.beginFill(0xFFFF00);
                    rect.lineStyle(2, 0xFF0000);
                    rect.drawRect(0, 0, cellSize, cellSize);
                    sprite.addChild(rect);
                }
                */
            } else {
                console.warn(`CellObject ${cellObject} is already rendered!`);
                this.data.cellObjects.delete(key);
            }
        }

        for (const key of this.data.entities.keys()) {
            const entity: Entity = this.data.entities.get(key) as Entity; // FIXME: why as?
            
            // TODO: the problem was here
            //const rendered = entity.rendered;
            const rendered = this.view.entities.has(key);

            if (!rendered) {
                const textureName = 'entity_' + entity.entityType?.toLowerCase();
                const texture = this.getTexture(textureName);
                let sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;

                if (!sprite) {
                    // TODO: use pool
                    sprite = new PIXI.Sprite(texture);

                    sprite.x = entity.x * cellSize - (texture.width / 2);
                    sprite.y = entity.y * cellSize - texture.height;
                    
                    //this.viewData.entities.set(key, entity);
                    this.view.entities.set(key, sprite);

                    this.container.addChild(sprite);
                    //spritesToAdd.push(sprite);

                    if (debugMode) {
                        const coordsText = new PIXI.Text(
                            `${entity.x.toFixed(2)}:${entity.y.toFixed(2)}`,
                            { fontSize: 24 }
                        );

                        sprite.addChild(coordsText);
                    }

                    // https://pixijs.com/7.x/examples/events/click
                    sprite.eventMode = 'static';
                    sprite.cursor = 'pointer';
                    sprite.on('pointerdown', (e) => this.sendMouseClickedOnEntity(e, entity));
                }

                if (debugMode) {
                    (sprite.getChildAt(0) as PIXI.Text).text = `${entity.x.toFixed(2)}:${entity.y.toFixed(2)}`;
                }

                //sprite.x = entity.x * cellSize;
                //sprite.y = entity.y * cellSize - (texture.height > cellSize ? (texture.height - cellSize) : 0);
                // TODO: why + 20
                //sprite.zIndex = entity.y * 100;

                // Entities has different coordinates. They need to be placed at exact coordinates (on the middle of the block)
                // TODO: how to get exact coordinates?
                // depends on square part (--, +-, ++, -+)

                // TODO: move stepped only if it is not creation
                /*
                this.moveSmooth(sprite, new Point2D(
                    entity.x * cellSize - (texture.width / 2),
                    entity.y * cellSize - texture.height
                ));
                */

                // z-index = bottom edge of the sprite
                //sprite.zIndex = entity.y * cellSize + (texture.height > cellSize ? (texture.height - cellSize) : 0);
                sprite.zIndex = entity.y * cellSize;

                entity.rendered = true;

                this.data.entities.delete(key);

            } else {
                // FIXME: it's smoother but code is not good enough
                const textureName = 'entity_' + entity.entityType?.toLowerCase();
                const texture = this.getTexture(textureName);
                const sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;

                // Entities has different coordinates. They need to be placed at exact coordinates (on the middle of the block)
                this.moveSmooth(sprite, new Point2D(
                    entity.x * cellSize - (texture.width / 2),
                    entity.y * cellSize - texture.height
                ));

                // z-index = bottom edge of the sprite
                sprite.zIndex = entity.y * cellSize + (texture.height > cellSize ? (texture.height - cellSize) : 0);

                //console.log('cell object already rendered');
            }
        }

        for (const key of this.data.effects.keys()) {
            const p: Point2D = this.parseKey(key);
            const effect: string = this.data.effects.get(key) as string;

            if (!effect) {
                continue;
            }

            const rendered = this.view.effects.has(key);

            if (!rendered) {
                const texture = this.getTexture('path');
                // TODO: use pool
                const sprite = new PIXI.Sprite(texture);

                sprite.x = p.x * cellSize - (sprite.width > cellSize ? (sprite.width - cellSize) / 2 : 0);
                sprite.y = p.y * cellSize - (sprite.height > cellSize ? (sprite.height - cellSize) : 0);
                sprite.zIndex = p.y * cellSize;

                //effect.rendered = true;

                this.view.effects.set(key, sprite);
                this.container.addChild(sprite);

                this.data.effects.delete(key);

            } else {
                this.data.effects.delete(key);
            }
        }

        // TODO: move to another function
        const targetX = Math.round(this.center.x * cellSize);
        const targetY = Math.round(this.center.y * cellSize);

        this.moveSmooth(this.container.pivot, new Point2D(
            targetX,
            targetY
        ));
    }

    redrawAll(): void {
        /*
        for (const key of this.viewData.cellObjects.keys()) {
            const p: Point2D = this.parseKey(key);
            const cellObject: CellObject = this.viewData.cellObjects.get(key) as CellObject;  // FIXME: why as?

            if (!cellObject) {
                continue;
            }

            const tiling = this.isTiling(cellObject);
            
            // TODO: only for edges
            if (tiling) {
                const sprite: PIXI.Sprite = this.view.cellObjects.get(key) as PIXI.Sprite; // FIXME: why as?
                const texture: PIXI.Texture = this.getTextureForObject(cellObject);

                // Redraw tiling
                if (sprite && sprite.texture !== texture) {
                    console.log('Redraw: ' + key);
                    sprite.texture = texture;

                } else {
                    console.error('Object is not rendered: ' + key);
                }
            }
        }
        */
    }

    clearAll(): void {
        for (const key of this.view.cells.keys()) {
            const p: Point2D = this.parseKey(key);

            if ((p.x < this.zero.x || p.x > (this.zero.x + this.worldWidth - 1))
                || (p.y < this.zero.y || p.y > (this.zero.y + this.worldHeight - 1))) {

                const sprite: PIXI.Sprite = this.view.cells.get(key) as PIXI.Sprite; // FIXME: why as?

                //sprite.visible = false;

                this.viewData.cells.delete(key);
                this.view.cells.delete(key);

                this.container.removeChild(sprite);

                //const index = this.container.children.indexOf(sprite);
                //this.container.removeChildren(index, index + 1);

                //this.container.children.splice(this.container.children.indexOf(sprite), 1)
            }
        }

        for (const key of this.view.cellObjects.keys()) {
            const p: Point2D = this.parseKey(key);

            if ((p.x < this.zero.x || p.x > (this.zero.x + this.worldWidth - 1))
                || (p.y < this.zero.y || p.y > (this.zero.y + this.worldHeight - 1))) {

                const sprite: PIXI.Sprite = this.view.cellObjects.get(key) as PIXI.Sprite;  // FIXME: why as?

                //sprite.visible = false;

                this.viewData.cellObjects.delete(key);
                this.view.cellObjects.delete(key);

                this.container.removeChild(sprite);

                //const index = this.container.children.indexOf(sprite);
                //this.container.removeChildren(index, index + 1);

                //this.container.children.splice(this.container.children.indexOf(sprite), 1)
            }
        }

        // TODO: clear entities
        /*
        for (const key of this.view.entities.keys()) {
            const entity: Entity = this.data.entities.get(key) as Entity; // FIXME: why as?

            if ((entity.x < this.zero.x || entity.x > (this.zero.x + this.worldWidth - 1))
                || (entity.y < this.zero.y || entity.y > (this.zero.y + this.worldHeight - 1))) {

                const sprite: PIXI.Sprite = this.view.entities.get(key) as PIXI.Sprite;  // FIXME: why as?

                this.container.removeChild(sprite);
                sprite.visible = false;

                this.view.entities.delete(key);
            }
        }
        */

        for (const key of this.view.effects.keys()) {
            const p: Point2D = this.parseKey(key);

            if (!this.viewData.effects.get(key)) {
                const sprite: PIXI.Sprite = this.view.effects.get(key) as PIXI.Sprite;  // FIXME: why as?

                //sprite.visible = false;

                this.viewData.effects.delete(key);
                this.view.effects.delete(key);

                this.container.removeChild(sprite);
            }
        }
    }
}