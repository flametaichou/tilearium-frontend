import { Identified } from '@/classes/identified';
import { Point2D } from '@/classes/point2d';

export class Entity implements Point2D, Identified {
    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.rendered = false;
    }

    id: string;
    x: number;
    y: number;
    entityType: string;
    rendered: boolean;
}