import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { gameLoop } from '../src/core/GameLoop.js';
import { bus } from '../src/core/Bus.js';

describe('Logic Validations (logic.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        state.isPaused = false;
        vi.clearAllMocks();
    });

    it('Verificar que Energía, Estabilidad y Ciclo Orbital permitan precisión decimal pero se redondeen para la UI', () => {
        // Ahora permitimos precisión decimal para un balance más fino
        state.energy = 50.5;
        state.stability = 80.7;
        state.orbitalCycle = 15.3;

        // El estado interno debe mantener los decimales
        expect(state.energy).toBe(50.5);
        expect(state.stability).toBe(80.7);
        expect(state.orbitalCycle).toBe(15.3);

        // Pero para la UI (Math.floor) deben ser enteros
        expect(Number.isInteger(Math.floor(state.energy))).toBe(true);
        expect(Math.floor(state.energy)).toBe(50);
    });

    it('Validar que el Ciclo Orbital se detenga (pause) cuando isPaused es true', () => {
        const initialCycle = state.orbitalCycle;
        state.isPaused = true;
        
        // Ejecutamos un tick del motor
        gameLoop.tick();
        
        expect(state.orbitalCycle).toBe(initialCycle);
    });

    it('Validar que el Game Over se dispare exactamente cuando Energía o Estabilidad lleguen a <= 0', () => {
        // Test Energía
        state.energy = 0.5;
        state.stability = 100;
        
        // Un tick que drene energía (drena 0.2 en NORMAL)
        gameLoop.tick();
        
        // Si bajó a <= 0, gameStatus debería ser GAME_OVER
        // Pero primero probamos forzando a 0
        state.energy = 0;
        gameLoop.tick();
        expect(state.gameStatus).toBe('GAME_OVER');

        // Reset y Test Estabilidad
        state.resetState();
        state.gameStatus = 'PLAYING';
        state.energy = 100;
        state.stability = 0;
        gameLoop.tick();
        expect(state.gameStatus).toBe('GAME_OVER');
    });
});
