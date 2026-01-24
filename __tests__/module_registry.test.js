import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bus } from '../src/core/Bus.js';
import { moduleRegistry, MODULES, localizeTutorialText } from '../src/systems/ModuleRegistry.js';

describe('ModuleRegistry Tests (module_registry.test.js)', () => {
    beforeEach(() => {
        moduleRegistry.activeModules = new Set();
        vi.clearAllMocks();
    });

    it('debe iniciar sin módulos activos', () => {
        expect(moduleRegistry.activeModules.size).toBe(0);
    });

    it('debe desbloquear ANALYTICS al avanzar al paso 4', () => {
        const spy = vi.spyOn(bus, 'emit');

        // Simular evento del secuenciador
        moduleRegistry.checkUnlocks(4);

        expect(moduleRegistry.isModuleActive('MOD_ANALYTICS')).toBe(true);
        expect(spy).toHaveBeenCalledWith('MODULE_UNLOCKED', expect.objectContaining({
            id: 'MOD_ANALYTICS'
        }));
    });

    it('debe desbloquear múltiples módulos si el paso es avanzado', () => {
        moduleRegistry.checkUnlocks(5);

        expect(moduleRegistry.isModuleActive('MOD_ANALYTICS')).toBe(true);
        expect(moduleRegistry.isModuleActive('MOD_BIOSCAN')).toBe(true); // Unlock at 4
        expect(moduleRegistry.isModuleActive('MOD_RESONANCE')).toBe(true);
        expect(moduleRegistry.isModuleActive('MOD_OPERATIONS')).toBe(true);
    });

    it('no debe desbloquear módulos en paso 3 (Cinemática)', () => {
        moduleRegistry.checkUnlocks(3);

        // Ninguno debe estar activo en paso 3
        expect(moduleRegistry.isModuleActive('MOD_ANALYTICS')).toBe(false);
        expect(moduleRegistry.isModuleActive('MOD_BIOSCAN')).toBe(false);
        expect(moduleRegistry.isModuleActive('MOD_RESONANCE')).toBe(false);
    });

    it('debe emitir mensaje de terminal al desbloquear', () => {
        const spy = vi.spyOn(bus, 'emit');

        moduleRegistry.unlockModule(MODULES.BIOSCAN);

        expect(spy).toHaveBeenCalledWith('TERMINAL_PRINT', expect.objectContaining({
            type: 'SUCCESS'
        }));
    });

    it('forceUnlock debe activar el módulo manualmente', () => {
        moduleRegistry.forceUnlock('MOD_PORTAL');

        expect(moduleRegistry.isModuleActive('MOD_PORTAL')).toBe(true);
    });

    it('localizeTutorialText debe reemplazar tokens [[MOD-XX]] correctamente', () => {
        const text = "Localice el [[MOD-01]] a su izquierda.";
        
        // Ruta Técnica (storyPath: 0)
        const techText = localizeTutorialText(text, 0);
        expect(techText).toBe("Localice el [Escáner Biométrico] a su izquierda.");
        
        // Ruta Sectaria (storyPath: 1)
        const sectText = localizeTutorialText(text, 1);
        expect(sectText).toBe("Localice el [Altar de Examen] a su izquierda.");
    });
});
