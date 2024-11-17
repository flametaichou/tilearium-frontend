import { webSocketService } from '@/service/websocket.service';
import { WorldSimGame } from './game';

export class ActionsContainer {

    game: WorldSimGame;
    elem: HTMLDivElement;

    actions: {
        name: string,
        icon: string,
        click: () => void
    }[];

    constructor(game: WorldSimGame) {
        this.game = game;
        this.elem = document.createElement('div');
        this.game.wrapper.appendChild(this.elem);

        this.elem.classList.add('game__actions');

        this.actions = [
            { 
                name: 'Dig', 
                icon: '/actions/dig.png', 
                click: () => {
                    webSocketService.send('/game/map-control', {
                        type: 'DIG',
                        body: {
                        }
                    });
                }
            },
            { 
                name: 'Open Inventory', 
                icon: '/actions/inventory.png', 
                click: () => {
                    webSocketService.send('/game/map-control', {
                        type: 'ACTION',
                        body: {
                            type: 'OPEN_INVENTORY'
                        }
                    });
                }
            },
            { 
                name: 'Show Map', 
                icon: '/actions/map.png', 
                click: () => {
                    webSocketService.send('/game/map-control', {
                        type: 'SHOW_MAP',
                        body: {
                        }
                    });
                }
            }
        ];

        for (const action of this.actions) {
            const actionElem = document.createElement('img') as HTMLImageElement;

            actionElem.classList.add('game__action');
            actionElem.src = action.icon;
            actionElem.title = action.name;
            actionElem.onclick = action.click;

            this.elem.appendChild(actionElem);
        }
    }

    update(): void {
    }
}