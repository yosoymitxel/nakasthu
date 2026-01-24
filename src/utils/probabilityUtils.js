/**
 * PROBABILITYUTILS.JS
 * Utilidades para cálculos de probabilidad y azar.
 */
import { chance, randomRange } from './mathUtils.js';

/**
 * Determina si ocurre un evento basado en una probabilidad (0.0 a 1.0)
 */
export const rollSuccess = (probability) => {
    return Math.random() < probability;
};

/**
 * Selecciona un elemento aleatorio de un array
 */
export const pickRandom = (array) => {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Genera un valor con una desviación aleatoria (glitch)
 */
export const applyGlitch = (value, intensity = 0.1) => {
    const deviation = value * intensity;
    return value + randomRange(-deviation, deviation);
};

/**
 * Determina el resultado de una confrontación de facciones
 */
export const resolveFactionConflict = (powerA, powerB) => {
    const total = powerA + powerB;
    if (total === 0) return 0.5;
    return powerA / total;
};
