import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { pagesFor, corruptText } from '../src/utils/cinematicUtils.js';
import { narrativeFlags } from '../src/systems/NarrativeFlags.js';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { dialogueEngine, speaksOnArrival } from '../src/systems/DialogueEngine.js';

// Los planos se leen del código de la escena: Backdrop3D necesita WebGL y React para importarse.
const SHOTS = new Set([...readFileSync('src/ui/components/Backdrop3D.js', 'utf8').matchAll(/^\s{4}(\w+): \{ from:/gm)].map(m => m[1]));
const visible = (t) => t.split('¦').join('');
const allPages = () => [
    ...Object.values(STEPS_CONFIG).flatMap(c => [...(c.pages || []), ...(c.intro || [])]),
    ...Object.values(STEPS_CONFIG[12].meta.endings).flatMap(e => e.pages)
];

describe('Cinemáticas por páginas (entrega 1)', () => {
    beforeEach(() => narrativeFlags.reset?.());

    it('cada cinemática y preludio tiene páginas escritas a mano, de ≤ 9 y ≤ 220 caracteres', () => {
        for (const [n, c] of Object.entries(STEPS_CONFIG)) {
            if (c.type === 'cinematic' && !c.meta?.endings) expect(c.pages?.length, `paso ${n}`).toBeGreaterThan(0);
            for (const list of [c.pages, c.intro].filter(Boolean)) expect(list.length, `paso ${n}`).toBeLessThanOrEqual(9);
        }
        for (const p of allPages()) expect(visible(p.text).length, p.text).toBeLessThanOrEqual(220);
    });

    it('los pasos 2 y 11 dejan de tener briefing invisible: traen preludio', () => {
        expect(STEPS_CONFIG[2].intro.length).toBeGreaterThan(2);
        expect(STEPS_CONFIG[11].intro.map(p => p.text).join(' ')).toMatch(/cortado limpio/);
    });

    it('todo plano nombrado existe en la escena y el plano por defecto es el de la primera página', () => {
        for (const p of allPages()) if (p.shot) expect(SHOTS.has(p.shot), p.shot).toBe(true);
        for (const [n, c] of Object.entries(STEPS_CONFIG)) {
            if (c.pages?.[0]?.shot) expect(c.shot, `paso ${n}`).toBe(c.pages[0].shot);
            if (c.shot) expect(SHOTS.has(c.shot), c.shot).toBe(true);
        }
    });

    it('03:17 cierra las cinemáticas 3-9 y encabeza los briefings 4-10; en el 10 vuelve a empezar', () => {
        for (const n of [3, 5, 7, 9]) expect(pagesFor(STEPS_CONFIG[n]).at(-1)).toMatchObject({ clock: true, black: true });
        for (const n of [4, 6, 8, 10]) expect(STEPS_CONFIG[n].clock317).toBeTruthy();
        expect(STEPS_CONFIG[8].clock317.length).toBeGreaterThan(STEPS_CONFIG[6].clock317.length);
        expect(STEPS_CONFIG[10].clock317).toBe('No abras.');
    });

    it('cada turno cierra con boletín de enlace y cada briefing dice quién eres', () => {
        for (const n of [4, 6, 8, 10]) expect(STEPS_CONFIG[n].bulletin, `paso ${n}`).toBeTruthy();
        expect(STEPS_CONFIG[4].briefingText).toMatch(/operador de reasignación/);
        expect(STEPS_CONFIG[8].briefingText).toMatch(/cartilla/);
        expect(STEPS_CONFIG[8].briefingText).not.toMatch(/sabotaje/i);
    });

    it('los dos finales tienen el empuje, la foto de Elara y la grabación de Kamin; sin Tierra violácea en `orden`', () => {
        for (const faction of ['orden', 'caos']) {
            const pages = pagesFor(STEPS_CONFIG[12], faction);
            const text = pages.map(p => p.text).join(' ');
            expect(text, faction).toMatch(/Y empujó/);
            expect(pages.some(p => p.photo === 'ELARA'), faction).toBe(true);
            expect(pages.some(p => p.shot === 'kaminTurn' || p.shot === 'kaminTape'), faction).toBe(true);
            expect(pages.at(-1).text).toBe('FIN');
        }
        expect(pagesFor(STEPS_CONFIG[12], 'orden').map(p => p.text).join(' ')).not.toMatch(/violácea|Distribuciones que quedan/);
    });

    it('la pradera se revela en páginas y vuelve en bucle al primer fotograma', () => {
        const meadow = STEPS_CONFIG[12].meta.endings.caos.pages.filter(p => String(p.shot).startsWith('meadow'));
        expect(meadow.length).toBeGreaterThanOrEqual(10);
        expect(meadow[0].text).toMatch(/hermoso/);
        expect(meadow.some(p => p.corrupt)).toBe(true);
        expect(meadow.some(p => p.sound === 'silence')).toBe(true);
        expect(meadow.at(-1).auto).toBeGreaterThan(0);
        expect(SHOTS.has('meadowLoop')).toBe(true);
    });

    it('el texto corrupto repite letras y una palabra', () => {
        const t = '—Soy todo lo que recuerdas de él. ¿No es suficiente?';
        const c = corruptText(t);
        expect(c).not.toBe(t);
        expect(c.length).toBeGreaterThan(t.length);
    });
});

describe('Primera línea automática (V2)', () => {
    const anchor = { id: 'DLG_ANCLA', priority: true, minStep: 1, maxStep: 12, text: '*Llega.* \'Hola.\'', options: [] };
    beforeEach(() => {
        vi.useFakeTimers();
        state.resetState();
        state.currentStep = 4;
        state.gameStatus = 'PLAYING';
        state.isModalOpen = false;
        state.isTutorialActive = false;
        state.usedDialogueIds = [];
        dialogueEngine.closeDialogue();
        dialogueEngine.uiModal = false;
        dialogueEngine.dialogues = [anchor];
    });
    afterEach(() => vi.useRealTimers());

    it('reservar un diálogo no lo gasta: sólo se marca al abrirse', () => {
        const subject = { id: 'XR-1' };
        bus.emit('SUBJECT_PREPARE', subject);
        expect(state.usedDialogueIds).not.toContain('DLG_ANCLA');
        expect(speaksOnArrival(dialogueEngine.reserved.dialogue)).toBe(true);
    });

    it('un ancla se abre sola al llegar el sujeto, sin INTERROGAR', () => {
        const subject = { id: 'XR-2' };
        bus.emit('SUBJECT_PREPARE', subject);
        state.currentEntity = subject;
        bus.emit('NEW_SUBJECT_DETECTED', subject);
        vi.advanceTimersByTime(1000);
        expect(state.activeDialogue?.id).toBe('DLG_ANCLA');
        expect(state.usedDialogueIds).toContain('DLG_ANCLA');
    });

    it('con un briefing abierto espera a que se cierre', () => {
        const subject = { id: 'XR-3' };
        bus.emit('SUBJECT_PREPARE', subject);
        state.currentEntity = subject;
        state.isModalOpen = true;
        bus.emit('NEW_SUBJECT_DETECTED', subject);
        vi.advanceTimersByTime(1000);
        expect(state.activeDialogue).toBeFalsy();
        state.isModalOpen = false;
        bus.emit('STORY_MODAL_CLOSE', {});
        vi.advanceTimersByTime(1000);
        expect(state.activeDialogue?.id).toBe('DLG_ANCLA');
    });

    it('si el sujeto se va antes de hablar, el ancla vuelve al pool', () => {
        bus.emit('SUBJECT_PREPARE', { id: 'XR-4' });
        state.currentEntity = { id: 'XR-5' };
        vi.advanceTimersByTime(1000);
        expect(state.usedDialogueIds).not.toContain('DLG_ANCLA');
        expect(dialogueEngine.pickDialogue({ id: 'XR-5' })?.id).toBe('DLG_ANCLA');
    });
});
