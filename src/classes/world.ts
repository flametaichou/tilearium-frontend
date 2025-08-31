import { Identified } from '@/classes/identified';
import { WorldCell } from '@/classes/world-cell';

export interface World extends Identified {
    name: string;
    generated: boolean;
    cells: WorldCell[];
}

export class World implements World {
    constructor(id: string, name: string, cells: WorldCell[]) {
        this.id = id;
        this.name = name;
        this.cells = cells;
    }

    id: string;
    name: string;
    cells: WorldCell[];

    sort(): void {
        this.cells.sort((c1: WorldCell, c2: WorldCell) => c1.x - c2.x || c1.y - c2.y);
    }

    addCells(cells: WorldCell[]): void {
        this.cells.push(...cells);
        this.sort();

        // Remove cells not found in the new view
        /*
        this.world.cells = this.world.cells.filter((cell: WorldCell) => {
            return newWorld.cells.find((newCell) => {
                return newCell.x === cell.x && newCell.y === cell.y && newCell.height === cell.height;
            });
        });

        const newCells: WorldCell[] = newWorld.cells.filter((newCell) => {
            return this.world?.cells.find((cell) => {
                return newCell.x === cell.x && newCell.y === cell.y && newCell.height === cell.height;
            }) === undefined;
        });
        */
    }
}
