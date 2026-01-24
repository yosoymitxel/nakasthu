/**
 * UNRESTUTILS.JS
 * Lógica pura para el sistema de descontento social.
 */
import { chance } from './mathUtils.js';

/**
 * Determina el estado de descontento basado en el nivel actual.
 * @param {number} level - Nivel actual de descontento.
 * @param {Object} levelsConfig - Configuración de niveles (de CONFIG.UNREST.LEVELS).
 * @returns {string} ID del estado ('CRITICAL', 'TENSION', 'CALM').
 */
export const getUnrestStatus = (level, levelsConfig) => {
    if (level >= levelsConfig.CRITICAL.threshold) return 'CRITICAL';
    if (level >= levelsConfig.TENSION.threshold) return 'TENSION';
    return 'CALM';
};

/**
 * Calcula si ocurre un disturbio basado en el nivel actual y probabilidades.
 * @param {number} level - Nivel actual de descontento.
 * @param {number} threshold - Umbral para empezar a tirar probabilidad (CONFIG.UNREST.RIOT_THRESHOLD).
 * @param {number} riotChance - Probabilidad de disturbio (CONFIG.UNREST.RIOT_CHANCE).
 * @returns {boolean} True si ocurre un disturbio.
 */
export const shouldTriggerRiot = (level, threshold, riotChance) => {
    if (level <= threshold) return false;
    // riotChance suele ser 0.3 (30%), chance espera 0-100
    return chance(riotChance * 100);
};

/**
 * Calcula el impacto del disturbio en la estabilidad.
 * @param {number} currentStability - Estabilidad actual.
 * @param {number} damage - Daño base del disturbio.
 * @returns {number} Nueva estabilidad.
 */
export const calculateRiotImpact = (currentStability, damage) => {
    return Math.max(0, currentStability - damage);
};
