/**
 * MECHANICSENGINE.JS
 * Lógica de decisión y consecuencia para Nakasthu.
 * Regla 2.A: Vanilla JS puro.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';

/**
 * Procesa el sacrificio del sujeto actual para recuperar energía.
 */
export const handleSacrifice = () => {
    const subject = state.currentEntity;
    if (!subject || state.gameStatus !== 'PLAYING') return;

    // BLOQUEO: Solo permitir tras escaneo específico (excepto en tutorial paso 3)
    const isTutorialOverride = state.tutorialStep === 3;
    const requiredType = state.requiredScan || 'BIOMETRIC';
    const hasRequiredScan = subject.scannedTypes && subject.scannedTypes.includes(requiredType);
    
    if (!hasRequiredScan && !isTutorialOverride) {
        bus.emit('TERMINAL_PRINT', {
            text: `[BLOQUEO] IMPOSIBLE PROCEDER: ENLACE ${requiredType} NO ESTABLECIDO.`,
            type: 'SYSTEM'
        });
        return;
    }

    console.log(`%c[MECHANICS] Procesando biomasa del sujeto ${subject.id}...`, "color: #ff0000; font-weight: bold;");

    state.startBatch();
    
    // Notificar pico visual para el layout (VFX perimetral)
    bus.emit('SACRIFICE_PEAK');
    
    if (!state.isTutorialActive) {
        // Consecuencias de Veracidad
        if (subject.isCorrupt) {
            // Limpieza exitosa
            state.energy = Math.min(100, state.energy + 80);
            state.stability = Math.min(100, state.stability + 15);
            state.stats.corruptsDetected++;
            bus.emit('TERMINAL_PRINT', {
                text: '[LOG] CORRUPCIÓN DETECTADA Y ELIMINADA. +80 ENERGÍA | +15 ESTABILIDAD.',
                type: 'SYSTEM'
            });
            bus.emit('TRIGGER_FLASH', { color: 'rgba(16, 185, 129, 0.3)', duration: 150 });
        } else {
            // Error crítico: Sacrificio de inocente
            state.energy = Math.min(100, state.energy + 60);
            state.stability = Math.max(0, state.stability - 25);
            state.stats.innocentsSacrificed++;
            state.judgmentErrors++;
            bus.emit('TERMINAL_PRINT', {
                text: '[CRITICAL ERROR] SUJETO INOCENTE PROCESADO. +60 ENERGÍA | -25 ESTABILIDAD.',
                type: 'SYSTEM'
            });
            // Feedback visual de error crítico
            bus.emit('CRITICAL_ERROR_FEEDBACK');
            bus.emit('TRIGGER_FLASH', { color: 'rgba(220, 38, 38, 0.5)', duration: 200 });
        }
    } else {
        // En el tutorial solo notificamos el acto
        bus.emit('TERMINAL_PRINT', {
            text: `[TUTORIAL] PROCESO COMPLETADO. RECURSOS CONSERVADOS POR PROTOCOLO DE INDUCCIÓN.`,
            type: 'INFO'
        });
    }
    
    state.processedCount++;
    checkGameStatus();
    
    state.endBatch();

    // Notificar fin de sesión para limpiar terminal/coms
    bus.emit('SESSION_TERMINATED');

    // Feedback en Terminal (MOD-09)
    bus.emit('TERMINAL_PRINT', {
        text: `SUJETO ${subject.id} ARCHIVADO. PROCESANDO SIGUIENTE EN COLA...`
    });

    // Pequeño delay para la inmersión antes de cambiar de sujeto
    if (state.gameStatus === 'PLAYING') {
        setTimeout(() => {
            state.nextSubject();
            randomizeTargetFrequency();
        }, 1500);
    }
};

/**
 * Autoriza al sujeto, aumentando la fe del sistema.
 */
export const handleAuthorize = () => {
    const subject = state.currentEntity;
    if (!subject || state.gameStatus !== 'PLAYING') return;

    // BLOQUEO: Solo permitir tras escaneo específico (excepto en tutorial paso 3)
    const isTutorialOverride = state.tutorialStep === 3;
    const requiredType = state.requiredScan || 'BIOMETRIC';
    const hasRequiredScan = subject.scannedTypes && subject.scannedTypes.includes(requiredType);

    if (!hasRequiredScan && !isTutorialOverride) {
        bus.emit('TERMINAL_PRINT', {
            text: `[BLOQUEO] IMPOSIBLE PROCEDER: ENLACE ${requiredType} NO ESTABLECIDO.`,
            type: 'SYSTEM'
        });
        return;
    }

    console.log(`%c[MECHANICS] Autorizando sujeto ${subject.id}. Protocolo de fe actualizado.`, "color: #00ff00;");

    state.startBatch();
    
    if (!state.isTutorialActive) {
        if (subject.isCorrupt) {
            // Brecha de seguridad: Autorizar corrupto
            state.stability = Math.max(0, state.stability - 30);
            state.stats.corruptsAuthorized++;
            state.judgmentErrors++;
            bus.emit('TERMINAL_PRINT', {
                text: '[ALERTA] BRECHA DE SEGURIDAD DETECTADA: ENTIDAD CORRUPTA AUTORIZADA. -30 ESTABILIDAD.',
                type: 'SYSTEM'
            });
            // Feedback visual de error crítico
            bus.emit('CRITICAL_ERROR_FEEDBACK');
            bus.emit('TRIGGER_FLASH', { color: 'rgba(220, 38, 38, 0.5)', duration: 200 });
        } else {
            // Autorización correcta
            state.energy = Math.max(0, state.energy - 1);
            state.stability = Math.min(100, state.stability + 20);
            state.stats.innocentsAuthorized++;
            bus.emit('TERMINAL_PRINT', {
                text: '[INFO] SUJETO LIMPIO AUTORIZADO. -1 ENERGÍA | +20 ESTABILIDAD.',
                type: 'SYSTEM'
            });
            bus.emit('TRIGGER_FLASH', { color: 'rgba(59, 130, 246, 0.3)', duration: 150 });
        }
    } else {
        // En el tutorial solo notificamos el acto
        bus.emit('TERMINAL_PRINT', {
            text: `[TUTORIAL] AUTORIZACIÓN COMPLETADA. PROTOCOLO DE INDUCCIÓN: SIN CAMBIOS EN VITALES.`,
            type: 'INFO'
        });
    }
    
    // Feedback visual específico para MOD-04
    bus.emit('AUTHORIZE_EFFECT');
    
    state.processedCount++;
    checkGameStatus();
    
    state.endBatch();

    // Notificar fin de sesión para limpiar terminal/coms
    bus.emit('SESSION_TERMINATED');

    // Feedback en Terminal (MOD-09)
    bus.emit('TERMINAL_PRINT', {
        text: `SUJETO ${subject.id} ARCHIVADO. PROCESANDO SIGUIENTE EN COLA...`
    });

    if (state.gameStatus === 'PLAYING') {
        setTimeout(() => {
            state.nextSubject();
            randomizeTargetFrequency();
        }, 1500);
    }
};

/**
 * Verifica si se ha cumplido la cuota o si hay Game Over.
 */
const checkGameStatus = () => {
    if (state.stability <= 0) {
        state.gameStatus = 'GAME_OVER';
        console.log("%c[SYSTEM] BASTIÓN COLAPSADO. CONEXIÓN PERDIDA.", "color: #ff0000; font-weight: bold;");
        return;
    }

    if (state.processedCount >= state.quota) {
        // En Fase 15 podríamos tener un estado VICTORY o simplemente fin de turno
        state.gameStatus = 'GAME_OVER'; // O un nuevo estado de victoria si se requiere
        console.log("%c[SYSTEM] CUOTA CUMPLIDA. EVALUANDO DESEMPEÑO...", "color: #00ff00; font-weight: bold;");
        
        // Feedback en Terminal (MOD-09)
        bus.emit('TERMINAL_PRINT', {
            text: 'TURNO FINALIZADO. REPORTE ENVIADO AL ALTO MANDO ZHYR.'
        });
    }
};

/**
 * Actualiza la sincronía de resonancia.
 * Centralizado para ser llamado desde GameLoop y UI (Oscilloscope).
 */
export const updateResonance = () => {
    // En el tutorial permitimos que funcione siempre para poder avanzar
    if (state.gameStatus !== 'PLAYING' && !state.isTutorialActive) return state.resonanceSync;

    const freqDiff = Math.abs(state.targetFrequency - state.localFrequency);
    
    // Cálculo de sync: 100 - abs(diff)
    // Usamos el mismo cálculo que el GameLoop para consistencia
    const syncPercent = Math.max(0, Math.floor(100 - freqDiff));
    
    state.resonanceSync = syncPercent;
    
    // Solo drenar estabilidad si no estamos en el tutorial (pasos 1-3)
    const isTutorialStep = state.tutorialStep > 0 && state.tutorialStep < 4;
    
    if (!isTutorialStep) {
        if (syncPercent < 40) {
            state.stability = Math.max(0, state.stability - 0.5);
        } else if (syncPercent > 90) {
            state.stability = Math.min(100, state.stability + 0.2);
        }
    }
    
    bus.emit('RESONANCE_UPDATE', { 
        sync: syncPercent,
        stability: state.stability,
        target: state.targetFrequency,
        local: state.localFrequency,
        phase: state.localPhase
    });
    
    return syncPercent;
};

/**
 * Cambia la frecuencia y fase objetivo de forma aleatoria,
 * y rota el requisito de escaneo para el siguiente sujeto.
 */
export const randomizeTargetFrequency = () => {
    state.targetFrequency = 0.1 + Math.random() * 59.9; // Rango 0.1 - 60.0Hz
    state.targetPhase = Math.random() * Math.PI * 2;

    // Rotar requisito de escaneo entre los 5 tipos disponibles
    const scanKeys = ['THERMAL', 'NEURAL', 'NAKARA', 'BIOMETRIC', 'RESONANCE'];
    state.requiredScan = scanKeys[Math.floor(Math.random() * scanKeys.length)];
    
    console.log(`%c[MECHANICS] Siguiente requisito de bloqueo: ${state.requiredScan}`, "color: #06b6d4;");
};
