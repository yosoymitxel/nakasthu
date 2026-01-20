/**
 * APP.JS
 * Componente raíz de la UI.
 */
import { Layout } from './Layout.js';
import { html } from '../utils/html.js';

const App = () => {
    return html`
        <div className="app-container">
            <${Layout} />
        </div>
    `;
};

export default App;
