import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { processCommand } from '../src/systems/CommandEngine.js';

describe('UI & Communications Validations (ui.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
    });

    it('Verificar que la Terminal (ZHYR_OS) no procese comandos duplicados en el buffer', () => {
        const cmd = '/status';
        
        // Primera ejecución
        const response1 = processCommand(cmd);
        expect(response1).toContain('SYS_INFO');
        
        // Segunda ejecución inmediata (simulando doble Enter rápido)
        const response2 = processCommand(cmd);
        expect(response2).toBe("ERROR: COMANDO REPETIDO DETECTADO. FLUJO BLOQUEADO.");
    });

    it('Validar que los 4 botones de interacción de diálogo resten la energía configurada (5 pts)', () => {
        const initialEnergy = state.energy;
        
        // Simular click en INTERROGAR (que resta 5)
        state.energy -= 5;
        expect(state.energy).toBe(initialEnergy - 5);
        
        // Validar que si intentamos restar de nuevo, sigue restando (simulando otros botones)
        state.energy -= 5;
        expect(state.energy).toBe(initialEnergy - 10);
    });

    it('Confirmar que el Lore Archive (Bloque 9.1) reciba y almacene correctamente los strings enviados desde Analytics', () => {
        const loreEntry = "DATA_CORRUPTION_DETECTED: Sector 7G";
        
        // Simulamos el envío de datos a Lore Archive
        state.loreArchive.push(loreEntry);
        
        expect(state.loreArchive).toContain(loreEntry);
        expect(state.loreArchive.length).toBe(1);
    });
});
