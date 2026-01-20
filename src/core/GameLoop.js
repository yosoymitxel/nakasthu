/**
 * GAMELOOP.JS
 * Ciclo de juego (1 tick por segundo).
 * Regla 2.A: Optimizado con Batch Updates para el estado.
 */
import { state } from './State.js';
import { bus } from './Bus.js';

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
        if (state.energy <= 0 || state.stability <= 0) {
            state.gameStatus = 'GAME_OVER';
            console.log("%c[SYSTEM FAILURE] El bastión ha sido brechado.", "color: #ff0000; font-weight: bold;");
            bus.emit('SYSTEM_FAILURE', { 
                reason: state.energy <= 0 ? 'ENERGY_DEPLETED' : 'STABILITY_COLLAPSED' 
            });
        }
    }

    tick() {
        if (state.gameStatus !== 'PLAYING' || state.isPaused) return;

        // Iniciar ráfaga de actualizaciones (Batch)
        state.startBatch();

        // 0. Verificar fallo del sistema (Game Over)
        this.checkSystemFailure();
        if (state.gameStatus !== 'PLAYING') {
            state.endBatch();
            return;
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

        // 2. Vitales
        const energyDrain = state.mode === 'ECLIPSE' ? 0.5 : 0.2;
        state.energy = Math.max(0, state.energy - energyDrain);
        
        if (!state.purgeActive) {
            state.oxygen = Math.max(0, state.oxygen - 0.1);
        }

        // 3. Resonancia y Estabilidad (Lógica Unificada Fase 16)
        // RE-VINCULACIÓN DE RESONANCIA: Sync = 100 - abs(TargetFreq - PlayerFreq)
        const freqDiff = Math.abs(state.targetFrequency - state.localFrequency);
        const syncPercent = Math.max(0, 100 - freqDiff); 
        state.resonanceSync = syncPercent;

        if (syncPercent < 40) {
            // Penalización crítica (Ajustada Fase 17)
            state.stability = Math.max(0, state.stability - 0.5);
        } else if (syncPercent > 90) {
            // Recuperación
            state.stability = Math.min(100, state.stability + 0.2);
        }

        if (syncPercent < 85) {
            console.log(`[RESONANCE] Sync: ${syncPercent.toFixed(1)}% | Stability: ${state.stability.toFixed(1)}`);
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
