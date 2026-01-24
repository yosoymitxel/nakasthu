/**
 * MODULEREGISTRY.JS
 * Sistema centralizado de gestión de módulos y desbloqueos progresivos.
 * Regla 2.A: Vanilla JS, Event Bus.
 */
import { bus } from '../core/Bus.js';
import { state } from '../core/State.js';

export const MODULES = {
    BIOSCAN: {
        id: 'MOD_BIOSCAN',
        name: 'Escáner Biométrico',
        unlockStep: 4, // Changed from 2 to 4 to match Gameplay phase
        tutorial: 'TUTO_BIOSCAN',
        description: 'Análisis primario de firmas térmicas y biológicas.'
    },
    ANALYTICS: {
        id: 'MOD_ANALYTICS',
        name: 'Motor Analítico',
        unlockStep: 4, // Moved to 4 (Gameplay)
        tutorial: 'TUTO_ANALYTICS',
        description: 'Procesamiento de datos y detección de anomalías.'
    },
    RESONANCE: {
        id: 'MOD_RESONANCE',
        name: 'Sincronizador Neural',
        unlockStep: 4, // Aligned with Gameplay
        tutorial: 'TUTO_RESONANCE',
        description: 'Alineación de frecuencias para enlace estable.'
    },
    OPERATIONS: {
        id: 'MOD_OPERATIONS',
        name: 'Consola de Mando',
        unlockStep: 4, // Critical for Step 4 gameplay
        tutorial: 'TUTO_OPERATIONS',
        description: 'Autorización y sacrificio de sujetos procesados.'
    },
    LORE_ARCHIVE: {
        id: 'MOD_LORE',
        name: 'Archivo Histórico',
        unlockStep: 6,
        tutorial: 'TUTO_LORE',
        description: 'Base de datos recuperada de la memoria de Zhyr.'
    },
    // Nuevos módulos planificados
    QUOTA_TRACKER: {
        id: 'MOD_QUOTA',
        name: 'Gestor de Cuotas',
        unlockStep: 4, // Aligned with Step 4
        tutorial: 'TUTO_QUOTA',
        description: 'Seguimiento de objetivos de producción.'
    },
    RITUAL_ENGINE: {
        id: 'MOD_RITUAL',
        name: 'Altar de Sacrificio',
        unlockStep: 9,
        tutorial: 'TUTO_RITUAL',
        description: 'Protocolos de purificación y ofrenda.'
    },
    UNREST_METER: {
        id: 'MOD_UNREST',
        name: 'Medidor de Disturbios',
        unlockStep: 5,
        tutorial: 'TUTO_UNREST',
        description: 'Monitoreo de estabilidad social en sectores.'
    },
    FACTION_SYSTEM: {
        id: 'MOD_FACTION',
        name: 'Rastreador Ideológico',
        unlockStep: 7,
        tutorial: 'TUTO_FACTION',
        description: 'Análisis de alineamiento: ORDEN vs CAOS.'
    },
    PORTAL_MONITOR: {
        id: 'MOD_PORTAL',
        name: 'Monitor de Flujo',
        unlockStep: 11,
        tutorial: 'TUTO_PORTAL',
        description: 'Televigilancia de la estabilidad dimensional.'
    }
};

export const getModuleName = (moduleId, storyPath) => {
    const module = typeof moduleId === 'string' ? Object.values(MODULES).find(m => m.id === moduleId) : moduleId;
    if (!module) return 'Unknown Module';

    if (storyPath === 1) {
        const sectarianNames = {
            'MOD_BIOSCAN': 'Altar de Examen',
            'MOD_ANALYTICS': 'Emanaciones del Alma',
            'MOD_OPERATIONS': 'Altar de Consagración',
            'MOD_QUOTA': 'Cosecha de Adeptos',
            'MOD_UNREST': 'Monitor de Agitación',
            'MOD_FACTION': 'Panel de Comunión',
            'MOD_PORTAL': 'Velo Dimensional',
            'MOD_RESONANCE': 'Sincronía de Fe',
            'MOD_LORE': 'Crónicas de la Nakara',
            'MOD_RITUAL': 'Cámara de Purificación'
        };
        return sectarianNames[module.id] || module.name;
    }
    return module.name;
};

/**
 * Reemplaza los tokens [[MOD-XX]] en un texto por el nombre localizado del módulo.
 */
export const localizeTutorialText = (text, storyPath) => {
    if (!text) return '';
    
    // Mapeo de MOD-XX a IDs internos
    const tokenMap = {
        'MOD-01': 'MOD_BIOSCAN',
        'MOD-02': 'MOD_ANALYTICS',
        'MOD-03': 'MOD_CORE_STATUS', // Asumiendo este ID
        'MOD-04': 'MOD_OPERATIONS',
        'MOD-05': 'MOD_RESONANCE',
        'MOD-06': 'MOD_RESONANCE', // A veces se usa 06 para resonancia
        'MOD-07': 'MOD_QUOTA',
        'MOD-08': 'MOD_UNREST'
    };

    return text.replace(/\[\[MOD-(\d+)\]\]/g, (match, p1) => {
        const tokenId = `MOD-${p1}`;
        const moduleId = tokenMap[tokenId];
        if (moduleId) {
            return `[${getModuleName(moduleId, storyPath)}]`;
        }
        return match;
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

        // Comando de depuración
        if (typeof window !== 'undefined') {
            window.__NAKASTHU_MODULES__ = this;
        }
    }

    checkUnlocks(currentStep) {
        Object.values(MODULES).forEach(module => {
            if (currentStep >= module.unlockStep && !this.activeModules.has(module.id)) {
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
        return this.activeModules.has(moduleId);
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
