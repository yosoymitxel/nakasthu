
/**
 * STEPSCONFIG.JS
 * Configuración centralizada de los 12 pasos narrativos.
 */
export const STEPS_CONFIG = {
    1: {
        type: 'cinematic',
        name: 'La Avanzadilla',
        briefingText: 'Kael, Deyar y Alexia. Tres sombras modificadas descendieron a Zhyr. No buscaban gloria, buscaban la Piedra. Pero la Piedra los encontró primero.',
        meta: null
    },
    2: {
        type: 'mechanic',
        mechanicType: 'SYNC',
        name: 'El Contacto',
        briefingText: 'La sincronización neural con el Bastión requiere contacto absoluto. El Monolito pulsa. Mantén la conexión o el sistema colapsa.',
        meta: { syncRequired: 100 }
    },
    3: {
        type: 'cinematic',
        name: 'El Gran Desvío',
        briefingText: 'La Piedra despertó. Un tercio de la humanidad se desvaneció en un parpadeo. El caos reina en las Distribuciones. Tú eres el Operador del Bastión, el último filtro entre el orden y la extinción.',
        meta: null
    },
    4: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'Reconstrucción',
        briefingText: 'Orval Drexler ha ordenado la reconstrucción. Necesitamos mano de obra calificada. Evalúa los sujetos según su utilidad técnica.',
        subjectCount: 10,
        meta: {
            requiredTechnicians: 6,
            hiddenGoal: 'Estabilizar el país con técnicos cualificados'
        }
    },
    5: {
        type: 'cinematic',
        name: 'La Grieta Social',
        briefingText: 'Las plazas de Dispay arden. La gente no quiere trabajar, quiere a sus desaparecidos. En el BioScan, las lecturas empiezan a mostrar algo más que carne: muestran ecos, susurros de los que se fueron.',
        meta: null
    },
    6: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Urgencia',
        briefingText: 'El tiempo apremia. Los disturbios se intensifican. Procesa los sujetos con rapidez. [ADVERTENCIA: Anomalía detectada en cola de espera]',
        subjectCount: 7,
        meta: {
            kaminAppears: true,
            kaminPosition: 7,
            timeMultiplier: 1.5
        }
    },
    7: {
        type: 'cinematic',
        name: 'El Mensajero de Aitor',
        briefingText: 'Kamin no habla de odio, habla de esperanza. Dice que el portal es un regalo, un Renacimiento. Su voz calma el zumbido de las máquinas. La gente empieza a escucharlo.',
        meta: { actChange: true, newStoryPath: 1 }
    },
    8: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'El Convencimiento',
        briefingText: 'La secta de Kamin crece. Necesitamos sujetos con alta influencia para estabilizar la situación. Si fallas en reclutar suficientes devotos, el Bastión sufrirá sabotajes.',
        subjectCount: 5,
        meta: {
            requiredInfluence: 3,
            penaltyOnFail: 'sabotage'
        }
    },
    9: {
        type: 'cinematic',
        name: 'La Fe Ciega',
        briefingText: 'Ya no hay ciudadanos, solo devotos. El Bastión hiede a incienso y aceite de máquina. La fe es el nuevo combustible de la Nakara.',
        meta: null
    },
    10: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Cosecha de Adeptos',
        briefingText: 'Admisión masiva. Ya no importa la técnica, solo la cantidad. El Bastión necesita cuerpos. El propósito es secundario.',
        subjectCount: 15,
        meta: {
            massAdmission: true,
            coreColorOverride: 'purple'
        }
    },
    11: {
        type: 'mechanic',
        mechanicType: 'DECISION',
        name: 'El Juicio Final',
        briefingText: 'El terminal se divide. Leina intenta cerrar la brecha. Kamin exige el sacrificio final. Tu desempeño determinará el destino.',
        meta: {
            dualChoice: true,
            leftOption: { name: 'ESTABILIZAR', faction: 'orden', color: 'cyan' },
            rightOption: { name: 'TRASCENDER', faction: 'caos', color: 'purple' }
        }
    },
    12: {
        type: 'cinematic',
        name: 'Epílogo',
        briefingText: null, // Se determina según el final elegido
        meta: {
            endings: {
                orden: 'Cierras el portal. La humanidad sobrevive en un mundo roto, pero real. Leina te mira con gratitud silenciosa.',
                caos: 'Kamin empuja a Leina hacia la grieta. Las sombras devoran el Bastión. "El renacimiento nunca es sencillo", susurra antes de desvanecerse.'
            }
        }
    }
};
