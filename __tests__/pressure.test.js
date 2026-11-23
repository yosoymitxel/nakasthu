/**
 * Entrega 4 «Que pese»: horas de turno que se acumulan, devueltos del paso 10 con escáner inútil,
 * el cerco que alarga la cola, urgencia del paso 6 y registro de Kamin.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { gameLoop } from '../src/core/GameLoop.js';
import { gameSequencer, errorBudget } from '../src/systems/GameSequencer.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { CONFIG } from '../src/data/gameConfig.js';
import { analyzeSubjectProbability } from '../src/utils/scannerUtils.js';
import { calculateDecisionResult } from '../src/utils/gameplayUtils.js';
import { fatigueTier, baseShiftHours, turnShiftHours, kaminRegister, siegeNoticeAt } from '../src/utils/pressureUtils.js';

const F = CONFIG.FATIGUE;

// Cierra el turno del paso actual con los objetivos cumplidos y entra en `next`.
function closeTurn(step, next, { seconds = 0 } = {}) {
    gameSequencer.currentStep = step;
    state.currentStep = step;
    state.gameStatus = 'PLAYING';
    state.judgmentErrors = 0;
    state.quota = STEPS_CONFIG[step].subjectCount;
    state.processedCount = state.quota;
    state.techniciansRecruited = 99;
    state.influenceGathered = 99;
    state.turnSeconds = seconds;
    gameSequencer.checkGameStatus();
    gameSequencer.finalizeStepTransition(next);
}

describe('Horas de turno', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        gameSequencer.turnCarry = null;
        state.resetState();
    });
    afterEach(() => vi.useRealTimers());

    it('se acumulan entre turnos y no se reinician con el paso', () => {
        closeTurn(4, 6);
        expect(state.shiftHours).toBe(STEPS_CONFIG[4].meta.shiftHours);
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL);

        closeTurn(6, 8);
        expect(fatigueTier(state.shiftHours)).toBe(1);
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL - F.TIRED_ENERGY);

        closeTurn(8, 10);
        expect(state.shiftHours).toBe(baseShiftHours(10));
        expect(fatigueTier(state.shiftHours)).toBe(2);
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL - F.TIRED_ENERGY);
    });

    it('el tiempo jugado alarga el turno, con tope', () => {
        expect(turnShiftHours({ shiftHours: 10 }, F.SECONDS_PER_HOUR * 2)).toBe(12);
        expect(turnShiftHours({ shiftHours: 10 }, 99999)).toBe(10 + F.MAX_EXTRA_HOURS);
    });

    it('el resumen del turno dice las horas y avisa al cruzar un tramo', () => {
        let content = '';
        const onOpen = (d) => { content = d.content; };
        bus.on('STORY_MODAL_OPEN', onOpen);
        state.shiftHours = 20;
        gameSequencer.currentStep = 6;
        state.currentStep = 6;
        state.gameStatus = 'PLAYING';
        state.quota = state.processedCount = STEPS_CONFIG[6].subjectCount;
        state.turnSeconds = 0;
        gameSequencer.checkGameStatus();
        bus.off('STORY_MODAL_OPEN', onOpen);
        gameSequencer.pendingAdvance = false;
        expect(content).toMatch(/Horas de turno: 34\. Desde ahora la energía empezará 10 más abajo\./);
    });

    it('saltar a un paso trae las horas de los turnos anteriores', () => {
        gameSequencer.jumpToStep(10);
        vi.advanceTimersByTime(150);
        expect(state.shiftHours).toBe(baseShiftHours(10));
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL - F.TIRED_ENERGY);
        gameSequencer.jumpToStep(4);
        vi.advanceTimersByTime(150);
        expect(state.shiftHours).toBe(0);
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL);
    });

    it('reiniciar el día no quita el cansancio', () => {
        gameSequencer.jumpToStep(8);
        vi.advanceTimersByTime(150);
        state.energy = 12;
        gameSequencer.resetLevel();
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL - F.TIRED_ENERGY);
    });
});

describe('Paso 6: la urgencia gasta más', () => {
    beforeEach(() => state.resetState());

    it('timeMultiplier acelera el gasto de energía', () => {
        state.gameStatus = 'PLAYING';
        state.isModalOpen = false;
        state.currentStep = 6;
        state.energy = 100;
        gameLoop.tick();
        expect(state.energy).toBeCloseTo(100 - CONFIG.ENERGY.TICK_DRAIN * STEPS_CONFIG[6].meta.timeMultiplier);
        state.currentStep = 4;
        state.energy = 100;
        gameLoop.tick();
        expect(state.energy).toBeCloseTo(100 - CONFIG.ENERGY.TICK_DRAIN);
        expect(state.turnSeconds).toBe(2);
    });
});

describe('Paso 10: devueltos y cerco', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        state.resetState();
    });
    afterEach(() => vi.useRealTimers());

    it('un devuelto sale nominal en todos los escáneres y ninguna decisión es error', () => {
        const cameo = STEPS_CONFIG[10].meta.cameos.find(c => c.returned);
        state.currentStep = 10;
        state.quota = 15;
        state.processedCount = cameo.pos - 1;
        state.nextSubject();
        const subject = state.currentEntity;
        expect(subject.returned).toBe(true);
        for (const type of [...Object.keys(CONFIG.SCANNER.TYPES), 'VOICE']) {
            for (const mode of ['NORMAL', 'ECLIPSE']) expect(analyzeSubjectProbability(type, subject, mode)).toBeLessThan(5);
        }
        expect(calculateDecisionResult(subject, 'authorize', CONFIG).isError).toBe(false);
        expect(calculateDecisionResult(subject, 'sacrifice', CONFIG).isError).toBe(false);
    });

    it('el cerco sube la cuota hasta +5, da todos sus partes y el turno se puede cerrar', () => {
        const siege = STEPS_CONFIG[10].meta.siege;
        const notices = [];
        let summary = '';
        const onEmit = (d) => { if (d.sender === 'PARTE DEL CERCO') notices.push(d.text); };
        const onOpen = (d) => { summary = d.content; };
        bus.on('DIALOGUE_EMITTED', onEmit);
        bus.on('STORY_MODAL_OPEN', onOpen);

        gameSequencer.jumpToStep(10);
        vi.advanceTimersByTime(150);
        state.isModalOpen = false;
        const base = STEPS_CONFIG[10].subjectCount;
        expect(state.quota).toBe(base);
        let guard = 0;
        while (state.gameStatus === 'PLAYING' && guard++ < 40) {
            const subject = state.currentEntity || { id: `T-${guard}`, type: 'devoto' };
            bus.emit('DECISION_MADE', { subject, action: 'authorize' });
            vi.advanceTimersByTime(1000);
        }
        bus.off('DIALOGUE_EMITTED', onEmit);
        bus.off('STORY_MODAL_OPEN', onOpen);
        gameSequencer.pendingAdvance = false;

        expect(state.quota).toBe(base + siege.grow);
        expect(state.processedCount).toBe(base + siege.grow);
        expect(notices).toEqual(siege.notices.map(n => n.text));
        expect(state.maxErrors).toBeGreaterThanOrEqual(errorBudget(base + siege.grow));
        const returned = STEPS_CONFIG[10].meta.cameos.filter(c => c.returned).length;
        expect(summary).toMatch(new RegExp(`Devueltos: ${returned}\\. Describieron un lugar: 0\\.`));
    });

    it('admisión en masa: consagrar no gasta energía en el paso 10', () => {
        expect(STEPS_CONFIG[10].meta.massAdmission).toBe(true);
        const innocent = { isCorrupt: false };
        expect(calculateDecisionResult(innocent, 'authorize', CONFIG).energyChange).toBe(-CONFIG.ENERGY.AUTHORIZE_COST);
        expect(calculateDecisionResult(innocent, 'authorize', CONFIG, { massAdmission: true }).energyChange).toBe(0);
    });

    it('un parte sólo sale una vez y en su tramo', () => {
        const siege = STEPS_CONFIG[10].meta.siege;
        expect(siegeNoticeAt(siege, 2, 0)).toBeNull();
        expect(siegeNoticeAt(siege, 3, 0)).toMatchObject({ index: 0, grows: true });
        expect(siegeNoticeAt(siege, 3, 1)).toBeNull();
        expect(siegeNoticeAt(siege, siege.every * (siege.notices.length + 1), siege.notices.length)).toBeNull();
    });
});

describe('Registro: Kamin', () => {
    it('empieza vacío y se escribe con la cola: un cualquiera en el paso 6, miles en el 10', () => {
        expect(kaminRegister(6, 0).entries).toHaveLength(0);
        expect(kaminRegister(6, 6).faithful).toBe(1);
        expect(kaminRegister(8, 0).faithful).toBe(1200);
        expect(kaminRegister(8, 2).entries.some(e => e.technique === 'Mide la máquina')).toBe(false);
        expect(kaminRegister(8, 3).entries.some(e => e.technique === 'Mide la máquina')).toBe(true);
        const siege = STEPS_CONFIG[10].meta.siege;
        const arrivals = siege.notices.reduce((n, s) => n + s.arrivals, 0);
        expect(kaminRegister(10, 0, 0).faithful).toBe(31000);
        expect(kaminRegister(10, 15, siege.notices.length).faithful).toBe(31000 + arrivals);
        // Cada escalón hace subir o mantener los fieles: nunca bajan
        let last = 0;
        for (const step of [6, 7, 8, 9, 10]) {
            const f = kaminRegister(step, 99, 0).faithful;
            expect(f).toBeGreaterThanOrEqual(last);
            last = f;
        }
    });
});
