export interface Point2D {
    x: number;
    y: number;
}

export class Point2D implements Point2D {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /*
    getKey(): number {

        return 0;
    }
    */
}
