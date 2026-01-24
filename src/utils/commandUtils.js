/**
 * COMMANDUTILS.JS
 * Utilidades para el procesamiento de comandos y respuestas de terminal.
 */
import { state } from '../core/State.js';
import { CONFIG } from '../data/gameConfig.js';

/**
 * Genera una respuesta formateada para la terminal.
 */
export const formatTerminalResponse = (text, type = 'SYSTEM', links = []) => {
    return { text, type, links };
};

/**
 * Valida si un comando puede ejecutarse según la energía y el estado.
 */
export const validateCommand = (cmd, args = []) => {
    switch (cmd) {
        case '/interrogate':
            if (state.activeDialogue) return { valid: false, error: "ERROR: ENLACE NEURAL YA ACTIVO." };
            if (state.energy < 5) return { valid: false, error: "ERROR: ENERGÍA INSUFICIENTE PARA ENLACE NEURAL (5 REQUERIDA)." };
            return { valid: true };
            
        case '/repair':
            const repairCost = CONFIG.ENERGY.REPAIR_COST || 20;
            if (state.energy < repairCost) return { valid: false, error: `ERROR: ENERGÍA INSUFICIENTE (REQUERIDA: ${repairCost})` };
            return { valid: true };
            
        case '/scan':
            if (!args[1]) return { valid: false, error: "USO: /scan [tipo]" };
            if (state.activeScan) return { valid: false, error: "ERROR: ESCANEO EN CURSO." };
            return { valid: true };
            
        default:
            return { valid: true };
    }
};

/**
 * Obtiene los comandos de ayuda basados en el estado actual.
 */
export const getHelpLinks = (unlockedCommands = []) => {
    const baseLinks = [
        { label: 'STATUS', event: 'TERMINAL_INPUT', data: '/status' },
        { label: 'INTERROGATE', event: 'TERMINAL_INPUT', data: '/interrogate' },
        { label: 'REPAIR', event: 'TERMINAL_INPUT', data: '/repair' },
        { label: 'SCAN', event: 'TERMINAL_INPUT', data: '/scan ' },
        { label: 'CLEAR', event: 'TERMINAL_INPUT', data: '/clear' }
    ];
    
    const extraLinks = unlockedCommands.map(c => ({ 
        label: c, 
        event: 'TERMINAL_INPUT', 
        data: `/${c.toLowerCase()}` 
    }));
    
    return [...baseLinks, ...extraLinks];
};
