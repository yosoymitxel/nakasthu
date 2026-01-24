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
            
            // Sincronizar entradas existentes en el archivo que puedan tener texto de fallback
            this.refreshArchiveTexts();

            console.log("%c[LORE] Base de datos de conocimiento cargada.", "color: #8b5cf6;");
        } catch (error) {
            console.error("[LORE] Error cargando base de datos de lore:", error);
        }
    }

    refreshArchiveTexts() {
        if (!state.loreArchive || state.loreArchive.length === 0) return;

        let modified = false;
        const newArchive = state.loreArchive.map(entry => {
            if (entry.loreId && this.loreDatabase[entry.loreId]) {
                const currentText = entry.text;
                const dbText = this.loreDatabase[entry.loreId];
                
                // Si el texto actual es el de fallback o está vacío, lo actualizamos
                if (!currentText || currentText.startsWith('ENTRADA DE LORE DESBLOQUEADA:') || currentText === 'Contenido cifrado...') {
                    modified = true;
                    return { ...entry, text: dbText };
                }
            }
            return entry;
        });

        if (modified) {
            state.loreArchive = newArchive;
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

    async unlockLoreById(loreId) {
        if (!loreId) return;

        // Asegurar que la base de datos esté cargada
        if (Object.keys(this.loreDatabase).length === 0) {
            await this.loadLoreDatabase();
        }

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
        if (!data) return;

        // Almacenar en el estado global (Rule: State.js loreArchive)
        const newArchive = [...state.loreArchive, {
            ...data,
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)
        }];
        
        state.loreArchive = newArchive;
        
        const logId = data.entityId || data.loreId || 'SISTEMA_GENERIC';
        console.log(`%c[LORE] Entrada archivada: ${logId}`, "color: #a78bfa; font-weight: bold;");
    }
}

export const loreSystem = new LoreSystem();
