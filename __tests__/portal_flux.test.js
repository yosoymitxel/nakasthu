import { describe, it, expect, beforeEach, vi } from 'vitest';
import { portalFlux } from '../src/services/PortalService.js';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';

describe('PortalFlux Tests (portal_flux.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        portalFlux.reset();
        vi.clearAllMocks();
    });

    it('debe iniciar estable (100%)', () => {
        expect(portalFlux.stability).toBe(100);
        expect(portalFlux.isActive).toBe(false);
    });

    it('decay() debe reducir la estabilidad', () => {
        const spy = vi.spyOn(bus, 'emit');
        portalFlux.isActive = true;

        portalFlux.decay(10);

        expect(portalFlux.stability).toBe(90);
        expect(spy).toHaveBeenCalledWith('PORTAL_UPDATE', expect.objectContaining({ stability: 90 }));
    });

    it('stabilize() debe restaurar estabilidad', () => {
        portalFlux.isActive = true;
        portalFlux.stability = 50;

        portalFlux.stabilize(20);

        expect(portalFlux.stability).toBe(70);
    });

    it('debe generar anomalías si la estabilidad es baja', () => {
        const spy = vi.spyOn(bus, 'emit');
        portalFlux.isActive = true;
        portalFlux.stability = 20;

        // Mock Math.random to force anomaly
        vi.spyOn(Math, 'random').mockReturnValue(0.1);

        portalFlux.checkAnomalies();

        expect(spy).toHaveBeenCalledWith('PORTAL_ANOMALY', expect.anything());
    });
});

describe('Portal: activación y coste de estabilizar', () => {
    it('se activa con el id real del módulo (MOD-11)', () => {
        portalFlux.reset();
        bus.emit('MODULE_UNLOCKED', { id: 'MOD-11' });
        expect(portalFlux.isActive).toBe(true);
    });

    it('estabilizar gasta energía y no actúa si no alcanza', () => {
        portalFlux.isActive = true;
        portalFlux.stability = 50;
        state.energy = 3;
        bus.emit('PORTAL_STABILIZE');
        expect(portalFlux.stability).toBe(50);
        state.energy = 20;
        bus.emit('PORTAL_STABILIZE');
        expect(portalFlux.stability).toBe(60);
        expect(state.energy).toBe(15);
    });
});
