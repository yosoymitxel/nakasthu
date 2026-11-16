/**
 * SCANNERUTILS.JS
 * Lógica pura para el sistema de escaneo.
 * Desacoplado de State y Bus para facilitar pruebas.
 */
import { CONFIG } from '../data/gameConfig.js';

/**
 * Calcula el costo final de un escaneo considerando penalizaciones por repetición.
 * @param {Object} scanConfig - Configuración del tipo de escaneo (de CONFIG.SCANNER.TYPES).
 * @param {number} scanCount - Cuántas veces se ha realizado este escaneo en el sujeto actual.
 * @param {number} penaltyRate - Tasa de penalización (de CONFIG.SCANNER.REPETITION_PENALTY).
 * @returns {number} Costo final.
 */
export const calculateScanCost = (scanConfig, scanCount, penaltyRate) => {
    const repetitionPenalty = 1 + (scanCount * penaltyRate);
    return scanConfig.cost * repetitionPenalty;
};

/**
 * Calcula la duración ajustada por sincronía de resonancia.
 * @param {number} baseDuration - Duración base del escaneo.
 * @param {number} resonanceSync - Nivel actual de sincronía (0-100).
 * @param {number} maxBonus - Bonus máximo de reducción (de CONFIG.SCANNER.SYNC_BONUS_MAX).
 * @returns {number} Duración en ms.
 */
export const calculateAdjustedDuration = (baseDuration, resonanceSync, maxBonus) => {
    const syncBonus = (resonanceSync / 100) * maxBonus;
    return baseDuration * (1 - syncBonus);
};

/**
 * Determina si un escaneo es crítico o tiene resultados especiales (placeholder para futuras expansiones).
 */
export const evaluateScanResult = (scanId, subject) => {
    // Lógica futura para resultados críticos o anomalías específicas
    return 'DATA_EXTRACTED';
};

/**
 * Genera una probabilidad de corrupción basada en el tipo de escaneo y el estado de la entidad.
 * @param {string} scanType - ID del tipo de escaneo (NEURAL, NAKARA, etc).
 * @param {Object} entity - La entidad siendo escaneada.
 * @param {string} currentMode - Modo actual del sistema (NORMAL, ECLIPSE, etc).
 * @returns {number} Probabilidad calculada (0-100).
 */
export const scanPrecision = (scanType) =>
    scanType === 'VOICE' ? CONFIG.SCANNER.VOICE_PRECISION : (CONFIG.SCANNER.TYPES[scanType]?.precision ?? 0.5);

/**
 * Señales fijas por sujeto: para cada fuente, ¿muestra anomalía? Acierta con su `precision`.
 * Fijarlas al generar el sujeto hace que el valor físico (TEMP, SYNC...) y el % digan lo mismo
 * y que repetir un escaneo no "re-tire los dados".
 */
export const rollTells = (isCorrupt, rand = Math.random) => {
    const tells = {};
    for (const type of [...Object.keys(CONFIG.SCANNER.TYPES), 'VOICE']) {
        tells[type] = rand() < scanPrecision(type) ? isCorrupt : !isCorrupt;
    }
    return tells;
};

export const analyzeSubjectProbability = (scanType, entity, currentMode) => {
    if (!entity) return 0;

    const eclipseInterference = currentMode === 'ECLIPSE' ? 0.2 : 0;
    const precision = Math.max(0.1, scanPrecision(scanType) - eclipseInterference);

    // Con señal fija se usa; sin ella (sujetos antiguos/tests) se sortea con la misma precisión.
    let displayedIsCorrupt = entity.tells && scanType in entity.tells
        ? entity.tells[scanType]
        : (Math.random() < precision ? entity.isCorrupt : !entity.isCorrupt);
    // El eclipse mete ruido encima de la señal.
    if (eclipseInterference && Math.random() < eclipseInterference) displayedIsCorrupt = !displayedIsCorrupt;

    const p = scanPrecision(scanType);
    const prob = displayedIsCorrupt
        ? (p * 100 + (Math.random() * (100 - p * 100)))
        : ((1 - p) * 100 * Math.random());

    return Math.floor(prob);
};

/**
 * Formatea el resultado de un escaneo usando un patrón de etiquetas.
 * @param {string} pattern - Patrón de string (ej: "TEMP: {val}°C").
 * @param {number|string} value - Valor a insertar.
 * @returns {string} Resultado formateado.
 */
export const formatScanDetail = (pattern, value) => {
    if (!pattern) return 'DATA_RECOVERY: SUCCESS';
    return pattern.replace('{val}', value ?? '');
};

