
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
                orden: {
                    summary: 'El portal se cierra. Prisiat sobrevive en ruinas. El ciclo no se detiene.',
                    pages: [
                        { title: 'Epílogo', shot: 'portalClose', text: 'Ejecutas la sentencia. Leina introduce la secuencia inversa y el vórtice se pliega sobre sí mismo. La aurora se apaga sobre Prisiat. Los que cruzaron no vuelven; los que quedan despiertan como de una fiebre, entre ciudades en ruinas.' },
                        { title: 'Lo que había detrás', shot: 'monolith', text: 'Hace quince años, el geólogo Kamin, A. tocó el monolito de Zhyr. El hombre que volvió y fundó la secta llevaba su cara, pero no era él. El monolito no mata: devuelve a cada uno lo que perdió, entero, y a cambio se lo queda.' },
                        { title: 'Lo que había detrás', shot: 'bastion', text: 'Eidolon lo sabía y fabricó personas para tapar las desapariciones. Kael encuentra la prueba: una niña de diez años con la cara exacta de Elara Voss. Y desde lo alto del Bastión, la sustancia negra dibuja un mapa. Lo copia y echa a andar.' },
                        { title: 'El ciclo', shot: 'mirror', text: 'Cerrar la puerta no la destruye. En Zhyr emerge un segundo monolito con los símbolos invertidos. Mucho después, una nave encuentra la Tierra violácea y una palabra grabada en todas partes: AITOR. El ciclo empieza otra vez, con otros.' },
                        { title: '', black: true, text: 'Corte a negro.\\n\\nUn corazón late. Una vez. Dos veces.\\n\\nSilencio.\\n\\nFIN.' }
                    ]
                },
                caos: {
                    summary: 'El portal sigue abierto. Siguen cruzando. Siguen sonriendo.',
                    pages: [
                        { title: 'Epílogo', shot: 'meadow', text: 'Kamin empuja a Leina hacia la grieta. Al otro lado hay una pradera dorada y gente que se funde: dedos que entran en mejillas sin sangre, cuerpos unidos de cintura para abajo que la colina absorbe despacio. Nadie grita. Todos sonríen.' },
                        { title: 'Epílogo', shot: 'meadowClose', text: 'Leina mira las colinas y entiende de qué están hechas. "Tú no eres Darien." La sonrisa de su hermano no se mueve. El suelo le cierra los tobillos. Abre los ojos en la pradera. Todo está bien. Todo está bien. Todo está bien.' },
                        { title: 'Éxodo', shot: 'exodus', text: 'Doce mil cruzan el primer día. Después dejan de contar, porque el que contaba se pone en la fila. Kamin mira desde el Bastión; bajo el esternón algo late cada diez segundos. No es un corazón. El cielo se vuelve violeta. Siguen cruzando.' },
                        { title: 'El ciclo', shot: 'mirrorVoid', text: 'En Zhyr emerge un segundo monolito. Dentro, como en ámbar, Alexia y Leina, con los ojos abiertos. Sonríen. Mucho después, una nave baja a un páramo violáceo marcado con una palabra: AITOR. Ciento veinte bajan en fila. Ninguno se resiste.' },
                        { title: '', black: true, text: 'Corte a negro.\\n\\nUn corazón late. Una vez. Dos veces.\\n\\nSilencio.\\n\\nFIN.' }
                    ]
                }
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
