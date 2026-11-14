/**
 * BOOT.JS
 * Punto de entrada del motor. Inicializa el GameLoop y otros sistemas core.
 */
import { gameLoop } from './GameLoop.js';
import { state } from './State.js';
import { bus } from './Bus.js';
import { audio } from './Audio.js';
import { loreSystem } from '../systems/LoreSystem.js';
import { dialogueEngine } from '../systems/DialogueEngine.js';
import { tutorialController } from '../systems/TutorialController.js';
import { achievements } from '../systems/Achievements.js';
import { verdictLog } from '../systems/VerdictLog.js';

console.log("%c NAKASTHU // CORE BOOT SEQUENCE STARTED ", "background: #111; color: #FF8C00; font-weight: bold;");

// Inicializar sistemas asíncronos
audio.init();

// Asegurar que los sistemas singletons se instancien y escuchen eventos
const systems = {
    lore: loreSystem,
    dialogue: dialogueEngine,
    tutorial: tutorialController,
    achievements,
    verdicts: verdictLog
};

// Exponer state para depuración
window.state = state;
window.__SYSTEMS__ = systems;

// Protocolo de omisión de tutoriales si se solicita via comando o estado
if (state.hasSeenTutorial || localStorage.getItem('nakasthu_skip_tutorials') === 'true') {
    setTimeout(() => {
        bus.emit('TUTORIAL_SKIP_ALL');
    }, 500);
}

// El GameLoop es gestionado por el hook useGameLoop en la capa de UI.

