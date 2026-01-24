import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { executeScan, SCAN_TYPES } from '../src/systems/Scanner.js';
import { gameLoop } from '../src/core/GameLoop.js';
import { bus } from '../src/core/Bus.js';

describe('Subsystem: Scanner', () => {
    beforeEach(() => {
        state.resetState();
        state.energy = 100;
        state.isTutorialActive = false;
        state.currentEntity = { id: 'test-subject', scanHistory: {} };
        vi.useFakeTimers();
    });

    it('should consume energy when executing a scan', async () => {
        const scanType = 'THERMAL';
        const cost = SCAN_TYPES[scanType].cost;
        
        const scanPromise = executeScan(scanType);
        vi.advanceTimersByTime(SCAN_TYPES[scanType].duration + 1000);
        await scanPromise;

        // Energy is Math.floor in executeScan
        expect(state.energy).toBe(Math.floor(100 - cost));
    });

    it('should fail if not enough energy', async () => {
        state.energy = 0.1;
        const result = await executeScan('NEURAL');
        expect(result).toBe(false);
    });

    it('should apply repetition penalty to cost', async () => {
        state.currentEntity.scanHistory = { THERMAL: 1 }; // One previous scan
        const baseCost = SCAN_TYPES.THERMAL.cost;
        const expectedCost = baseCost * 1.5; // +50% penalty
        
        const scanPromise = executeScan('THERMAL');
        vi.advanceTimersByTime(SCAN_TYPES.THERMAL.duration + 1000);
        await scanPromise;

        expect(state.energy).toBe(Math.floor(100 - expectedCost));
    });
});

describe('Subsystem: GameLoop', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        state.isTutorialActive = false;
        vi.useFakeTimers();
    });

    it('should trigger GAME_OVER when energy is 0', () => {
        state.energy = 0;
        gameLoop.tick();
        expect(state.gameStatus).toBe('GAME_OVER');
    });

    it('should trigger GAME_OVER when stability is 0', () => {
        state.stability = 0;
        gameLoop.tick();
        expect(state.gameStatus).toBe('GAME_OVER');
    });

    it('should drain energy and oxygen during normal tick', () => {
        const initialEnergy = state.energy;
        const initialOxygen = state.oxygen;
        
        gameLoop.tick();
        
        expect(state.energy).toBeLessThan(initialEnergy);
        expect(state.oxygen).toBeLessThan(initialOxygen);
    });

    it('should enter ECLIPSE mode after worldTime reaches 100', () => {
        state.worldTime = 99;
        gameLoop.tick();
        expect(state.mode).toBe('ECLIPSE');
        expect(state.phase).toBe('ECLIPSE');
    });
});
