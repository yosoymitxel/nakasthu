/**
 * MATHUTILS.JS
 * Utilidades de cálculo puro para el motor Nakasthu.
 */

/**
 * Convierte un valor a entero truncado hacia abajo.
 * Regla: Los indicadores siempre muestran enteros.
 */
export const toInt = (val) => Math.floor(val);

/**
 * Limita un valor entre un mínimo y un máximo.
 */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Genera un número aleatorio entre min y max.
 */
export const randomRange = (min, max) => Math.random() * (max - min) + min;

/**
 * Calcula la probabilidad de éxito/fallo.
 */
export const chance = (percent) => Math.random() * 100 < percent;

/**
 * Calcula la precisión de un escaneo basada en interferencias.
 */
export const calculateScanPrecision = (basePrecision, interference = 0) => {
    return Math.max(0.1, basePrecision - interference);
};
