import { html } from './ui/utils/html.js';
import App from './ui/components/App.js';
import './core/Boot.js'; // Initialize all Systems

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
