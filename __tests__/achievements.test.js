import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { state } from '../src/core/State.js';
import { achievements } from '../src/systems/Achievements.js';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from '../src/data/achievements.js';

const decide = (action = 'authorize', subject = { id: 'XEN-1' }) => bus.emit('DECISION_MADE', { subject, action });

describe('Achievements Tests (achievements.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        achievements.reset();
    });

    it('cada logro tiene grupo válido, nombre y descripción, sin ids repetidos', () => {
        const groups = ACHIEVEMENT_GROUPS.map(g => g.id);
        const ids = ACHIEVEMENTS.map(a => a.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const a of ACHIEVEMENTS) {
            expect(groups).toContain(a.group);
            expect(a.name && a.desc).toBeTruthy();
        }
    });

    it('otorga una sola vez y avisa por el Bus', () => {
        const spy = vi.fn();
        bus.on('ACHIEVEMENT_UNLOCKED', spy);
        bus.emit('SCAN_COMPLETED', {});
        bus.emit('SCAN_COMPLETED', {});
        bus.off('ACHIEVEMENT_UNLOCKED', spy);
        expect(achievements.has('primer_escaneo')).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('cuenta sujetos procesados hasta el objetivo', () => {
        for (let i = 0; i < 24; i++) decide();
        expect(achievements.has('rutina')).toBe(false);
        decide();
        expect(achievements.has('rutina')).toBe(true);
    });

    it('un error corta la racha de ojo clínico', () => {
        for (let i = 0; i < 7; i++) decide();
        state.judgmentErrors = 1;
        decide();
        expect(achievements.has('ojo_clinico')).toBe(false);
        for (let i = 0; i < 8; i++) decide();
        expect(achievements.has('ojo_clinico')).toBe(true);
    });

    it('turno limpio exige cero errores y sin preguntas exige no interrogar', () => {
        bus.emit('DIALOGUE_STARTED', {});
        state.judgmentErrors = 1;
        bus.emit('QUOTA_MET', {});
        expect(achievements.has('turno_limpio')).toBe(false);
        expect(achievements.has('sin_preguntas')).toBe(false);

        bus.emit('STEP_CHANGE', {});
        state.judgmentErrors = 0;
        bus.emit('QUOTA_MET', {});
        expect(achievements.has('turno_limpio')).toBe(true);
        expect(achievements.has('sin_preguntas')).toBe(true);
    });

    it('el secreto de Kamin solo sale al autorizarlo', () => {
        decide('sacrifice', { id: 'KAMIN' });
        expect(achievements.has('mensajero')).toBe(false);
        decide('authorize', { id: 'KAMIN' });
        expect(achievements.has('mensajero')).toBe(true);
    });

    it('los registros del archivo no cuentan repetidos', () => {
        for (let i = 0; i < 12; i++) bus.emit('LORE_UNLOCKED', 'LORE_A');
        expect(achievements.has('archivista')).toBe(false);
        for (let i = 0; i < 10; i++) bus.emit('LORE_UNLOCKED', `LORE_${i}`);
        expect(achievements.has('archivista')).toBe(true);
    });
});
