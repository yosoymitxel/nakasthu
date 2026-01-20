/**
 * APP.JS
 * Componente raíz de la UI.
 */
import { Layout } from './Layout.js';
import { html } from '../utils/html.js';
import { useGameLoop } from '../hooks/useGameLoop.js';
import { gameLoop } from '../../core/GameLoop.js';

const App = () => {
    // Centralización del ciclo de vida del GameLoop
    useGameLoop(gameLoop);

    return html`
        <div className="app-container">
            <${Layout} />
        </div>
    `;
};

export default App;
