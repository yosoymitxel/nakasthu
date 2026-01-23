import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { state } from '../src/core/State.js';
import { factionSystem } from '../src/systems/FactionSystem.js';

describe('FactionSystem Tests (faction_system.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        factionSystem.reset();
        vi.clearAllMocks();
    });

    it('debe iniciar con alineamiento neutral (0/0)', () => {
        expect(factionSystem.alignments.ORDEN).toBe(0);
        expect(factionSystem.alignments.CAOS).toBe(0);
    });

    it('registerAction debe aumentar puntos de facción', () => {
        const spy = vi.spyOn(bus, 'emit');

        factionSystem.registerAction('ORDEN', 10);

        expect(factionSystem.alignments.ORDEN).toBe(10);
        expect(spy).toHaveBeenCalledWith('FACTION_UPDATE', expect.objectContaining({
            orden: 10,
            caos: 0,
            dominant: 'ORDEN'
        }));
    });

    it('getDominantFaction debe retornar la facción líder', () => {
        factionSystem.registerAction('CAOS', 20);
        factionSystem.registerAction('ORDEN', 5);

        expect(factionSystem.getDominantFaction()).toBe('CAOS');
    });

    it('debe detectar hitos de facción', () => {
        const spy = vi.spyOn(bus, 'emit');

        // Simular hito de CAOS (ej: 50 puntos)
        factionSystem.registerAction('CAOS', 50);

        expect(spy).toHaveBeenCalledWith('FACTION_MILESTONE', expect.objectContaining({
            faction: 'CAOS',
            level: 1
        }));
    });
});
