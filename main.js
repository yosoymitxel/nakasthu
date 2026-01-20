import GameLoop from './src/core/GameLoop.js';
import Logger from './src/core/Logger.js';

// Inicializar Subsistemas (Efectos secundarios de registro en Bus)
import './src/systems/Portal.js';
import './src/systems/Scanner.js';
import './src/systems/Narrator.js';
import './src/systems/MechanicsEngine.js';
import './src/systems/TestSystem.js';

import Layout from './src/ui/components/Layout.js';
import { html } from './src/ui/utils/html.js';

// 1. Inicializar el Engine Vanilla
Logger.log('Iniciando secuencia de arranque NAKASTHU...', 'BOOT');
GameLoop.start();

// 2. Montar la UI de React
// Asumimos que React y ReactDOM están en el scope global por el CDN en index.html
const rootNode = document.getElementById('root');
const root = window.ReactDOM.createRoot(rootNode);

root.render(
    html`<${Layout} />`
);

Logger.log('Interfaz Visual Montada. Esperando input...', 'BOOT');
