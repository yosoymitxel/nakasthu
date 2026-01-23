import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { loreSystem } from '../src/systems/LoreSystem.js';

describe('LoreSystem Tests (lore_system.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        state.loreArchive = [];
        vi.clearAllMocks();
    });

    describe('unlockLoreById()', () => {
        it('debe agregar una entrada al archivo de lore', async () => {
            await loreSystem.unlockLoreById('LORE_TEST_ENTRY');

            expect(state.loreArchive.length).toBe(1);
            expect(state.loreArchive[0].loreId).toBe('LORE_TEST_ENTRY');
        });

        it('no debe duplicar entradas con el mismo loreId', async () => {
            await loreSystem.unlockLoreById('LORE_DUPLICATE');
            await loreSystem.unlockLoreById('LORE_DUPLICATE');

            const matches = state.loreArchive.filter(e => e.loreId === 'LORE_DUPLICATE');
            expect(matches.length).toBe(1);
        });

        it('debe usar texto de fallback si no existe en la base de datos', async () => {
            await loreSystem.unlockLoreById('LORE_UNKNOWN_ENTRY');

            const entry = state.loreArchive.find(e => e.loreId === 'LORE_UNKNOWN_ENTRY');
            expect(entry.text).toContain('ENTRADA DE LORE DESBLOQUEADA:');
        });

        it('debe emitir evento TERMINAL_PRINT al desbloquear', async () => {
            const spy = vi.spyOn(bus, 'emit');

            await loreSystem.unlockLoreById('LORE_EVENT_TEST');

            expect(spy).toHaveBeenCalledWith('TERMINAL_PRINT', expect.objectContaining({
                type: 'SUCCESS'
            }));
        });

        it('no debe hacer nada si loreId es null o undefined', async () => {
            const initialLength = state.loreArchive.length;

            await loreSystem.unlockLoreById(null);
            await loreSystem.unlockLoreById(undefined);

            expect(state.loreArchive.length).toBe(initialLength);
        });
    });

    describe('saveToArchive()', () => {
        it('debe agregar datos al archivo con ID único', () => {
            const testData = {
                entityId: 'TEST-001',
                text: 'Datos de prueba',
                timestamp: Date.now()
            };

            loreSystem.saveToArchive(testData);

            expect(state.loreArchive.length).toBe(1);
            expect(state.loreArchive[0]).toHaveProperty('id');
            expect(state.loreArchive[0].entityId).toBe('TEST-001');
        });

        it('debe preservar todas las propiedades del objeto original', () => {
            const testData = {
                customProp: 'valor',
                nested: { key: 'value' }
            };

            loreSystem.saveToArchive(testData);

            expect(state.loreArchive[0].customProp).toBe('valor');
            expect(state.loreArchive[0].nested.key).toBe('value');
        });
    });

    describe('Event Listeners', () => {
        it('LORE_UNLOCKED debe llamar a unlockLoreById', async () => {
            const spy = vi.spyOn(loreSystem, 'unlockLoreById');

            bus.emit('LORE_UNLOCKED', 'LORE_FROM_EVENT');

            // Dar tiempo al async
            await new Promise(r => setTimeout(r, 100));

            expect(spy).toHaveBeenCalledWith('LORE_FROM_EVENT');
        });

        it('LORE_DATA_EMITTED debe llamar a saveToArchive', () => {
            const spy = vi.spyOn(loreSystem, 'saveToArchive');

            bus.emit('LORE_DATA_EMITTED', { test: 'data' });

            expect(spy).toHaveBeenCalledWith({ test: 'data' });
        });
    });
});
