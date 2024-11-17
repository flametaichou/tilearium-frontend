export class WorldCell {
    constructor(x: number, y: number, height: number) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.cellType = 'DIRT';
        this.rendered = false;
    }

    x: number;
    y: number;
    height: number;
    cellType: string;
    rendered: boolean;
}
