/**
 * BOOT.JS
 * Punto de entrada del motor. Inicializa el GameLoop y otros sistemas core.
 */
import { gameLoop } from './GameLoop.js';
import { state } from './State.js';
import { audio } from './Audio.js';
import { loreSystem } from '../systems/LoreSystem.js';

console.log("%c NAKASTHU // CORE BOOT SEQUENCE STARTED ", "background: #111; color: #FF8C00; font-weight: bold;");

// Inicializar sistemas asíncronos
audio.init();
// El loreSystem se auto-inicializa al importar, pero aseguramos su carga
const _lore = loreSystem;

// Exponer state para depuración
window.state = state;

// Iniciar el ciclo de juego
gameLoop.start();
