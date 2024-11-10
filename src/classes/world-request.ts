export class WorldRequest {

    name: string;
    size: number;
    timer: number;

    constructor(name: string, size: number, timer: number) {
        this.name = name;
        this.size = size;
        this.timer = timer;
    }
}