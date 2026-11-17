/**
 * STATE.JS
 * Estado global optimizado con Batch Updates.
 * Regla 2.A: Minimiza emisiones para evitar loops de re-renderizado.
 */
import { bus } from './Bus.js';
import { generateSubject, applyTraits } from '../services/EntityService.js';
import { CONFIG } from '../data/gameConfig.js';
import { STEPS_CONFIG } from '../data/stepsConfig.js';
import { storageGet, storageGetInt } from '../utils/storage.js';

let isBatching = false;

const initialState = {
    energy: CONFIG.ENERGY.INITIAL,
    stability: CONFIG.STABILITY.INITIAL,
    oxygen: 100,
    worldTime: 0,
    phase: 'SOLAR',
    currentRoom: 0,
    currentEntity: null,
    purgeActive: false,
    // Sistema de Secuencia Narrativa (12 pasos)
    currentStep: 1,          // Paso actual de la historia (1-12)
    storyPath: 0,            // 0: Ruta Técnico/Operador, 1: Ruta Religioso/Líder
    tutorialChoiceMade: false, // Si el jugador ya decidió sobre el tutorial
    // Resonancia
    targetFrequency: 0.1 + Math.random() * 59.9,
    targetPhase: Math.random() * Math.PI * 2,
    localFrequency: 30,
    localPhase: 0,
    resonanceSync: 0,
    // Escaneo
    activeScan: null, // { id, progress, type }
    // Modos y Emergencias
    mode: 'NORMAL', // 'NORMAL' | 'ECLIPSE'
    eclipseTimer: 0,
    orbitalCycle: 0, // 0-100 para visuales
    moduleLock: {
        bioscan: false, // MOD-01
        subject: false  // MOD-04
    },
    // Cuota y Estadísticas (Fase 11)
    currentTurn: 1,
    processedCount: 0,
    quota: CONFIG.DEFAULT_QUOTA,
    judgmentErrors: 0,
    maxErrors: CONFIG.MAX_JUDGMENT_ERRORS, // Agregado para visibilidad en UI
    // Totales de la partida: sobreviven al reset de cada nivel y alimentan el informe final
    runStats: { processed: 0, errors: 0 },
    cineShot: null, // plano 3D de la página de cinemática actual
    endingFaction: null, // 'orden' | 'caos': el epílogo sigue la elección, no la facción dominante
    unrest: 0,           // 0-100: Nivel de agitación civil
    faith: 0,            // 0-100: Nivel de herejía/devoción (storyPath 1)
    techniciansRecruited: 0,
    devotsRecruited: 0,
    influenceGathered: 0,
    utilidadOculta: 0,
    loreArchive: [], // Lista de información recolectada (Fase 15)
    activeDialogue: null, // Diálogo activo actual
    stats: {
        innocentsSacrificed: 0,
        corruptsDetected: 0,
        corruptsAuthorized: 0,
        innocentsAuthorized: 0
    },
    gameStatus: 'START_MENU', // 'START_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LORE_ARCHIVE' | 'CINEMATIC' | 'MECHANIC'
    previousGameStatus: 'START_MENU',
    isPaused: false,
    isModalOpen: false, // Bloquea el tick del motor si hay un modal activo
    isTutorialActive: false,
    emergencies: {
        resonance: false,
        oxygen: false,
        energy: false
    },
    o2Stabilized: false, // Bloquea el drenaje de O2 temporalmente
    activeTutorialId: null, // ID del tutorial activo actual
    tutorialStep: 0, // 0: No tutorial, 1-4: Pasos del tutorial
    focusMode: false, // Bloquea el resto de la UI durante diálogos profundos
    unlockedCommands: ['HELP', 'CLEAR', 'STATUS'], // Comandos iniciales
    hasSeenTutorial: storageGet('nakasthu_tutorial_seen') === 'true' || storageGet('nakasthu_skip_tutorials') === 'true',
    // Acotado a los pasos existentes: un valor manipulado (NaN, -3, 999) rompía o desbloqueaba el selector.
    maxStepReached: storageGetInt('nakasthu_max_step', { fallback: 1, min: 1, max: Math.max(...Object.keys(STEPS_CONFIG).map(Number)) }),
    infiniteMode: false,
    requiredScan: 'BIOMETRIC', // Tipo de escaneo requerido para decisiones (rotativo)
    usedDialogueIds: []        // Memoria de diálogos para evitar repeticiones
};

// Objeto base que contiene los métodos de batching y acciones de entidad
const stateManager = {
    ...initialState,
    startBatch() {
        isBatching = true;
    },
    endBatch() {
        isBatching = false;
        bus.emit('STATE_CHANGE', { ...state });
    },
    // Acción para rotar sujetos
    nextSubject() {
        console.log("%c[STATE] Limpiando cámara de contención...", "color: #fbbf24;");

        // REGLA: Cancelar escaneos activos al cambiar de sujeto (Fase 18)
        if (this.activeScan) {
            bus.emit('SCAN_CANCEL_REQUEST');
            this.activeScan = null;
        }

        const currentStep = this.currentStep || 1;
        const stepMeta = STEPS_CONFIG?.[currentStep]?.meta;
        const nextPos = (this.processedCount || 0) + 1;

        let newSubject = generateSubject();
        if (stepMeta?.kaminAppears && nextPos === stepMeta.kaminPosition) {
            applyTraits(newSubject, {
                id: 'KAMIN',
                type: 'SECTARIO',
                name: 'Kamin'
            });
        }

        // La cola debe poder cumplir la meta del paso: si ya no quedan sujetos
        // suficientes para reunir los técnicos que faltan, el siguiente lo es.
        const remainingAfter = Math.max(0, (this.quota || 0) - (this.processedCount || 0) - 1);
        const missingTechnicians = (stepMeta?.requiredTechnicians || 0) - (this.techniciansRecruited || 0);
        if (missingTechnicians > 0 && missingTechnicians > remainingAfter) {
            applyTraits(newSubject, { type: 'técnico' });
        }

        // Misma garantía para la influencia: el último sujeto del turno puede cerrar la meta.
        const missingInfluence = (stepMeta?.requiredInfluence || 0) - (this.influenceGathered || 0);
        if (missingInfluence > 0 && remainingAfter === 0) {
            newSubject.influence = Math.max(newSubject.influence || 0, missingInfluence);
        }

        this.currentEntity = newSubject;

        // CRÍTICO: Emitir eventos FUERA del batch para garantizar que React se actualice
        // Si estamos en batch, el proxy de State.js suprimirá STATE_CHANGE, 
        // pero NEW_SUBJECT_DETECTED no está suprimido
        bus.emit('NEW_SUBJECT_DETECTED', newSubject);

        // Forzar actualización de currentEntity incluso durante batch
        if (!isBatching) {
            bus.emit('STATE_CHANGE:currentEntity', newSubject);
        }

        console.log(`%c[STATE] Nuevo sujeto generado: ${newSubject.id}`, "color: #10b981;");
    },
    // Totales de partida: sobreviven al reinicio de contadores de cada nivel
    registerSubjectProcessed() {
        const run = this.runStats || { processed: 0, errors: 0 };
        this.runStats = { ...run, processed: run.processed + 1 };
    },
    registerJudgmentError() {
        const run = this.runStats || { processed: 0, errors: 0 };
        this.runStats = { ...run, errors: run.errors + 1 };
    },
    // Reinicio total del sistema (Fase 11)
    resetState() {
        console.log("%c[STATE] Iniciando REINICIO TOTAL del sistema...", "color: #ef4444; font-weight: bold;");

        // Usar deep clone para evitar referencias residuales
        const freshState = JSON.parse(JSON.stringify(initialState));
        const tutorialSeen = this.hasSeenTutorial; // Preservar estado del tutorial
        const maxStep = this.maxStepReached;      // Preservar progreso máximo

        this.startBatch();
        Object.keys(freshState).forEach(key => {
            // No resetear flags persistentes
            if (key === 'hasSeenTutorial' || key === 'maxStepReached') return;
            this[key] = freshState[key];
        });

        // Asegurar limpieza de flags de sistema
        this.mode = 'NORMAL';
        this.eclipseTimer = 0;
        this.isTutorialActive = false;
        this.activeScan = null;
        this.emergencies = { resonance: false, oxygen: false, energy: false };

        this.hasSeenTutorial = tutorialSeen;
        this.maxStepReached = maxStep;
        this.endBatch();

        bus.emit('SYSTEM_LOG', { msg: 'REINICIO_COMPLETO_ESTADO' });
        console.log("%c[STATE] Sistema reiniciado satisfactoriamente.", "color: #10b981;");
    }
};

export const state = new Proxy(stateManager, {
    set(target, property, value) {
        // Guardar estado previo antes de cambiar gameStatus
        if (property === 'gameStatus' && value !== target.gameStatus) {
            target.previousGameStatus = target.gameStatus;
        }

        // Regla: Energía, Estabilidad y Ciclo Orbital se guardan con precisión decimal
        // pero la UI los mostrará redondeados (Fase 18/Revisión Balance)
        let processedValue = value;

        if (target[property] !== processedValue) {
            target[property] = processedValue;

            // Solo emitir eventos si no estamos en medio de un batch
            if (!isBatching) {
                bus.emit('STATE_CHANGE', { ...target });
                bus.emit(`STATE_CHANGE:${property}`, processedValue);
            }
        }
        return true;
    },
    get(target, property) {
        return target[property];
    }
});

// Exponer globalmente para depuración
window.__NAKASTHU_STATE__ = state;
