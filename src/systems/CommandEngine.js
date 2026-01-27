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

    const isSectarian = state.storyPath === 1;

    // Aliases para Sectario
    let effectiveCmd = cmd;
    if (isSectarian) {
        if (cmd === '/revelacion') effectiveCmd = '/scan';
        if (cmd === '/purificar') effectiveCmd = '/repair';
        if (cmd === '/comunion') effectiveCmd = '/interrogate';
        if (cmd === '/sacrificio') effectiveCmd = '/overload';
        if (cmd === '/codice') effectiveCmd = '/lore';
        if (cmd === '/vision') effectiveCmd = '/status';
    }

    if (effectiveCmd === '/status') {
        const scanStatus = state.activeScan
            ? (isSectarian ? ` | REVELACIÓN: ${state.activeScan.name} (${state.activeScan.progress.toFixed(0)}%)` : ` | SCAN: ${state.activeScan.name} (${state.activeScan.progress.toFixed(0)}%)`)
            : (isSectarian ? " | REVELACIÓN: NINGUNA" : " | SCAN: IDLE");

        return formatTerminalResponse(
            isSectarian 
                ? `ESENCIA: E:${Math.floor(state.energy)} PUREZA:${Math.floor(state.stability)}${scanStatus}`
                : `SYS_INFO: E:${Math.floor(state.energy)} S:${Math.floor(state.stability)}${scanStatus}`,
            state.energy < CONFIG.SYSTEM.ENERGY_WARNING_THRESHOLD ? 'CRITICAL' : (isSectarian ? 'success' : 'SYSTEM'),
            isSectarian ? [
                { label: 'PURIFICAR', event: 'TERMINAL_INPUT', data: '/purificar' },
                { label: 'REVELACION_ALMA', event: 'TERMINAL_INPUT', data: '/revelacion soul' }
            ] : [
                { label: 'REPAIR', event: 'TERMINAL_INPUT', data: '/repair' },
                { label: 'SCAN_THERMAL', event: 'TERMINAL_INPUT', data: '/scan thermal' }
            ]
        );
    }

    if (effectiveCmd === '/interrogate') {
        state.energy -= 5;
        dialogueEngine.triggerRandomDialogue();
        return formatTerminalResponse(
            isSectarian 
                ? `COMUNIÓN ESTABLECIDA. LAS ALMAS SUSURRAN EN EL MÓDULO DE RITOS (MOD-05). | -5 ESENCIA`
                : `ENLACE NEURAL ESTABLECIDO. REVISAR MÓDULO COMS (MOD-05). | -5 ENERGY`,
            'success'
        );
    }

    if (effectiveCmd === '/repair') {
        state.startBatch();
        state.stability = Math.min(100, state.stability + 10);
        state.energy = Math.max(0, state.energy - CONFIG.ENERGY.REPAIR_COST);
        state.endBatch();
        return formatTerminalResponse(
            isSectarian
                ? `RITO DE PURIFICACIÓN: ÉXITO. +10 PUREZA | -${CONFIG.ENERGY.REPAIR_COST} ESENCIA`
                : `PROTOCOL REPAIR: SUCCESS. +10 STABILITY | -${CONFIG.ENERGY.REPAIR_COST} ENERGY`,
            'success'
        );
    }

    if (effectiveCmd === '/lore') {
        state.gameStatus = 'LORE_ARCHIVE';
        return formatTerminalResponse(
            isSectarian
                ? "ACCEDIENDO AL CÓDICE SAGRADO... LA VERDAD SE REVELA."
                : "ACCEDIENDO AL ARCHIVO DE LORE... CONEXIÓN ESTABLECIDA.",
            'success'
        );
    }

    if (effectiveCmd === '/overload') {
        state.startBatch();
        state.stability = Math.min(100, state.stability + 50);
        state.moduleLock = { bioscan: true, subject: true };
        state.endBatch();

        bus.emit('TERMINAL_PRINT', formatTerminalResponse(
            isSectarian
                ? '[SANTUARIO] SACRIFICIO ACEPTADO: RESTAURANDO PUREZA. VISIÓN/REVELACIÓN DESACTIVADAS POR 15S.'
                : '[CRITICAL] SOBRECARGA ACTIVADA: RESTAURANDO ESTABILIDAD. MÓDULOS BIOSCAN/VISUALIZER DESACTIVADOS POR 15S.',
            isSectarian ? 'success' : 'SYSTEM'
        ));

        setTimeout(() => {
            state.moduleLock = { bioscan: false, subject: false };
            bus.emit('TERMINAL_PRINT', formatTerminalResponse(
                isSectarian
                    ? '[SANTUARIO] EL VELO SE DESVANECE. VISIÓN/REVELACIÓN RESTAURADAS.'
                    : '[INFO] REINICIO DE MÓDULOS COMPLETADO. BIOSCAN/VISUALIZER ONLINE.',
                isSectarian ? 'success' : 'SYSTEM'
            ));
        }, 15000);

        return isSectarian ? "SACRIFICIO CONSUMADO. PUREZA RESTAURADA." : "OVERLOAD PROTOCOL: EXECUTED. STABILITY RESTORED.";
    }

    if (effectiveCmd === '/scan') {
        const typeId = args[1]?.toUpperCase();
        const scanType = SCAN_TYPES[typeId];

        if (!scanType) {
            return formatTerminalResponse(
                isSectarian ? "ERROR: TIPO DE REVELACIÓN NO RECONOCIDO." : "ERROR: TIPO DE ESCANEO NO RECONOCIDO.", 
                'error'
            );
        }

        executeScan(scanType);
        return formatTerminalResponse(
            isSectarian 
                ? `INICIANDO REVELACIÓN DE ${scanType.name}...`
                : `INICIANDO ESCANEO: ${scanType.name}...`,
            'success'
        );
    }

    if (effectiveCmd === '/help') {
        return formatTerminalResponse(
            isSectarian ? "PLEGARIAS Y RITOS AUTORIZADOS:" : "COMANDOS AUTORIZADOS EN ZHYR_OS:",
            isSectarian ? 'success' : 'INFO',
            isSectarian ? [
                { label: 'VISIÓN', event: 'TERMINAL_INPUT', data: '/vision' },
                { label: 'REVELACIÓN', event: 'TERMINAL_INPUT', data: '/revelacion thermal' },
                { label: 'PURIFICAR', event: 'TERMINAL_INPUT', data: '/purificar' },
                { label: 'COMUNIÓN', event: 'TERMINAL_INPUT', data: '/comunion' },
                { label: 'SACRIFICIO', event: 'TERMINAL_INPUT', data: '/sacrificio' },
                { label: 'CÓDICE', event: 'TERMINAL_INPUT', data: '/codice' }
            ] : getHelpLinks(state.unlockedCommands)
        );
    }

    // Comandos de Lore Desbloqueables
    if (effectiveCmd === '/logs') {
        if (!state.unlockedCommands?.includes('LOGS')) return formatTerminalResponse(isSectarian ? "ERROR: TU FE ES INSUFICIENTE PARA ESTA REVELACIÓN." : "ERROR: ACCESO DENEGADO. CREDENCIALES INSUFICIENTES.", 'error');
        return formatTerminalResponse(
            isSectarian 
                ? "[REVELACIÓN KRON-42] El Profeta vio a los elegidos. El Monolito no castiga, simplemente asimila a los que están listos para la Verdad."
                : "[ARCHIVO KRON-42] Orval reportó 1/3 de bajas. La realidad es que el Monolito seleccionó a los 'aptos'. Leina intentó advertir sobre la asimilación neural.",
            isSectarian ? 'success' : 'INFO'
        );
    }

    if (effectiveCmd === '/zh-archive') {
        if (!state.unlockedCommands?.includes('ZH_ARCHIVE')) return formatTerminalResponse(isSectarian ? "ERROR: EL SANTUARIO PERMANECE CERRADO." : "ERROR: ACCESO DENEGADO.", 'error');
        return formatTerminalResponse(
            isSectarian
                ? "[GÉNESIS_ZHYR] Zhyr: Tierra Prometida. El Monolito es la llave. Los símbolos son el lenguaje de Dios, grabado en nuestra esencia."
                : "[ZH_HISTORY] Zhyr: Planeta de clase X-9. Descubierto por la Orden. El Monolito no es nativo. Los símbolos en su superficie son un mapa de la red neural humana.",
            isSectarian ? 'success' : 'INFO'
        );
    }

    if (effectiveCmd === '/kamin-intel') {
        if (!state.unlockedCommands?.includes('KAMIN_INTEL')) return formatTerminalResponse(isSectarian ? "ERROR: NO HAS SIDO LLAMADO POR EL MENSAJERO." : "ERROR: ACCESO DENEGADO.", 'error');
        return formatTerminalResponse(
            isSectarian
                ? "[SUSURROS_KAMIN] El Mensajero ha cruzado el Velo. Sus seguidores llevan la marca sagrada. El Bastión es ahora el centro de la Comunión."
                : "[INTEL_KAMIN] El Mensajero afirma haber cruzado. Informes de infiltrados sugieren que sus seguidores están grabando símbolos en su piel. El Bastión se está convirtiendo en un templo.",
            isSectarian ? 'success' : 'INFO'
        );
    }

    return formatTerminalResponse(isSectarian ? "PLEGARIA NO RECONOCIDA. ENTONA /HELP PARA GUÍA." : "COMANDO NO RECONOCIDO. ESCRIBA /HELP PARA LISTADO.", 'error');
};
