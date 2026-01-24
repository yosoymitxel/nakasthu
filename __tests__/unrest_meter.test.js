import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { state } from '../src/core/State.js';
import { unrestMeter } from '../src/systems/UnrestMeter.js';

describe('UnrestMeter Tests (unrest_meter.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        unrestMeter.reset();
        vi.clearAllMocks();
    });

    it('debe iniciar con nivel 0 (calma)', () => {
        expect(state.unrest).toBe(0);
        expect(unrestMeter.isActive).toBe(false);
    });

    it('increase() debe aumentar el nivel y emitir alerta', () => {
        const spy = vi.spyOn(bus, 'emit');
        unrestMeter.isActive = true;

        unrestMeter.increase(10);

        expect(state.unrest).toBe(10);
        expect(spy).toHaveBeenCalledWith('UNREST_UPDATE', expect.objectContaining({ level: 10, status: 'CALM' }));
    });

    it('decrease() debe reducir el nivel pero no bajar de 0', () => {
        unrestMeter.isActive = true;
        state.unrest = 20;

        unrestMeter.decrease(50);

        expect(state.unrest).toBe(0);
    });

    it('debe cambiar de estado (CALM -> RIOT) al superar umbrales', () => {
        const spy = vi.spyOn(bus, 'emit');
        unrestMeter.isActive = true;

        unrestMeter.increase(80); // Umbral CRITICAL/RIOT suele ser alto

        expect(spy).toHaveBeenCalledWith('UNREST_UPDATE', expect.objectContaining({
            level: 80,
            status: 'CRITICAL'
        }));
    });

    it('triggerRiot() debe causar penalizaciones si el nivel es crítico', () => {
        const spy = vi.spyOn(bus, 'emit');
        unrestMeter.isActive = true;
        state.unrest = 90;

        // Mock Math.random to ensure riot triggers (probability is 0.7)
        vi.spyOn(Math, 'random').mockReturnValue(0.8);

        unrestMeter.checkRiotChance(); // Simula el chequeo periódico

        expect(spy).toHaveBeenCalledWith('RIOT_EVENT', expect.any(Object));
        
        vi.restoreAllMocks();
    });

    it('no debe procesar cambios si no está activo', () => {
        unrestMeter.isActive = false;
        unrestMeter.increase(50);
        expect(state.unrest).toBe(0);
    });
});
