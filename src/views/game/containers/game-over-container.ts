import { TileariumGame } from '../game';
import { GameOverInfo } from '../model/game-over-info';
import { ModalContainer } from './modal-container';

export class GameOverContainer extends ModalContainer {

    constructor(game: TileariumGame, params: { info: GameOverInfo }) {
        super(game, params);

        this.header.innerHTML = '<h2>The game is ended!</h2>';

        const close = document.createElement('button');

        close.classList.add('secondary');
        close.textContent = 'Exit';
        close.onclick = () => {
            game.exit();
            //this.game.wrapper.removeChild(this.elem);
            //this.game.gameOverContainer = undefined;
        };

        this.actions.appendChild(close);

        this.content.innerHTML = `
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