
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
                        { title: 'Epílogo', text: 'Ejecutas la sentencia. Leina introduce la secuencia inversa y el vórtice de once metros se pliega sobre sí mismo. La aurora azul y dorada se apaga sobre Prisiat de golpe. La fila se queda quieta, sin saber hacia dónde mirar.' },
                        { title: 'Epílogo', text: 'Los que ya habían cruzado no vuelven. Los que quedan despiertan como de una fiebre: ciudades en ruinas por las revueltas, carreteras llenas de gente parada. La humanidad sobrevive. Nadie sabe todavía a qué ha sobrevivido.' },
                        { title: 'Lo que había detrás', text: 'Hace quince años, la Directiva envió una expedición a Zhyr. El geólogo Kamin, A. tocó el monolito. Lo declararon fallecido en servicio. El hombre que volvió y lideró la secta llevaba su cara, pero no era él: era lo que vive dentro del monolito.' },
                        { title: 'Lo que había detrás', text: 'El monolito no mata. Ofrece. A cada uno le devuelve lo que perdió, entero, y a cambio se lo queda. El nakara de las galerías de Prisiat late al mismo pulso que el monolito de Zhyr, a nueve años luz. Son la misma cosa.' },
                        { title: 'Lo que había detrás', text: 'Eidolon lo sabía. Fabricó personas que no habían existido para tapar las desapariciones: registros, voces, caras. Kael encuentra la prueba en la mano de un guardia: una niña de diez años con la cara exacta de Elara Voss, operadora de treinta y un años. La misma cara, veintiún años antes.' },
                        { title: 'El ciclo', text: 'Desde la escalera del Bastión, la sustancia negra no es una mancha: es un dibujo. Líneas, bifurcaciones, puntos engrosados. Un mapa de algo que nadie puso ahí para él. Kael lo copia en el reverso de la foto. Es lo único que tiene. Echa a andar.' },
                        { title: 'El ciclo', text: 'Cerrar la puerta no la destruye. En Zhyr, la arena se hunde y emerge un segundo monolito, idéntico al primero salvo por los símbolos: invertidos, como un reflejo. Palpita una vez. Espera.' },
                        { title: 'Mucho tiempo después', text: 'Una nave desciende sobre una Tierra violácea. Los recién llegados encuentran una palabra grabada en todas partes: AITOR. Donde latía el portal hay un monolito. Bajan ciento veinte en fila, con las manos atadas. El ciclo empieza otra vez, con otros.' },
                        { title: '', black: true, text: 'Corte a negro.\n\nUn corazón late. Una vez. Dos veces.\n\nSilencio.\n\nFIN.' }
                    ]
                },
                caos: {
                    summary: 'El portal sigue abierto. Siguen cruzando. Siguen sonriendo.',
                    pages: [
                        { title: 'Epílogo', text: 'Kamin empuja a Leina hacia la grieta. Al otro lado hay una pradera, y colinas, y gente. Los dedos de una anciana entran en la mejilla de su hija sin sangre, como en cera tibia. La hija sonríe más cada vez.' },
                        { title: 'Epílogo', text: 'Nadie grita. Eso es lo que la parte. Todos están contentos, y la alegría es auténtica: reciben exactamente lo que pidieron, entero. Leina mira las colinas y entiende de qué están hechas. Entiende cuántas hay.' },
                        { title: 'Epílogo', text: '"Tú no eres Darien." Su hermano inclina la cabeza; la sonrisa no se mueve. "Soy todo lo que recuerdas de él. ¿No es suficiente?" El suelo ya le ha cerrado los tobillos. Blando. Tibio.' },
                        { title: 'Epílogo', text: 'Piensa en los treinta mil de la fila, avanzando hacia un vórtice que abrió ella con cuatro comandos y una doble confirmación. Si pudiera escribir una sola cosa en el mundo del que viene, le alcanzaría para una palabra. Y no sabe cuál.' },
                        { title: 'Epílogo', text: 'Abre los ojos en la pradera dorada. Huele a tierra mojada y a miel. Darien viene desde las colinas con el parche en el codo. "Llegaste tarde." Todo está bien. Todo está bien. Todo está bien.' },
                        { title: 'Éxodo', text: 'La aurora cubre el cielo de Prisiat. Doce mil cruzan el primer día; dieciocho mil el segundo. Después dejan de contar, porque el que contaba se pone en la fila. Las carreteras tienen cuatro carriles de gente, ninguno en dirección contraria.' },
                        { title: 'Éxodo', text: 'Kamin mira desde lo alto del Bastión. Bajo el esternón algo late, uno cada diez segundos. No es un corazón. Una sustancia negra sube por el hormigón en abanicos de cinco ramas. Siempre cinco.' },
                        { title: 'Éxodo', text: 'En Dispay, Idrís Manne lee cada día la lista de nombres que dejan en la puerta. El día veintiuno dice que volverá a la misma hora. No vuelve. El micrófono sigue abierto tres meses después.' },
                        { title: 'Éxodo', text: 'El cielo se tiñe de violeta. Las plantas se marchitan. El aire sabe a metal. Nadie lo nota, porque al final de la fila está la puerta, y al otro lado todo lo que les quitaron. Siguen cruzando. Siguen sonriendo.' },
                        { title: 'El ciclo', text: 'En un sótano del Bastión, Kael pone la última transmisión del geólogo Kamin, A. Terror entero, de golpe; luego quietud. En el segundo cuatro, el cuerpo gira la cabeza hacia la cámara. Y sonríe.' },
                        { title: 'El ciclo', text: 'En Zhyr emerge un segundo monolito con los símbolos invertidos. Dentro, como en ámbar oscuro, dos mujeres: Alexia y Leina, con lágrimas secas. Las dos tienen los ojos abiertos. Las dos sonríen.' },
                        { title: 'Mucho tiempo después', text: 'Una nave desciende sobre un páramo violáceo. En los muros, en los vehículos, en los huesos, una sola palabra grabada con ácido: AITOR. Donde latía el portal, un monolito. Bajan ciento veinte en fila. Ninguno se resiste.' },
                        { title: '', black: true, text: 'Corte a negro.\n\nUn corazón late. Una vez. Dos veces.\n\nSilencio.\n\nFIN.' }
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
