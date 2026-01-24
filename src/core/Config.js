/**
 * CONFIG.JS
 * Configuración centralizada del sistema NAKASTHU.
 * Permite ajustes rápidos de balance y mecánicas.
 */

export const CONFIG = {
    // Límites de errores de juicio antes de fallo del sistema
    MAX_JUDGMENT_ERRORS: 3,

    // Cuota por defecto si no se especifica en el paso narrativo
    DEFAULT_QUOTA: 10,

    // Parámetros de estabilidad y energía
    STABILITY: {
        INITIAL: 100,
        SACRIFICE_INOCENT_PENALTY: 25,
        AUTHORIZE_CORRUPT_PENALTY: 30,
        RESONANCE_LOW_PENALTY: 0.5,
        RESONANCE_HIGH_BONUS: 0.2
    },

    ENERGY: {
        INITIAL: 100,
        SACRIFICE_CORRUPT_BONUS: 80,
        SACRIFICE_INOCENT_BONUS: 60,
        AUTHORIZE_COST: 1
    },

    // Tiempos y delays
    DELAYS: {
        TRANSITION: 1000,
        NEXT_SUBJECT: 1500
    }
};
