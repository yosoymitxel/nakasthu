import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { executeScan } from '../src/systems/Scanner.js';
import { dialogueEngine } from '../src/systems/DialogueEngine.js';
import { gameLoop } from '../src/core/GameLoop.js';
import { gameSequencer } from '../src/systems/GameSequencer.js';
import { unrestMeter } from '../src/systems/UnrestMeter.js';

describe('New Mechanics Validations (new_mechanics.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        state.currentStep = 4; // Asegurar un paso con mecánicas de decisión
        gameSequencer.init();
        unrestMeter.activate(); // Forzar activación para tests
        state.gameStatus = 'PLAYING';
        state.currentEntity = {
            id: 'TEST-001',
            type: 'técnico',
            utility: 10,
            influence: 5,
            scannedData: {
                corruption: 20,
                corruptionHistory: []
            },
            isCorrupt: false,
            scanHistory: {},
            scannedTypes: ['BIOMETRIC']
        };
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('Mecánica de Escaneo Repetido: debe aplicar un coste extra del 50% acumulativo', async () => {
        const typeId = 'BIOMETRIC';
        
        // Primer escaneo (coste normal 0.5)
        // 100 - 0.5 = 99.5 -> Math.floor(99.5) = 99
        const scan1 = executeScan(typeId);
        vi.advanceTimersByTime(3000);
        await scan1;
        expect(state.energy).toBe(99);
        expect(state.currentEntity.scanHistory[typeId]).toBe(1);
        
        // Segundo escaneo (coste +50% = 0.75)
        // 99 - 0.75 = 98.25 -> Math.floor(98.25) = 98
        const scan2 = executeScan(typeId);
        vi.advanceTimersByTime(3000);
        await scan2;
        expect(state.energy).toBe(98); 
        expect(state.currentEntity.scanHistory[typeId]).toBe(2);
        
        // Tercer escaneo (coste +100% = 1.0)
        // 98 - 1.0 = 97
        const scan3 = executeScan(typeId);
        vi.advanceTimersByTime(3000);
        await scan3;
        expect(state.energy).toBe(97);
        expect(state.currentEntity.scanHistory[typeId]).toBe(3);
    });

    it('Sistema de Diálogo: la corrupción del NPC debe verse afectada por las opciones elegidas', () => {
        const initialCorruption = state.currentEntity.scannedData.corruption;
        dialogueEngine.currentDialogue = {
            id: 'test-d',
            text: 'Test',
            options: [{
                text: 'Test Option',
                energyCost: 5,
                corruptionImpact: 15
            }]
        };
        
        dialogueEngine.selectOption(0);
        
        expect(state.currentEntity.scannedData.corruption).toBe(initialCorruption + 15);
    });

    it('Sistema de Diálogo: debe manejar correctamente el ramificado (next)', () => {
        const nextOptions = [{ text: 'Branch Option 1' }];
        dialogueEngine.currentDialogue = {
            id: 'test-d',
            text: 'Initial',
            options: [{
                text: 'Initial Option',
                consequence: 'Next text',
                next: nextOptions
            }]
        };
        
        dialogueEngine.selectOption(0);
        
        expect(state.activeDialogue.text).toBe('Next text');
        expect(state.activeDialogue.options[0].text).toBe('Branch Option 1');
    });

    it('Fix de Drenaje Pregame: el bucle no debe drenar recursos si hay un modal abierto', () => {
        state.isModalOpen = true;
        const initialEnergy = state.energy;
        const initialStability = state.stability;
        
        // Ejecutamos varios ticks
        gameLoop.tick();
        gameLoop.tick();
        gameLoop.tick();
        
        expect(state.energy).toBe(initialEnergy);
        expect(state.stability).toBe(initialStability);
        
        // Si cerramos el modal, el drenaje debe reanudarse
        state.isModalOpen = false;
        gameLoop.tick();
        expect(state.energy).toBeLessThan(initialEnergy);
    });

    it('Prevención de Repetición de Diálogos: debe priorizar diálogos no usados', () => {
        dialogueEngine.dialogues = [
            { id: 'D1', minStep: 1, maxStep: 10, text: 'T1', options: [] },
            { id: 'D2', minStep: 1, maxStep: 10, text: 'T2', options: [] }
        ];
        state.usedDialogueIds = ['D1'];
        state.currentStep = 1;

        dialogueEngine.triggerRandomDialogue();
        
        expect(dialogueEngine.currentDialogue.id).toBe('D2');
        expect(state.usedDialogueIds).toContain('D2');
    });

    it('Prevención de Repetición de Diálogos: debe reiniciar el pool cuando todos han sido usados', () => {
        dialogueEngine.dialogues = [
            { id: 'D1', minStep: 1, maxStep: 10, text: 'T1', options: [] }
        ];
        state.usedDialogueIds = ['D1'];
        state.currentStep = 1;

        dialogueEngine.triggerRandomDialogue();
        
        expect(dialogueEngine.currentDialogue.id).toBe('D1');
    });

    it('Reinicio de Nivel Completo: debe limpiar variables de estado y errores de juicio', () => {
        state.utilidadOculta = 100;
        state.techniciansRecruited = 5;
        state.devotsRecruited = 3;
        state.influenceGathered = 50;
        state.judgmentErrors = 10;
        state.processedCount = 5;
        state.energy = 20;

        gameSequencer.resetLevel();

        expect(state.utilidadOculta).toBe(0);
        expect(state.techniciansRecruited).toBe(0);
        expect(state.judgmentErrors).toBe(0);
        expect(state.processedCount).toBe(0);
        expect(state.energy).toBe(100);
    });

    it('Targeting de Flashes: las acciones de sacrificio/autorización deben dirigirse a MOD04, resetear focusMode y cerrar diálogos', () => {
        const spy = vi.spyOn(bus, 'emit');
        state.focusMode = true;
        dialogueEngine.currentDialogue = { id: 'test' }; // Simular diálogo activo
        
        // Procesar un error (genera flash y cierra foco)
        state.currentEntity = { id: 'S1', isCorrupt: false, scannedTypes: ['BIOMETRIC'] };
        bus.emit('SACRIFICE_REQUEST');
        
        expect(spy).toHaveBeenCalledWith('TRIGGER_FLASH', expect.objectContaining({
            target: 'MOD04'
        }));
        expect(spy).toHaveBeenCalledWith('SESSION_TERMINATED');
        expect(state.focusMode).toBe(false);
        expect(dialogueEngine.currentDialogue).toBe(null);

        vi.clearAllMocks();
        state.focusMode = true;
        dialogueEngine.currentDialogue = { id: 'test2' };

        state.currentEntity = { id: 'S2', isCorrupt: true, scannedTypes: ['BIOMETRIC'] };
        bus.emit('AUTHORIZE_REQUEST');

        expect(spy).toHaveBeenCalledWith('TRIGGER_FLASH', expect.objectContaining({
            target: 'MOD04'
        }));
        expect(spy).toHaveBeenCalledWith('SESSION_TERMINATED');
        expect(state.focusMode).toBe(false);
        expect(dialogueEngine.currentDialogue).toBe(null);
    });

    it('GameOver por errores de juicio: debe dispararse al alcanzar el límite de 3 errores', () => {
        const spy = vi.spyOn(bus, 'emit');
        
        // Simular 3 errores de juicio
        state.currentEntity = { id: 'S1', isCorrupt: true, scannedTypes: ['BIOMETRIC'] };
        state.requiredScan = 'BIOMETRIC';
        bus.emit('AUTHORIZE_REQUEST'); // Error 1 (Autorizar corrupto)
        
        state.currentEntity = { id: 'S2', isCorrupt: false, scannedTypes: ['BIOMETRIC'] };
        bus.emit('SACRIFICE_REQUEST'); // Error 2 (Sacrificar inocente)
        
        state.currentEntity = { id: 'S3', isCorrupt: true, scannedTypes: ['BIOMETRIC'] };
        bus.emit('AUTHORIZE_REQUEST'); // Error 3 (Autorizar corrupto)
        
        expect(state.judgmentErrors).toBe(3);
        expect(state.gameStatus).toBe('GAME_OVER');
        expect(spy).toHaveBeenCalledWith('SYSTEM_FAILURE', expect.objectContaining({
            reason: 'EXCESSIVE_ERRORS'
        }));
    });

    it('Impacto en Agitación/Herejía: las decisiones erróneas deben afectar las métricas sociales', () => {
        const initialUnrest = state.unrest;
        
        // Sacrificar inocente (Aumenta agitación)
        state.currentEntity = { id: 'S1', isCorrupt: false, scannedTypes: ['BIOMETRIC'] };
        bus.emit('SACRIFICE_REQUEST');
        
        expect(state.unrest).toBeGreaterThan(initialUnrest);
        
        // Autorizar corrupto (Aumenta agitación aún más)
        const unrestAfterFirstError = state.unrest;
        state.currentEntity = { id: 'S2', isCorrupt: true, scannedTypes: ['BIOMETRIC'] };
        bus.emit('AUTHORIZE_REQUEST');
        
        expect(state.unrest).toBeGreaterThan(unrestAfterFirstError);
    });
});
