import { WorldSimGame } from './game';
import { GameOverInfo } from './model/game-over-info';

export class GameOverContainer {

    game: WorldSimGame;

    elem: HTMLDivElement;

    constructor(game: WorldSimGame, params: { info: GameOverInfo }) {
        this.game = game;

        this.elem = document.createElement('div');
        this.elem.classList.add('dialog');
        this.elem.classList.add('card');
        this.elem.classList.add('card--shadow');
        this.game.wrapper.appendChild(this.elem);

        const header = document.createElement('div');

        header.classList.add('card__title');
        header.innerHTML = '<h2>The game is ended!</h2>';
        this.elem.appendChild(header);

        const content = document.createElement('div');

        content.classList.add('dialog__content');
        content.classList.add('card__content');
        this.elem.appendChild(content);

        const actions = document.createElement('div');

        actions.classList.add('dialog__actions');
        actions.classList.add('card__footer');
        this.elem.appendChild(actions);

        const close = document.createElement('button');

        close.classList.add('secondary');
        close.textContent = 'Exit';
        close.onclick = () => {
            game.exit()
            //this.game.wrapper.removeChild(this.elem);
            //this.game.gameOverContainer = undefined;
        };

        actions.appendChild(close);

        content.innerHTML = `
        <h4>Here are the results:</h4>
        <table>
        <thead>
            <tr>
                <th>
                    Player
                </th>
                <th>
                    Score
                </th>
                <th>

                </th>
            </tr>
        </thead>
        <tbody>
        ${ params.info.players.map((p) => `
            <tr>
                <td>
                    ${ p.name }
                </td>
                <td>
                    ${ p.points }
                </td>
                <td>
                    ${ p.winner ? 'Winner!' : '' }
                </td>
            </tr>
        `) }
        </tbody>
        </table>
        `;
    }

    update(): void {
    }
}