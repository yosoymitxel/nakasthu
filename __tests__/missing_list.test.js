/**
 * Entrega 2 «Que duela»: LA LISTA, recurrentes, nombres de reasignar/entregar, monitor de cruces y epílogo.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { LIST_LAYERS } from '../src/data/missingList.js';
import { PATH_CONFIGS } from '../src/data/pathConfigs.js';
import { MODULES } from '../src/systems/ModuleRegistry.js';
import { missingList } from '../src/systems/MissingList.js';
import { narrativeFlags } from '../src/systems/NarrativeFlags.js';
import { dialogueEngine } from '../src/systems/DialogueEngine.js';
import { pagesFor } from '../src/utils/cinematicUtils.js';

const open = (step) => bus.emit('STEP_CHANGE', { step, config: STEPS_CONFIG[step] });
const decide = (step, subject, action) => { state.currentStep = step; missingList.record(subject, action); };
const ids = () => state.missingList.map(e => e.id);

describe('LA LISTA', () => {
    beforeEach(() => bus.emit('GAME_START'));

    it('cada paso jugable pega su capa del libro, y saltar a un paso trae las anteriores', () => {
        open(4);
        expect(ids()).toEqual(LIST_LAYERS[4].entries.map(e => e.id));
        open(10);
        const all = Object.values(LIST_LAYERS).flatMap(l => l.entries.map(e => e.id));
        expect(ids().sort()).toEqual(all.sort());
        // Quien buscaba en el paso 8 ya no viene en el 10: Toren pagó, Rian dejó de buscar
        const toren = state.missingList.find(e => e.id === 'TOREN');
        expect(toren.gone).toBe(true);
        expect(toren.note).toMatch(/ya no viene/);
    });

    it('reasignar pone nombre y «retorno previsto»; autorizar en Talok no entra en la lista', () => {
        open(4);
        decide(4, { id: 'XR-42' }, 'authorize');
        expect(state.missingList.filter(e => e.mine)).toHaveLength(0);
        decide(4, { id: 'XR-43' }, 'sacrifice');
        const mine = state.missingList.filter(e => e.mine);
        expect(mine).toHaveLength(1);
        expect(mine[0].tag).toBe('XR-43');
        expect(mine[0].name).toMatch(/^\p{L}+ \p{L}+, \d+$/u);
        expect(mine[0].note).toBe('A Prisiat. Retorno previsto: —');
        expect(missingList.turnLine(4)).toMatch(/Esta consola: 1 a Prisiat.*La lista: 3 nombres/);
    });

    it('en el paso 10 los que cruzan desde tu mesa quedan tachados; los personajes con nombre conservan el suyo', () => {
        open(10);
        decide(10, { id: 'TOBI ARREN' }, 'authorize');
        const tobi = state.missingList.find(e => e.mine);
        expect(tobi).toMatchObject({ name: 'Tobi Arren', struck: true, note: 'Cruzó.' });
        decide(10, { id: 'KAEL', isLoreCore: true }, 'authorize');
        expect(state.missingList.filter(e => e.mine)).toHaveLength(1);
    });

    it('rejugar un turno o reiniciarlo borra lo que procesaste en él', () => {
        open(4);
        decide(4, { id: 'XR-1' }, 'sacrifice');
        bus.emit('LEVEL_RESET', { step: 4 });
        expect(state.missingList.some(e => e.mine)).toBe(false);
        decide(4, { id: 'XR-2' }, 'sacrifice');
        open(6);
        decide(6, { id: 'XR-3' }, 'sacrifice');
        open(4); // selector de niveles: vuelve a empezar desde el 4
        expect(state.missingList.some(e => e.mine)).toBe(false);
    });

    it('sobrevive a «Continuar partida» (resetState) y una partida nueva la vacía', () => {
        open(6);
        state.resetState();
        expect(state.missingList.length).toBe(4);
        bus.emit('GAME_START');
        expect(state.missingList).toEqual([]);
    });

    it('al cruzar en el final caos se tachan los nombres del libro, salvo si quien buscaba fue entregado', () => {
        open(10);
        narrativeFlags.set({ ovid: 'entregado' });
        bus.emit('GAME_ENDING', { faction: 'caos' });
        expect(state.missingList.find(e => e.id === 'OKONJO').struck).toBe(true);
        expect(state.missingList.find(e => e.id === 'TESSA').struck).toBeFalsy();
    });
});

describe('Recurrentes', () => {
    beforeAll(async () => { await dialogueEngine.loadDialogues(); });
    beforeEach(() => {
        bus.emit('GAME_START');
        state.resetState();
        state.usedDialogueIds = [];
    });

    const arrive = (step, pos) => {
        state.currentStep = step;
        state.processedCount = pos - 1;
        state.quota = STEPS_CONFIG[step].subjectCount;
        state.nextSubject();
        return dialogueEngine.reserved?.dialogue?.id;
    };

    it('vuelven en su posición con su cara y su primera línea', () => {
        expect(arrive(4, 6)).toBe('DLG_R_TOBI_DEUDA');
        expect(state.currentEntity.id).toBe('TOBI ARREN');
        expect(arrive(6, 2)).toBe('DLG_P2_OVID');
        expect(arrive(8, 2)).toBe('DLG_P3_TOREN');
        expect(arrive(10, 9)).toBe('DLG_P4_SERAFIN');
    });

    it('lo que decidiste con ellos decide cómo vuelven', () => {
        state.currentStep = 4;
        missingList.record({ id: 'TOBI ARREN', cameo: STEPS_CONFIG[4].meta.cameos[1] }, 'authorize');
        expect(arrive(6, 4)).toBe('DLG_R_TOBI_OBRA');
        narrativeFlags.reset();
        expect(arrive(6, 4)).toBe('DLG_R_TOBI_RAMPA');
        state.currentStep = 4;
        missingList.record({ id: 'TOBI ARREN', cameo: STEPS_CONFIG[4].meta.cameos[1] }, 'sacrifice');
        expect(arrive(10, 6)).toBe('DLG_R_TOBI_CONSOLA');
        // Entregar a Nera en el paso 8: en el 10 ya no viene
        narrativeFlags.set({ nera: 'entregada' });
        expect(arrive(10, 4)).not.toBe('DLG_R_NERA_EIDOLON');
    });

    it('un diálogo de recurrente nunca sale al azar fuera de su posición', () => {
        state.currentStep = 10;
        for (let i = 0; i < 200; i++) expect(dialogueEngine.pickDialogue({ id: 'XR-9' })?.cameo).toBeFalsy();
    });
});

describe('Nombres, monitor y epílogo', () => {
    beforeEach(() => { bus.emit('GAME_START'); narrativeFlags.reset(); });

    it('reasignar a Prisiat (Talok) y entregar (Orden) en lugar de sacrificar y purgar', () => {
        expect(PATH_CONFIGS[0].operations.rejectLabel).toBe('REASIGNAR A PRISIAT');
        expect(PATH_CONFIGS[1].operations.rejectLabel).toBe('ENTREGAR');
        expect(PATH_CONFIGS[0].controlPanel.manual.sacrifice.label).toMatch(/REASIGNAR/);
        expect(PATH_CONFIGS[1].controlPanel.manual.sacrifice.label).toMatch(/ENTREGAR/);
    });

    it('el monitor de flujo llega en el paso 10, con el portal ya abierto', () => {
        expect(MODULES.PORTAL_MONITOR.unlockStep).toBe(10);
    });

    it('Idrís lee los nombres de tu lista, los de tu consola primero', () => {
        open(10);
        state.currentStep = 4;
        missingList.record({ id: 'MAREN KALL' }, 'sacrifice');
        const caos = pagesFor(STEPS_CONFIG[12], 'caos');
        const radio = caos.find(p => p.doc === 'Emisora local · día 21');
        expect(radio.text).toMatch(/^El día veintiuno lee la lista entera\.\nMaren Kall\. /);
        expect(radio.text).not.toContain('{lista}');
        expect(pagesFor(STEPS_CONFIG[12], 'orden').some(p => p.text.includes('Maren Kall'))).toBe(true);
    });

    it('Ovid contesta a su madre y Serafín no cruza, salvo que los entregaras', () => {
        const has = (re) => pagesFor(STEPS_CONFIG[12], 'caos').some(p => re.test(p.text));
        expect(has(/Voy a buscar a Tessa/)).toBe(true);
        expect(has(/Serafín Duq no cruza/)).toBe(true);
        narrativeFlags.set({ ovid: 'entregado', serafin: 'entregado' });
        expect(has(/Voy a buscar a Tessa/)).toBe(false);
        expect(has(/Serafín Duq no cruza/)).toBe(false);
    });
});
