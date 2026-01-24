/**
 * QUOTAUTILS.JS
 * Lógica pura para el seguimiento de cuotas.
 */

/**
 * Calcula el porcentaje de completitud de una cuota.
 * @param {number} current - Progreso actual.
 * @param {number} target - Objetivo total.
 * @returns {number} Porcentaje (0-100).
 */
export const calculateQuotaPercentage = (current, target) => {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.floor((current / target) * 100));
};

/**
 * Determina si se ha alcanzado el objetivo.
 */
export const isQuotaReached = (current, target) => {
    return target > 0 && current >= target;
};
