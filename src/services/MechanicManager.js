
/**
 * MECHANICMANAGER.JS
 * Centraliza la lógica de las mecánicas especiales del juego.
 * Implementa un patrón polimórfico para manejar diferentes tipos de interacciones.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';
import { CONFIG } from '../data/gameConfig.js';
import { PATH_CONFIGS } from '../data/pathConfigs.js';
import { cancelScan } from '../systems/Scanner.js';
import { calculateDecisionResult, calculateSyncStabilityEffect } from '../utils/gameplayUtils.js';

class BaseMechanic {
    constructor(config) {
        this.config = config;
    }
    init() { }
    update(data) { }
    destroy() {
        // Para ser sobrescrito por subclases
    }
    complete() {
        bus.emit('MECHANIC_COMPLETE', { type: this.constructor.name });
    }
}

/**
 * Mecánica de Sincronía (MOD-06)
 */
class SyncMechanic extends BaseMechanic {}

/**
 * Mecánica de Decisión (MOD-04)
 * Maneja Autorizar/Sacrificar sujetos.
 */
class DecisionMechanic extends BaseMechanic {
    constructor(config) {
        super(config);
        this.subs = [];
    }

    init() {
        this.subs.push(bus.on('AUTHORIZE_REQUEST', () => this.handleAuthorize()));
        this.subs.push(bus.on('SACRIFICE_REQUEST', () => this.handleSacrifice()));
    }

    destroy() {
        this.subs.forEach(unsub => unsub());
        this.subs = [];
    }

    handleAuthorize() {
        const subject = state.currentEntity;
        if (!subject || state.gameStatus !== 'PLAYING') return;

        // PREVENCIÓN: Evitar doble decisión sobre el mismo sujeto
        if (subject._processed) return;
        subject._processed = true;

        // BLOQUEO: Solo permitir tras escaneo específico
        const requiredType = state.requiredScan || 'BIOMETRIC';
        const hasRequiredScan = subject.scannedTypes && subject.scannedTypes.includes(requiredType);

        if (!hasRequiredScan && !state.isTutorialActive) {
            bus.emit('TERMINAL_PRINT', {
                text: `[BLOQUEO] IMPOSIBLE PROCEDER: ENLACE ${requiredType} NO ESTABLECIDO.`,
                type: 'SYSTEM'
            });
            return;
        }

        const storyPath = state.storyPath || 0;
        const pathConfig = PATH_CONFIGS[storyPath];

        // Calcular resultado usando utilidad
        const result = calculateDecisionResult(subject, 'authorize', CONFIG);

        // Detener escaneos en curso para evitar contaminación del siguiente NPC (Fase 18)
        cancelScan();

        state.startBatch();

        // Aplicar cambios
        if (result.energyChange !== 0) state.energy = Math.max(0, Math.min(100, state.energy + result.energyChange));
        if (result.stabilityChange !== 0) state.stability = Math.max(0, Math.min(100, state.stability + result.stabilityChange));
        if (result.unrestChange !== 0) state.unrest = Math.max(0, Math.min(100, state.unrest + result.unrestChange));

        if (result.isError) {
            state.judgmentErrors++;
            if (result.flash) bus.emit('TRIGGER_FLASH', result.flash);
            bus.emit('TERMINAL_PRINT', {
                text: pathConfig.decisions.authorize.fail,
                type: 'ERROR'
            });
        } else {
            bus.emit('TERMINAL_PRINT', {
                text: pathConfig.decisions.authorize.success,
                type: 'SUCCESS'
            });
        }

        // REGLA: El incremento de processedCount ahora lo gestiona GameSequencer.js
        // para centralizar la validación de cuota y evitar el error 6/5.

        state.endBatch();

        bus.emit('AUTHORIZE_EFFECT');
        bus.emit('DECISION_MADE', { subject, action: 'authorize' });
        bus.emit('SESSION_TERMINATED');
    }

    handleSacrifice() {
        const subject = state.currentEntity;
        if (!subject || state.gameStatus !== 'PLAYING') return;

        // PREVENCIÓN: Evitar doble decisión sobre el mismo sujeto
        if (subject._processed) return;
        subject._processed = true;

        const requiredType = state.requiredScan || 'BIOMETRIC';
        const hasRequiredScan = subject.scannedTypes && subject.scannedTypes.includes(requiredType);

        if (!hasRequiredScan && !state.isTutorialActive) {
            bus.emit('TERMINAL_PRINT', {
                text: `[BLOQUEO] IMPOSIBLE PROCEDER: ENLACE ${requiredType} NO ESTABLECIDO.`,
                type: 'SYSTEM'
            });
            return;
        }

        const storyPath = state.storyPath || 0;
        const pathConfig = PATH_CONFIGS[storyPath];

        // Calcular resultado usando utilidad
        const result = calculateDecisionResult(subject, 'sacrifice', CONFIG);

        // Detener escaneos en curso para evitar contaminación del siguiente NPC (Fase 18)
        cancelScan();

        state.startBatch();

        // Aplicar cambios
        if (result.energyChange !== 0) state.energy = Math.max(0, Math.min(100, state.energy + result.energyChange));
        if (result.stabilityChange !== 0) state.stability = Math.max(0, Math.min(100, state.stability + result.stabilityChange));
        if (result.unrestChange !== 0) state.unrest = Math.max(0, Math.min(100, state.unrest + result.unrestChange));

        // CRÍTICO: Limpiar sujeto actual para forzar la regeneración en el siguiente tick
        // NOTA: GameSequencer también limpia esto, pero lo hacemos aquí por seguridad de doble-check
        state.currentEntity = null;

        if (result.isError) {
            state.judgmentErrors++;
            if (result.flash) bus.emit('TRIGGER_FLASH', result.flash);
            bus.emit('TERMINAL_PRINT', {
                text: pathConfig.decisions.sacrifice.fail,
                type: 'ERROR'
            });
        } else {
            bus.emit('TERMINAL_PRINT', {
                text: pathConfig.decisions.sacrifice.success,
                type: 'SUCCESS'
            });
        }

        // REGLA: El incremento de processedCount ahora lo gestiona GameSequencer.js

        state.endBatch();

        bus.emit('SACRIFICE_EFFECT');
        bus.emit('DECISION_MADE', { subject, action: 'sacrifice' });
        bus.emit('SESSION_TERMINATED');
    }
}

/**
 * REGISTRO DE MECÁNICAS
 * Permite añadir nuevas mecánicas simplemente registrando la clase aquí.
 */
const MECHANIC_REGISTRY = {
    'SYNC': SyncMechanic,
    'DECISION': DecisionMechanic,
    'DEFAULT': BaseMechanic
};

export const MechanicManager = {
    currentMechanic: null,
    initialized: false,

    init(stepConfig) {
        if (!this.initialized) {
            // Listeners para emergencias (Solo registrar una vez)
            bus.on('EMERGENCY_START', ({ type }) => {
                state.startBatch();
                if (!state.emergencies) state.emergencies = {};
                state.emergencies[type] = true;
                if (type === 'resonance') {
                    // Objetivo nuevo y lejos del mando: si no, la emergencia nace resuelta
                    const { FREQ_MIN, FREQ_MAX } = CONFIG.RESONANCE;
                    do { state.targetFrequency = FREQ_MIN + Math.random() * (FREQ_MAX - FREQ_MIN); }
                    while (Math.abs(state.targetFrequency - (state.localFrequency || 30)) < 8);
                    state.targetPhase = Math.random() * Math.PI * 2;
                    this.updateResonance();
                }
                state.endBatch();
            });
            bus.on('EMERGENCY_END', ({ type }) => {
                state.startBatch();
                if (!state.emergencies) state.emergencies = {};
                state.emergencies[type] = false;
                state.endBatch();
            });
            this.initialized = true;
        }

        if (this.currentMechanic) {
            this.currentMechanic.destroy();
        }

        const mechanicType = stepConfig.mechanicType || 'DEFAULT';
        const MechanicClass = MECHANIC_REGISTRY[mechanicType] || MECHANIC_REGISTRY['DEFAULT'];
        this.currentMechanic = new MechanicClass(stepConfig);

        this.currentMechanic.init();

        // Cada paso arranca sin emergencias: la resonancia del Monolito se quedaba encendida al pasar a la partida
        state.startBatch();
        state.emergencies = { resonance: false, oxygen: false, energy: false };
        state.endBatch();

        // Caso especial: Si la mecánica principal es SYNC, activar módulo de resonancia
        if (this.currentMechanic instanceof SyncMechanic) {
            state.startBatch();
            if (!state.emergencies) state.emergencies = {};
            state.emergencies.resonance = true;
            state.endBatch();
        }

        if (mechanicType !== 'DEFAULT') {
            console.log(`[MECHANIC_MANAGER] Iniciada mecánica: ${mechanicType} (${this.currentMechanic.constructor.name})`);
        }
    },

    /**
     * Registra dinámicamente una nueva mecánica (útil para Acto 4 o DLCs)
     */
    registerMechanic(type, className) {
        MECHANIC_REGISTRY[type] = className;
    },

    update(data) {
        if (this.currentMechanic) {
            this.currentMechanic.update(data);
        }
    },

    /**
     * Puente para la mecánica de sincronía
     * Ahora es persistente y se calcula siempre que el módulo esté activo.
     */
    updateResonance() {
        // En el tutorial permitimos que funcione siempre para poder avanzar
        if (state.gameStatus !== 'PLAYING' && state.gameStatus !== 'MECHANIC' && !state.isTutorialActive) {
            return state.resonanceSync;
        }

        // Asegurar que tenemos valores válidos
        const targetFreq = state.targetFrequency || 30;
        const localFreq = state.localFrequency || 30;
        const targetPhase = state.targetPhase || 0;
        const localPhase = state.localPhase || 0;

        // Cálculo de diferencia de frecuencia (0-60)
        const freqDiff = Math.abs(targetFreq - localFreq);

        // Cálculo de diferencia de fase (0 - 2PI)
        // Normalizamos la diferencia de fase para que esté entre 0 y PI
        let phaseDiff = Math.abs(targetPhase - localPhase) % (Math.PI * 2);
        if (phaseDiff > Math.PI) phaseDiff = Math.PI * 2 - phaseDiff;

        // Cálculo de sync base: Frecuencia es el 80%, Fase el 20%
        // Sensibilidad ajustada: freqDiff de 40Hz = 0% sync (antes era 20Hz)
        const freqScore = Math.max(0, 100 - (freqDiff * 2.5));
        const phaseScore = Math.max(0, 100 - (phaseDiff * (100 / Math.PI)));

        const syncPercent = Math.floor((freqScore * 0.8) + (phaseScore * 0.2));

        // Actualizar estado global (Esto disparará el Proxy -> STATE_CHANGE)
        state.resonanceSync = syncPercent;

        // Si es el mecánico activo (Paso 2), manejar la completitud
        if (this.currentMechanic instanceof SyncMechanic) {
            const required = this.currentMechanic.config.syncRequired || 85; // Bajado de 100 a 85 por defecto
            if (syncPercent >= required) {
                this.currentMechanic.complete();
            }
        }

        // Aplicar efectos a la estabilidad si no estamos en tutorial de inicio
        const isTutorialStep = state.isTutorialActive && state.tutorialStep > 0 && state.tutorialStep < 7;
        if (!isTutorialStep && state.gameStatus === 'PLAYING') {
            const stabilityChange = calculateSyncStabilityEffect(syncPercent, CONFIG);
            if (stabilityChange !== 0) {
                state.stability = Math.max(0, Math.min(100, state.stability + stabilityChange));
            }
        }

        // Emitir evento adicional por si alguien escucha (aunque la UI use useGameState)
        bus.emit('RESONANCE_UPDATE', {
            sync: syncPercent,
            stability: state.stability,
            target: targetFreq,
            local: localFreq,
            phase: localPhase
        });

        return syncPercent;
    }
};
