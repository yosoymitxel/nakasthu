import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { state } from '../src/core/State.js';
import { ritualEngine } from '../src/systems/RitualEngine.js';

describe('RitualEngine Tests (ritual_engine.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        ritualEngine.reset();
        vi.clearAllMocks();
    });

    it('debe iniciar inactivo y sin cargas', () => {
        expect(ritualEngine.isActive).toBe(false);
        expect(ritualEngine.charges).toBe(0);
    });

    it('addCharge() debe acumular cargas hasta el máximo', () => {
        ritualEngine.isActive = true;
        ritualEngine.addCharge(2);

        expect(ritualEngine.charges).toBe(2);

        ritualEngine.addCharge(10); // Max is usually limited (e.g. 5)
        expect(ritualEngine.charges).toBeLessThanOrEqual(5);
    });

    it('performRitual() debe consumir cargas y otorgar beneficios', () => {
        const spy = vi.spyOn(bus, 'emit');
        ritualEngine.isActive = true;
        ritualEngine.charges = 3;
        state.stability = 50;

        const result = ritualEngine.performRitual('PURIFICATION');

        expect(result.success).toBe(true);
        expect(ritualEngine.charges).toBe(0); // Cost 3
        expect(state.stability).toBe(80); // +30 stability
        expect(spy).toHaveBeenCalledWith('RITUAL_COMPLETED', expect.objectContaining({ type: 'PURIFICATION' }));
    });

    it('performRitual() debe fallar si no hay cargas suficientes', () => {
        ritualEngine.isActive = true;
        ritualEngine.charges = 1;

        const result = ritualEngine.performRitual('PURIFICATION'); // Costs 3

        expect(result.success).toBe(false);
    });
});
