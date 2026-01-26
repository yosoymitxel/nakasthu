/**
 * GAMELOOP.JS
 * Ciclo de juego (1 tick por segundo).
 * Regla 2.A: Optimizado con Batch Updates para el estado.
 */
import { state } from './State.js';
import { bus } from './Bus.js';
import { MechanicManager } from '../services/MechanicManager.js';
import { CONFIG } from '../data/gameConfig.js';
import { PATH_CONFIGS } from '../data/pathConfigs.js';
import { evaluateSystemStatus, calculateNextOrbitalState } from '../utils/systemUtils.js';

class GameLoop {
    constructor() {
        this.interval = null;
        this.tickRate = 1000;
        this.lastEnergyWarning = false;
        this.lastStabilityWarning = false;
    }

    start() {
        if (this.interval) return;

        // Inicializar primer sujeto
        if (!state.currentEntity) {
            state.nextSubject();
        }

        this.interval = setInterval(() => this.tick(), this.tickRate);
        console.log("%c[GAMELOOP] Inyectando pulso vital...", "color: #FF8C00; font-weight: bold;");
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    checkSystemFailure() {
        // En el tutorial no se puede perder por recursos
        if (state.isTutorialActive) return;

        const status = evaluateSystemStatus(state, CONFIG);

        if (status.failed) {
            state.gameStatus = 'GAME_OVER';
            
            bus.emit('SYSTEM_FAILURE', {
                reason: status.reason,
                details: status.details,
                stats: {
                    processed: state.processedCount,
                    errors: state.judgmentErrors,
                    energy: state.energy,
                    stability: state.stability
                }
            });
        }
    }

    handleWarnings() {
        const pathConfig = PATH_CONFIGS[state.storyPath || 0];
        const thresholds = pathConfig.thresholds;
        
        // Energía
        if (state.energy < thresholds.energyWarning && !this.lastEnergyWarning) {
            bus.emit('TERMINAL_PRINT', { 
                text: pathConfig.emergencies.energy.warning, 
                type: 'SYSTEM' 
            });
            this.lastEnergyWarning = true;
        } else if (state.energy >= thresholds.energyWarning) {
            this.lastEnergyWarning = false;
        }

        // Estabilidad
        if (state.stability < thresholds.stabilityWarning && !this.lastStabilityWarning) {
            bus.emit('TERMINAL_PRINT', { 
                text: pathConfig.emergencies.stability.warning, 
                type: 'SYSTEM' 
            });
            this.lastStabilityWarning = true;
        } else if (state.stability >= thresholds.stabilityWarning) {
            this.lastStabilityWarning = false;
        }
    }

    checkEmergencies() {
        // No hay emergencias durante diálogos o cinemáticas
        if (state.isModalOpen || state.activeDialogue) return;

        const pathConfig = PATH_CONFIGS[state.storyPath || 0];
        const thresholds = pathConfig.thresholds;
        const CHANCE = thresholds.emergencyChance;

        // 1. Resonancia (Si estabilidad < threshold)
        if (!state.emergencies.resonance && state.stability < thresholds.resonanceEmergency) {
            if (Math.random() < CHANCE) {
                bus.emit('EMERGENCY_START', { type: 'resonance' });
                bus.emit('TERMINAL_PRINT', { 
                    text: pathConfig.emergencies.resonance.alert, 
                    type: 'ERROR' 
                });
            }
        }

        // 2. Oxígeno (Si energía < threshold)
        if (!state.emergencies.oxygen && state.energy < thresholds.oxygenEmergency) {
            if (Math.random() < CHANCE) {
                bus.emit('EMERGENCY_START', { type: 'oxygen' });
                bus.emit('TERMINAL_PRINT', { 
                    text: pathConfig.emergencies.oxygen.alert, 
                    type: 'ERROR' 
                });
            }
        }

        // 3. Energía (Si energía < threshold)
        if (!state.emergencies.energy && state.energy < thresholds.energyEmergency) {
            if (Math.random() < CHANCE) {
                bus.emit('EMERGENCY_START', { type: 'energy' });
                bus.emit('TERMINAL_PRINT', { 
                    text: pathConfig.emergencies.energy.alert, 
                    type: 'ERROR' 
                });
            }
        }
    }

    updateOrbitalCycle() {
        const nextState = calculateNextOrbitalState(state, CONFIG);
        
        state.mode = nextState.mode;
        state.phase = nextState.phase;
        state.worldTime = nextState.worldTime;
        state.orbitalCycle = nextState.orbitalCycle;
        state.eclipseTimer = nextState.eclipseTimer;

        if (nextState.triggerAlert) {
            bus.emit('TERMINAL_PRINT', { text: '[CRITICAL] Iniciando ciclo de ECLIPSE. Interferencia orbital detectada.', type: 'SYSTEM' });
        }
    }

    tick() {
        if (state.isPaused || state.isModalOpen || state.focusMode) return;
        if (state.gameStatus !== 'PLAYING' && state.gameStatus !== 'MECHANIC') return;

        state.startBatch();

        // 1. Verificar fallos y alertas
        if (state.gameStatus === 'PLAYING' && !state.isTutorialActive) {
            this.checkSystemFailure();
            this.handleWarnings();
            this.checkEmergencies();
        }

        // 2. Actualizar mecánicas activas
        MechanicManager.updateResonance();

        // 3. Si estamos en tutorial o mecánica pura, saltar drenaje de vitales
        if (state.gameStatus === 'MECHANIC' || state.isTutorialActive) {
            state.endBatch();
            return;
        }

        // 4. Ciclo Orbital
        this.updateOrbitalCycle();

        // 5. Drenaje de vitales
        const energyDrain = state.mode === 'ECLIPSE' ? CONFIG.ENERGY.ECLIPSE_DRAIN : CONFIG.ENERGY.TICK_DRAIN;
        state.energy = Math.max(0, state.energy - energyDrain);

        const thresholds = PATH_CONFIGS[state.storyPath || 0].thresholds;
        if (!state.purgeActive && !state.o2Stabilized) {
            state.oxygen = Math.max(0, state.oxygen - (thresholds.oxygenDrain || CONFIG.SYSTEM.OXYGEN_DRAIN));
        }

        state.endBatch();
        bus.emit('TICK', { time: state.worldTime });
    }
}

export const gameLoop = new GameLoop();
export const start = () => gameLoop.start();
