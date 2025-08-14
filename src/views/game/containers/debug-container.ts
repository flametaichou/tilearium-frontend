import { WorldSimGame } from '../game';
import { UiContainer } from './ui-container';

export class DebugContainer extends UiContainer {

    fpsElem: HTMLDivElement;
    centerElem: HTMLDivElement;

    constructor(game: WorldSimGame, params?: { info: object }) {
        super(game, params);

        this.elem.classList.add('game__debug');

        this.fpsElem = document.createElement('div');
        this.centerElem = document.createElement('div');

        this.fpsElem.classList.add('game__fps');
        this.centerElem.classList.add('game__center');
        this.elem.appendChild(this.fpsElem);
        this.elem.appendChild(this.centerElem);
    }

    update(): void {
        this.fpsElem.textContent = `FPS: ${this.game.fps}`;
        this.centerElem.textContent = `Center: X: ${this.game.center.x}, Y: ${this.game.center.y}`;
    }
}