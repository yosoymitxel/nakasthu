import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { moduleRegistry, MODULES, getModuleName } from '../src/systems/ModuleRegistry.js';
import { tutorialController } from '../src/systems/TutorialController.js';

describe('Sectarian Path Integration Tests (sectarian_integration.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('ModuleRegistry Sectarian Mapping', () => {
        it('debe devolver nombres técnicos cuando storyPath es 0', () => {
            state.storyPath = 0;
            expect(getModuleName(MODULES.BIOSCAN, state.storyPath)).toBe('Escáner Biométrico');
            expect(getModuleName(MODULES.OPERATIONS, state.storyPath)).toBe('Consola de Mando');
        });

        it('debe devolver nombres sectarios cuando storyPath es 1', () => {
            state.storyPath = 1;
            expect(getModuleName(MODULES.BIOSCAN, state.storyPath)).toBe('Altar de Examen');
            expect(getModuleName(MODULES.OPERATIONS, state.storyPath)).toBe('Altar de Consagración');      
            expect(getModuleName(MODULES.UNREST_METER, state.storyPath)).toBe('Efervescencia Profana');     
        });
    });

    describe('TutorialController Sectarian Content', () => {
        it('debe usar contenido técnico cuando storyPath es 0', () => {
            state.storyPath = 0;
            const spy = vi.spyOn(bus, 'emit');
            
            tutorialController.startModuleTutorial(MODULES.BIOSCAN.tutorial);
            
            expect(spy).toHaveBeenCalledWith('STORY_MODAL_OPEN', expect.objectContaining({
                title: expect.stringContaining('MÓDULO DESBLOQUEADO: BIOSCAN')
            }));
        });

        it('debe usar contenido sectario cuando storyPath es 1', () => {
            state.storyPath = 1;
            const spy = vi.spyOn(bus, 'emit');
            
            tutorialController.startModuleTutorial(MODULES.BIOSCAN.tutorial);
            
            expect(spy).toHaveBeenCalledWith('STORY_MODAL_OPEN', expect.objectContaining({
                title: expect.stringContaining('REVELACIÓN: ALTAR DE EXAMEN')
            }));
        });

        it('debe mostrar terminología sectaria en los pasos del tutorial', () => {
            state.storyPath = 1;
            const spy = vi.spyOn(bus, 'emit');
            
            tutorialController.startModuleTutorial(MODULES.OPERATIONS.tutorial);
            
            // Paso 0: El [[MOD-04]] es su altar de juicio...
            expect(spy).toHaveBeenCalledWith('STORY_MODAL_OPEN', expect.objectContaining({
                content: expect.stringContaining('altar de juicio')
            }));

            // Avanzar al paso 1
            tutorialController.nextStep();
            vi.advanceTimersByTime(300);

            // Paso 1: [CONSAGRAR]: Recibe al adepto...
            expect(spy).toHaveBeenCalledWith('STORY_MODAL_OPEN', expect.objectContaining({
                content: expect.stringContaining('[CONSAGRAR]')
            }));
        });
    });

    describe('Layout Mapping Consistency', () => {
        // Simulamos la lógica de Layout.js que extrajimos
        const AREA_TO_MODULE = {
            'L_UPPER': MODULES.BIOSCAN.id,
            'L_LOWER': MODULES.ANALYTICS.id,
            'C_FOOTER': MODULES.RESONANCE.id,
            'C_MAIN': MODULES.OPERATIONS.id,
            'R_UPPER': MODULES.LORE_ARCHIVE.id,
            'R_TOP': MODULES.QUOTA_TRACKER.id,
            'R_MIDDLE': MODULES.FACTION_SYSTEM.id,
            'R_BOTTOM': MODULES.UNREST_METER.id,
            'L_BOTTOM': MODULES.PORTAL_MONITOR.id
        };

        const TUTORIAL_TO_AREA = {
            [MODULES.BIOSCAN.tutorial]: 'L_UPPER',
            [MODULES.ANALYTICS.tutorial]: 'L_LOWER',
            [MODULES.RESONANCE.tutorial]: 'C_FOOTER',
            [MODULES.OPERATIONS.tutorial]: 'C_MAIN',
            [MODULES.LORE_ARCHIVE.tutorial]: 'R_UPPER',
            [MODULES.QUOTA_TRACKER.tutorial]: 'C_MAIN',
            [MODULES.UNREST_METER.tutorial]: 'R_BOTTOM',
            [MODULES.FACTION_SYSTEM.tutorial]: 'R_MIDDLE',
            [MODULES.PORTAL_MONITOR.tutorial]: 'L_BOTTOM'
        };

        it('todos los tutoriales deben apuntar a áreas válidas en AREA_TO_MODULE o ser casos especiales', () => {
            Object.keys(TUTORIAL_TO_AREA).forEach(tutoId => {
                const area = TUTORIAL_TO_AREA[tutoId];
                if (tutoId === MODULES.QUOTA_TRACKER.tutorial) {
                    expect(area).toBe('C_MAIN'); // QuotaTracker está en Operations
                } else {
                    const moduleId = AREA_TO_MODULE[area];
                    // Encontrar el módulo que tiene ese tutorialId
                    const module = Object.values(MODULES).find(m => m.tutorial === tutoId);
                    expect(moduleId).toBe(module.id);
                }
            });
        });
    });
});
