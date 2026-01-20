/**
 * LORESYSTEM.JS (MOD-09)
 * Almacenamiento persistente de datos de escaneo en la sesión.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

class LoreSystem {
    constructor() {
        this.init();
    }

    init() {
        bus.on('LORE_DATA_EMITTED', (data) => {
            this.saveToArchive(data);
        });

        bus.on('LORE_UNLOCKED', (loreId) => {
            this.unlockLoreById(loreId);
        });

        console.log("%c[LORE] Sistema de archivo MOD-09 operativo.", "color: #8b5cf6; font-weight: bold;");
    }

    /**
     * Desbloquea una entrada de lore específica por su ID.
     */
    unlockLoreById(loreId) {
        if (!loreId) return;

        // Evitar duplicados
        if (state.loreArchive.some(entry => entry.loreId === loreId)) return;

        const loreData = {
            loreId: loreId,
            timestamp: Date.now(),
            source: 'NEURAL_LINK',
            type: 'ENIGMA'
        };

        this.saveToArchive(loreData);
        
        bus.emit('TERMINAL_PRINT', {
            text: `[ALERTA] NUEVA ENTRADA DE LORE DESBLOQUEADA: ${loreId}`,
            type: 'SUCCESS'
        });
    }

    saveToArchive(data) {
        // Almacenar en el estado global (Rule: State.js loreArchive)
        const newArchive = [...state.loreArchive, {
            ...data,
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)
        }];
        
        state.loreArchive = newArchive;
        
        console.log(`%c[LORE] Entrada archivada: ${data.entityId}`, "color: #a78bfa;");
    }
}

export const loreSystem = new LoreSystem();
