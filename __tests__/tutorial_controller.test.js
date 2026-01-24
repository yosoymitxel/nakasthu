import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { state } from '../src/core/State.js';
import { tutorialController } from '../src/systems/TutorialController.js';

describe('Modular TutorialController Tests (tutorial_controller.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        tutorialController.activeTutorialId = null;
        tutorialController.currentStepIndex = 0;
        tutorialController.isModalOpen = false;
        tutorialController.proposalQueue = [];
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('debe solicitar confirmación cuando recibe MODULE_UNLOCKED', () => {
        const spy = vi.spyOn(bus, 'emit');

        bus.emit('MODULE_UNLOCKED', {
            id: 'MOD_BIOSCAN',
            name: 'BioScan',
            tutorialId: 'TUTO_BIOSCAN'
        });

        // No debe activar tutorial inmediatamente
        expect(tutorialController.activeTutorialId).toBeNull();

        // Debe mostrar modal de propuesta
        expect(spy).toHaveBeenCalledWith('UI_MODAL_OPEN', expect.objectContaining({
            title: 'NUEVO SISTEMA DETECTADO',
            content: expect.anything()
        }));
    });

    it('startModuleTutorial debe iniciar la secuencia', () => {
        const spy = vi.spyOn(bus, 'emit');
        tutorialController.startModuleTutorial('TUTO_BIOSCAN');

        expect(tutorialController.activeTutorialId).toBe('TUTO_BIOSCAN');
        expect(tutorialController.isModalOpen).toBe(true);
        expect(spy).toHaveBeenCalledWith('STORY_MODAL_OPEN', expect.objectContaining({
            isTutorial: true
        }));
    });

    it('debe avanzar pasos al recibir TUTORIAL_CONTINUE', () => {
        const spy = vi.spyOn(bus, 'emit');
        // Iniciar manualmente un tutorial conocido
        tutorialController.startModuleTutorial('TUTO_BIOSCAN');
        expect(tutorialController.currentStepIndex).toBe(0);

        bus.emit('TUTORIAL_CONTINUE');
        vi.advanceTimersByTime(300); // Wait for timeout

        expect(tutorialController.currentStepIndex).toBe(1);
        expect(spy).toHaveBeenCalledWith('STORY_MODAL_OPEN', expect.objectContaining({
            title: expect.stringContaining('(2/')
        }));
    });

    it('debe finalizar el tutorial al completar todos los pasos', () => {
        const spy = vi.spyOn(bus, 'emit');
        tutorialController.startModuleTutorial('TUTO_BIOSCAN'); // Asumimos que tiene 3 pasos

        // Paso 1 -> 2
        tutorialController.nextStep();
        vi.advanceTimersByTime(300);
        // Paso 2 -> 3
        tutorialController.nextStep();
        vi.advanceTimersByTime(300);
        // Paso 3 -> Fin
        tutorialController.nextStep();

        expect(tutorialController.activeTutorialId).toBeNull();
        expect(tutorialController.isModalOpen).toBe(false);
        expect(spy).toHaveBeenCalledWith('UI_MODAL_CLOSE');
        expect(spy).toHaveBeenCalledWith('TERMINAL_PRINT', expect.objectContaining({
            text: expect.stringMatching(/COMPLETED/)
        }));
    });

    it('replayTutorial debe reiniciar el tutorial bajo demanda', () => {
        const spy = vi.spyOn(tutorialController, 'startModuleTutorial');

        tutorialController.replayTutorial('MOD_BIOSCAN');

        expect(spy).toHaveBeenCalledWith('TUTO_BIOSCAN');
    });
});
