import { WorldSimGame } from '../game';
import { LogContainer } from './log-container';
import { UiContainer } from './ui-container';
import { MainContainer } from './main-container';

export class PanelContainer extends UiContainer {

    constructor(game: WorldSimGame, params?: { info: object }) {
        super(game, params);

        this.elem.classList.add('panel');

        this.addContainer(new MainContainer(this.game));

        const spacer = document.createElement('div');

        spacer.classList.add('panel__screen');
        this.elem.appendChild(spacer);

        this.addContainer(new LogContainer(this.game));
    }

    update(): void {
        super.update();
    }
}