import { WorldCell } from '@/classes/world-cell';
import { Point2D } from '@/classes/point2d';
import { CellObject } from '@/classes/cell-object';

export interface WorldPart {
    start: Point2D;
    width: number;
    height: number;
    // eslint-disable-next-line @typescript-eslint/ban-types
    //cells: object;

    cells: WorldCell[];
    cellObjects: CellObject[];
    // new Map(Object.entries({foo: 'bar'}));
}