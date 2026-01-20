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

    // BLOQUEO: Solo permitir tras escaneo biométrico
    const hasBiometric = subject.scannedTypes && subject.scannedTypes.includes('BIOMETRIC');
    if (!hasBiometric) {
        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[BLOQUEO] IMPOSIBLE PROCEDER: ENLACE BIOMÉTRICO NO ESTABLECIDO.',
            type: 'SYSTEM'
        });
        return;
    }

    console.log(`%c[MECHANICS] Procesando biomasa del sujeto ${subject.id}...`, "color: #ff0000; font-weight: bold;");

    state.startBatch();
    
    // Notificar pico visual para el layout (VFX perimetral)
    bus.emit('SACRIFICE_PEAK');
    
    // Consecuencias de Veracidad
    if (subject.isCorrupt) {
        // Limpieza exitosa
        state.energy = Math.min(100, state.energy + 30);
        state.stability = Math.min(100, state.stability + 5);
        state.stats.corruptsDetected++;
        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[LOG] CORRUPCIÓN DETECTADA Y ELIMINADA. +30 ENERGÍA | +5 ESTABILIDAD.',
            type: 'SYSTEM'
        });
        bus.emit('TRIGGER_FLASH', { color: 'rgba(16, 185, 129, 0.3)', duration: 150 });
    } else {
        // Error crítico: Sacrificio de inocente
        state.energy = Math.min(100, state.energy + 30);
        state.stability = Math.max(0, state.stability - 25);
        state.stats.innocentsSacrificed++;
        state.judgmentErrors++;
        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[CRITICAL ERROR] SUJETO INOCENTE PROCESADO. +30 ENERGÍA | -25 ESTABILIDAD.',
            type: 'SYSTEM'
        });
        // Feedback visual de error crítico
        bus.emit('CRITICAL_ERROR_FEEDBACK');
        bus.emit('TRIGGER_FLASH', { color: 'rgba(220, 38, 38, 0.5)', duration: 200 });
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

    // BLOQUEO: Solo permitir tras escaneo biométrico
    const hasBiometric = subject.scannedTypes && subject.scannedTypes.includes('BIOMETRIC');
    if (!hasBiometric) {
        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[BLOQUEO] IMPOSIBLE PROCEDER: ENLACE BIOMÉTRICO NO ESTABLECIDO.',
            type: 'SYSTEM'
        });
        return;
    }

    console.log(`%c[MECHANICS] Autorizando sujeto ${subject.id}. Protocolo de fe actualizado.`, "color: #00ff00;");

    state.startBatch();
    
    if (subject.isCorrupt) {
        // Brecha de seguridad: Autorizar corrupto
        state.stability = Math.max(0, state.stability - 30);
        state.stats.corruptsAuthorized++;
        state.judgmentErrors++;
        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[ALERTA] BRECHA DE SEGURIDAD DETECTADA: ENTIDAD CORRUPTA AUTORIZADA. -30 ESTABILIDAD.',
            type: 'SYSTEM'
        });
        // Feedback visual de error crítico
        bus.emit('CRITICAL_ERROR_FEEDBACK');
        bus.emit('TRIGGER_FLASH', { color: 'rgba(220, 38, 38, 0.5)', duration: 200 });
    } else {
        // Autorización correcta
        state.energy = Math.max(0, state.energy - 10);
        state.stability = Math.min(100, state.stability + 10);
        state.stats.innocentsAuthorized++;
        bus.emit('DIALOGUE_EMITTED', {
            sender: 'SISTEMA',
            text: '[INFO] SUJETO LIMPIO AUTORIZADO. -10 ENERGÍA | +10 ESTABILIDAD.',
            type: 'SYSTEM'
        });
        bus.emit('TRIGGER_FLASH', { color: 'rgba(59, 130, 246, 0.3)', duration: 150 });
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
 */
export const updateResonance = () => {
    if (state.gameStatus !== 'PLAYING') return state.resonanceSync;

    const freqDiff = Math.abs(state.targetFrequency - state.localFrequency);
    
    // Cálculo de sync simplificado: 100 - (abs(Target - Player) * factor)
    // Factor de 1.6 para rango 0.1-60Hz (60 * 1.6 = 96)
    const syncPercent = Math.max(0, Math.floor(100 - (freqDiff * 1.6)));
    
    state.resonanceSync = syncPercent;
    
    if (syncPercent < 85) {
        state.stability = Math.max(0, state.stability - 0.05);
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
 * Cambia la frecuencia y fase objetivo de forma aleatoria.
 */
export const randomizeTargetFrequency = () => {
    state.targetFrequency = 0.1 + Math.random() * 59.9; // Rango 0.1 - 60.0Hz
    state.targetPhase = Math.random() * Math.PI * 2;
};
