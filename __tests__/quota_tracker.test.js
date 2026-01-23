import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { state } from '../src/core/State.js';
import { quotaTracker } from '../src/systems/QuotaTracker.js';

describe('QuotaTracker Tests (quota_tracker.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        quotaTracker.reset();
        vi.clearAllMocks();
    });

    it('debe iniciar con cuota 0/0', () => {
        expect(quotaTracker.current).toBe(0);
        expect(quotaTracker.target).toBe(0);
    });

    it('setQuota debe establecer el objetivo y emitir actualización', () => {
        const spy = vi.spyOn(bus, 'emit');

        quotaTracker.setQuota(10);

        expect(quotaTracker.target).toBe(10);
        expect(spy).toHaveBeenCalledWith('QUOTA_UPDATE', expect.objectContaining({ current: 0, target: 10 }));
    });

    it('registerSuccess debe incrementar el progreso', () => {
        quotaTracker.setQuota(5);

        quotaTracker.registerSuccess();

        expect(quotaTracker.current).toBe(1);
    });

    it('debe emitir QUOTA_MET cuando se alcanza el objetivo', () => {
        const spy = vi.spyOn(bus, 'emit');
        quotaTracker.setQuota(1);

        quotaTracker.registerSuccess();

        expect(spy).toHaveBeenCalledWith('QUOTA_MET', { target: 1 });
    });

    it('no debe sobrepasar el objetivo visualmente pero sí internamente (bonus)', () => {
        quotaTracker.setQuota(2);

        quotaTracker.registerSuccess();
        quotaTracker.registerSuccess();
        quotaTracker.registerSuccess(); // 3/2

        expect(quotaTracker.current).toBe(3);
    });

    it('checkStatus debe retornar estado actual', () => {
        quotaTracker.setQuota(10);
        quotaTracker.current = 5;

        const status = quotaTracker.checkStatus();

        expect(status.complete).toBe(false);
        expect(status.percentage).toBe(50);
    });
});
