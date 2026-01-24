
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { gameSequencer } from '../src/systems/GameSequencer.js';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';

// Mock html utility
vi.mock('../src/ui/utils/html.js', () => ({
    html: (strings, ...values) => strings[0]
}));

describe('Level Selector & Isolation Tests', () => {
    beforeEach(() => {
        state.resetState();
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('jumpToStep should reset state and load correct step', () => {
        // Set some dirty state
        state.currentStep = 1;
        state.energy = 50;
        state.gameStatus = 'PLAYING';

        // Jump to Step 4 (Gameplay)
        gameSequencer.jumpToStep(4);

        // Advance timers for setTimeout in jumpToStep
        vi.advanceTimersByTime(150);

        expect(state.currentStep).toBe(4);
        expect(state.energy).toBe(100); // Should be reset
        expect(state.gameStatus).toBe('PLAYING'); // Step 4 is Gameplay -> PLAYING
    });

    test('jumpToStep should handle Mechanic steps correctly', () => {
        gameSequencer.jumpToStep(2);
        vi.advanceTimersByTime(150);

        expect(state.currentStep).toBe(2);
        expect(state.gameStatus).toBe('MECHANIC');
    });

    test('jumpToStep should emit SYSTEM_FORCE_RESET', () => {
        const spy = vi.spyOn(bus, 'emit');
        gameSequencer.jumpToStep(5);

        expect(spy).toHaveBeenCalledWith('SYSTEM_FORCE_RESET');
    });

    test('Independent Module Loading: Jump from 12 to 1', () => {
        // Jump to end
        gameSequencer.jumpToStep(12);
        vi.advanceTimersByTime(150);
        expect(state.gameStatus).toBe('CINEMATIC'); // Epilogue logic

        // Jump back to start
        gameSequencer.jumpToStep(1);
        vi.advanceTimersByTime(150);

        expect(state.currentStep).toBe(1);
        expect(state.gameStatus).toBe('CINEMATIC');
        expect(state.processedCount).toBe(0); // Clean slate
    });
});
