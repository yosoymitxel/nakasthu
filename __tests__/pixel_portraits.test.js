import { describe, it, expect } from 'vitest';
import { morphFor, ALIENS } from '../src/ui/components/PixelPortrait.js';
import { applyTraits, generateSubject } from '../src/services/EntityService.js';
import { findLoreCharacter } from '../src/data/loreCharactersConfig.js';

describe('Pixel Portraits & Morphology System', () => {
    describe('morphFor() - Identidad de Especies y Canon', () => {
        it('KAEL debe ser clasificado como humano, nunca alienígena', () => {
            const morph = morphFor('HUMANO', 'KAEL', 'HUMANO');
            expect(morph).toBe('humano');
            expect(ALIENS).not.toContain(morph);
        });

        it('ELARA debe ser clasificada como humana, nunca alienígena', () => {
            const morph = morphFor('HUMANO', 'ELARA', 'OPERADORA');
            expect(morph).toBe('humano');
            expect(ALIENS).not.toContain(morph);
        });

        it('DEYAR y ORVAL DREXLER deben ser clasificados como humanos', () => {
            expect(morphFor('HUMANO', 'DEYAR', 'TÉCNICO')).toBe('humano');
            expect(morphFor('HUMANO', 'ORVAL D.', 'LÍDER')).toBe('humano');
        });

        it('CLON debe resolver a morfología clon', () => {
            expect(morphFor('CLON', 'VAL-99')).toBe('clon');
            expect(morphFor('CLON', 'KRON-12')).toBe('clon');
        });

        it('HÍBRIDO debe resolver a una de las cuatro razas alienígenas de Zhyr', () => {
            const morph1 = morphFor('HÍBRIDO', 'XEN-01');
            const morph2 = morphFor('HÍBRIDO', 'ZHYR-88');
            expect(ALIENS).toContain(morph1);
            expect(ALIENS).toContain(morph2);
        });
    });

    describe('applyTraits() - Alineación de Especie con Lore', () => {
        it('debe asignar species HUMANO automáticamente a personajes canónicos humanos', () => {
            const subject = generateSubject();
            subject.species = 'HÍBRIDO'; // Suponiendo que el generador azaroso asignó híbrido

            applyTraits(subject, { id: 'KAEL', type: 'HUMANO' });

            expect(subject.species).toBe('HUMANO');
            expect(subject.id).toBe('KAEL');
            expect(subject.isLoreCore).toBe(true);
        });

        it('debe asignar species HUMANO a ELARA aunque el sujeto base fuera generado como CLON', () => {
            const subject = generateSubject();
            subject.species = 'CLON';

            applyTraits(subject, { id: 'ELARA', type: 'OPERADORA' });

            expect(subject.species).toBe('HUMANO');
            expect(subject.type).toBe('OPERADORA');
        });

        it('debe actualizar species cuando traits.type es una especie base', () => {
            const subject = generateSubject();
            applyTraits(subject, { id: 'TEST-01', type: 'CLON' });
            expect(subject.species).toBe('CLON');
        });
    });
});
