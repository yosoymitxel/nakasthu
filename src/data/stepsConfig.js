
/**
 * STEPSCONFIG.JS
 * Configuración centralizada de los 12 pasos narrativos.
 */
export const STEPS_CONFIG = {
    1: {
        type: 'cinematic',
        name: 'La Avanzadilla',
        shot: 'descent',
        briefingText: 'Kael, Deyar y Alexia bajaron a Zhyr a por la Piedra. Alexia la tocó el primer día; de ella no quedó ni la huella de la bota.',
        meta: null
    },
    2: {
        type: 'mechanic',
        mechanicType: 'SYNC',
        name: 'El Contacto',
        shot: 'monolith',
        briefingText: 'El Monolito pulsa once veces por minuto y el Bastión se sincroniza con ese ritmo. Si la conexión cae, cae todo.',
        meta: { syncRequired: 100 }
    },
    3: {
        type: 'cinematic',
        name: 'El Gran Desvío',
        shot: 'awakening',
        briefingText: 'La Piedra despertó y un tercio de la humanidad desapareció en un parpadeo. Las Distribuciones no dan abasto. Tú eres el Operador del Bastión: cada persona que entra pasa por tu consola.',
        meta: null
    },
    4: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'Reconstrucción',
        briefingText: 'Orval Drexler, desde Talok, ha ordenado la reconstrucción. Necesita técnicos. Evalúa a cada sujeto por lo que sabe hacer.',
        subjectCount: 10,
        meta: {
            requiredTechnicians: 2, // Con 1 de cada 4 sujetos técnico, 6 de 10 era casi imposible
            hiddenGoal: 'Estabilizar el país con técnicos cualificados',
            coreColorOverride: 'cyan'
        }
    },
    5: {
        type: 'cinematic',
        name: 'La Grieta Social',
        shot: 'riot',
        briefingText: 'Las plazas de Dispay arden y en las pancartas hay fotos de desaparecidos. En el BioScan aparecen lecturas que no son de nadie de la cola: restos de los que se fueron.',
        meta: null
    },
    6: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Urgencia',
        briefingText: 'Los disturbios llegan a las puertas. Procesa rápido; la cola no espera. [ADVERTENCIA: anomalía en la cola de espera]',
        subjectCount: 7,
        meta: {
            kaminAppears: true,
            kaminPosition: 7,
            timeMultiplier: 1.5,
            coreColorOverride: 'orange'
        }
    },
    7: {
        type: 'cinematic',
        name: 'El Mensajero de Aitor',
        shot: 'messenger',
        briefingText: 'En Prisiat, un técnico llamado Kamin habla de esperanza. Llama al portal Renacimiento. Cuando él habla, hasta las máquinas parecen zumbar más bajo, y la gente se queda a escuchar.',
        meta: { actChange: true, newStoryPath: 1 }
    },
    8: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'El Convencimiento',
        briefingText: 'La secta de Kamin crece. El Bastión necesita sujetos con influencia; si no reclutas suficientes devotos, habrá sabotajes.',
        subjectCount: 5,
        meta: {
            requiredInfluence: 3,
            penaltyOnFail: 'sabotage',
            coreColorOverride: 'red'
        }
    },
    9: {
        type: 'cinematic',
        name: 'La Fe Ciega',
        shot: 'faith',
        briefingText: 'En la cola quedan pocos ciudadanos; casi todos rezan. El Bastión huele a incienso y aceite de máquina, y la Nakara funciona con fe.',
        meta: null
    },
    10: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Cosecha de Adeptos',
        briefingText: 'Admisión masiva. Kamin quiere cuerpos, no oficios: cuantos más crucen, mejor.',
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
        shot: 'portal',
        briefingText: 'La terminal se parte en dos. Leina intenta cerrar la brecha; Kamin exige el sacrificio final. Lo que hayas hecho hasta aquí decide de qué lado cae.',
        meta: {
            dualChoice: true,
            leftOption: { name: 'ESTABILIZAR', faction: 'orden', color: 'cyan' },
            rightOption: { name: 'TRASCENDER', faction: 'caos', color: 'purple' }
        }
    },
    12: {
        type: 'cinematic',
        name: 'Epílogo',
        shot: 'portal',
        briefingText: null, // Se determina según el final elegido
        meta: {
            endings: {
                orden: 'Cierras el portal. La humanidad sobrevive en un mundo roto. Leina no dice nada; no hace falta.',
                caos: 'Kamin empuja a Leina hacia la grieta. Las sombras devoran el Bastión. "El renacimiento nunca es sencillo", susurra antes de desvanecerse.'
            }
        }
    },
    13: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'Modo Infinito: El Bucle',
        briefingText: 'El tiempo se ha plegado. Técnicos y devotos entran por la misma puerta, una y otra vez. Esto ya no termina.',
        subjectCount: Infinity,
        meta: {
            infinite: true,
            coreColorOverride: 'zinc'
        }
    }
};
