/**
 * GAMEPLAYUTILS.JS
 * Lógica de gameplay pura para puntuaciones, recomendaciones y metas.
 */
import { state } from '../core/State.js';
import { CONFIG } from '../data/gameConfig.js';

/**
 * Calcula la recomendación del sistema para el Juicio Final basada en reclutamiento.
 */
export const calculateJudgmentRecommendation = () => {
    const techScore = (state.techniciansRecruited / (CONFIG.JUDGMENT?.MAX_TECH || 10)) * 100;
    const faithScore = (state.devotsRecruited / (CONFIG.JUDGMENT?.MAX_FAITH || 10)) * 100;

    const weightedTech = techScore * (CONFIG.JUDGMENT?.WEIGHT_TECH || 0.6);
    const weightedFaith = faithScore * (CONFIG.JUDGMENT?.WEIGHT_FAITH || 0.4);

    return {
        techPercentage: Math.min(100, Math.round(techScore)),
        faithPercentage: Math.min(100, Math.round(faithScore)),
        recommendation: weightedTech >= weightedFaith ? 'ESTABILIZAR' : 'TRASCENDER',
        dominant: weightedTech >= weightedFaith ? 'orden' : 'caos'
    };
};

/**
 * Verifica si se cumplen las metas ocultas de un paso narrativo.
 */
export const checkStepMeta = (stepMeta) => {
    if (!stepMeta) return { success: true, messages: [] };

    const results = { success: true, messages: [] };

    // Verificar técnicos requeridos
    if (stepMeta.requiredTechnicians) {
        if (state.techniciansRecruited < stepMeta.requiredTechnicians) {
            results.success = false;
            results.messages.push(`Técnicos insuficientes: ${state.techniciansRecruited}/${stepMeta.requiredTechnicians}`);
        }
    }

    // Verificar influencia requerida
    if (stepMeta.requiredInfluence) {
        if (state.influenceGathered < stepMeta.requiredInfluence) {
            results.success = false;
            results.messages.push('Influencia insuficiente. Sabotaje inminente.');
        }
    }

    return results;
};

/**
 * Calcula el resultado de una decisión (Autorizar/Sacrificar).
 * Regla: Centralización de lógica de consecuencias.
 */
export const calculateDecisionResult = (subject, action, config) => {
    const result = {
        energyChange: 0,
        stabilityChange: 0,
        unrestChange: 0,
        isError: false,
        flash: null
    };

    if (action === 'authorize') {
        if (subject.isCorrupt) {
            result.stabilityChange = -config.STABILITY.AUTHORIZE_CORRUPT_PENALTY;
            result.unrestChange = config.UNREST.AUTHORIZE_CORRUPT_INCREASE;
            result.isError = true;
            result.flash = { target: 'MOD04', intensity: 'heavy', color: 'red' };
        } else {
            result.energyChange = -config.ENERGY.AUTHORIZE_COST;
            result.stabilityChange = 20; // Bonus base
            result.unrestChange = -config.UNREST.AUTHORIZE_INOCENT_DECREASE;
        }
    } else if (action === 'sacrifice') {
        if (subject.isCorrupt) {
            result.energyChange = config.ENERGY.SACRIFICE_CORRUPT_BONUS;
            result.stabilityChange = 15; // Bonus base
        } else {
            result.energyChange = config.ENERGY.SACRIFICE_INOCENT_BONUS;
            result.stabilityChange = -config.STABILITY.SACRIFICE_INOCENT_PENALTY;
            result.unrestChange = config.UNREST.SACRIFICE_INOCENT_INCREASE;
            result.isError = true;
            result.flash = { target: 'MOD04', intensity: 'medium', color: 'orange' };
        }
    }

    return result;
};

/**
 * Calcula el cambio de estabilidad basado en la sincronía.
 */
export const calculateSyncStabilityEffect = (sync, config) => {
    if (sync < config.RESONANCE.LOW_SYNC) {
        return -config.STABILITY.RESONANCE_LOW_PENALTY;
    } else if (sync > config.RESONANCE.CRITICAL_SYNC) {
        return config.STABILITY.RESONANCE_HIGH_BONUS;
    }
    return 0;
};
