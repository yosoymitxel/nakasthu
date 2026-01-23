import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../src/core/State.js';
import { bus } from '../src/core/Bus.js';
import { processCommand } from '../src/systems/CommandEngine.js';

describe('CommandEngine Tests (command_engine.test.js)', () => {
    beforeEach(() => {
        state.resetState();
        state.gameStatus = 'PLAYING';
        state.energy = 100;
        state.stability = 100;
        state.unlockedCommands = ['HELP', 'CLEAR', 'STATUS'];
        // Reset duplicate protection
        processCommand('/reset-test-command-' + Math.random());
        vi.clearAllMocks();
    });

    describe('Comando /status', () => {
        it('debe retornar información del sistema', () => {
            state.energy = 50;
            state.stability = 75;

            const result = processCommand('/status');

            expect(result.text).toContain('E:50');
            expect(result.text).toContain('S:75');
        });

        it('debe marcar como CRITICAL si energía < 20', () => {
            state.energy = 15;

            const result = processCommand('/status');

            expect(result.type).toBe('CRITICAL');
        });

        it('debe incluir links de acción', () => {
            const result = processCommand('/status');

            expect(result.links).toBeDefined();
            expect(result.links.some(l => l.label === 'REPAIR')).toBe(true);
        });
    });

    describe('Comando /repair', () => {
        it('debe restaurar estabilidad y consumir energía', () => {
            state.energy = 50;
            state.stability = 60;

            const result = processCommand('/repair');

            expect(result.text).toContain('SUCCESS');
            expect(state.stability).toBe(70); // +10
            expect(state.energy).toBe(30); // -20
        });

        it('debe fallar si energía insuficiente', () => {
            state.energy = 15;

            const result = processCommand('/repair');

            expect(result.text).toContain('INSUFFICIENT ENERGY');
            expect(result.type).toBe('error');
        });
    });

    describe('Comando /scan', () => {
        it('debe mostrar uso si no hay argumento', () => {
            const result = processCommand('/scan');

            expect(result.text).toContain('USO:');
        });

        it('debe rechazar tipo de escaneo inválido', () => {
            const result = processCommand('/scan invalid');

            expect(result.text).toContain('NO RECONOCIDO');
            expect(result.type).toBe('error');
        });

        it('debe iniciar escaneo válido', () => {
            state.currentEntity = { id: 'TEST', scannedTypes: [], scanHistory: {} };

            const result = processCommand('/scan thermal');

            expect(result.text).toContain('INICIANDO');
        });

        it('debe rechazar si hay escaneo activo', () => {
            state.activeScan = { name: 'THERMAL', progress: 50 };

            const result = processCommand('/scan biometric');

            expect(result.text).toContain('EN CURSO');
            expect(result.type).toBe('error');
        });
    });

    describe('Comando /help', () => {
        it('debe mostrar comandos disponibles', () => {
            const result = processCommand('/help');

            expect(result.text).toContain('COMANDOS AUTORIZADOS');
            expect(result.links).toBeDefined();
            expect(result.links.length).toBeGreaterThan(0);
        });
    });

    describe('Comandos bloqueados por permisos', () => {
        it('/logs debe requerir permiso LOGS', () => {
            const result = processCommand('/logs');
            expect(result.text).toContain('ACCESO DENEGADO');
        });

        it('/logs debe funcionar con permiso', () => {
            state.unlockedCommands = [...state.unlockedCommands, 'LOGS'];
            const result = processCommand('/logs');
            expect(result.text).toContain('ARCHIVO');
        });

        it('/zh-archive debe requerir permiso', () => {
            const result = processCommand('/zh-archive');
            expect(result.text).toContain('ACCESO DENEGADO');
        });

        it('/kamin-intel debe requerir permiso', () => {
            const result = processCommand('/kamin-intel');
            expect(result.text).toContain('ACCESO DENEGADO');
        });
    });

    describe('Protección contra comandos duplicados', () => {
        it('debe bloquear comandos repetidos consecutivos', () => {
            processCommand('/status');
            const result = processCommand('/status');

            expect(result).toContain('REPETIDO');
        });

        it('debe permitir comandos diferentes consecutivos', () => {
            processCommand('/status');
            const result = processCommand('/help');

            expect(result.text).not.toContain('REPETIDO');
        });
    });

    describe('Comandos no reconocidos', () => {
        it('debe retornar error para comandos desconocidos', () => {
            const result = processCommand('/unknowncommand');

            expect(result.text).toContain('NO RECONOCIDO');
            expect(result.type).toBe('error');
        });
    });
});
