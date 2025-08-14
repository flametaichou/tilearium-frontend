import { WorldSimGame } from '../game';
import { UiContainer } from './ui-container';

export class LogContainer extends UiContainer {

    constructor(game: WorldSimGame, params?: { info: object }) {
        super(game, params);

        this.elem.classList.add('panel__log');
    }

    update(): void {
        while (this.game.log.length) {
            const message = this.game.log.shift();

            const messageElem = document.createElement('div');

            messageElem.textContent = message;
            this.elem.appendChild(messageElem);
            this.elem.scrollTo(0, this.elem.scrollHeight);
        }
    }
}