import { describe, it, expect } from 'vitest';
import { calculateRank } from '../src/utils/systemUtils.js';
import { getStepObjective, getObjectivePercent } from '../src/utils/objectiveUtils.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';

describe('calculateRank: partidas fallidas y resúmenes', () => {
    it('una partida fallida nunca puede ser A aunque no haya errores', () => {
        const rank = calculateRank({ processed: 1, errors: 0, energy: 0, failed: true });
        expect(rank.label).toBe('F');
        expect(rank.desc).toBe('SISTEMA COLAPSADO');
    });

    it('mantiene la escalera S/A/B/C/D para partidas válidas', () => {
        expect(calculateRank({ processed: 10, errors: 0, energy: 90 }).label).toBe('S');
        expect(calculateRank({ processed: 2, errors: 0, energy: 40 }).label).toBe('A');
        expect(calculateRank({ processed: 10, errors: 1, energy: 40, maxErrors: 3 }).label).toBe('B');
        expect(calculateRank({ processed: 10, errors: 2, energy: 40, maxErrors: 3 }).label).toBe('C');
        expect(calculateRank({ processed: 10, errors: 4, energy: 40, maxErrors: 5 }).label).toBe('D');
    });

    it('lee judgmentErrors/processedCount del State para los resúmenes de nivel', () => {
        const rank = calculateRank({
            processedCount: 10,
            judgmentErrors: 1,
            energy: 50,
            maxErrors: 3
        });
        expect(rank.label).toBe('B');
    });

    it('sin sujetos procesados devuelve F por abandono', () => {
        const rank = calculateRank({ processed: 0, errors: 0, energy: 100 });
        expect(rank.label).toBe('F');
        expect(rank.desc).toBe('ABANDONO DE DEBERES');
    });
});

describe('getStepObjective: metas visibles por paso', () => {
    it('el paso 4 muestra técnicos y su progreso', () => {
        const objective = getStepObjective(STEPS_CONFIG[4], {
            processed: 3,
            quota: 10,
            technicians: 4,
            influence: 0
        });
        expect(objective.label).toBe('Reclutar 6 técnicos');
        expect(objective.countLabel).toBe('4/6');
        expect(objective.complete).toBe(false);
        expect(getObjectivePercent(objective)).toBe(67);
    });

    it('marca cumplida la meta de técnicos al alcanzarla', () => {
        const objective = getStepObjective(STEPS_CONFIG[4], { technicians: 6, quota: 10 });
        expect(objective.complete).toBe(true);
        expect(getObjectivePercent(objective)).toBe(100);
    });

    it('el paso 8 mide influencia, no la cuota', () => {
        const objective = getStepObjective(STEPS_CONFIG[8], {
            processed: 2,
            quota: 5,
            influence: 1
        });
        expect(objective.label).toBe('Reunir 3 de influencia');
        expect(objective.countLabel).toBe('1/3');
    });

    it('un paso con cuota normal muestra sujetos procesados', () => {
        const objective = getStepObjective(STEPS_CONFIG[6], { processed: 2, quota: 7 });
        expect(objective.label).toBe('Procesar 7 sujetos');
        expect(objective.countLabel).toBe('2/7');
    });

    it('el modo infinito no tiene objetivo numérico', () => {
        const objective = getStepObjective(STEPS_CONFIG[13], { processed: 9 });
        expect(objective.infinite).toBe(true);
        expect(objective.target).toBe(null);
        expect(objective.countLabel).toBe('9 procesados');
    });

    it('un paso sin meta no produce objetivo', () => {
        expect(getStepObjective(STEPS_CONFIG[1], {})).toBe(null);
    });
});
