import { WorldSimGame } from './game';
import { ActionsContainer } from './actions-container';
import { UiContainer } from './ui-container';
import { DebugContainer } from './debug-container';
import { debugMode } from './constants';

export class MainContainer extends UiContainer {

    timerStart: Date;
    timer: number;
    title: string;

    timerElem: HTMLElement;

    constructor(game: WorldSimGame, params?: { info: object }) {
        super(game, params);

        this.timerStart = new Date();
        this.timer = 20000;
        this.title = 'The world';

        this.elem.classList.add('panel__main');

        // ---------

        const info = document.createElement('div');

        info.classList.add('ui__row');
        info.classList.add('ui__block');
        info.classList.add('panel__info');
        this.elem.appendChild(info);

        this.timerElem = document.createElement('div');
        this.timerElem.classList.add('ui__chip');
        info.appendChild(this.timerElem);

        const titleElem = document.createElement('div');

        titleElem.classList.add('panel__title');
        titleElem.innerText = this.title;
        info.appendChild(titleElem);

        /*
        const copyBtn = document.createElement('button');

        copyBtn.classList.add('ui__button');
        copyBtn.innerText = '🔗';
        // TODO: onclick
        info.appendChild(copyBtn);

        const mapBtn = document.createElement('button');

        mapBtn.classList.add('ui__button');
        mapBtn.innerText = '🌐';
        // TODO: onclick
        info.appendChild(mapBtn);

        const exitBtn = document.createElement('button');

        exitBtn.classList.add('ui__button');
        exitBtn.innerText = '🚪';
        // TODO: onclick
        info.appendChild(exitBtn);
        */

        // ---------

        this.addContainer(new ActionsContainer(this.game));

        if (debugMode) {
            this.addContainer(new DebugContainer(this.game));
        }
    }

    update(): void {
        super.update();
        this.timerElem.innerText = toTimeString((this.timerStart.getTime() + this.timer) - new Date().getTime());
    }
}

function toTimeString(ms: number): string {
    return new Date(ms).toISOString().slice(11, 19);
}