/**
 * ENTITYGENERATOR.JS
 * Generador de sujetos para Nakasthu.
 * Regla 2.A: Lógica pura Vanilla JS.
 */

export const ENTITY_TYPES = {
    HUMANO: 'HUMANO',
    CLON: 'CLON',
    EIDOLON: 'EIDOLON',
    HIBRIDO: 'HÍBRIDO'
};

const PREFIXES = ['ZHYR', 'KRON', 'XEN', 'VAL', 'NYX'];
const GLITCH_TYPES = ['STATIC', 'CHROMATIC', 'VOID', 'GHOST', 'NONE'];

const DIALOGUES = {
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

/**
 * Genera un nuevo sujeto con datos aleatorios.
 */
export const generateSubject = () => {
    const id = `${PREFIXES[Math.floor(Math.random() * PREFIXES.length)]}-${Math.floor(Math.random() * 99)}`;
    const typeKeys = Object.keys(ENTITY_TYPES);
    const type = ENTITY_TYPES[typeKeys[Math.floor(Math.random() * typeKeys.length)]];
    
    // Motor de Veracidad: Determinar corrupción real
    const isCorrupt = Math.random() > 0.6; // 40% de probabilidad de ser corrupto
    
    // Probabilidad base de ser un Eidolon (Corrupción visual)
    const corruptionLevel = type === ENTITY_TYPES.EIDOLON ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;

    // Obtener diálogos según tipo (fallback a HUMANO si no existe)
    const typeDialogues = DIALOGUES[type] || DIALOGUES.HUMANO;

    const subject = {
        id,
        type,
        isCorrupt, // Booleano oculto de veracidad
        mentalStability: Math.floor(Math.random() * 100),
        dialogue: {
            plea: typeDialogues.pleas[Math.floor(Math.random() * typeDialogues.pleas.length)],
            threat: typeDialogues.threats[Math.floor(Math.random() * typeDialogues.threats.length)],
            truth: typeDialogues.truths[Math.floor(Math.random() * typeDialogues.truths.length)]
        },
        hasBeenInterrogated: false,
        scannedTypes: [], // Lista de tipos de escaneo realizados (THERMAL, NEURAL, etc.)
        // Datos ocultos para los escáneres
        scannedData: {
            temperature: Math.floor(35 + Math.random() * 5), // 35-40°C
            neuralSync: Math.floor(Math.random() * 100), // 0-100%
            implants: Math.floor(Math.random() * 5),
            corruption: Math.floor(corruptionLevel * 100),
            corruptionHistory: [] // Historial de indicios para promedio
        },
        // Atributos visuales
        visual: {
            glitch: GLITCH_TYPES[Math.floor(Math.random() * GLITCH_TYPES.length)],
            seed: Math.random() // Semilla para generación visual en React
        }
    };

    console.log(`%c[ENTITY] Nuevo sujeto detectado: ID ${id} | Tipo: ${type} | Prob. Corrupción: ${(corruptionLevel * 100).toFixed(0)}%`, "color: #ff00ff; font-weight: bold;");
    
    return subject;
};
