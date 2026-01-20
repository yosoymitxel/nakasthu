/**
 * COMMANDENGINE.JS
 * Procesador de comandos de la consola ZHYR_OS.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';
import { executeScan, SCAN_TYPES } from './Scanner.js';
import { interrogate } from './DialogueEngine.js';

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
        return `SYS_INFO: E:${Math.floor(state.energy)} S:${Math.floor(state.stability)}${scanStatus}`;
    }

    if (cmd === '/interrogate') {
        const response = interrogate();
        if (typeof response === 'string' && response.startsWith('ERROR')) {
            return response;
        }
        return `ENLACE NEURAL ESTABLECIDO. REVISAR MÓDULO COMS (MOD-05).`;
    }
    
    if (cmd === '/repair') {
        if (state.energy > 30) {
            state.startBatch();
            state.stability = Math.min(100, state.stability + 10);
            state.energy = Math.max(0, state.energy - 25);
            state.endBatch();
            return "PROTOCOL REPAIR: SUCCESS. +10 STABILITY | -25 ENERGY";
        } else {
            return "ERROR: INSUFFICIENT ENERGY (REQUIRED: 30)";
        }
    }

    if (cmd === '/overload') {
        state.startBatch();
        state.stability = Math.min(100, state.stability + 50);
        state.moduleLock = { bioscan: true, subject: true };
        state.endBatch();

        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[CRITICAL] SOBRECARGA ACTIVADA: RESTAURANDO ESTABILIDAD. MÓDULOS BIOSCAN/VISUALIZER DESACTIVADOS POR 15S.',
            type: 'SYSTEM'
        });

        setTimeout(() => {
            state.moduleLock = { bioscan: false, subject: false };
            bus.emit('DIALOGUE_EMITTED', {
                sender: 'SISTEMA',
                text: '[INFO] REINICIO DE MÓDULOS COMPLETADO. BIOSCAN/VISUALIZER ONLINE.',
                type: 'SYSTEM'
            });
        }, 15000);

        return "OVERLOAD PROTOCOL: EXECUTED. STABILITY RESTORED.";
    }

    if (cmd === '/scan') {
        if (!args[1]) {
            return "USO: /scan [thermal|neural|nakara|biometric|resonance]";
        }

        const typeId = args[1].toUpperCase();
        const scanType = SCAN_TYPES[typeId];

        if (!scanType) {
            return `ERROR: TIPO DE ESCANEO '${args[1]}' NO RECONOCIDO.`;
        }

        if (state.activeScan) {
            return "ERROR: ESCANEO EN CURSO. ESPERE A QUE FINALICE.";
        }

        if (state.energy < scanType.cost) {
            return `ERROR: ENERGÍA INSUFICIENTE (${scanType.cost} REQUERIDA).`;
        }

        // Ejecutar escaneo de forma asíncrona (no bloqueamos la terminal)
        executeScan(scanType.id);
        return `INICIANDO PROTOCOLO ${scanType.name}...`;
    }
    
    if (cmd === '/help') {
        return "COMANDOS: /status, /repair, /scan [tipo], /clear";
    }
    
    return `ERROR: COMANDO '${cmd}' NO RECONOCIDO.`;
};
