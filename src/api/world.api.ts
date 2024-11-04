import { $http } from '@/http/http';
import { AxiosResponse } from 'axios';
import { World } from '@/classes/world';
import { Point2D } from '@/classes/point2d';
import { WorldCell } from '@/classes/world-cell';
import { CellObject } from '@/classes/cell-object';
import { WorldPart } from '@/classes/worldpart';

class WorldApi {

    getWorld(worldId: string, from: Point2D, width: number, height: number): Promise<AxiosResponse<World>> {
        return $http.get('world', {
            params: {
                id: worldId,
                x: from.x,
                y: from.y,
                width: width,
                height: height
            }
        });
    }

    getWorldCells(worldId: string, from: Point2D, width: number, height: number): Promise<AxiosResponse<WorldCell[]>> {
        return $http.get('world/cells', {
            params: {
                id: worldId,
                x: from.x,
                y: from.y,
                width: width,
                height: height
            }
        });
    }

    getCellObjects(worldId: string, from: Point2D, width: number, height: number): Promise<AxiosResponse<CellObject[]>> {
        return $http.get('world/cell-objects', {
            params: {
                id: worldId,
                x: from.x,
                y: from.y,
                width: width,
                height: height
            }
        });
    }

    getPart(worldId: string, from: Point2D, width: number, height: number): Promise<AxiosResponse<WorldPart>> {
        return $http.get('world/part', {
            params: {
                id: worldId,
                x: from.x,
                y: from.y,
                width: width,
                height: height
            }
        });
    }

    /*
    getWorldAddition(worldId: string, center: Point2D, oldCenter: Point2D, width: number, height: number): Promise<AxiosResponse<World>> {
        return $http.get('world/addition', {
            params: {
                id: worldId,
                centerX: center.x,
                centerY: center.y,
                oldCenterX: oldCenter.x,
                oldCenterY: oldCenter.y,
                width: width,
                height: height
            }
        });
    }
    */
}

export const $WorldApi = new WorldApi();
