
/**
 * STEPSCONFIG.JS
 * Configuración centralizada de los 12 pasos narrativos.
 */
export const STEPS_CONFIG = {
    1: {
        type: 'cinematic',
        name: 'La Avanzadilla',
        shot: 'descent',
        briefingText: 'Kael, Deyar y Alexia bajaron a Zhyr para la Custodia. El tercer día encontraron la piedra. Alexia la tocó y no quedó nada: ni sangre, ni restos. A la vuelta, el registro de a bordo marcó tres tripulantes durante once segundos.',
        meta: null
    },
    2: {
        type: 'mechanic',
        mechanicType: 'SYNC',
        name: 'El Contacto',
        shot: 'monolith',
        briefingText: 'Nadie sabe leer el monolito. La masa da tres valores en tres tomas con el mismo instrumento. El enlace tiene que aguantar su pulso; si cae, cae todo.',
        meta: { syncRequired: 100 }
    },
    3: {
        type: 'cinematic',
        name: 'El Gran Desvío',
        shot: 'awakening',
        briefingText: 'Un tercio de la población deja de estar en cuatro días: en sus camas, en sus turnos, en mitad de una frase. Las Distribuciones reasignan a los que quedan. Tú eres el Operador de reasignación: cada persona que pasa por tu consola deja una ficha.',
        meta: null
    },
    4: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'Reconstrucción',
        briefingText: 'Orval Drexler, desde Talok, ha ordenado la reconstrucción. Necesita técnicos: evalúa a cada sujeto por lo que sabe hacer. En una celda de cuarentena, el panel se reinicia todas las noches a las 03:17. Los desaparecidos no caen al azar: comparten bloque, fondo vecinal, capilla.',
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
        briefingText: 'Las plazas de Dispay arden. «¿Dónde están?». Un chico con bufanda pide respuestas por un megáfono; la emisión se corta dieciocho segundos y ya no está en el encuadre. En una grabación de vigilancia, un reflejo que no coincide con la imagen. En otra plaza, una pancarta: «Nuestros seres queridos no son datos».',
        meta: null
    },
    6: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Urgencia',
        briefingText: 'Los disturbios llegan a las puertas. En Zhyr, de los trece de Talok vuelven cuatro. En Prisiat, un hombre de gabardina escucha a los mineros y no interrumpe. Procesa rápido; la cola no espera. [ADVERTENCIA: anomalía en la cola de espera]',
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
        name: 'La Tarima',
        shot: 'messenger',
        briefingText: 'Una palabra aparece grabada en una plancha de acero de un almacén cerrado: AITOR. En Prisiat, un hombre llamado Kamin sube a una tarima. En Kanatsia cobraba doce créditos por sesión de consuelo; lo dice él. Habla de una puerta, y de que abrirla no es gratis.',
        meta: { actChange: true, newStoryPath: 1 }
    },
    8: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'El Convencimiento',
        briefingText: 'Kamin funda la Orden del Renacimiento Lumínico en una base abandonada del sector nueve. En dos meses son mil doscientos. En el pasillo central hay una lista: lo que sabe hacer cada uno y, debajo, a quién busca. En Talok, Orval prepara una intervención sin firma. Si no reclutas suficientes devotos, habrá sabotajes.',
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
        briefingText: 'Capas blancas, cantos, un altar de nakara. Bajo el hangar, un fragmento late una vez cada diez segundos. Leina Karst abre el portal. Caen objetos fríos. Al cuarto día sale gente, y ninguno pregunta qué día es.',
        meta: null
    },
    10: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Cosecha de Adeptos',
        briefingText: 'Admisión masiva. Kamin quiere cuerpos, no oficios: cuantos más crucen, mejor. Eidolon ha filtrado sus carpetas: hijos que no existieron. Talok corta la luz y el agua y cada medida empuja a más gente dentro. Por el arcén llega un hombre que estuvo en Zhyr.',
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
        briefingText: 'Talok ha entrado en el Bastión y sus líderes no han salido. Kamin está junto a la consola: «Hazla otra vez. Enséñamelo. Por si te pasa algo.» Leina tiene las manos en el teclado. Cuatro comandos amplían la puerta. Los mismos cuatro, al revés, la cierran.',
        meta: {
            dualChoice: true,
            // quote/price/action los pinta MechanicScreen; cada eco sale sólo si su marca narrativa coincide (`if`).
            leftOption: {
                name: 'ESTABILIZAR', faction: 'orden', color: 'cyan', tag: 'SECUENCIA INVERSA',
                quote: '«No abras. El que abre ya no…» — 03:17',
                price: 'Talok vuelve a firmar. Retorno previsto: ninguno.',
                action: 'CERRAR',
                echoes: [
                    { if: { libreta: 'guardada' }, text: 'Entrada treinta y ocho: la misma cara en dos fichas.' },
                    { if: { aviso_317: 'anotado' }, text: 'Tu parte de las 03:17 sigue abierto.' },
                    { if: { kamin_expediente: 'leido' }, text: 'Kamin, A. Fallecido en servicio hace quince años.' },
                    { if: { agua_norte: 'sellada' }, text: 'La galería siete no sale en ningún mapa.' }
                ]
            },
            rightOption: {
                name: 'TRASCENDER', faction: 'caos', color: 'purple', tag: 'SECUENCIA',
                quote: '«Allí no falta nada.» — los cuarenta y seis',
                price: 'Ninguno de los cuarenta y seis describió un lugar.',
                action: 'AMPLIAR',
                echoes: [
                    { if: { lichesth: 'fue' }, text: 'Once créditos con cuarenta. Los pagó.' },
                    { if: { leina_palabra: 'escuchada' }, text: 'AITOR. Tú preguntaste qué letras.' },
                    { if: { marek: 'existio' }, text: 'Al amanecer decidieron que existió.' },
                    { if: { vargas_fuerza: 'letal' }, text: 'El generador siguió en marcha.' },
                    { if: { elara_contacto: 'confia' }, text: 'Elara Voss. Tenía diez años.' }
                ]
            }
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
                        { title: 'Epílogo', shot: 'portalClose', text: 'Leina mete la secuencia al revés. El vórtice se pliega sobre sí mismo. La aurora se apaga sobre Prisiat. Los que cruzaron no vuelven.' },
                        { title: 'El precio', shot: 'bastion', text: 'Las Distribuciones que quedan se reúnen. Se aprueban cuatro partidas y un cierre de fronteras interiores. En la columna de retorno previsto de las reasignaciones no hay nada escrito.' },
                        { title: 'Lo que había detrás', shot: 'monolith', text: 'Hace quince años, el geólogo Kamin, A. tocó el monolito de Zhyr. El hombre que volvió y fundó la secta llevaba su cara, pero no era él. El monolito no mata: devuelve a cada uno lo que perdió, entero, y a cambio se lo queda.' },
                        { title: 'Lo que había detrás', shot: 'bastion', text: 'Eidolon lo sabía y fabricó personas para tapar las desapariciones. Kael encuentra la prueba: una niña de diez años con la cara exacta de Elara Voss. Y desde lo alto del Bastión, la sustancia negra dibuja un mapa. Lo copia y echa a andar.' },
                        // Páginas con `if`: sólo salen si la marca narrativa coincide (CinematicScreen las filtra).
                        { title: 'Lo que había detrás', shot: 'bastion', if: { libreta: 'guardada' }, text: 'Kael abre la libreta por la página treinta y uno. Esta vez tiene la otra pieza.' },
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
                        { title: 'Éxodo', shot: 'exodus', if: { lichesth: 'fue' }, text: 'El hombre de los once créditos con cuarenta cruza con los seis de su turno. Entran de dos en dos, cogidos de la mano.' },
                        { title: 'Éxodo', shot: 'exodus', if: { marek: 'existio' }, text: 'En una cocina de Itzinol, dos personas se ponen de acuerdo en cosas que no ocurrieron. Después se ponen en la fila.' },
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
