/**
 * MODULEREGISTRY.JS
 * Sistema centralizado de gestión de módulos y desbloqueos progresivos.
 * Regla 2.A: Vanilla JS, Event Bus.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

export const MODULES = {
    BIOSCAN: {
        id: 'MOD-01',
        name: 'Escáner Biométrico',
        sectarianName: 'Altar de Examen',
        unlockStep: 4,
        tutorial: 'TUTO_BIOSCAN',
        description: 'Detección de firmas térmicas y biológicas.'
    },
    ANALYTICS: {
        id: 'MOD-02',
        name: 'Motor Analítico',
        sectarianName: 'Emanaciones del Alma',
        unlockStep: 4,
        tutorial: 'TUTO_ANALYTICS',
        description: 'Análisis de coherencia neural y patrones de Zhyr.'
    },
    LORE_ARCHIVE: {
        id: 'MOD-03',
        name: 'Archivo de Datos',
        sectarianName: 'Crónicas de la Nakara',
        unlockStep: 1,
        tutorial: 'TUTO_LORE',
        description: 'Acceso a registros históricos y fragmentos de memoria.'
    },
    OPERATIONS: {
        id: 'MOD-04',
        name: 'Consola de Mando',
        sectarianName: 'Altar de Consagración',
        unlockStep: 4,
        tutorial: 'TUTO_OPERATIONS',
        description: 'Gestión de sujetos y ejecución de sentencias.'
    },
    COMMS: {
        id: 'MOD-05',
        name: 'Enlace de Comunicaciones',
        sectarianName: 'Canal de Plegarias',
        unlockStep: 4,
        tutorial: 'TUTO_OPERATIONS', // Compartido con Operations
        description: 'Interfaz de diálogo y recepción de transmisiones.'
    },
    RESONANCE: {
        id: 'MOD-06',
        name: 'Consola de Emergencia',
        sectarianName: 'Altar de Penitencia',
        unlockStep: 4,
        tutorial: 'TUTO_RESONANCE',
        description: 'Interfaz tri-modular de respuesta ante fallos críticos.'
    },
    QUOTA_TRACKER: {
        id: 'MOD-07',
        name: 'Gestor de Cuotas',
        sectarianName: 'Cosecha de Almas',
        unlockStep: 1,
        tutorial: 'TUTO_QUOTA',
        description: 'Monitoreo de objetivos de procesamiento.'
    },
    FACTION_SYSTEM: {
        id: 'MOD-08',
        name: 'Sistema de Facciones',
        sectarianName: 'Panel de Comunión',
        unlockStep: 7, // Sincronizado con el inicio de la ruta sectaria
        requiredPath: 1, // Solo disponible en la ruta sectaria
        tutorial: 'TUTO_FACTION',
        description: 'Estado de las alianzas y dominio ideológico.'
    },
    TERMINAL: {
        id: 'MOD-09',
        name: 'Terminal de Comandos',
        sectarianName: 'Susurros del Vacío',
        unlockStep: 1,
        tutorial: 'TUTO_TERMINAL',
        description: 'Intervención directa vía consola ZHYR_OS.'
    },
    UNREST_METER: {
        id: 'MOD-10',
        name: 'Medidor de Disturbios',
        sectarianName: 'Efervescencia Profana',
        unlockStep: 5,
        tutorial: 'TUTO_UNREST',
        description: 'Monitoreo de estabilidad social en sectores.'
    },
    PORTAL_MONITOR: {
        id: 'MOD-11',
        name: 'Monitor de Flujo',
        sectarianName: 'Velo Dimensional',
        unlockStep: 11,
        tutorial: 'TUTO_PORTAL',
        description: 'Televigilancia de la estabilidad dimensional.'
    }
};

export const getModuleName = (moduleId, storyPath) => {
    const module = typeof moduleId === 'string' ? Object.values(MODULES).find(m => m.id === moduleId) : moduleId;
    if (!module) return 'Unknown Module';

    return storyPath === 1 ? (module.sectarianName || module.name) : module.name;
};

/**
 * Reemplaza los tokens [[MOD-XX]] en un texto por el nombre localizado del módulo.
 */
export const localizeTutorialText = (text, storyPath) => {
    if (!text) return '';
    
    return text.replace(/\[\[(MOD-\d+)\]\]/g, (match, p1) => {
        const name = getModuleName(p1, storyPath);
        return name !== 'Unknown Module' ? `[${name}]` : match;
    });
};

class ModuleRegistry {
    constructor() {
        this.activeModules = new Set();
        this.init();
    }

    init() {
        // Escuchar cambios de paso para desbloquear módulos
        bus.on('STATE_CHANGE:step', (step) => {
            this.checkUnlocks(step);
        });

        // También re-verificar al cambiar de acto/ruta
        bus.on('ACT_CHANGE', () => {
            this.checkUnlocks(state.currentStep);
        });

        // Comando de depuración
        if (typeof window !== 'undefined') {
            window.__NAKASTHU_MODULES__ = this;
        }
    }

    checkUnlocks(currentStep) {
        const storyPath = state.storyPath || 0;
        
        Object.values(MODULES).forEach(module => {
            // Verificar si cumple el paso de desbloqueo
            const stepMet = currentStep >= module.unlockStep;
            
            // Verificar si cumple el requisito de ruta (si existe)
            const pathMet = module.requiredPath === undefined || module.requiredPath === storyPath;

            if (stepMet && pathMet && !this.activeModules.has(module.id)) {
                this.unlockModule(module);
            }
        });
    }

    unlockModule(module) {
        this.activeModules.add(module.id);
        const displayName = getModuleName(module, state.storyPath);

        console.log(`%c[SYSTEM] Módulo Desbloqueado: ${displayName}`, "color: #00ff00; font-weight: bold;");

        bus.emit('MODULE_UNLOCKED', {
            id: module.id,
            name: displayName,
            tutorialId: module.tutorial
        });

        bus.emit('TERMINAL_PRINT', {
            text: `[SYSTEM] NEW MODULE ONLINE: ${displayName}`,
            type: 'SUCCESS'
        });
    }

    isModuleActive(moduleId) {
        if (!this.activeModules.has(moduleId)) return false;

        // Verificar si el módulo sigue cumpliendo requisitos de ruta
        const module = Object.values(MODULES).find(m => m.id === moduleId);
        if (module && module.requiredPath !== undefined) {
            return module.requiredPath === (state.storyPath || 0);
        }

        return true;
    }

    // Método para forzar desbloqueo (Debug/Dev)
    forceUnlock(moduleId) {
        const module = Object.values(MODULES).find(m => m.id === moduleId);
        if (module) {
            this.unlockModule(module);
        }
    }
}

export const moduleRegistry = new ModuleRegistry();
