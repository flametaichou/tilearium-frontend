import { webSocketService } from '@/service/websocket.service';
import { TileariumGame } from '../game';
import { UiContainer } from './ui-container';

export class ActionsContainer extends UiContainer {

    actions: {
        name: string,
        icon: string,
        click: () => void
    }[];

    playerName: string;

    constructor(game: TileariumGame, params?: { info: object }) {
        super(game, params);
        this.playerName = 'Player';
       
        this.elem.classList.add('ui__row');

        // ---------

        const player = document.createElement('div');

        player.classList.add('panel__player');
        player.classList.add('ui__block');
        this.elem.appendChild(player);

        const avatar = document.createElement('div');

        avatar.classList.add('panel__avatar');
        player.appendChild(avatar);

        const playerNameElem = document.createElement('div');

        playerNameElem.classList.add('panel__text');
        playerNameElem.innerText = this.playerName;
        player.appendChild(playerNameElem);

        // ---------

        const actionsElem = document.createElement('div');

        actionsElem.classList.add('panel__actions');
        //actionsElem.classList.add('ui__block');
        this.elem.appendChild(actionsElem);

        this.actions = [
            { 
                name: 'Copy Link', 
                icon: '/actions/share.png', 
                click: () => {
                    navigator.clipboard.writeText(window.location.href);
                    game.log.push('Link copied');
                }
            },
            { 
                name: 'Dig', 
                icon: '/actions/dig.png', 
                click: () => {
                    webSocketService.send(this.game.pushPath, {
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
                    webSocketService.send(this.game.pushPath, {
                        type: 'ACTION',
                        body: {
                            type: 'OPEN_INVENTORY'
                        }
                    });
                }
            },
            { 
                name: 'Show Quests', 
                icon: '/actions/journal.png', 
                click: () => {
                    webSocketService.send(this.game.pushPath, {
                        type: 'ACTION',
                        body: {
                            type: 'SHOW_QUESTS'
                        }
                    });
                }
            },
            { 
                name: 'Show Map', 
                icon: '/actions/map.png', 
                click: () => {
                    webSocketService.send(this.game.pushPath, {
                        type: 'SHOW_MAP',
                        body: {
                        }
                    });
                }
            },
            { 
                name: 'Exit', 
                icon: '/actions/exit.png', 
                click: () => {
                    game.exit();
                }
            }
        ];

        for (const action of this.actions) {
            const actionElem = document.createElement('button') as HTMLButtonElement;

            actionElem.classList.add('ui__button');
            actionElem.innerHTML = `
            <img src="${action.icon}"></img>
            `;
            actionElem.title = action.name;
            actionElem.onclick = action.click;

            actionsElem.appendChild(actionElem);
        }
    }

    update(): void {
    }
}