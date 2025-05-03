import { WorldSimGame } from './game';

export abstract class UiContainer {

    game: WorldSimGame;
    elem: HTMLDivElement;
    containers: UiContainer[];

    constructor(game: WorldSimGame, params?: { info: object }) {
        this.containers = [];
        this.game = game;
        this.elem = document.createElement('div');
        this.game.wrapper.appendChild(this.elem);
    }

    update(): void {
        this.containers.forEach((c) => c.update());
    }

    addContainer(container: UiContainer): void {
        this.elem.appendChild(container.elem);
        this.containers.push(container);
    }
}