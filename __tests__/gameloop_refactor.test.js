import { describe, test, expect, beforeEach, vi } from 'vitest';
import { gameLoop } from '../src/core/GameLoop.js';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { MechanicManager } from '../src/services/MechanicManager.js';

// Mock html utility because it uses https import not supported
vi.mock('../src/ui/utils/html.js', () => ({
    html: (strings, ...values) => strings[0]
}));

describe('GameLoop Refactor Tests', () => {
    beforeEach(() => {
        state.resetState();
        state.energy = 100;
        state.stability = 100;
        vi.spyOn(MechanicManager, 'updateResonance');
        vi.clearAllMocks();
    });

    test('should NOT drain energy or update resonance in CINEMATIC state', () => {
        state.gameStatus = 'CINEMATIC';
        state.energy = 100;

        gameLoop.tick();

        expect(state.energy).toBe(100);
        expect(MechanicManager.updateResonance).not.toHaveBeenCalled();
    });

    test('should update resonance but NOT drain energy in MECHANIC state', () => {
        state.gameStatus = 'MECHANIC';
        state.energy = 100;
        state.mode = 'NORMAL';

        gameLoop.tick();

        expect(state.energy).toBe(100);
        expect(MechanicManager.updateResonance).toHaveBeenCalled();
    });

    test('should drain energy and update resonance in PLAYING state', () => {
        state.gameStatus = 'PLAYING';
        state.energy = 100;
        state.isTutorialActive = false; // Ensure tutorial doesn't block
        state.mode = 'NORMAL';

        gameLoop.tick();

        // El drenaje ahora permite precisión decimal para suavizar la caída
        // TICK_DRAIN NORMAL = 0.005
        expect(state.energy).toBe(99.995);
        expect(MechanicManager.updateResonance).toHaveBeenCalled();
    });

    // Special test for tutorial override in loop
    test('should NOT drain energy if Tutorial is active even in PLAYING state', () => {
        state.gameStatus = 'PLAYING';
        state.energy = 100;
        state.isTutorialActive = true;

        gameLoop.tick();

        expect(state.energy).toBe(100);
        expect(MechanicManager.updateResonance).toHaveBeenCalled(); // Resonance still updates for tutorial
    });
});
