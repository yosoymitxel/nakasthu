/**
 * STATE.JS
 * Estado global optimizado con Batch Updates.
 * Regla 2.A: Minimiza emisiones para evitar loops de re-renderizado.
 */
import { bus } from './Bus.js';
import { generateSubject } from '../systems/EntityGenerator.js';

let isBatching = false;

const initialState = {
    energy: 100,
    stability: 100,
    oxygen: 100,
    faith: 0,
    worldTime: 0,
    phase: 'SOLAR',
    currentRoom: 0,
    currentEntity: null,
    purgeActive: false,
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
    quota: 10,
    judgmentErrors: 0,
    loreArchive: [], // Lista de información recolectada (Fase 15)
    stats: {
        innocentsSacrificed: 0,
        corruptsDetected: 0,
        corruptsAuthorized: 0,
        innocentsAuthorized: 0
    },
    gameStatus: 'START_MENU', // 'START_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
    isPaused: false
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
        Object.keys(initialState).forEach(key => {
            this[key] = initialState[key];
        });
        this.nextSubject();
        this.endBatch();
        console.log("%c[STATE] Sistema reiniciado satisfactoriamente.", "color: #10b981;");
    }
};

export const state = new Proxy(stateManager, {
    set(target, property, value) {
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
