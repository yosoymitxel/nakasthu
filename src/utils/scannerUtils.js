/**
 * SCANNERUTILS.JS
 * Lógica pura para el sistema de escaneo.
 * Desacoplado de State y Bus para facilitar pruebas.
 */

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
export const analyzeSubjectProbability = (scanType, entity, currentMode) => {
    if (!entity) return 0;
    
    let precision = 0.5;
    switch (scanType) {
        case 'NEURAL': precision = 0.9; break;
        case 'NAKARA': precision = 0.95; break;
        case 'RESONANCE': precision = 0.7; break;
        case 'THERMAL': precision = 0.6; break;
        case 'BIOMETRIC': precision = 0.5; break;
    }
    
    const eclipseInterference = currentMode === 'ECLIPSE' ? 0.2 : 0;
    precision = Math.max(0.1, precision - eclipseInterference);
    
    const showTruth = Math.random() < precision;
    const displayedIsCorrupt = showTruth ? entity.isCorrupt : !entity.isCorrupt;
    
    let prob = displayedIsCorrupt 
        ? (precision * 100 + (Math.random() * (100 - precision * 100))) 
        : ((1 - precision) * 100 * Math.random());
        
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

