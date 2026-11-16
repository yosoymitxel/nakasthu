/**
 * Objetivo del turno con consecuencia (punto 5 de diseño):
 * cumplido → +1 error tolerado el siguiente turno jugable; incumplido → −20 de energía.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { gameSequencer, errorBudget } from '../src/systems/GameSequencer.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { CONFIG } from '../src/data/gameConfig.js';

// Cierra el paso 4 con N técnicos y avanza hasta el siguiente turno jugable (6).
function closeStep4(technicians) {
    gameSequencer.currentStep = 4;
    state.currentStep = 4;
    state.gameStatus = 'PLAYING';
    state.judgmentErrors = 0;
    state.quota = STEPS_CONFIG[4].subjectCount;
    state.processedCount = state.quota;
    state.techniciansRecruited = technicians;
    gameSequencer.checkGameStatus();
}

describe('Objetivo del turno', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        gameSequencer.turnCarry = null;
        state.resetState();
    });

    it('cumplido: el resumen lo anuncia y el siguiente turno tolera 1 error más', () => {
        const spy = vi.spyOn(bus, 'emit');
        closeStep4(STEPS_CONFIG[4].meta.requiredTechnicians);
        expect(gameSequencer.turnCarry).toMatchObject({ errors: 1 });

        gameSequencer.finalizeStepTransition(6);
        expect(state.maxErrors).toBe(errorBudget(STEPS_CONFIG[6].subjectCount) + 1);
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL);
        expect(gameSequencer.turnCarry).toBeNull();
        expect(spy).toHaveBeenCalledWith('TERMINAL_PRINT', expect.objectContaining({ text: expect.stringMatching(/Objetivo cumplido/) }));
        spy.mockRestore();
    });

    it('incumplido: el siguiente turno empieza con −20 de energía', () => {
        closeStep4(0);
        expect(gameSequencer.turnCarry).toMatchObject({ energy: -20 });

        gameSequencer.finalizeStepTransition(6);
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL - 20);
        expect(state.maxErrors).toBe(errorBudget(STEPS_CONFIG[6].subjectCount));
    });

    it('la consecuencia no se aplica en cinemáticas: espera al próximo turno jugable', () => {
        closeStep4(0);
        gameSequencer.finalizeStepTransition(5); // cinemática
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL);
        expect(gameSequencer.turnCarry).not.toBeNull();
        gameSequencer.finalizeStepTransition(6);
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL - 20);
    });

    it('saltar de paso desde el selector descarta la consecuencia pendiente', () => {
        closeStep4(0);
        gameSequencer.jumpToStep(6);
        vi.advanceTimersByTime(150);
        expect(gameSequencer.turnCarry).toBeNull();
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL);
    });
});
