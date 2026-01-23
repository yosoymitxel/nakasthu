import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { state } from '../src/core/State.js';
import { portalFlux } from '../src/systems/PortalFlux.js';

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
