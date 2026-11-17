import { describe, it, expect, beforeEach } from 'vitest';
import { factionSystem } from '../src/systems/FactionSystem.js';
import { narrativeFlags } from '../src/systems/NarrativeFlags.js';
import { calculateJudgmentRecommendation } from '../src/utils/gameplayUtils.js';

// Las marcas de diálogo inclinan la recomendación del paso 11 sin decidirla.
describe('Recomendación del juicio y marcas de diálogo', () => {
    beforeEach(() => {
        factionSystem.reset();
        narrativeFlags.reset();
    });

    it('las marcas del hilo B suben TRASCENDER y pueden darle la recomendación', () => {
        factionSystem.registerAction('ORDEN', 1);
        factionSystem.registerAction('CAOS', 1);
        const before = calculateJudgmentRecommendation();
        expect(before.recommendation).toBe('ESTABILIZAR');

        narrativeFlags.set({ lichesth: 'fue', leina_palabra: 'escuchada', marek: 'existio' });
        const after = calculateJudgmentRecommendation();
        expect(after.faithPercentage).toBeGreaterThan(before.faithPercentage);
        expect(after.techPercentage).toBe(before.techPercentage);
        expect(after.recommendation).toBe('TRASCENDER');
    });

    it('las marcas del hilo A suben ESTABILIZAR', () => {
        narrativeFlags.set({ lichesth: 'fue', leina_palabra: 'escuchada' });
        expect(calculateJudgmentRecommendation().recommendation).toBe('TRASCENDER');

        narrativeFlags.set({ libreta: 'guardada', aviso_317: 'anotado', kamin_expediente: 'leido' });
        const r = calculateJudgmentRecommendation();
        expect(r.techPercentage).toBeGreaterThan(0);
        expect(r.recommendation).toBe('ESTABILIZAR');
    });

    it('una marca pesa poco frente a la facción acumulada', () => {
        factionSystem.registerAction('ORDEN', 8);
        narrativeFlags.set({ lichesth: 'fue', leina_palabra: 'escuchada', marek: 'existio', vargas_fuerza: 'letal' });
        expect(calculateJudgmentRecommendation().recommendation).toBe('ESTABILIZAR');
    });
});
