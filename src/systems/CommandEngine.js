/**
 * COMMANDENGINE.JS
 * Procesador de comandos de la consola ZHYR_OS.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';
import { executeScan, SCAN_TYPES } from './Scanner.js';
import { dialogueEngine } from './DialogueEngine.js';
import { CONFIG } from '../data/gameConfig.js';
import { formatTerminalResponse, validateCommand, getHelpLinks } from '../utils/commandUtils.js';

let lastCommand = null;

export const processCommand = (input) => {
    const args = input.trim().split(' ');
    const cmdInput = input.trim().toLowerCase();
    const cmd = args[0].toLowerCase();

    // Validación: No procesar comandos duplicados consecutivos
    if (cmdInput === lastCommand) {
        return formatTerminalResponse("ERROR: COMANDO REPETIDO DETECTADO. FLUJO BLOQUEADO.", 'error');
    }
    lastCommand = cmdInput;

    // Validar comando y recursos
    const validation = validateCommand(cmd, args);
    if (!validation.valid) {
        return formatTerminalResponse(validation.error, 'error');
    }

    if (cmd === '/status') {
        const scanStatus = state.activeScan
            ? ` | SCAN: ${state.activeScan.name} (${state.activeScan.progress.toFixed(0)}%)`
            : " | SCAN: IDLE";

        return formatTerminalResponse(
            `SYS_INFO: E:${Math.floor(state.energy)} S:${Math.floor(state.stability)}${scanStatus}`,
            state.energy < CONFIG.SYSTEM.ENERGY_WARNING_THRESHOLD ? 'CRITICAL' : 'SYSTEM',
            [
                { label: 'REPAIR', event: 'TERMINAL_INPUT', data: '/repair' },
                { label: 'SCAN_THERMAL', event: 'TERMINAL_INPUT', data: '/scan thermal' }
            ]
        );
    }

    if (cmd === '/interrogate') {
        state.energy -= 5;
        dialogueEngine.triggerRandomDialogue();
        return formatTerminalResponse(
            `ENLACE NEURAL ESTABLECIDO. REVISAR MÓDULO COMS (MOD-05). | -5 ENERGY`,
            'success'
        );
    }

    if (cmd === '/repair') {
        state.startBatch();
        state.stability = Math.min(100, state.stability + 10);
        state.energy = Math.max(0, state.energy - CONFIG.ENERGY.REPAIR_COST);
        state.endBatch();
        return formatTerminalResponse(
            `PROTOCOL REPAIR: SUCCESS. +10 STABILITY | -${CONFIG.ENERGY.REPAIR_COST} ENERGY`,
            'success'
        );
    }

    if (cmd === '/lore') {
        state.gameStatus = 'LORE_ARCHIVE';
        return formatTerminalResponse(
            "ACCEDIENDO AL ARCHIVO DE LORE... CONEXIÓN ESTABLECIDA.",
            'success'
        );
    }

    if (cmd === '/overload') {
        state.startBatch();
        state.stability = Math.min(100, state.stability + 50);
        state.moduleLock = { bioscan: true, subject: true };
        state.endBatch();

        bus.emit('TERMINAL_PRINT', formatTerminalResponse(
            '[CRITICAL] SOBRECARGA ACTIVADA: RESTAURANDO ESTABILIDAD. MÓDULOS BIOSCAN/VISUALIZER DESACTIVADOS POR 15S.',
            'SYSTEM'
        ));

        setTimeout(() => {
            state.moduleLock = { bioscan: false, subject: false };
            bus.emit('TERMINAL_PRINT', formatTerminalResponse(
                '[INFO] REINICIO DE MÓDULOS COMPLETADO. BIOSCAN/VISUALIZER ONLINE.',
                'SYSTEM'
            ));
        }, 15000);

        return "OVERLOAD PROTOCOL: EXECUTED. STABILITY RESTORED.";
    }

    if (cmd === '/scan') {
        const typeId = args[1].toUpperCase();
        const scanType = SCAN_TYPES[typeId];

        if (!scanType) {
            return formatTerminalResponse(`ERROR: TIPO DE ESCANEO '${args[1]}' NO RECONOCIDO.`, 'error');
        }

        executeScan(scanType.id);
        return formatTerminalResponse(`INICIANDO PROTOCOLO ${scanType.name}...`, 'SYSTEM');
    }

    if (cmd === '/help') {
        return formatTerminalResponse(
            "COMANDOS AUTORIZADOS EN ZHYR_OS:",
            'INFO',
            getHelpLinks(state.unlockedCommands)
        );
    }

    // Comandos de Lore Desbloqueables
    if (cmd === '/logs') {
        if (!state.unlockedCommands?.includes('LOGS')) return formatTerminalResponse("ERROR: ACCESO DENEGADO. CREDENCIALES INSUFICIENTES.", 'error');
        return formatTerminalResponse(
            "[ARCHIVO KRON-42] Orval reportó 1/3 de bajas. La realidad es que el Monolito seleccionó a los 'aptos'. Leina intentó advertir sobre la asimilación neural.",
            'INFO'
        );
    }

    if (cmd === '/zh-archive') {
        if (!state.unlockedCommands?.includes('ZH_ARCHIVE')) return formatTerminalResponse("ERROR: ACCESO DENEGADO.", 'error');
        return formatTerminalResponse(
            "[ZH_HISTORY] Zhyr: Planeta de clase X-9. Descubierto por la Orden. El Monolito no es nativo. Los símbolos en su superficie son un mapa de la red neural humana.",
            'INFO'
        );
    }

    if (cmd === '/kamin-intel') {
        if (!state.unlockedCommands?.includes('KAMIN_INTEL')) return formatTerminalResponse("ERROR: ACCESO DENEGADO.", 'error');
        return formatTerminalResponse(
            "[INTEL_KAMIN] El Mensajero afirma haber cruzado. Informes de infiltrados sugieren que sus seguidores están grabando símbolos en su piel. El Bastión se está convirtiendo en un templo.",
            'INFO'
        );
    }

    return formatTerminalResponse(`ERROR: COMANDO '${cmd}' NO RECONOCIDO O NO AUTORIZADO.`, 'error');
};
