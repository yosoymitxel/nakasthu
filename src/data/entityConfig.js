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
    // Sin clave propia, un tipo usa HUMANO. HÍBRIDO lleva tilde porque así es el valor de ENTITY_TYPES.
    HUMANO: {
        pleas: [
            "Me fui a dormir y él ya no estaba en la cama. Solo quiero saber dónde está.",
            "Mi cartilla es buena. Me la retiraron por tener a mi hija apuntada en la lista.",
            "Trabajo en el turno de noche en Dispay. Si no vuelvo, pierdo el puesto."
        ],
        threats: [
            "Ponga en el acta que me negué a firmar. Que conste.",
            "Usted también tiene a alguien. Todos tenemos a alguien en la lista.",
            "Si me reasignan a Prisiat, apunte mi nombre debajo del de mi hermano."
        ],
        truths: [
            "La Custodia dice que mi hermano no consta. Yo cené con él el jueves.",
            "En el pasillo hay una lista: lo que sabes hacer y a quién buscas. Yo puse las dos cosas.",
            "A mi vecino lo reasignaron a la galería siete. La galería siete está cerrada."
        ]
    },
    CLON: {
        pleas: [
            "Mi madre me llamaba los domingos. Creo. Solo me acuerdo de que era domingo.",
            "Tengo un hijo de seis años. Lo sé porque lo pone en mi ficha.",
            "Pregúntele a mi mujer. Ella sabe cómo me llamo."
        ],
        threats: [
            "Mi expediente está en orden. Compruébelo en Eidolon.",
            "Llevo once años en la misma planta. Alguien lo habrá apuntado.",
            "Si mi ficha está mal, la culpa no es mía."
        ],
        truths: [
            "Recuerdo el entierro de mi padre. No recuerdo dónde está enterrado.",
            "Lloré a mi mujer en invierno. Lo recuerdo como una película.",
            "No sé decirle en qué piso estaba la cantina. Comí allí once años."
        ]
    },
    EIDOLON: {
        pleas: [
            "Déjeme volver con mi familia. Ya he vuelto una vez.",
            "No hace falta el cristal. Estoy bien.",
            "Estaba tranquilo. Ahora también lo estoy."
        ],
        threats: [
            "Allí no falta nada. Aquí falta todo.",
            "Usted también va a cruzar. Todos cruzan.",
            "Pregunte lo que quiera. Voy a responder lo mismo."
        ],
        truths: [
            "Todos me preguntan cómo era el sitio. Estaba bien. No faltaba nada.",
            "Mi mujer dice que ahora duermo con los ojos abiertos.",
            "No tengo frío. Hace tiempo que no tengo frío."
        ]
    },
    HÍBRIDO: {
        pleas: [
            "No noto dónde termina mi mano. Quíteme el guante, por favor.",
            "Me tomo la temperatura cada hora. Treinta y cuatro grados. Dígame que eso no es posible.",
            "No abra nada más. Con lo que tengo me basta."
        ],
        threats: [
            "Si me corto, tarda once segundos en sangrar. Los he contado. Cuéntelos usted.",
            "Lo que tengo en el brazo no lo traje yo. Lo trajo alguien que abrió.",
            "No me toque. No sé si lo que se pega es mío."
        ],
        truths: [
            "Cuento las baldosas para no dormirme. Ciento noventa y dos. Ayer eran ciento noventa y una.",
            "A las 03:17 me despierto. Siempre a la misma hora.",
            "En la piel me han salido cinco rayas. Todas con la misma inclinación."
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
