import { describe, it, expect } from 'vitest';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { REPORTS } from '../src/data/interludes.js';
import { createReportsRun, readReport, sealReport, timeoutReports, reportsVerdict } from '../src/systems/Interludes.js';

const sealAll = (run) => { while (!run.done) run = sealReport(run); return run; };

describe('Doce informes (cinemática 7)', () => {
    it('son doce y el séptimo es la galería siete; la página va en la cinemática 7', () => {
        expect(REPORTS.items).toHaveLength(12);
        expect(REPORTS.items[6]).toMatchObject({ seven: true });
        expect(REPORTS.items[6].where).toMatch(/siete/);
        const page = STEPS_CONFIG[7].pages.find(p => p.play === 'reports');
        expect(page.text).toMatch(/veintiséis/);
    });

    it('sellar doce sin leer: lo firmó sin leerlo', () => {
        const run = sealAll(createReportsRun(REPORTS));
        expect(run).toMatchObject({ sealed: 12, done: true });
        expect(reportsVerdict(REPORTS, run)).toBe(REPORTS.unread);
    });

    it('leer el séptimo no cambia nada: no decía nada raro', () => {
        let run = createReportsRun(REPORTS);
        for (let i = 0; i < 6; i++) run = sealReport(run);
        expect(run.index).toBe(6);
        run = sealAll(readReport(run));
        expect(reportsVerdict(REPORTS, run)).toMatch(/nada raro/);
    });

    it('si se acaba el tiempo, el resto lo sella el supervisor con su firma', () => {
        const run = timeoutReports(sealReport(createReportsRun(REPORTS)));
        expect(run).toMatchObject({ done: true, sealed: 12, timedOut: true });
        expect(reportsVerdict(REPORTS, run)).toBe(REPORTS.timeout);
    });
});
