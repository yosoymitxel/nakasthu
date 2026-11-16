/**
 * SCANNER.JS
 * Lógica de sistemas para escaneo de sujetos.
 * Regla 2.A: Motor Vanilla JS.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';
import { CONFIG } from '../data/gameConfig.js';
import { toInt } from '../utils/mathUtils.js';
import { calculateScanCost, calculateAdjustedDuration, analyzeSubjectProbability } from '../utils/scannerUtils.js';

export const SCAN_TYPES = CONFIG.SCANNER.TYPES;

let activeInterval = null;
let currentResolve = null;

/**
 * Cancela cualquier escaneo en curso.
 */
export const cancelScan = () => {
    if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = null;
    }
    if (currentResolve) {
        currentResolve(false);
        currentResolve = null;
    }
    state.activeScan = null;
    console.log("%c[SCANNER] Escaneo cancelado.", "color: #ff9900;");
};

// Listener global para cancelación
bus.on('SCAN_CANCEL_REQUEST', cancelScan);

/**
 * Ejecuta un escaneo consumiendo energía.
 * @param {string} typeId - ID del tipo de escaneo.
 */
export const executeScan = async (typeId) => {
    const scan = SCAN_TYPES[typeId];
    if (!scan || state.activeScan) return false;

    // Cancelar cualquier intervalo previo por seguridad
    if (activeInterval) clearInterval(activeInterval);

    // Calcular coste extra por repetición usando utilidad
    const scanCount = state.currentEntity?.scanHistory?.[typeId] || 0;
    const finalCost = calculateScanCost(scan, scanCount, CONFIG.SCANNER.REPETITION_PENALTY);

    // Verificar energía
    if (state.energy < finalCost) {
        console.warn(`[SCANNER] Energía insuficiente para ${scan.name} (Requerido: ${finalCost.toFixed(1)})`);
        bus.emit('LOW_POWER', { required: finalCost, current: state.energy });
        return false;
    }

    // Consumir energía (Solo si no estamos en el tutorial)
    if (!state.isTutorialActive) {
        state.energy = toInt(Math.max(0, state.energy - finalCost));
        bus.emit('TERMINAL_PRINT', {
            text: `[RECURSOS] ESCANEO ${scan.name} INICIADO. COSTO: ${finalCost.toFixed(1)} ENERGÍA.`,
            type: 'SYSTEM'
        });
    }
    
    // Calcular duración ajustada por sincronía de resonancia usando utilidad
    const adjustedDuration = calculateAdjustedDuration(
        scan.duration, 
        state.resonanceSync || 0, 
        CONFIG.SCANNER.SYNC_BONUS_MAX
    );

    // Notificar inicio y establecer estado global
    state.activeScan = { 
        id: scan.id, 
        progress: 0, 
        name: scan.name,
        entityId: state.currentEntity?.id // Track current entity ID
    };
    bus.emit('SCAN_STARTED', { type: scan });
    
    console.log(`%c[SCANNER] Iniciando ${scan.name}...`, "color: #00ffff; font-weight: bold;");

    // Simular proceso con actualización de progreso
    return new Promise((resolve) => {
        currentResolve = resolve;
        let elapsedReal = 0;
        const startEntityId = state.currentEntity?.id;

        activeInterval = setInterval(() => {
            if (state.isPaused) return;

            // REGLA: Si la entidad ha cambiado o el escaneo se ha limpiado, cancelar
            if (!state.currentEntity || 
                state.currentEntity.id !== startEntityId || 
                state.activeScan === null) {
                cancelScan();
                return;
            }

            elapsedReal += CONFIG.SCANNER.SCAN_INTERVAL;
            const progress = Math.min((elapsedReal / adjustedDuration) * 100, 100);
            
            // Actualizar progreso en el estado global
            state.activeScan = { ...state.activeScan, progress };

            if (progress >= 100) {
                clearInterval(activeInterval);
                activeInterval = null;
                currentResolve = null;
                
                console.log(`%c[SCANNER] ${scan.name} completado.`, "color: #00ff00;");
                
                // Registrar el tipo de escaneo y el historial en el sujeto
                if (state.currentEntity) {
                    const currentScans = state.currentEntity.scannedTypes || [];
                    const scanHistory = state.currentEntity.scanHistory || {};
                    
                    const newScans = !currentScans.includes(scan.id) 
                        ? [...currentScans, scan.id] 
                        : currentScans;
                        
                    // La lectura de corrupción es lógica de juego: vive en el motor, no en la vista.
                    // La señal es fija por sujeto: repetir un escaneo no aporta una lectura nueva.
                    const firstTime = !currentScans.includes(scan.id);
                    const probability = analyzeSubjectProbability(scan.id, state.currentEntity, state.mode);
                    const scannedData = state.currentEntity.scannedData || {};
                    const corruptionHistory = firstTime ? [...(scannedData.corruptionHistory || []), probability] : (scannedData.corruptionHistory || []);
                    state.currentEntity = {
                        ...state.currentEntity,
                        scannedTypes: newScans,
                        scanHistory: {
                            ...scanHistory,
                            [scan.id]: (scanHistory[scan.id] || 0) + 1
                        },
                        scannedData: { ...scannedData, corruptionHistory },
                        corruptionEstimate: Math.round(corruptionHistory.reduce((a, b) => a + b, 0) / corruptionHistory.length)
                    };
                    console.log(`%c[SCANNER] Lectura ${scan.id}: ${probability}%`, 'color: #00ff00;');
                    bus.emit('SCAN_COMPLETED', {
                        type: scan,
                        result: 'DATA_EXTRACTED',
                        probability,
                        subject: state.currentEntity,
                        timestamp: Date.now()
                    });
                }

                // REGLA: Si el escaneo es BIOMÉTRICO, emitir señal para habilitar decisiones
                if (scan.id === 'BIOMETRIC') {
                    bus.emit('BIOMETRICO_COMPLETO', { subjectId: state.currentEntity?.id });
                }

                // Limpiar estado
                state.activeScan = null;
                resolve(true);
            }
        }, CONFIG.SCANNER.SCAN_INTERVAL);
    });
};
