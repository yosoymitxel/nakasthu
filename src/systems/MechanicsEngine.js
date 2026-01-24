/**
 * MECHANICSENGINE.JS
 * Lógica de decisión y consecuencia para Nakasthu.
 * Regla 2.A: Vanilla JS puro.
 */
import { state } from '../core/State.js';
import { bus } from '../core/Bus.js';
import { gameSequencer } from './GameSequencer.js';
import { CONFIG } from '../core/Config.js';

/**
 * Procesa el sacrificio del sujeto actual para recuperar energía.
 */
export const handleSacrifice = () => {
    const subject = state.currentEntity;
    if (!subject || state.gameStatus !== 'PLAYING') return;

    // BLOQUEO: Solo permitir tras escaneo específico (excepto en tutorial paso del juicio)
    const isTutorialOverride = state.isTutorialActive && state.tutorialStep === 5;
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
    state.focusMode = false; // Desactivar modo focus al cambiar de sujeto

    // Notificar pico visual para el layout (VFX perimetral)
    bus.emit('SACRIFICE_PEAK');

    if (!state.isTutorialActive) {
        // Consecuencias de Veracidad
        if (subject.isCorrupt) {
            // Limpieza exitosa
            state.energy = Math.min(100, state.energy + CONFIG.ENERGY.SACRIFICE_CORRUPT_BONUS);
            state.stability = Math.min(100, state.stability + 15);
            state.stats.corruptsDetected++;
            
            // Reducir agitación si eliminamos una amenaza real
            state.unrest = Math.max(0, state.unrest - 5);
            if (state.storyPath === 1) state.faith = Math.min(100, state.faith + 5);

            bus.emit('TERMINAL_PRINT', {
                text: `[LOG] CORRUPCIÓN DETECTADA Y ELIMINADA. +${CONFIG.ENERGY.SACRIFICE_CORRUPT_BONUS} ENERGÍA | +15 ESTABILIDAD.`,
                type: 'SYSTEM'
            });
            bus.emit('TRIGGER_FLASH', { color: 'rgba(16, 185, 129, 0.3)', duration: 150, target: 'MOD04' });
        } else {
            // Error crítico: Sacrificio de inocente
            state.energy = Math.min(100, state.energy + CONFIG.ENERGY.SACRIFICE_INOCENT_BONUS);
            state.stability = Math.max(0, state.stability - CONFIG.STABILITY.SACRIFICE_INOCENT_PENALTY);
            state.stats.innocentsSacrificed++;
            state.judgmentErrors++;

            // Aumentar agitación/herejía por error fatal
            state.unrest = Math.min(100, state.unrest + 15);
            if (state.storyPath === 1) state.faith = Math.max(0, state.faith - 10);

            bus.emit('TERMINAL_PRINT', {
                text: `[CRITICAL ERROR] SUJETO INOCENTE PROCESADO. +${CONFIG.ENERGY.SACRIFICE_INOCENT_BONUS} ENERGÍA | -${CONFIG.STABILITY.SACRIFICE_INOCENT_PENALTY} ESTABILIDAD.`,
                type: 'SYSTEM'
            });
            // Feedback visual de error crítico
            bus.emit('CRITICAL_ERROR_FEEDBACK');
            bus.emit('TRIGGER_FLASH', { color: 'rgba(220, 38, 38, 0.5)', duration: 200, target: 'MOD04' });
        }
    } else {
        // En el tutorial solo notificamos el acto
        bus.emit('TERMINAL_PRINT', {
            text: `[TUTORIAL] PROCESO COMPLETADO. RECURSOS CONSERVADOS POR PROTOCOLO DE INDUCCIÓN.`,
            type: 'INFO'
        });
    }

    state.processedCount++;
    
    // REGISTRAR RESULTADO EN EL SECUENCIADOR (Para metas de influencia/técnicos)
    gameSequencer.registerSubjectResult(subject, 'sacrifice');

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
        }, CONFIG.DELAYS.NEXT_SUBJECT);
    }
};

/**
 * Autoriza al sujeto, aumentando la fe del sistema.
 */
export const handleAuthorize = () => {
    const subject = state.currentEntity;
    if (!subject || state.gameStatus !== 'PLAYING') return;

    // BLOQUEO: Solo permitir tras escaneo específico (excepto en tutorial paso del juicio)
    const isTutorialOverride = state.isTutorialActive && state.tutorialStep === 5;
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
    state.focusMode = false; // Desactivar modo focus al cambiar de sujeto

    if (!state.isTutorialActive) {
        if (subject.isCorrupt) {
            // Brecha de seguridad: Autorizar corrupto
            state.stability = Math.max(0, state.stability - CONFIG.STABILITY.AUTHORIZE_CORRUPT_PENALTY);
            state.stats.corruptsAuthorized++;
            state.judgmentErrors++;

            // Autorizar corrupto aumenta drásticamente la agitación/herejía
            state.unrest = Math.min(100, state.unrest + 20);
            if (state.storyPath === 1) state.faith = Math.max(0, state.faith - 15);

            bus.emit('TERMINAL_PRINT', {
                text: `[ALERTA] BRECHA DE SEGURIDAD DETECTADA: ENTIDAD CORRUPTA AUTORIZADA. -${CONFIG.STABILITY.AUTHORIZE_CORRUPT_PENALTY} ESTABILIDAD.`,
                type: 'SYSTEM'
            });
            // Feedback visual de error crítico
            bus.emit('CRITICAL_ERROR_FEEDBACK');
            bus.emit('TRIGGER_FLASH', { color: 'rgba(220, 38, 38, 0.5)', duration: 200, target: 'MOD04' });
        } else {
            // Autorización correcta
            state.energy = Math.max(0, state.energy - CONFIG.ENERGY.AUTHORIZE_COST);
            state.stability = Math.min(100, state.stability + 20);
            state.stats.innocentsAuthorized++;

            // Autorización correcta calma a la población
            state.unrest = Math.max(0, state.unrest - 8);
            if (state.storyPath === 1) state.faith = Math.min(100, state.faith + 10);

            bus.emit('TERMINAL_PRINT', {
                text: `[INFO] SUJETO LIMPIO AUTORIZADO. -${CONFIG.ENERGY.AUTHORIZE_COST} ENERGÍA | +20 ESTABILIDAD.`,
                type: 'SYSTEM'
            });
            bus.emit('TRIGGER_FLASH', { color: 'rgba(59, 130, 246, 0.3)', duration: 150, target: 'MOD04' });
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

    // REGISTRAR RESULTADO EN EL SECUENCIADOR (Para metas de influencia/técnicos)
    gameSequencer.registerSubjectResult(subject, 'authorize');

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
        }, CONFIG.DELAYS.NEXT_SUBJECT);
    }
};

/**
 * Verifica si se ha cumplido la cuota o si hay Game Over.
 */
const checkGameStatus = () => {
    // 1. Verificar Colapso por Estabilidad
    if (state.stability <= 0) {
        triggerGameOver('STABILITY_COLLAPSED', 'La sincronía neural con el bastión se ha roto. El exceso de errores de juicio o la autorización de entidades corruptas ha saturado los filtros de biomasa.');
        return;
    }

    // 2. Verificar Agotamiento de Energía
    if (state.energy <= 0) {
        triggerGameOver('ENERGY_DEPLETED', 'Agotamiento de energía crítico. El sistema ha entrado en modo de hibernación forzada para preservar el núcleo.');
        return;
    }

    // 3. Verificar Margen de Errores (NUEVO REQUISITO)
    if (state.judgmentErrors >= CONFIG.MAX_JUDGMENT_ERRORS) {
        triggerGameOver('EXCESSIVE_ERRORS', `Protocolo de seguridad activado: Se ha alcanzado el límite de ${CONFIG.MAX_JUDGMENT_ERRORS} errores de juicio. El Operador ha sido relevado de sus funciones por incompetencia manifiesta.`);
        return;
    }

    // 4. Verificar Cuota para Siguiente Nivel
    if (state.processedCount >= state.quota) {
        console.log("%c[SYSTEM] CUOTA CUMPLIDA. EVALUANDO DESEMPEÑO...", "color: #00ff00; font-weight: bold;");

        // Verificar metas del paso actual antes de avanzar
        const metaResults = gameSequencer.checkStepMeta();

        if (metaResults.success) {
            const currentStep = state.currentStep;
            bus.emit('TERMINAL_PRINT', {
                text: `[SISTEMA] FASE ${currentStep} COMPLETADA. EVALUACIÓN DE PROTOCOLO: POSITIVA.`,
                type: 'SUCCESS'
            });

            // Avanzar al siguiente paso narrativo
            setTimeout(() => {
                gameSequencer.nextStep();
            }, CONFIG.DELAYS.TRANSITION);
        } else {
            // Fracaso por no cumplir metas secundarias (ej: técnicos insuficientes)
            const failureReason = metaResults.messages.join(' | ');
            triggerGameOver('PROTOCOL_ERROR', `ERROR DE PROTOCOLO: ${failureReason}`);

            bus.emit('TERMINAL_PRINT', {
                text: `[FALLO CRÍTICO] OBJETIVOS NO ALCANZADOS: ${failureReason}`,
                type: 'SYSTEM'
            });
        }
    }
};

/**
 * Dispara el fin del juego de forma centralizada.
 */
const triggerGameOver = (reason, details) => {
    state.gameStatus = 'GAME_OVER';
    bus.emit('SYSTEM_FAILURE', {
        reason,
        details,
        stats: {
            ...state.stats,
            processed: state.processedCount,
            errors: state.judgmentErrors,
            energy: state.energy,
            stability: state.stability,
            techniciansRecruited: state.techniciansRecruited,
            devotsRecruited: state.devotsRecruited
        }
    });
    console.log(`%c[SYSTEM] GAME OVER: ${reason}`, "color: #ff0000; font-weight: bold;");
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
    const syncPercent = Math.max(0, Math.floor(100 - freqDiff));

    state.resonanceSync = syncPercent;

    // Solo drenar estabilidad si no estamos en el tutorial activo (pasos de instrucción)
    const isTutorialStep = state.isTutorialActive && state.tutorialStep > 0 && state.tutorialStep < 7;

    if (!isTutorialStep) {
        if (syncPercent < 40) {
            state.stability = Math.max(0, state.stability - CONFIG.STABILITY.RESONANCE_LOW_PENALTY);
        } else if (syncPercent > 90) {
            state.stability = Math.min(100, state.stability + CONFIG.STABILITY.RESONANCE_HIGH_BONUS);
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
