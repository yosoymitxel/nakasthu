/**
 * VALIDATIONUTILS.JS
 * Validaciones de estado y comandos para el sistema NAKASTHU.
 */
import { state } from '../core/State.js';

/**
 * Verifica si el sistema está en un estado crítico
 */
export const isSystemCritical = () => {
    return state.energy < 20 || state.stability < 20 || state.oxygen < 20;
};

/**
 * Valida si una acción es permitida en el estado actual
 */
export const canPerformAction = (actionId) => {
    if (state.gameStatus !== 'PLAYING') return false;
    if (state.isPaused || state.isModalOpen) return false;
    
    // Acciones específicas pueden tener requisitos adicionales
    switch(actionId) {
        case 'AUTHORIZE':
        case 'SACRIFICE':
            return !!state.currentEntity;
        case 'SCAN':
            return state.energy > 5;
        default:
            return true;
    }
};

/**
 * Valida la integridad de una entidad
 */
export const isValidEntity = (entity) => {
    return entity && typeof entity.id === 'string' && typeof entity.isCorrupt === 'boolean';
};
