/**
 * STATE.JS
 * Estado global optimizado con Batch Updates.
 * Regla 2.A: Minimiza emisiones para evitar loops de re-renderizado.
 */
import { bus } from './Bus.js';
import { generateSubject } from '../systems/EntityGenerator.js';
import { CONFIG } from './Config.js';

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
    activeTutorialId: null, // ID del tutorial activo actual
    tutorialStep: 0, // 0: No tutorial, 1-4: Pasos del tutorial
    focusMode: false, // Bloquea el resto de la UI durante diálogos profundos
    unlockedCommands: ['HELP', 'CLEAR', 'STATUS'], // Comandos iniciales
    hasSeenTutorial: localStorage.getItem('nakasthu_tutorial_seen') === 'true',
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
        this.currentEntity = generateSubject();
        bus.emit('NEW_SUBJECT_DETECTED', this.currentEntity);
    },
    // Reinicio total del sistema (Fase 11)
    resetState() {
        this.startBatch();
        const tutorialSeen = this.hasSeenTutorial; // Preservar estado del tutorial
        Object.keys(initialState).forEach(key => {
            this[key] = initialState[key];
        });
        this.hasSeenTutorial = tutorialSeen;
        this.nextSubject();
        this.endBatch();
        console.log("%c[STATE] Sistema reiniciado satisfactoriamente.", "color: #10b981;");
    }
};

export const state = new Proxy(stateManager, {
    set(target, property, value) {
        // Guardar estado previo antes de cambiar gameStatus
        if (property === 'gameStatus' && value !== target.gameStatus) {
            target.previousGameStatus = target.gameStatus;
        }

        // Regla: Energía, Estabilidad y Ciclo Orbital NUNCA retornan decimales (Fase 18)
        let processedValue = value;
        if (['energy', 'stability', 'orbitalCycle'].includes(property) && typeof value === 'number') {
            processedValue = Math.floor(value);
        }

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
