/**
 * Balance del paso 4 (primer turno jugable).
 * Simula a un jugador honesto que sólo usa lo que ve (lecturas de escaneo), con las
 * fórmulas y la configuración reales. Antes del ajuste ganaba ~5%: el nivel era imposible.
 */
import { describe, it, expect } from 'vitest';
import { analyzeSubjectProbability } from '../src/utils/scannerUtils.js';
import { calculateDecisionResult } from '../src/utils/gameplayUtils.js';
import { CONFIG } from '../src/data/gameConfig.js';
import { GENERATION_CONFIG } from '../src/data/entityConfig.js';
import { STEPS_CONFIG } from '../src/data/stepsConfig.js';
import { errorBudget } from '../src/systems/GameSequencer.js';
import { baseShiftHours, fatigueStartEnergy } from '../src/utils/pressureUtils.js';

// `pressure`: horas de turno acumuladas, urgencia (timeMultiplier), cerco (+cuota) y devueltos del paso.
function playTurn({ secondsPerSubject, extraScan, step = 4, pressure = false }) {
    const scans = CONFIG.SCANNER.TYPES;
    const meta = STEPS_CONFIG[step].meta || {};
    let energy = pressure ? fatigueStartEnergy(baseShiftHours(step)) : 100, stability = 100, errors = 0;
    const count = STEPS_CONFIG[step].subjectCount + (pressure ? (meta.siege?.grow || 0) : 0);
    const drain = CONFIG.ENERGY.TICK_DRAIN * (pressure ? (meta.timeMultiplier || 1) : 1);
    const returned = new Set(pressure ? (meta.cameos || []).filter(c => c.returned).map(c => c.pos) : []);
    const maxErrors = errorBudget(count);
    for (let i = 0; i < count; i++) {
        const subject = { isCorrupt: Math.random() < GENERATION_CONFIG.CORRUPTION_CHANCE, returned: returned.has(i + 1) };
        if (subject.returned) subject.isCorrupt = false;
        const readings = [analyzeSubjectProbability('BIOMETRIC', subject, 'NORMAL')];
        energy -= scans.BIOMETRIC.cost;
        // Un jugador atento pide siempre una segunda opinión (NEURAL, más fiable y más cara).
        if (extraScan) {
            readings.push(analyzeSubjectProbability('NEURAL', subject, 'NORMAL'));
            energy -= scans.NEURAL.cost;
        }
        const estimate = readings.reduce((a, b) => a + b, 0) / readings.length;
        const r = calculateDecisionResult(subject, estimate > 50 ? 'sacrifice' : 'authorize', CONFIG, { massAdmission: pressure && !!meta.massAdmission });
        energy = Math.min(100, energy + r.energyChange - secondsPerSubject * drain);
        stability = Math.min(100, stability + r.stabilityChange);
        if (r.isError) errors++;
        if (errors >= maxErrors || energy <= 0 || stability <= 0) return false;
    }
    return true;
}

const winRate = (opts, n = 4000) => {
    let w = 0;
    for (let i = 0; i < n; i++) if (playTurn(opts)) w++;
    return w / n;
};

describe('Balance · paso 4', () => {
    it('sólo con el escaneo obligatorio se gana con frecuencia razonable (≥ 55%)', () => {
        expect(winRate({ secondsPerSubject: 20, extraScan: false })).toBeGreaterThanOrEqual(0.55);
    });

    it('usar escaneos extra recompensa (≥ 75%) y mejora frente a no usarlos', () => {
        const base = winRate({ secondsPerSubject: 20, extraScan: false });
        const careful = winRate({ secondsPerSubject: 20, extraScan: true });
        expect(careful).toBeGreaterThanOrEqual(0.75);
        expect(careful).toBeGreaterThan(base);
    });

    it('un jugador lento (30 s/sujeto) no muere por energía', () => {
        expect(winRate({ secondsPerSubject: 30, extraScan: true })).toBeGreaterThanOrEqual(0.7);
    });

    it('la meta visible de técnicos es alcanzable (≥ 50% de turnos con 10 sujetos)', () => {
        const need = STEPS_CONFIG[4].meta.requiredTechnicians;
        let ok = 0;
        for (let i = 0; i < 4000; i++) {
            let t = 0;
            for (let j = 0; j < 10; j++) if (Math.random() < 0.25) t++;
            if (t >= need) ok++;
        }
        expect(ok / 4000).toBeGreaterThanOrEqual(0.5);
    });

    it('todos los turnos jugables finitos son ganables con juego atento (≥ 70%)', () => {
        const steps = Object.entries(STEPS_CONFIG).filter(([, c]) => c.type === 'gameplay' && Number.isFinite(c.subjectCount));
        for (const [id] of steps) {
            expect(winRate({ secondsPerSubject: 20, extraScan: true, step: Number(id) }), `paso ${id}`).toBeGreaterThanOrEqual(0.7);
        }
    });

    it('con horas de turno, urgencia, cerco y devueltos, cada turno sigue siendo ganable (≥ 70%)', () => {
        for (const step of [4, 6, 8, 10]) {
            // Agotado se lee más despacio: más segundos por sujeto desde el paso 10
            const seconds = baseShiftHours(step) >= CONFIG.FATIGUE.EXHAUSTED_AT ? 26 : 20;
            expect(winRate({ secondsPerSubject: seconds, extraScan: true, step, pressure: true }), `paso ${step}`).toBeGreaterThanOrEqual(0.7);
        }
    });
});
