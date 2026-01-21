import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock html utility because it uses https import not supported in Node
vi.mock('../src/ui/utils/html.js', () => ({
    html: (strings, ...values) => strings[0]
}));

import { state } from '../src/core/State.js';
import { gameSequencer } from '../src/systems/GameSequencer.js';
import { bus } from '../src/core/Bus.js';

describe('Narrative Sequencer Validations (sequencer.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        gameSequencer.init();
        vi.clearAllMocks();
        // Spying on bus.emit
        vi.spyOn(bus, 'emit');
    });

    it('Debe iniciar en el Paso 1 y ser de tipo cinemático', () => {
        expect(state.currentStep).toBe(1);
        const step = gameSequencer.getCurrentStepData();
        expect(step.config.type).toBe('cinematic');
    });

    it('Debe avanzar correctamente al Paso 2', () => {
        gameSequencer.nextStep();
        expect(state.currentStep).toBe(2);
        const step = gameSequencer.getCurrentStepData();
        expect(step.config.type).toBe('mechanic'); // El monolito
    });

    it('El Paso 4 debe presentar la opción de tutorial y no avanzar hasta elegir', () => {
        state.currentStep = 3;
        gameSequencer.init();

        // Intentamos avanzar al 4
        gameSequencer.nextStep();

        expect(state.currentStep).toBe(3);
        expect(bus.emit).toHaveBeenCalledWith('OPEN_MODAL', expect.objectContaining({
            title: 'PROTOCOLO DE INDUCCIÓN - OPERADOR'
        }));

        // Simulamos la elección
        gameSequencer.finalizeStepTransition(4);
        expect(state.currentStep).toBe(4);
    });

    it('Debe cambiar a la ruta religiosa (storyPath 1) al avanzar al Paso 7', () => {
        state.currentStep = 6;
        gameSequencer.init();
        gameSequencer.nextStep();

        expect(state.storyPath).toBe(1);
    });

    it('Debe detectar el final del juego al superar el paso 12', () => {
        state.currentStep = 12;
        gameSequencer.init();
        gameSequencer.nextStep();

        expect(bus.emit).toHaveBeenCalledWith('GAME_COMPLETE', expect.objectContaining({ finalStep: 12 }));
    });
});
