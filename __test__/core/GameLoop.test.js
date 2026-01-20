import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import GameLoop from '../../src/core/GameLoop.js';
import { state } from '../../src/core/State.js';
import { bus } from '../../src/core/Bus.js';

describe('GameLoop Engine', () => {
    let loop;

    beforeEach(() => {
        loop = new GameLoop();
        state.resetState();
        state.gameStatus = 'PLAYING';
        vi.useFakeTimers();
    });

    afterEach(() => {
        loop.stop();
        vi.restoreAllMocks();
    });

    it('should drain energy and oxygen during tick', () => {
        const initialEnergy = state.energy;
        const initialOxygen = state.oxygen;

        loop.tick();

        expect(state.energy).toBeLessThan(initialEnergy);
        expect(state.oxygen).toBeLessThan(initialOxygen);
    });

    it('should transition to ECLIPSE when worldTime reaches 100', () => {
        state.worldTime = 99;
        state.mode = 'NORMAL';

        loop.tick();

        expect(state.mode).toBe('ECLIPSE');
        expect(state.phase).toBe('ECLIPSE');
        expect(state.eclipseTimer).toBe(60);
    });

    it('should trigger SYSTEM_FAILURE when energy reaches 0', () => {
        state.energy = 0.1;
        const failureSpy = vi.fn();
        bus.on('SYSTEM_FAILURE', failureSpy);

        loop.tick();

        expect(state.gameStatus).toBe('GAME_OVER');
        expect(failureSpy).toHaveBeenCalledWith(expect.objectContaining({
            reason: 'ENERGY_DEPLETED'
        }));
    });

    it('should respect pause state', () => {
        state.isPaused = true;
        const initialEnergy = state.energy;

        loop.tick();

        expect(state.energy).toBe(initialEnergy);
    });

    it('should advance orbitalCycle during tick', () => {
        state.worldTime = 10;
        state.orbitalCycle = 10;
        
        loop.tick();
        
        expect(state.worldTime).toBe(11);
        expect(state.orbitalCycle).toBe(11);
    });
});
