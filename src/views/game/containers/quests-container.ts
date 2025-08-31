import { TileariumGame } from '../game';
import { ModalContainer } from './modal-container';
import { QuestsInfo } from '../model/quests-info';

export class QuestsContainer extends ModalContainer {

    constructor(game: TileariumGame, params: { info: QuestsInfo }) {
        super(game, params);

        this.header.innerHTML = '<h2>Welcome to the game</h2>';

        const close = document.createElement('button');

        close.classList.add('primary');
        close.textContent = 'Close';
        close.onclick = () => {
            this.game.wrapper.removeChild(this.elem);
            this.game.questsContainer = undefined;
        };

        this.actions.appendChild(close);

        this.content.innerHTML = `
        <h4>The story is:</h4>
        <div>${ params.info.description }</div>
        <h4>Your quests are:</h4>
        <ul>
        ${ params.info.quests.map((q) => `
            <li style="${ q.completed ? 'text-decoration: line-through;' : '' }">
                <span>
                    ${ q.main ? '✪' : '' }
                </span>
                <span>
                    ${ q.action }
                </span>
                <span>
                    ${ q.target ? JSON.stringify(q.target) : '' }
                </span>
                <span>
                    ${ q.targetEntity ? JSON.stringify(q.targetEntity) : '' }
                </span>
            </div>
        `) }
        </ul>
        `;
    }

    update(): void {
    }
}