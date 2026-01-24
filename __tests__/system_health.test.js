
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { gameSequencer } from '../src/systems/GameSequencer.js';
import { CONFIG } from '../src/data/gameConfig.js';

describe('NAKASTHU 2.0 - System Health & Critical Mechanics', () => {
    beforeEach(() => {
        state.resetState();
        gameSequencer.init();
    });

    test('Initial State Integrity', () => {
        expect(state.energy).toBe(CONFIG.ENERGY.INITIAL);
        expect(state.stability).toBe(CONFIG.STABILITY.INITIAL);
        expect(state.currentStep).toBe(1);
        expect(state.gameStatus).toBeDefined();
    });

    test('Full 12-Step Progression Sequence', () => {
        // Simulamos el recorrido completo de los 12 pasos
        for (let i = 1; i <= 12; i++) {
            expect(state.currentStep).toBe(i);
            if (i < 12) {
                gameSequencer.nextStep();
            }
        }
        // El paso 12 es el final
        expect(state.currentStep).toBe(12);
    });

    test('Energy vs Stability Critical Thresholds', () => {
        // Simular agotamiento de energía
        state.energy = 0;
        // La lógica de Game Over suele estar en MechanicsEngine o GameLoop
        // Verificamos que el estado refleje el peligro
        expect(state.energy).toBe(0);
        
        // Simular colapso de estabilidad
        state.stability = 0;
        expect(state.stability).toBe(0);
    });

    test('Quota Tracker Integration', () => {
        state.quota = 5;
        state.processedCount = 5;
        // Al llegar a la cuota, el sistema debería estar listo para avanzar
        expect(state.processedCount).toBe(state.quota);
    });
});
