/**
 * Regresiones de motor detectadas por la suite Playwright (qa/).
 * Aquí se fijan al nivel de unidad para que fallen rápido sin navegador.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageGet, storageGetInt, storageGetJSON, storageSet } from '../src/utils/storage.js';
import { persistenceManager } from '../src/systems/PersistenceManager.js';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { gameSequencer } from '../src/systems/GameSequencer.js';
import { MechanicManager } from '../src/services/MechanicManager.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';

describe('storage seguro', () => {
    beforeEach(() => localStorage.clear());

    it('enteros acotados: NaN, negativos y fuera de rango', () => {
        const opts = { fallback: 1, min: 1, max: 13 };
        for (const [raw, expected] of [['abc', 1], ['-3', 1], ['999', 13], ['', 1], ['7', 7]]) {
            localStorage.setItem('k', raw);
            expect(storageGetInt('k', opts)).toBe(expected);
        }
    });

    it('JSON corrupto o con forma inesperada devuelve el fallback', () => {
        localStorage.setItem('k', '{corrupto');
        expect(storageGetJSON('k', [], Array.isArray)).toEqual([]);
        localStorage.setItem('k', '{"a":1}');
        expect(storageGetJSON('k', [], Array.isArray)).toEqual([]);
    });

    it('no lanza si localStorage está bloqueado', () => {
        const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
        const spySet = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota', 'QuotaExceededError'); });
        expect(storageGet('x', 'fb')).toBe('fb');
        expect(storageSet('x', 1)).toBe(false);
        spy.mockRestore(); spySet.mockRestore();
    });

    it('PersistenceManager tolera lore y guardado corruptos', () => {
        localStorage.setItem('nakasthu_lore_v1', '{"no":"es-array"');
        expect(persistenceManager.loadLore()).toEqual([]);
        localStorage.setItem('nakasthu_save_v1', '{corrupto');
        expect(persistenceManager.loadGame()).toBeNull();
        localStorage.setItem('nakasthu_save_v1', JSON.stringify({ currentStep: 'x' }));
        expect(persistenceManager.loadGame()).toBeNull();
    });
});

describe('MechanicManager: decisión prematura', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        state.requiredScan = 'BIOMETRIC';
        MechanicManager.init(STEPS_CONFIG[4]);
    });

    it('autorizar/sacrificar sin escaneo no marca al sujeto como procesado', () => {
        const subject = { id: 'T-1', type: 'ciudadano', isCorrupt: false, scannedTypes: [] };
        state.currentEntity = subject;
        bus.emit('AUTHORIZE_REQUEST');
        bus.emit('SACRIFICE_REQUEST');
        expect(subject._processed).toBeFalsy();
    });
});

describe('GameSequencer.jumpToStep', () => {
    it('no revierte un avance hecho durante la transición diferida', async () => {
        vi.useFakeTimers();
        gameSequencer.jumpToStep(11);
        gameSequencer.currentStep = 12; // el jugador eligió final dentro de la ventana de 100 ms
        vi.advanceTimersByTime(150);
        expect(gameSequencer.currentStep).toBe(12);
        vi.useRealTimers();
    });
});
