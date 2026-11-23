/**
 * GAMEPLAYUTILS.JS
 * Lógica de gameplay pura para puntuaciones, recomendaciones y metas.
 */
import { state } from '../core/State.js';
import { factionSystem } from '../systems/FactionSystem.js';
import { CONFIG } from '../data/gameConfig.js';
import { STEPS_CONFIG } from '../data/stepsConfig.js';
import { narrativeFlags } from '../systems/NarrativeFlags.js';

// Los ecos del paso 11 son el mapa marca → lado: cada eco cumplido inclina la balanza hacia su opción.
const matchedEchoes = (opt) => (opt?.echoes || []).filter(e => narrativeFlags.matches(e.if)).length;

/**
 * Calcula la recomendación del sistema para el Juicio Final: facción acumulada + marcas de diálogo.
 */
export const calculateJudgmentRecommendation = () => {
    // Los contadores de reclutas se reinician en cada paso; la facción acumula toda la partida
    const { leftOption, rightOption } = STEPS_CONFIG[11]?.meta || {};
    const echoPoints = CONFIG.JUDGMENT?.ECHO_POINTS ?? 0;
    const techBonus = matchedEchoes(leftOption) * echoPoints;
    const faithBonus = matchedEchoes(rightOption) * echoPoints;

    const techBase = (factionSystem.alignments.ORDEN / (CONFIG.JUDGMENT?.MAX_TECH || 10)) * 100;
    const faithBase = (factionSystem.alignments.CAOS / (CONFIG.JUDGMENT?.MAX_FAITH || 10)) * 100;
    const techScore = techBase + techBonus;
    const faithScore = faithBase + faithBonus;

    // El bonus va fuera de la ponderación para que una marca pese lo mismo hacia cualquier lado.
    const weightedTech = techBase * (CONFIG.JUDGMENT?.WEIGHT_TECH || 0.6) + techBonus;
    const weightedFaith = faithBase * (CONFIG.JUDGMENT?.WEIGHT_FAITH || 0.4) + faithBonus;

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
export const calculateDecisionResult = (subject, action, config, { massAdmission = false } = {}) => {
    const result = {
        energyChange: 0,
        stabilityChange: 0,
        unrestChange: 0,
        isError: false,
        flash: null
    };

    const admitChange = massAdmission ? 0 : -config.ENERGY.AUTHORIZE_COST;

    // Devueltos: nada que acertar ni que fallar. Pasan o vuelven a la fila sin error.
    if (subject.returned) {
        result.energyChange = action === 'authorize' ? admitChange : config.ENERGY.SACRIFICE_INOCENT_BONUS;
        return result;
    }

    if (action === 'authorize') {
        if (subject.isCorrupt) {
            result.stabilityChange = -config.STABILITY.AUTHORIZE_CORRUPT_PENALTY;
            result.unrestChange = config.UNREST.AUTHORIZE_CORRUPT_INCREASE;
            result.isError = true;
            result.flash = { target: 'MOD04', intensity: 'heavy', color: 'red' };
        } else {
            result.energyChange = admitChange;
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
