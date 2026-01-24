/**
 * TEXTUTILS.JS
 * Utilidades puras para formateo de texto y procesamiento de strings.
 */

/**
 * Formatea un texto para el terminal con prefijo y timestamp opcional
 */
export const formatTerminalLine = (text, type = 'INFO') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const prefix = `[${time}] [${type}]`;
    return `${prefix} ${text}`;
};

/**
 * Trunca un texto a una longitud máxima añadiendo elipsis
 */
export const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Genera un ID aleatorio para entidades o eventos
 */
export const generateId = (prefix = 'ID') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Limpia caracteres especiales para visualización industrial
 */
export const sanitizeTechnicalText = (text) => {
    return text.replace(/[^\x20-\x7E]/g, '?').toUpperCase();
};
