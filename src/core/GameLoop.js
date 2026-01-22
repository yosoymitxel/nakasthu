/**
 * GAMELOOP.JS
 * Ciclo de juego (1 tick por segundo).
 * Regla 2.A: Optimizado con Batch Updates para el estado.
 */
import { state } from './State.js';
import { bus } from './Bus.js';
import { updateResonance } from '../systems/MechanicsEngine.js';

class GameLoop {
    constructor() {
        this.interval = null;
        this.tickRate = 1000;
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

        if (state.energy <= 0 || state.stability <= 0) {
            state.gameStatus = 'GAME_OVER';
            const reason = state.energy <= 0 ? 'ENERGY_DEPLETED' : 'STABILITY_COLLAPSED';
            const details = reason === 'ENERGY_DEPLETED' 
                ? 'Agotamiento de energía crítico. El sistema no tiene potencia suficiente para mantener el enlace neural.'
                : 'Sincronía neural perdida. Demasiadas brechas de seguridad o sacrificios injustificados han colapsado el bastión.';
            
            console.log("%c[SYSTEM FAILURE] El bastión ha sido brechado.", "color: #ff0000; font-weight: bold;");
            bus.emit('SYSTEM_FAILURE', {
                reason,
                details,
                stats: { ...state.stats, processed: state.processedCount }
            });
        }
    }

    tick() {
        if (state.gameStatus !== 'PLAYING' || state.isPaused || state.isModalOpen || state.focusMode) return;

        // Iniciar ráfaga de actualizaciones (Batch)
        state.startBatch();

        // 0. Verificar fallo del sistema (Game Over)
        this.checkSystemFailure();
        if (state.gameStatus !== 'PLAYING') {
            state.endBatch();
            return;
        }

        // --- Lógica de Resonancia (Siempre activa para el tutorial) ---
        updateResonance();

        // --- Si el tutorial está activo, solo actualizamos resonancia y salimos ---
        if (state.isTutorialActive || (state.tutorialStep > 0 && state.tutorialStep < 4)) {
            state.endBatch();
            return;
        }

        // --- Lógica de Juego Normal (Drenaje de vitales, Eclipse, etc.) ---

        // Notificación de energía crítica (Fase 18)
        if (state.energy < 20 && !this.lastEnergyWarning) {
            bus.emit('TERMINAL_PRINT', {
                text: '>>> WARNING: CRITICAL_POWER_LEVEL - SISTEMAS DE SOPORTE AL LÍMITE.',
                type: 'SYSTEM'
            });
            this.lastEnergyWarning = true;
        } else if (state.energy >= 20) {
            this.lastEnergyWarning = false;
        }

        // Notificación de estabilidad crítica
        if (state.stability < 20 && !this.lastStabilityWarning) {
            bus.emit('TERMINAL_PRINT', {
                text: '>>> ALERTA: INESTABILIDAD NEURAL CRÍTICA - BASTIÓN COMPROMETIDO.',
                type: 'SYSTEM'
            });
            this.lastStabilityWarning = true;
        } else if (state.stability >= 20) {
            this.lastStabilityWarning = false;
        }

        // 1. Ciclo de tiempo y ECLIPSE
        const orbitalStep = state.mode === 'ECLIPSE' ? 2 : 1; // 2% en eclipse, 1% en solar (ajustable)

        if (state.mode === 'ECLIPSE') {
            state.eclipseTimer--;
            state.orbitalCycle = Math.min(100, state.orbitalCycle + orbitalStep);

            if (state.eclipseTimer <= 0 || state.orbitalCycle >= 100) {
                state.mode = 'NORMAL';
                state.phase = 'SOLAR';
                state.worldTime = 0;
                state.orbitalCycle = 0;
                console.log("%c[ECLIPSE] Finalizado. Regresando a fase SOLAR.", "color: #06b6d4;");
            }
        } else {
            // Avance constante del 1% (o según velocidad de dificultad)
            state.worldTime += 1;
            state.orbitalCycle = Math.min(100, state.worldTime);

            if (state.worldTime >= 100) {
                state.mode = 'ECLIPSE';
                state.phase = 'ECLIPSE';
                state.eclipseTimer = 60; // 60 ticks de duración
                state.orbitalCycle = 0; // Reiniciar para el nuevo ciclo
                state.worldTime = 0;
                console.log("%c[CRITICAL] Iniciando ciclo de ECLIPSE. Interferencia orbital detectada.", "color: #ef4444; font-weight: bold;");
            }
        }

        // 2. Vitales (Rebalanceo: 1 punto cada 10 segundos = 0.1 por tick)
        // CONGELAR durante el tutorial (Fase 18)
        if (state.tutorialStep > 0 && state.tutorialStep < 4) {
            state.endBatch();
            return;
        }

        const energyDrain = state.mode === 'ECLIPSE' ? 0.02 : 0.01;
        state.energy = Math.max(0, state.energy - energyDrain);

        if (!state.purgeActive) {
            state.oxygen = Math.max(0, state.oxygen - 0.05);
        }

        if (state.resonanceSync < 85) {
            console.log(`[RESONANCE] Sync: ${state.resonanceSync.toFixed(1)}% | Stability: ${state.stability.toFixed(1)}`);
        }

        // Finalizar ráfaga y emitir UN SOLO evento de cambio
        state.endBatch();

        // Log único por tick para monitorización limpia
        console.log(`[TICK] T:${state.worldTime} | E:${state.energy.toFixed(1)}% | O:${state.oxygen.toFixed(1)}% | ${state.phase}`);

        bus.emit('TICK', { time: state.worldTime });
    }
}

export const gameLoop = new GameLoop();
export const start = () => gameLoop.start();
