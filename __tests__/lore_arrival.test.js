/**
 * Un diálogo que cambia la identidad del sujeto (npcTraits) se elige al llegar el sujeto:
 * el personaje entra ya con su cara y al interrogarlo no se transforma delante del jugador.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { dialogueEngine } from '../src/systems/DialogueEngine.js';

describe('personajes de lore al llegar', () => {
    beforeAll(async () => {
        for (let i = 0; i < 50 && dialogueEngine.dialogues.length === 0; i++) await new Promise(r => setTimeout(r, 20));
    });

    it('interrogar no cambia la identidad ni vuelve a anunciar el sujeto', () => {
        let lore = 0;
        for (const step of [4, 6, 8, 10]) {
            state.currentStep = step;
            for (let i = 0; i < 25; i++) {
                state.processedCount = 0;
                state.nextSubject();
                const before = state.currentEntity.id;
                if (state.currentEntity.isLoreCore) lore++;
                let announced = 0;
                const onNew = () => announced++;
                bus.on('NEW_SUBJECT_DETECTED', onNew);
                dialogueEngine.triggerRandomDialogue();
                bus.off('NEW_SUBJECT_DETECTED', onNew);
                expect(state.currentEntity.id).toBe(before);
                expect(announced).toBe(0);
                dialogueEngine.closeDialogue();
            }
        }
        expect(lore).toBeGreaterThan(0);
    });
});
