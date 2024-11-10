import { WorldCell } from '@/classes/world-cell';
import { Point2D } from '@/classes/point2d';
import { CellObject } from '@/classes/cell-object';
import { EntityMove } from './entity-move';

export interface WorldPart {
    //start: Point2D;
    //width: number;
    //height: number;
    // eslint-disable-next-line @typescript-eslint/ban-types
    //cells: object;

    center: Point2D;

    cells: WorldCell[];
    cellObjects: CellObject[];
    entities: EntityMove[];
    // new Map(Object.entries({foo: 'bar'}));
}