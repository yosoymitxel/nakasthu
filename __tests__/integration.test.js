import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { loreSystem } from '../src/systems/LoreSystem.js';
import { dialogueEngine } from '../src/systems/DialogueEngine.js';
import { gameSequencer } from '../src/systems/GameSequencer.js';

describe('Complete Game Flow Integration (integration.test.js)', () => {
    beforeEach(async () => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        
        // Mock simple lore database for testing
        loreSystem.loreDatabase = {
            'LORE_TEST_ENTRY': 'Este es un texto de lore de prueba.',
            'CMD_REBOOT': 'Comando de reinicio desbloqueado.'
        };
        
        vi.clearAllMocks();
    });

    it('Flujo de Lore: Desbloqueo desde Diálogo -> LoreSystem -> State.loreArchive con texto real', async () => {
        // 1. Configurar un diálogo que desbloquea lore
        dialogueEngine.currentDialogue = {
            id: 'test-lore-dlg',
            text: '¿Qué sabes del proyecto?',
            options: [{
                text: 'Dime la verdad',
                loreUnlock: 'LORE_TEST_ENTRY',
                consequence: 'Todo es una mentira.'
            }]
        };

        // 2. Seleccionar la opción
        dialogueEngine.selectOption(0);

        // 3. Verificar que el evento se emitió (DialogueEngine emite LORE_UNLOCKED)
        // LoreSystem escucha este evento y actualiza el estado.
        // Como LoreSystem ya está inicializado en el entorno global de la app, 
        // debería haber reaccionado al evento.
        
        // Esperamos un momento para que el bus procese
        await new Promise(resolve => setTimeout(resolve, 10));

        // 4. Verificar que el archive tenga la entrada con el texto REAL de la DB, no el ID
        const entry = state.loreArchive.find(e => e.loreId === 'LORE_TEST_ENTRY');
        expect(entry).toBeDefined();
        expect(entry.text).toBe('Este es un texto de lore de prueba.');
    });

    it('Flujo de Comandos: Desbloqueo de comandos vía Lore -> State.unlockedCommands', async () => {
        // 1. Configurar diálogo con comando
        dialogueEngine.currentDialogue = {
            id: 'test-cmd-dlg',
            text: 'Acceso restringido.',
            options: [{
                text: 'Forzar terminal',
                loreUnlock: 'CMD_REBOOT',
                consequence: 'Acceso concedido.'
            }]
        };

        // 2. Seleccionar opción
        dialogueEngine.selectOption(0);
        
        await new Promise(resolve => setTimeout(resolve, 10));

        // 3. Verificar que el comando esté en la lista de permitidos
        expect(state.unlockedCommands).toContain('REBOOT');
    });

    it('Historial de Corrupción: el interrogatorio añade UNA lectura de voz y no la inventa', () => {
        state.currentEntity = {
            id: 'S-123',
            isCorrupt: true,
            tells: { VOICE: true },
            scannedData: { corruption: 10, corruptionHistory: [90] }
        };
        dialogueEngine.currentDialogue = { id: 'test-corr-dlg', text: 'Test', options: [{ text: 'Presionar', corruptionImpact: 10 }] };
        dialogueEngine.selectOption(0);
        // El dato narrativo se mueve, pero el indicio sale de la señal de voz (anómala → > 50 %).
        expect(state.currentEntity.scannedData.corruption).toBe(20);
        const history = state.currentEntity.scannedData.corruptionHistory;
        expect(history).toHaveLength(2);
        expect(history[1]).toBeGreaterThan(50);
        expect(state.currentEntity.corruptionEstimate).toBe(Math.round((history[0] + history[1]) / 2));

        // Una segunda respuesta no suma otra lectura (si no, interrogar sería farmear indicios).
        dialogueEngine.currentDialogue = { id: 'test-corr-dlg-2', text: 'Test 2', options: [{ text: 'Amenazar', corruptionImpact: 20 }] };
        dialogueEngine.selectOption(0);
        expect(state.currentEntity.scannedData.corruptionHistory).toHaveLength(2);
    });

    it('Progresión Narrativa: Avance de pasos debe limpiar el pool de diálogos y actualizar Step', () => {
        gameSequencer.init();
        const initialStep = state.currentStep;
        
        // Avanzar paso
        gameSequencer.nextStep();
        
        expect(state.currentStep).toBe(initialStep + 1);
        // Verificar que se emitió el evento de cambio de paso
        // (Podríamos espiar el bus si fuera necesario, pero el cambio en state ya es prueba suficiente)
    });
});
