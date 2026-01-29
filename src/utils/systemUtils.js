/**
 * SYSTEMUTILS.JS
 * Lógica pura para el ciclo vital y fallos del sistema.
 */

import { CONFIG } from '../data/gameConfig.js';

/**
 * Verifica si el sistema ha fallado basándose en los recursos actuales.
 */
export const evaluateSystemStatus = (state, config) => {
    const maxErrors = state.maxErrors || config.MAX_JUDGMENT_ERRORS;
    const isExcessiveErrors = state.judgmentErrors >= maxErrors;
    const isStabilityCollapsed = state.stability <= 0;
    const isEnergyDepleted = state.energy <= 0;

    if (isEnergyDepleted || isStabilityCollapsed || isExcessiveErrors) {
        let reason = 'SYSTEM_FAILURE';
        let details = '';

        if (isEnergyDepleted) {
            reason = 'ENERGY_DEPLETED';
            details = 'Agotamiento de energía crítico. El sistema ha entrado en modo de hibernación forzada para preservar el núcleo.';
        } else if (isStabilityCollapsed) {
            reason = 'STABILITY_COLLAPSED';
            details = 'La sincronía neural con el bastión se ha roto. El exceso de errores de juicio ha saturado los filtros de biomasa.';
        } else if (isExcessiveErrors) {
            reason = 'EXCESSIVE_ERRORS';
            details = `Protocolo de seguridad activado: Se ha alcanzado el límite de ${maxErrors} errores de juicio.`;
        }

        return {
            failed: true,
            reason,
            details
        };
    }

    return { failed: false };
};

/**
 * Calcula el siguiente paso del ciclo orbital.
 */
export const calculateNextOrbitalState = (state, config) => {
    const newState = { ...state };
    const step = state.mode === 'ECLIPSE' ? config.ORBITAL.ECLIPSE_STEP : config.ORBITAL.NORMAL_STEP;

    if (state.mode === 'ECLIPSE') {
        newState.eclipseTimer = state.eclipseTimer - 1;
        newState.orbitalCycle = Math.min(config.ORBITAL.MAX_CYCLE, state.orbitalCycle + step);

        if (newState.eclipseTimer <= 0 || newState.orbitalCycle >= config.ORBITAL.MAX_CYCLE) {
            newState.mode = 'NORMAL';
            newState.phase = 'SOLAR';
            newState.worldTime = 0;
            newState.orbitalCycle = 0;
            newState.triggerAlert = false;
        }
    } else {
        newState.worldTime = state.worldTime + step;
        newState.orbitalCycle = Math.min(config.ORBITAL.MAX_CYCLE, newState.worldTime);

        if (newState.worldTime >= config.ORBITAL.MAX_CYCLE) {
            newState.mode = 'ECLIPSE';
            newState.phase = 'ECLIPSE';
            newState.eclipseTimer = config.ORBITAL.ECLIPSE_DURATION;
            newState.orbitalCycle = 0;
            newState.worldTime = 0;
            newState.triggerAlert = true;
        }
    }

    return newState;
};

/**
 * Obtiene un fragmento narrativo aleatorio basado en la ruta actual.
 */
export const getRandomFragment = (step, storyPath) => {
    const pathKey = storyPath === 1 ? 'kamin' : 'drexler';
    const fragments = CONFIG.UI.NARRATIVE_FRAGMENTS[pathKey] || CONFIG.UI.NARRATIVE_FRAGMENTS.sistema;
    return fragments[Math.floor(Math.random() * fragments.length)];
};

/**
 * Calcula el rango de desempeño basado en errores y energía.
 */
export const calculateRank = (stats) => {
    const errors = stats?.errors || 0;
    const currentEnergy = stats?.energy || 0;
    const maxAllowed = stats?.maxErrors || 3;
    const processed = stats?.processed || 0;

    // Si no ha procesado a nadie, el rango es F (Abandono) en lugar de null
    if (processed === 0) return { label: 'F', color: 'text-zinc-500', desc: 'ABANDONO DE DEBERES' };

    if (errors >= maxAllowed) return { label: 'F', color: 'text-red-600', desc: 'INCOMPETENCIA TOTAL' };

    // S: 0 errores, >80 energía y al menos 5 procesados
    if (errors === 0 && currentEnergy > 80 && processed >= 5) return { label: 'S', color: 'text-amber-400', desc: 'EJECUCIÓN PERFECTA' };

    // A: 0 errores
    if (errors === 0) return { label: 'A', color: 'text-emerald-400', desc: 'DESEMPEÑO SOBRESALIENTE' };

    const ratio = errors / maxAllowed;
    if (ratio < 0.4) return { label: 'B', color: 'text-cyan-400', desc: 'OPERACIÓN ESTABLE' };
    if (ratio < 0.7) return { label: 'C', color: 'text-yellow-600', desc: 'OPERACIÓN ACEPTABLE' };
    return { label: 'D', color: 'text-orange-600', desc: 'RENDIMIENTO MARGINAL' };
};
