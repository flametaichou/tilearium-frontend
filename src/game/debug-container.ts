import { WorldSimGame } from './game';

export class DebugContainer {

    game: WorldSimGame;

    //id: string;
    wrapper: HTMLDivElement;
    elem: HTMLDivElement;

    fpsElem: HTMLDivElement;
    centerElem: HTMLDivElement;

    constructor(game: WorldSimGame) {
        this.game = game;

        //this.id = game.id;
        this.wrapper = game.wrapper as HTMLDivElement;
        this.elem = document.createElement('div');
        this.wrapper.appendChild(this.elem);

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