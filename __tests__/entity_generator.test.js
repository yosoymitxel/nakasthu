import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateSubject, applyTraits, ENTITY_TYPES } from '../src/systems/EntityGenerator.js';

describe('EntityGenerator Tests (entity_generator.test.js)', () => {
    describe('generateSubject()', () => {
        it('debe retornar un sujeto con estructura completa', () => {
            const subject = generateSubject();

            // Verificar propiedades obligatorias
            expect(subject).toHaveProperty('id');
            expect(subject).toHaveProperty('type');
            expect(subject).toHaveProperty('isCorrupt');
            expect(subject).toHaveProperty('mentalStability');
            expect(subject).toHaveProperty('dialogue');
            expect(subject).toHaveProperty('hasBeenInterrogated');
            expect(subject).toHaveProperty('scannedTypes');
            expect(subject).toHaveProperty('scannedData');
            expect(subject).toHaveProperty('visual');
        });

        it('debe generar IDs con formato PREFIX-NUMBER', () => {
            const subject = generateSubject();
            const validPrefixes = ['ZHYR', 'KRON', 'XEN', 'VAL', 'NYX'];
            const [prefix, number] = subject.id.split('-');

            expect(validPrefixes).toContain(prefix);
            expect(parseInt(number)).toBeGreaterThanOrEqual(0);
            expect(parseInt(number)).toBeLessThan(99);
        });

        it('debe generar tipos válidos (HUMANO, CLON, EIDOLON, HÍBRIDO)', () => {
            const validTypes = Object.values(ENTITY_TYPES);

            // Generar múltiples sujetos para verificar distribución
            for (let i = 0; i < 20; i++) {
                const subject = generateSubject();
                expect(validTypes).toContain(subject.type);
            }
        });

        it('debe generar temperatura entre 35 y 40 grados', () => {
            const subject = generateSubject();
            expect(subject.scannedData.temperature).toBeGreaterThanOrEqual(35);
            expect(subject.scannedData.temperature).toBeLessThanOrEqual(40);
        });

        it('debe generar neuralSync entre 0 y 100', () => {
            const subject = generateSubject();
            expect(subject.scannedData.neuralSync).toBeGreaterThanOrEqual(0);
            expect(subject.scannedData.neuralSync).toBeLessThanOrEqual(100);
        });

        it('EIDOLONs deben tener corrupción alta (80-100%)', () => {
            // Forzar múltiples generaciones hasta obtener un EIDOLON
            let eidolonFound = false;
            for (let i = 0; i < 100 && !eidolonFound; i++) {
                const subject = generateSubject();
                if (subject.type === 'EIDOLON') {
                    expect(subject.scannedData.corruption).toBeGreaterThanOrEqual(80);
                    eidolonFound = true;
                }
            }
            // No forzamos que siempre encuentre uno, pero si lo encuentra debe cumplir
        });

        it('debe incluir glitch válido en visuales', () => {
            const validGlitches = ['STATIC', 'CHROMATIC', 'VOID', 'GHOST', 'NONE'];
            const subject = generateSubject();
            expect(validGlitches).toContain(subject.visual.glitch);
        });
    });

    describe('applyTraits()', () => {
        let baseSubject;

        beforeEach(() => {
            baseSubject = generateSubject();
        });

        it('debe retornar el sujeto sin cambios si no hay traits', () => {
            const originalId = baseSubject.id;
            const result = applyTraits(baseSubject, null);
            expect(result.id).toBe(originalId);
        });

        it('debe retornar el sujeto sin cambios si el sujeto es null', () => {
            const result = applyTraits(null, { id: 'TEST' });
            expect(result).toBeNull();
        });

        it('debe sobreescribir el ID correctamente', () => {
            applyTraits(baseSubject, { id: 'KAEL' });
            expect(baseSubject.id).toBe('KAEL');
        });

        it('debe sobreescribir el tipo correctamente', () => {
            applyTraits(baseSubject, { type: 'LÍDER' });
            expect(baseSubject.type).toBe('LÍDER');
        });

        it('debe agregar nombre real opcional', () => {
            applyTraits(baseSubject, { name: 'Alexia' });
            expect(baseSubject.name).toBe('Alexia');
        });

        it('debe merge scannedData parcialmente', () => {
            const originalTemp = baseSubject.scannedData.temperature;
            applyTraits(baseSubject, {
                scannedData: { neuralSync: 99 }
            });

            // neuralSync debe cambiar
            expect(baseSubject.scannedData.neuralSync).toBe(99);
            // temperature debe mantenerse
            expect(baseSubject.scannedData.temperature).toBe(originalTemp);
        });

        it('debe merge visual parcialmente', () => {
            const originalSeed = baseSubject.visual.seed;
            applyTraits(baseSubject, {
                visual: { glitch: 'CHROMATIC' }
            });

            // glitch debe cambiar
            expect(baseSubject.visual.glitch).toBe('CHROMATIC');
            // seed debe mantenerse
            expect(baseSubject.visual.seed).toBe(originalSeed);
        });

        it('debe permitir múltiples traits a la vez', () => {
            applyTraits(baseSubject, {
                id: 'ORVAL D.',
                type: 'LÍDER',
                scannedData: { temperature: 36.8, neuralSync: 95 },
                visual: { glitch: 'NONE' }
            });

            expect(baseSubject.id).toBe('ORVAL D.');
            expect(baseSubject.type).toBe('LÍDER');
            expect(baseSubject.scannedData.temperature).toBe(36.8);
            expect(baseSubject.scannedData.neuralSync).toBe(95);
            expect(baseSubject.visual.glitch).toBe('NONE');
        });
    });
});
