import { Identified } from '@/classes/identified';
import { Point2D } from '@/classes/point2d';

export class EntityMove implements Point2D, Identified {
    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    id: string;
    x: number;
    y: number;
}