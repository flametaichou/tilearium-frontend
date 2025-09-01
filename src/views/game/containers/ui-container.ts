import { TileariumGame } from '../game';

export abstract class UiContainer {

    game: TileariumGame;
    elem: HTMLDivElement;
    containers: UiContainer[];
    params?: { 
        info: object 
    };

    constructor(game: TileariumGame, params?: { info: object }) {
        this.containers = [];
        this.game = game;
        this.params = params;
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