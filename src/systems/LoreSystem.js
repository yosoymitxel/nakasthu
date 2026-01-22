/**
 * LORESYSTEM.JS (MOD-09)
 * Almacenamiento persistente de datos de escaneo en la sesión.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

class LoreSystem {
    constructor() {
        this.loreDatabase = {};
        this.init();
        this.loadLoreDatabase();
    }

    async loadLoreDatabase() {
        try {
            const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
            const isTest = typeof process !== 'undefined' && process.env && process.env.VITEST;

            let data;
            const pathUrl = './src/data/lore_database.json';

            if (isBrowser && !isTest) {
                const response = await fetch(pathUrl);
                data = await response.json();
            } else {
                const fs = await import('fs/promises');
                const path = await import('path');
                const fullPath = path.join(process.cwd(), 'src', 'data', 'lore_database.json');
                const content = await fs.readFile(fullPath, 'utf-8');
                data = JSON.parse(content);
            }

            this.loreDatabase = data.entries || {};
            console.log("%c[LORE] Base de datos de conocimiento cargada.", "color: #8b5cf6;");
        } catch (error) {
            console.error("[LORE] Error cargando base de datos de lore:", error);
        }
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
            text: this.loreDatabase[loreId] || `ENTRADA DE LORE DESBLOQUEADA: ${loreId}`,
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
