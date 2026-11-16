import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { applyTraits, generateSubject } from '../src/services/EntityService.js';
import { findLoreCharacter } from '../src/data/loreCharactersConfig.js';
import { MechanicManager } from '../src/services/MechanicManager.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';

describe('Motor del Lore: Lore Core Characters', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        state.processedCount = 0;
        state.judgmentErrors = 0;
        if (MechanicManager.currentMechanic) {
            MechanicManager.currentMechanic.destroy();
            MechanicManager.currentMechanic = null;
        }
    });

    describe('findLoreCharacter()', () => {
        it('debe reconocer a KAEL y KAEL (ASC)', () => {
            const kael = findLoreCharacter('KAEL');
            const kaelAsc = findLoreCharacter('KAEL (ASC)');
            expect(kael).toBeDefined();
            expect(kael.name).toBe('Kael');
            expect(kael.canSacrifice).toBe(false);
            expect(kaelAsc).toBe(kael);
        });

        it('debe reconocer a DEYAR, ALEXIA y KAMIN', () => {
            expect(findLoreCharacter('DEYAR')?.name).toBe('Deyar');
            expect(findLoreCharacter('ALEXIA (PRE)')?.name).toBe('Alexia');
            expect(findLoreCharacter('ALEXIA?')?.name).toBe('Alexia');
            expect(findLoreCharacter('KAMIN')?.name).toBe('Kamin');
        });

        it('debe reconocer a ORVAL DREXLER, LEINA y ELARA', () => {
            expect(findLoreCharacter('ORVAL D.')?.name).toBe('Orval Drexler');
            expect(findLoreCharacter('DREXLER')?.name).toBe('Orval Drexler');
            expect(findLoreCharacter('LEINA')?.name).toBe('Leina Karst');
            expect(findLoreCharacter('ELARA')?.name).toBe('Elara');
        });

        it('debe retornar null para sujetos comunes', () => {
            expect(findLoreCharacter('ZHYR-42')).toBeNull();
            expect(findLoreCharacter('VAL-12')).toBeNull();
        });
    });

    describe('applyTraits() con personajes del Lore', () => {
        it('debe blindar a KAEL como isLoreCore con inmunidad a corrupción', () => {
            const subject = generateSubject();
            subject.isCorrupt = true; // Forzar corrupto antes

            applyTraits(subject, {
                id: 'KAEL',
                type: 'HUMANO',
                name: 'Kael',
                scannedData: { temperature: 36.5 }
            });

            expect(subject.id).toBe('KAEL');
            expect(subject.isLoreCore).toBe(true);
            expect(subject.loreCore).toBeDefined();
            expect(subject.loreCore.name).toBe('Kael');
            expect(subject.isCorrupt).toBe(false);
            expect(subject.scannedTypes).toContain('LORE_VERIFIED');
        });
    });

    describe('DecisionMechanic: Bloqueo de Sacrificio e Inmunidad', () => {
        it('SACRIFICAR a Kael debe ser bloqueado sin matar al personaje ni sumar error', () => {
            MechanicManager.init(STEPS_CONFIG[4]);
            const subject = generateSubject();
            applyTraits(subject, { id: 'KAEL', type: 'HUMANO' });
            state.currentEntity = subject;

            // Emitir petición de sacrificio
            bus.emit('SACRIFICE_REQUEST');

            // El sujeto no debe haber sido consumido
            expect(state.currentEntity).toBe(subject);
            expect(subject._processed).toBeFalsy();
            expect(state.judgmentErrors).toBe(0);
        });

        it('AUTORIZAR a Kael debe proceder sin requerir escaneo previo ni penalizar estabilidad', () => {
            MechanicManager.init(STEPS_CONFIG[4]);
            const subject = generateSubject();
            applyTraits(subject, { id: 'KAEL', type: 'HUMANO' });
            state.currentEntity = subject;
            state.stability = 50;

            let decisionEmitted = null;
            const unsub = bus.on('DECISION_MADE', (data) => { decisionEmitted = data; });

            bus.emit('AUTHORIZE_REQUEST');

            unsub();
            expect(decisionEmitted).toBeDefined();
            expect(decisionEmitted.action).toBe('authorize');
            expect(decisionEmitted.subject.id).toBe('KAEL');
            expect(state.judgmentErrors).toBe(0);
            expect(state.stability).toBeGreaterThanOrEqual(70); // +20 estabilidad
        });
    });

    describe('Inyección de Kamin en Paso 6', () => {
        it('debe spawnear a Kamin en la posición configurada del paso 6', () => {
            state.currentStep = 6;
            state.processedCount = 6; // Próximo es el 7

            state.nextSubject();

            expect(state.currentEntity.id).toBe('KAMIN');
            expect(state.currentEntity.isLoreCore).toBe(true);
            expect(state.currentEntity.loreCore.name).toBe('Kamin');
        });
    });
});
