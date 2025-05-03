import { WorldSimGame } from './game';
import { UiContainer } from './ui-container';

export abstract class ModalContainer extends UiContainer {

    header: HTMLDivElement;
    content: HTMLDivElement;
    actions: HTMLDivElement;

    constructor(game: WorldSimGame, params?: { info: object }) {
        super(game, params);

        this.elem.classList.add('dialog');
        this.elem.classList.add('card');
        this.elem.classList.add('card--shadow');

        this.header = document.createElement('div');
        this.header.classList.add('card__title');
        //this.header.innerHTML = '<h2>Title</h2>';
        this.elem.appendChild(this.header);

        this.content = document.createElement('div');
        this.content.classList.add('dialog__content');
        this.content.classList.add('card__content');
        this.elem.appendChild(this.content);

        this.actions = document.createElement('div');
        this.actions.classList.add('dialog__actions');
        this.actions.classList.add('card__footer');
        this.elem.appendChild(this.actions);
    }

    update(): void {
    }
}