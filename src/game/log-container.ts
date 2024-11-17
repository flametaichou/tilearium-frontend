import { WorldSimGame } from './game';

export class LogContainer {

    game: WorldSimGame;
    elem: HTMLDivElement;

    constructor(game: WorldSimGame) {
        this.game = game;
        this.elem = document.createElement('div');
        this.game.wrapper.appendChild(this.elem);

        this.elem.classList.add('game__log');
    }

    update(): void {
        while (this.game.log.length) {
            const message = this.game.log.shift();

            const messageElem = document.createElement('div');

            messageElem.textContent = message;
            this.elem.appendChild(messageElem);
        }
    }
}