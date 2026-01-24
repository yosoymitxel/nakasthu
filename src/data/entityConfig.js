/**
 * ENTITYCONFIG.JS
 * Configuración de entidades, tipos y diálogos del sistema NAKASTHU.
 */

export const ENTITY_TYPES = {
    HUMANO: 'HUMANO',
    CLON: 'CLON',
    EIDOLON: 'EIDOLON',
    HIBRIDO: 'HÍBRIDO'
};

export const ENTITY_ROLES = {
    TECNICO: 'técnico',
    DEVOTO: 'devoto',
    CIUDADANO: 'ciudadano',
    INFILTRADO: 'infiltrado'
};

export const PREFIXES = ['ZHYR', 'KRON', 'XEN', 'VAL', 'NYX'];
export const GLITCH_TYPES = ['STATIC', 'CHROMATIC', 'VOID', 'GHOST', 'NONE'];

export const DIALOGUES = {
    HUMANO: {
        pleas: [
            "Por favor, no pertenezco a este sector, hubo un error en el traslado.",
            "¡Tengo familia en la zona exterior! Pagaran el rescate.",
            "No puedo sentir mis manos... ¿qué me habéis hecho?"
        ],
        threats: [
            "Si me matáis, el Gremio de Mineros vendrá a por vosotros.",
            "No sabéis con quién os estáis metiendo, escoria industrial.",
            "Mi sangre será el veneno de vuestro sistema."
        ],
        truths: [
            "El núcleo ya está muerto, solo sois parásitos en un cadáver.",
            "Vi la grieta abrirse... ya no queda nada ahí fuera.",
            "El código que me creó es el mismo que os borrará."
        ]
    }
};

export const GENERATION_CONFIG = {
    CORRUPTION_CHANCE: 0.4, // 40% de probabilidad de ser corrupto (1 - 0.6)
    EIDOLON_CORRUPTION: { MIN: 0.8, MAX: 1.0 },
    STANDARD_CORRUPTION_MAX: 0.3,
    UTILITY_MAX: 100,
    INFLUENCE_MAX: 5,
    STABILITY_MAX: 100
};
