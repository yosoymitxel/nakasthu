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
        console.log("%c[LORE] Sistema de archivo MOD-09 operativo.", "color: #8b5cf6; font-weight: bold;");
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
