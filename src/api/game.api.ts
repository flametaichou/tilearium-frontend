import { WorldRequest } from '@/classes/world-request';
import { http } from '@/http/http';
import { AxiosResponse } from 'axios';

class GameApi {

    findGame(code?: string): Promise<AxiosResponse<string>> {
        return http.get('game/find', { 
            params: {
                code: code
            } 
        });
    }

    unfinished(): Promise<AxiosResponse<string>> {
        return http.get('game/unfinished');
    }

    newGame(request: WorldRequest): Promise<AxiosResponse<string>> {
        return http.post('game', request);
    }

}

export const gameApi = new GameApi();
