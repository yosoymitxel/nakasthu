/**
 * PERSISTENCEMANAGER.JS
 * Sistema de guardado en localStorage para progreso de historia y lore.
 */
import { bus } from '../core/Bus.js';

class PersistenceManager {
    constructor() {
        this.SAVE_KEY = 'nakasthu_save_v1';
        this.LORE_KEY = 'nakasthu_lore_v1';
    }

    /**
     * Guarda el estado actual del juego.
     */
    saveGame(gameState) {
        const data = {
            currentStep: gameState.currentStep,
            storyPath: gameState.storyPath,
            unlockedModules: Array.from(gameState.unlockedModules || []),
            timestamp: Date.now()
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
        console.log("%c[SAVE] Partida guardada.", "color: #0ea5e9; font-weight: bold;");
        bus.emit('SYSTEM_LOG', { msg: 'SISTEMA_GUARDADO: PROGRESO_SINCRONIZADO' });
    }

    /**
     * Carga el estado guardado.
     */
    loadGame() {
        const data = localStorage.getItem(this.SAVE_KEY);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Guarda un fragmento de lore desbloqueado.
     */
    saveLore(loreId) {
        const lore = this.loadLore();
        if (!lore.includes(loreId)) {
            lore.push(loreId);
            localStorage.setItem(this.LORE_KEY, JSON.stringify(lore));
        }
    }

    /**
     * Carga todos los fragmentos de lore desbloqueados.
     */
    loadLore() {
        const data = localStorage.getItem(this.LORE_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Borra todo el progreso.
     */
    clearAll() {
        localStorage.removeItem(this.SAVE_KEY);
        localStorage.removeItem(this.LORE_KEY);
        console.warn("[PERSISTENCE] Todos los datos borrados.");
    }
}

export const persistenceManager = new PersistenceManager();
