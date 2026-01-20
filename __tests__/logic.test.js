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

    it('Verificar que Energía, Estabilidad y Ciclo Orbital NUNCA retornen decimales', () => {
        // Forzamos valores con decimales (si el sistema lo permite)
        state.energy = 50.5;
        state.stability = 80.7;
        state.orbitalCycle = 15.3;

        // Si el sistema no los florea automáticamente, esto fallará
        // La instrucción dice "usar Math.floor", lo que implica que el test debe verificar que sean enteros
        expect(Number.isInteger(state.energy)).toBe(true);
        expect(Number.isInteger(state.stability)).toBe(true);
        expect(Number.isInteger(state.orbitalCycle)).toBe(true);
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
