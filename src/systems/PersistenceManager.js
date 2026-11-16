/**
 * PERSISTENCEMANAGER.JS
 * Sistema de guardado en localStorage para progreso de historia y lore.
 */
import { bus } from '../core/Bus.js';
import { storageGetJSON, storageSet, storageRemove } from '../utils/storage.js';

// Un guardado sólo es utilizable si apunta a un paso concreto.
const isValidSave = (d) => d && typeof d === 'object' && Number.isInteger(d.currentStep) && d.currentStep >= 1;

class PersistenceManager {
    constructor() {
        this.SAVE_KEY = 'nakasthu_save_v1';
        this.LORE_KEY = 'nakasthu_lore_v1';
    }

    /**
     * Guarda el estado actual del juego.
     */
    saveGame(gameState, { silent = false } = {}) {
        const data = {
            currentStep: gameState.currentStep,
            storyPath: gameState.storyPath,
            unlockedModules: Array.from(gameState.unlockedModules || []),
            timestamp: Date.now()
        };
        storageSet(this.SAVE_KEY, JSON.stringify(data));
        console.log("%c[SAVE] Partida guardada.", "color: #0ea5e9; font-weight: bold;");
        if (!silent) bus.emit('SYSTEM_LOG', { msg: 'SISTEMA_GUARDADO: PROGRESO_SINCRONIZADO' });
    }

    /**
     * Carga el estado guardado.
     */
    loadGame() {
        return storageGetJSON(this.SAVE_KEY, null, isValidSave);
    }

    /**
     * Guarda un fragmento de lore desbloqueado.
     */
    saveLore(loreId) {
        const lore = this.loadLore();
        if (!lore.includes(loreId)) {
            lore.push(loreId);
            storageSet(this.LORE_KEY, JSON.stringify(lore));
        }
    }

    /**
     * Carga todos los fragmentos de lore desbloqueados.
     */
    loadLore() {
        // Corrupto o con otra forma → vacío. Antes lanzaba y abortaba la carga de TODA la base de lore.
        const ids = storageGetJSON(this.LORE_KEY, [], Array.isArray);
        return ids.filter((id) => typeof id === 'string');
    }

    /**
     * Borra todo el progreso.
     */
    clearAll() {
        storageRemove(this.SAVE_KEY);
        storageRemove(this.LORE_KEY);
        console.warn("[PERSISTENCE] Todos los datos borrados.");
    }
}

export const persistenceManager = new PersistenceManager();
