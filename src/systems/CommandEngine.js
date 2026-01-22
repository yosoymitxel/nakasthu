/**
 * COMMANDENGINE.JS
 * Procesador de comandos de la consola ZHYR_OS.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';
import { executeScan, SCAN_TYPES } from './Scanner.js';
import { dialogueEngine } from './DialogueEngine.js';

let lastCommand = null;

export const processCommand = (input) => {
    const args = input.trim().split(' ');
    const cmdInput = input.trim().toLowerCase();
    const cmd = args[0].toLowerCase();

    // Validación: No procesar comandos duplicados consecutivos (MOD-09 Protection)
    if (cmdInput === lastCommand) {
        return "ERROR: COMANDO REPETIDO DETECTADO. FLUJO BLOQUEADO.";
    }
    lastCommand = cmdInput;

    if (cmd === '/status') {
        const scanStatus = state.activeScan
            ? ` | SCAN: ${state.activeScan.name} (${state.activeScan.progress.toFixed(0)}%)`
            : " | SCAN: IDLE";

        return {
            text: `SYS_INFO: E:${Math.floor(state.energy)} S:${Math.floor(state.stability)}${scanStatus}`,
            type: state.energy < 20 ? 'CRITICAL' : 'SYSTEM',
            links: [
                { label: 'REPAIR', event: 'TERMINAL_INPUT', data: '/repair' },
                { label: 'SCAN_THERMAL', event: 'TERMINAL_INPUT', data: '/scan thermal' }
            ]
        };
    }

    if (cmd === '/interrogate') {
        if (state.activeDialogue) {
            return { text: "ERROR: ENLACE NEURAL YA ACTIVO.", type: 'error' };
        }

        if (state.energy < 5) {
            return { text: "ERROR: ENERGÍA INSUFICIENTE PARA ENLACE NEURAL (5 REQUERIDA).", type: 'error' };
        }

        state.energy -= 5;
        dialogueEngine.triggerRandomDialogue();
        return {
            text: `ENLACE NEURAL ESTABLECIDO. REVISAR MÓDULO COMS (MOD-05). | -5 ENERGY`,
            type: 'success'
        };
    }

    if (cmd === '/repair') {
        if (state.energy >= 20) {
            state.startBatch();
            state.stability = Math.min(100, state.stability + 10);
            state.energy = Math.max(0, state.energy - 20);
            state.endBatch();
            return {
                text: "PROTOCOL REPAIR: SUCCESS. +10 STABILITY | -20 ENERGY",
                type: 'success'
            };
        } else {
            return { text: "ERROR: INSUFFICIENT ENERGY (REQUIRED: 20)", type: 'error' };
        }
    }

    if (cmd === '/lore') {
        state.gameStatus = 'LORE_ARCHIVE';
        return {
            text: "ACCEDIENDO AL ARCHIVO DE LORE... CONEXIÓN ESTABLECIDA.",
            type: 'success'
        };
    }

    if (cmd === '/overload') {
        state.startBatch();
        state.stability = Math.min(100, state.stability + 50);
        state.moduleLock = { bioscan: true, subject: true };
        state.endBatch();

        bus.emit('TERMINAL_PRINT', {
            text: '[CRITICAL] SOBRECARGA ACTIVADA: RESTAURANDO ESTABILIDAD. MÓDULOS BIOSCAN/VISUALIZER DESACTIVADOS POR 15S.',
            type: 'SYSTEM'
        });

        setTimeout(() => {
            state.moduleLock = { bioscan: false, subject: false };
            bus.emit('TERMINAL_PRINT', {
                text: '[INFO] REINICIO DE MÓDULOS COMPLETADO. BIOSCAN/VISUALIZER ONLINE.',
                type: 'SYSTEM'
            });
        }, 15000);

        return "OVERLOAD PROTOCOL: EXECUTED. STABILITY RESTORED.";
    }

    if (cmd === '/scan') {
        if (!args[1]) {
            return {
                text: "USO: /scan [thermal|neural|nakara|biometric|resonance]",
                type: 'INFO',
                links: [
                    { label: 'THERMAL', event: 'TERMINAL_INPUT', data: '/scan thermal' },
                    { label: 'BIOMETRIC', event: 'TERMINAL_INPUT', data: '/scan biometric' }
                ]
            };
        }

        const typeId = args[1].toUpperCase();
        const scanType = SCAN_TYPES[typeId];

        if (!scanType) {
            return { text: `ERROR: TIPO DE ESCANEO '${args[1]}' NO RECONOCIDO.`, type: 'error' };
        }

        if (state.activeScan) {
            return { text: "ERROR: ESCANEO EN CURSO. ESPERE A QUE FINALICE.", type: 'error' };
        }

        if (state.energy < scanType.cost) {
            return { text: `ERROR: ENERGÍA INSUFICIENTE (${scanType.cost} REQUERIDA).`, type: 'error' };
        }

        // Ejecutar escaneo de forma asíncrona (no bloqueamos la terminal)
        executeScan(scanType.id);
        return { text: `INICIANDO PROTOCOLO ${scanType.name}...`, type: 'SYSTEM' };
    }

    if (cmd === '/help') {
        const available = state.unlockedCommands || [];
        return {
            text: "COMANDOS AUTORIZADOS EN ZHYR_OS:",
            type: 'INFO',
            links: [
                { label: 'STATUS', event: 'TERMINAL_INPUT', data: '/status' },
                { label: 'INTERROGATE', event: 'TERMINAL_INPUT', data: '/interrogate' },
                ...available.map(c => ({ label: c, event: 'TERMINAL_INPUT', data: `/${c.toLowerCase()}` })),
                { label: 'REPAIR', event: 'TERMINAL_INPUT', data: '/repair' },
                { label: 'SCAN', event: 'TERMINAL_INPUT', data: '/scan ' },
                { label: 'CLEAR', event: 'TERMINAL_INPUT', data: '/clear' }
            ]
        };
    }

    // Comandos de Lore Desbloqueables
    if (cmd === '/logs') {
        if (!state.unlockedCommands.includes('LOGS')) return { text: "ERROR: ACCESO DENEGADO. CREDENCIALES INSUFICIENTES.", type: 'error' };
        return {
            text: "[ARCHIVO KRON-42] Orval reportó 1/3 de bajas. La realidad es que el Monolito seleccionó a los 'aptos'. Leina intentó advertir sobre la asimilación neural.",
            type: 'INFO'
        };
    }

    if (cmd === '/zh-archive') {
        if (!state.unlockedCommands.includes('ZH_ARCHIVE')) return { text: "ERROR: ACCESO DENEGADO.", type: 'error' };
        return {
            text: "[ZH_HISTORY] Zhyr: Planeta de clase X-9. Descubierto por la Orden. El Monolito no es nativo. Los símbolos en su superficie son un mapa de la red neural humana.",
            type: 'INFO'
        };
    }

    if (cmd === '/kamin-intel') {
        if (!state.unlockedCommands.includes('KAMIN_INTEL')) return { text: "ERROR: ACCESO DENEGADO.", type: 'error' };
        return {
            text: "[INTEL_KAMIN] El Mensajero afirma haber cruzado. Informes de infiltrados sugieren que sus seguidores están grabando símbolos en su piel. El Bastión se está convirtiendo en un templo.",
            type: 'INFO'
        };
    }

    return { text: `ERROR: COMANDO '${cmd}' NO RECONOCIDO O NO AUTORIZADO.`, type: 'error' };
};
