/**
 * SCANNER.JS
 * Lógica de sistemas para escaneo de sujetos.
 * Regla 2.A: Motor Vanilla JS.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';

export const SCAN_TYPES = {
    THERMAL: { id: 'THERMAL', name: 'TÉRMICO', cost: 0.5, duration: 2000 },
    NEURAL: { id: 'NEURAL', name: 'NEURAL', cost: 1, duration: 4000 },
    NAKARA: { id: 'NAKARA', name: 'SONDA NAKARA', cost: 2, duration: 6000 },
    BIOMETRIC: { id: 'BIOMETRIC', name: 'BIO-MÉTRICO', cost: 0.5, duration: 2500 },
    RESONANCE: { id: 'RESONANCE', name: 'RESONANCIA', cost: 1, duration: 5000 }
};

/**
 * Ejecuta un escaneo consumiendo energía.
 * @param {string} typeId - ID del tipo de escaneo.
 */
export const executeScan = async (typeId) => {
    const scan = SCAN_TYPES[typeId];
    if (!scan || state.activeScan) return false;

    // Verificar energía
    if (state.energy < scan.cost) {
        console.warn(`[SCANNER] Energía insuficiente para ${scan.name}`);
        bus.emit('LOW_POWER', { required: scan.cost, current: state.energy });
        return false;
    }

    // Consumir energía (Solo si no estamos en el tutorial)
    if (!state.isTutorialActive) {
        state.energy = Math.max(0, state.energy - scan.cost);
    }
    
    // Calcular duración ajustada por sincronía de resonancia (MOD-06)
    const syncBonus = (state.resonanceSync / 100) * 0.5;
    const adjustedDuration = scan.duration * (1 - syncBonus);

    // Notificar inicio y establecer estado global
    state.activeScan = { id: scan.id, progress: 0, name: scan.name };
    bus.emit('SCAN_STARTED', { type: scan });
    
    console.log(`%c[SCANNER] Iniciando ${scan.name}...`, "color: #00ffff; font-weight: bold;");

    // Simular proceso con actualización de progreso
    return new Promise((resolve) => {
        let elapsedReal = 0;
        const interval = setInterval(() => {
            if (state.isPaused) return;

            elapsedReal += 100;
            const progress = Math.min((elapsedReal / adjustedDuration) * 100, 100);
            
            // Actualizar progreso en el estado global
            state.activeScan = { ...state.activeScan, progress };

            if (progress >= 100) {
                clearInterval(interval);
                
                console.log(`%c[SCANNER] ${scan.name} completado.`, "color: #00ff00;");
                
                // Notificar al MOD-05 (COMS) y otros
                bus.emit('SCAN_COMPLETED', { 
                    type: scan, 
                    result: 'DATA_EXTRACTED',
                    subject: state.currentEntity,
                    timestamp: Date.now()
                });

                bus.emit('TERMINAL_PRINT', {
                    text: `[REPORTE] ESCANEO ${scan.name} FINALIZADO PARA SUJETO ${state.currentEntity?.id || '?'}.`,
                    type: 'SYSTEM'
                });

                // REGLA: Si el escaneo es BIOMÉTRICO, emitir señal para habilitar decisiones
                if (scan.id === 'BIOMETRIC') {
                    bus.emit('BIOMETRICO_COMPLETO', { subjectId: state.currentEntity?.id });
                }

                // Registrar el tipo de escaneo en el sujeto
                if (state.currentEntity) {
                    const currentScans = state.currentEntity.scannedTypes || [];
                    if (!currentScans.includes(scan.id)) {
                        state.currentEntity = {
                            ...state.currentEntity,
                            scannedTypes: [...currentScans, scan.id]
                        };
                    }
                }

                // Limpiar estado
                state.activeScan = null;
                resolve(true);
            }
        }, 100); // Actualización cada 100ms para balancear fluidez y performance
    });
};
