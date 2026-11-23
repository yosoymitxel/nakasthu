import { describe, it, expect } from 'vitest';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { createConsoleRun, pressCommand, matchCommand } from '../src/systems/LeinaConsole.js';

const cfg = STEPS_CONFIG[11].meta.console;
const play = (ids) => ids.reduce((run, id) => pressCommand(cfg, run, id), createConsoleRun(cfg));

describe('Consola de Leina (paso 11)', () => {
    it('en orden, con la doble confirmación, amplía de 6 a 11 m: final caos', () => {
        const run = play(['potencia', 'campo', 'bucle', 'confirmar', 'confirmar']);
        expect(run).toMatchObject({ done: true, faction: 'caos', vortex: 11 });
    });

    it('al revés la cierra: final orden; la confirmación va primero y también pide dos pulsaciones', () => {
        const half = play(['confirmar']);
        expect(half).toMatchObject({ armed: true, entered: [], faction: 'orden' });
        const run = play(['confirmar', 'confirmar', 'bucle', 'campo', 'potencia']);
        expect(run).toMatchObject({ done: true, faction: 'orden', vortex: 0 });
    });

    it('sin la segunda pulsación no termina', () => {
        expect(play(['potencia', 'campo', 'bucle', 'confirmar']).done).toBe(false);
    });

    it('un comando fuera de orden anula la secuencia y deja empezar en el otro sentido', () => {
        const bad = play(['potencia', 'bucle']);
        expect(bad).toMatchObject({ entered: [], faction: null, vortex: 6 });
        expect(bad.error).toMatch(/ANULADA/);
        expect(play(['campo']).faction).toBe(null);
        expect(pressCommand(cfg, play(['confirmar']), 'bucle').entered).toEqual([]);
    });

    it('los comandos se pueden escribir', () => {
        expect(matchCommand(cfg, 'Potencia +2').id).toBe('potencia');
        expect(matchCommand(cfg, 'bucle retorno cerrar').id).toBe('bucle');
        expect(matchCommand(cfg, 'xyz')).toBe(null);
    });

    it('Kamin pide «Otra vez», «Enséñamelo» y «Por si te pasa algo»; luego el empuje y el monólogo', () => {
        const said = cfg.kamin.map(l => l.text).join(' ');
        for (const t of ['Otra vez.', 'Enséñamelo.', 'Por si te pasa algo.']) expect(said).toContain(t);
        const push = cfg.push.map(p => p.text).join(' ');
        expect(push).toMatch(/Y empujó/);
        expect(push).toMatch(/cuántas personas cabían por hora/);
        expect(push).toMatch(/funcionar sin ella/);
        expect(push).toMatch(/girar la cabeza/);
        for (const p of cfg.push) expect(p.text.replace(/¦/g, '').length).toBeLessThanOrEqual(220);
    });

    it('las dos preguntas de Kamin se oyen en el paso 8, en posiciones fijas', () => {
        const ids = STEPS_CONFIG[8].meta.cameos.flatMap(c => c.dialogues);
        expect(ids).toContain('DLG_P3_KAMIN_POR_HORA');
        expect(ids).toContain('DLG_P3_KAMIN_SIN_TI');
    });

    it('los finales no repiten la secuencia ni el empuje ya jugados', () => {
        for (const e of Object.values(STEPS_CONFIG[12].meta.endings)) {
            const text = e.pages.map(p => p.text).join(' ');
            expect(text).not.toMatch(/Y empujó|mete los cuatro comandos/);
        }
    });
});
