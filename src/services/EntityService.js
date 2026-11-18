/**
 * ENTITYSERVICE.JS
 * Generador de sujetos para Nakasthu.
 * Regla 2.A: Lógica pura Vanilla JS.
 */
import { 
    ENTITY_TYPES, 
    ENTITY_ROLES, 
    PREFIXES, 
    GLITCH_TYPES, 
    DIALOGUES, 
    GENERATION_CONFIG 
} from '../data/entityConfig.js';
import { findLoreCharacter } from '../data/loreCharactersConfig.js';
import { rollTells } from '../utils/scannerUtils.js';

export { 
    ENTITY_TYPES, 
    ENTITY_ROLES, 
    PREFIXES, 
    GLITCH_TYPES, 
    DIALOGUES, 
    GENERATION_CONFIG,
    findLoreCharacter
};

/**
 * Genera un nuevo sujeto con datos aleatorios.
 */
export const generateSubject = () => {
    const id = `${PREFIXES[Math.floor(Math.random() * PREFIXES.length)]}-${Math.floor(Math.random() * 99)}`;
    const typeKeys = Object.keys(ENTITY_TYPES);
    const type = ENTITY_TYPES[typeKeys[Math.floor(Math.random() * typeKeys.length)]];

    const roleKeys = Object.keys(ENTITY_ROLES);
    const role = ENTITY_ROLES[roleKeys[Math.floor(Math.random() * roleKeys.length)]];

    // Motor de Veracidad: Determinar corrupción real
    const isCorrupt = Math.random() < GENERATION_CONFIG.CORRUPTION_CHANCE;
    const tells = rollTells(isCorrupt);

    // Probabilidad base de ser un Eidolon (Corrupción visual)
    const corruptionLevel = type === ENTITY_TYPES.EIDOLON 
        ? GENERATION_CONFIG.EIDOLON_CORRUPTION.MIN + Math.random() * (GENERATION_CONFIG.EIDOLON_CORRUPTION.MAX - GENERATION_CONFIG.EIDOLON_CORRUPTION.MIN) 
        : Math.random() * GENERATION_CONFIG.STANDARD_CORRUPTION_MAX;

    // Obtener diálogos según tipo (fallback a HUMANO si no existe)
    const typeDialogues = DIALOGUES[type] || DIALOGUES.HUMANO;

    const subject = {
        id,
        type: role, // Usamos role para el campo 'type' que espera el GameSequencer
        species: type, // Guardamos la especie original por si se necesita
        isCorrupt, // Booleano oculto de veracidad
        influence: Math.floor(Math.random() * GENERATION_CONFIG.INFLUENCE_MAX), 
        utility: Math.floor(Math.random() * GENERATION_CONFIG.UTILITY_MAX), 
        mentalStability: Math.floor(Math.random() * GENERATION_CONFIG.STABILITY_MAX),
        dialogue: {
            plea: typeDialogues.pleas[Math.floor(Math.random() * typeDialogues.pleas.length)],
            threat: typeDialogues.threats[Math.floor(Math.random() * typeDialogues.threats.length)],
            truth: typeDialogues.truths[Math.floor(Math.random() * typeDialogues.truths.length)]
        },
        hasBeenInterrogated: false,
        _processed: false, // Flag de control para evitar decisiones duplicadas
        scannedTypes: [], // Lista de tipos de escaneo realizados (THERMAL, NEURAL, etc.)
        // Datos ocultos para los escáneres
        // Señales deducibles: anomalía = fiebre ≥38 °C, sincronía < 50 %, calor > 60 λ, vacío > 60 m.
        tells,
        scannedData: {
            temperature: tells.BIOMETRIC ? 38 + Math.random() * 1.9 : 36 + Math.random() * 1.9,
            neuralSync: Math.floor(tells.NEURAL ? Math.random() * 50 : 50 + Math.random() * 50),
            heatSignature: Math.floor(tells.THERMAL ? 61 + Math.random() * 39 : Math.random() * 60),
            voidDepth: Math.floor(tells.NAKARA ? 61 + Math.random() * 39 : Math.random() * 60),
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

/**
 * Sobreescribe rasgos de un sujeto existente.
 * Útil para alinear el NPC con la narrativa de un diálogo.
 */
export const applyTraits = (subject, traits) => {
    if (!subject || !traits) return subject;

    // Solo sobreescribir si el trait existe en el objeto traits
    if (traits.id) subject.id = traits.id;
    if (traits.type) {
        subject.type = traits.type;
        // Si el tipo especificado es una especie base, alinear species
        if (['HUMANO', 'CLON', 'EIDOLON', 'HÍBRIDO'].includes(traits.type.toUpperCase())) {
            subject.species = traits.type.toUpperCase();
        }
    }
    if (traits.species) subject.species = traits.species.toUpperCase();
    if (traits.name) subject.name = traits.name; // Soporte para nombre real opcional

    if (traits.scannedData) {
        subject.scannedData = {
            ...subject.scannedData,
            ...traits.scannedData
        };
    }

    if (traits.visual) {
        subject.visual = {
            ...subject.visual,
            ...traits.visual
        };
    }

    // Identificación y protección de personajes Motor del Lore
    const loreChar = findLoreCharacter(subject.id, subject.name);
    if (loreChar) {
        subject.isLoreCore = true;
        subject.loreCore = loreChar;
        subject.isCorrupt = false; // Personajes clave del canon no son corrupción arbitraria
        subject.tells = rollTells(false);
        // Su retrato es arte fijo: sin glitch al azar (VOID lo dejaba en gris)
        subject.visual = { ...subject.visual, glitch: 'NONE' };
        if (loreChar.species) subject.species = loreChar.species;
        if (!subject.scannedTypes) subject.scannedTypes = [];
        if (!subject.scannedTypes.includes('LORE_VERIFIED')) {
            subject.scannedTypes.push('LORE_VERIFIED');
        }
    }

    return subject;
};
