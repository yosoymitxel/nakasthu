import { describe, it, expect } from 'vitest';
import { MechanicManager } from '../src/services/MechanicManager.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';

describe('Emergencia de resonancia', () => {
    it('no nace resuelta: el objetivo se sortea lejos del mando', () => {
        state.resetState();
        MechanicManager.init(STEPS_CONFIG[4]);
        state.gameStatus = 'PLAYING';
        for (let i = 0; i < 50; i++) {
            state.targetFrequency = state.localFrequency = 30;
            bus.emit('EMERGENCY_START', { type: 'resonance' });
            expect(Math.abs(state.targetFrequency - state.localFrequency)).toBeGreaterThanOrEqual(8);
            expect(state.resonanceSync).toBeLessThan(90);
            bus.emit('EMERGENCY_END', { type: 'resonance' });
        }
    });
});
