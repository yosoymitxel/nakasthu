/**
 * STEPSCONFIG.JS
 * Configuración centralizada de los 12 pasos narrativos.
 *
 * Páginas de cinemática (`pages`, `intro`, `endings.*.pages`), todas opcionales salvo `text`:
 * - `shot`: plano 3D (Backdrop3D.SHOTS). `black: true` pinta negro sin plano.
 * - `doc`: rótulo grande sobre negro (un documento, un registro). `photo`: clave de retrato que se pinta dos veces.
 * - `clock`: la hora de Kael (03:17) encima del texto.
 * - `speed`: ms por carácter. `¦` en el texto es una pausa de un segundo que no se ve.
 * - `corrupt`: el texto se tuerce al teclearse. `auto`: pasa sola a los N ms, sin botón.
 * - `sound`: ambiente sintetizado (birds, drone, clicks, heart, silence). `music`: volumen de la música (0-1).
 * - `if`: sólo sale si la marca narrativa coincide. `unless`: no sale si coincide.
 * - `play`: escena jugable antes del texto de la página (PLAYS en ui/screens/cinematic/plays.js).
 * - `echo`: línea gris bajo el texto, ya tecleado (el monólogo del empuje recuerda dónde lo viste).
 * - `{lista}` en el texto: los nombres de LA LISTA de la partida (MissingList.readout).
 * `clock317`: lo que Kael lleva oído de la frase; cierra la cinemática o encabeza el briefing.
 * `bulletin`: parte de enlace que se lee al cerrar el turno.
 * `meta.cameos`: recurrentes en posiciones fijas de la cola. `dialogues`: el primero cuyas marcas encajan;
 *   `onDecision`: marcas que deja autorizar o reasignar/entregar a esa persona.
 */

// El empuje: pase lo que pase con la secuencia, la mano en la espalda; luego lo que pensó, en orden (cap. 15).
// Lo juega el paso 11 al terminar la consola; los finales empiezan después.
const PUSH = [
    { title: 'La consola', shot: 'portal', text: '—Ya está —dijo Leina—. Se acabó. No lo toco más.\nSe giró para apartarse de la consola.' },
    { title: 'La consola', shot: 'portal', speed: 45, text: 'Kamin le puso la mano en la espalda. No la agarró. Apoyó la mano abierta entre los omóplatos, como quien acompaña a alguien a través de una puerta.' },
    { title: '', black: true, speed: 60, text: 'Y empujó.\n\nLeina no llegó a girarse del todo. Lo que pensó, en el orden en que lo pensó, fue esto:' },
    { title: '', black: true, text: 'Que ella había firmado la salida de Eidolon con su nombre real.', echo: 'Paso 8 · «Saqué esto de Eidolon»' },
    { title: '', black: true, text: 'Que había convencido a Rian, y Rian había convencido a otros nueve.', echo: 'Paso 8 · Rian Telles y el cuenco lleno' },
    { title: '', black: true, text: 'Que había puesto la consola en ese punto exacto del hangar porque él se lo había pedido.' },
    { title: '', black: true, text: 'Que él le había preguntado, hacía dos meses, cuántas personas cabían por hora.', echo: 'Paso 8 · «Tú sabes de colas»' },
    { title: '', black: true, text: 'Que le había preguntado también, hacía tres semanas, si el aparato podía funcionar sin ella.\nQue le había dicho que sí.', echo: 'Paso 8 · la hoja de turnos' },
    { title: '', black: true, text: 'Que la conversación del hermano, la de la voz rota, había sido a los cuatro días de esa pregunta. Que nunca se lo contó a nadie porque él contaba con eso.' },
    { title: '', black: true, text: 'Que llevaba once meses buscándole la grieta detrás de los ojos, y que la grieta era todo lo demás. La cara era lo único que no lo era.' },
    { title: '', black: true, text: 'Que en Eidolon había once mil rostros usados más de una vez.', echo: 'Paso 10 · carpeta de descartes' },
    { title: '', black: true, text: 'Que Darien llevaba ocho años muerto, y que había metido a treinta mil personas por una puerta que abrió ella, por si acaso.', echo: 'Paso 7 · galería siete, sellado sin leer' },
    { title: '', black: true, speed: 60, text: 'Le dio tiempo a todo eso.\n\nNo le dio tiempo a girar la cabeza.' }
];

// Lo que Kael encuentra después, cierre el portal o no (cap. 18).
const AFTER = [
    { title: 'Lo que había detrás', black: true, text: 'Kael encuentra al guardia que le abrió la celda sentado contra una pared, con los ojos abiertos. En la mano, una fotografía: una niña de diez años con uniforme escolar de Talok.' },
    { title: 'Lo que había detrás', black: true, photo: 'ELARA', text: 'Elara Voss. Operadora de conformado, Dispay. Treinta y un años. La niña de la foto tiene diez.\nLa misma cara. No parecida: la misma.' },
    { title: 'Lo que había detrás', black: true, if: { libreta: 'guardada' }, text: 'Libreta de Alexia, página treinta y uno, entrada treinta y ocho: «La misma cara en dos fichas con nombres distintos». Ahora tiene la otra pieza.' },
    { title: 'Grabación', shot: 'kaminTape', text: 'Archivo de la Directiva. Hace quince años, el geólogo Kamin, A. dicta junto al monolito. Se interrumpe. Mira la piedra. Se queda muy quieto. Los ojos se le apagan sin cerrarse.' },
    { title: 'Grabación', shot: 'kaminTape', speed: 55, text: 'En el segundo cuatro, el cuerpo gira la cabeza hacia la cámara. Despacio. Sin mover los hombros.\n¦Y sonríe.' },
    { title: 'El mapa', shot: 'bastion', text: 'Desde la escalera del Bastión, la sustancia negra es un dibujo: líneas, bifurcaciones, puntos a distancias desiguales. Kael lo copia con carbón en el reverso de la foto de Elara Voss.' }
];

export const STEPS_CONFIG = {
    1: {
        type: 'cinematic',
        name: 'La Avanzadilla',
        shot: 'descent',
        briefingText: 'Kael, Deyar y Alexia bajan a Zhyr. Alexia toca la piedra y no queda nada. El registro de a bordo marca tres tripulantes durante once segundos.',
        pages: [
            { shot: 'descent', text: 'Bajaron tres a Zhyr para la Custodia: Kael, Deyar y Alexia. Arena abrasiva bajo dos soles. De noche el viento dejaba la arena peinada en cinco crestas, siempre con la misma inclinación.' },
            { shot: 'monolith', text: 'El tercer día apareció. Negra, sin base, sin escombro alrededor. Los símbolos se movían dentro, como algo que se desplaza bajo el agua.' },
            { shot: 'monolith', text: '—Si lo leo como una prohibición, dice tres veces que no —dijo Alexia—. No tocar, no creer, no ofrecer. Si lo leo al revés, dice lo contrario.' },
            { shot: 'touch', text: 'Extendió la mano y tocó la superficie. En el último instante Kael le vio la cara. No había miedo. Había expectación.' },
            { shot: 'touch', text: 'El destello fue blanco y no hizo ruido. Ni sangre, ni restos. Un hueco de aire donde había estado una persona.' },
            { black: true, doc: 'Libreta de Alexia', text: 'Última entrada, la víspera:\n«Los cañones no llaman. Llevo doce años buscando algo que me llame.\nMañana lo tocamos.»\nKael se la guarda debajo del traje.' },
            { black: true, doc: 'Tripulantes a bordo: 3', speed: 60, text: 'Día nueve, de vuelta. Kael lee el registro dos veces. Cuenta once segundos.' },
            { black: true, doc: 'Tripulantes a bordo: 2', text: 'Historial del sistema: ninguna corrección. El campo marca 2 desde el despegue.' }
        ],
        meta: null
    },
    2: {
        type: 'mechanic',
        mechanicType: 'SYNC',
        name: 'El Contacto',
        shot: 'monolith',
        briefingText: 'Seis días más junto a la piedra. La masa da tres valores en tres tomas con el mismo instrumento. El enlace tiene que aguantar su pulso.',
        intro: [
            { shot: 'monolith', text: 'Kael y Deyar se quedaron seis días más. Midieron temperatura, radiación, resonancia, masa.' },
            { shot: 'monolith', text: 'La masa dio tres valores distintos en tres tomas consecutivas con el mismo instrumento. Kael anotó los tres.' },
            { shot: 'monolith', text: 'Deyar dejó de hablar el quinto día. Comían de espaldas a la piedra y ninguno de los dos lo comentó nunca.' },
            { shot: 'monolith', text: 'Hay que registrar su pulso. Mantén el enlace pulsado hasta que la lectura se complete. Si sueltas, se pierde.' }
        ],
        meta: { syncRequired: 100 }
    },
    3: {
        type: 'cinematic',
        name: 'El Gran Desvío',
        shot: 'vanish',
        briefingText: 'Un tercio de la población deja de estar en cuatro días. Las Distribuciones reasignan a los que quedan. Tú eres el operador de reasignación.',
        clock317: 'No.',
        pages: [
            { black: true, doc: 'Cuarentena', text: 'A Kael lo meten en una celda de seis por cuatro, sin ventana, con un desagüe en el centro. Le preguntan qué tocó, cuántas veces, con qué mano. Nadie pregunta por Alexia.' },
            { shot: 'vanish', text: 'Desapareció un tercio de la población en cuatro días. Sin explosión, sin epidemia. La gente dejó de estar: en sus camas, en sus turnos, en mitad de una frase.' },
            { shot: 'vanish', text: 'En Kanatsia, Nera Okonjo puso agua a hervir para dos y estuvo nueve minutos esperando a que su marido saliera del cuarto. Las zapatillas de él seguían colocadas.' },
            { shot: 'vanish', text: 'En Itzinol quedó una enfermera para dieciocho incubadoras. Perla Suay aguantó cincuenta y dos horas. Salieron catorce. El parte dice: incidencia de dotación.' },
            { shot: 'awakening', text: 'Tres meses antes, en Eidolon, Leina Karst vio una palabra de cinco letras en un monitor. El supervisor abrió el log.\n—Fallo de caché. Pasa.' },
            { shot: 'awakening', text: 'Las Distribuciones reasignan a los que quedan. Tú eres el operador de reasignación de Talok, consola cuatro: decides quién se queda a reconstruir y quién baja a las galerías de Prisiat.' },
            { black: true, doc: 'Reasignaciones · trece semanas', text: '412.000 traslados forzosos a las galerías de Prisiat.\nRetorno previsto: —\nLa columna existe y está en blanco. Llevan ciento cuarenta años así.' }
        ],
        meta: null
    },
    4: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'Reconstrucción',
        briefingText: 'Eres el operador de reasignación de Talok, consola cuatro. Orval Drexler ha ordenado la reconstrucción y necesita técnicos: evalúa a cada sujeto por lo que sabe hacer. El que no sirve baja a Prisiat. Los desaparecidos no caen al azar: comparten bloque, fondo vecinal, capilla.',
        clock317: 'No abras.',
        bulletin: 'Kanatsia, bajo comité temporal. Itzinol, neonatos: incidencia de dotación. Corte de doscientos treinta milisegundos en el enlace de las seis Distribuciones: interferencia atmosférica.',
        subjectCount: 10,
        meta: {
            requiredTechnicians: 2, // Con 1 de cada 4 sujetos técnico, 6 de 10 era casi imposible
            cameos: [
                { pos: 3, dialogues: ['DLG_S1_03'], onDecision: { sacrifice: { nera: 'reasignada' } } },
                { pos: 6, dialogues: ['DLG_R_TOBI_DEUDA'], onDecision: { sacrifice: { tobi: 'reasignado' }, authorize: { tobi: 'se_queda' } } }
            ],
            hiddenGoal: 'Estabilizar el país con técnicos cualificados',
            coreColorOverride: 'cyan'
        }
    },
    5: {
        type: 'cinematic',
        name: 'La Grieta Social',
        shot: 'vanish',
        briefingText: 'Las plazas de Dispay arden. Un chico con bufanda pide respuestas por un megáfono. Una pancarta: «Nuestros seres queridos no son datos».',
        clock317: 'No abras. El que abre…',
        pages: [
            { black: true, doc: 'Acta', text: 'Renata Sykes, comité de ética, sobre la exposición controlada de sujetos humanos al objeto:\n—Que conste en acta que lo dije.\nConstó. Fue lo único que consiguió.' },
            { black: true, doc: '230 ms · 4 fotogramas', text: 'Las seis pantallas de la sala se cortan.\n—Interferencia atmosférica —dice Idrís Manne, de enlace. Es la casilla por defecto. A la mañana siguiente, su copia pesa cero bytes.' },
            { shot: 'riotCrowd', text: 'Las plazas de Dispay arden. Las pancartas ya no piden nada concreto.\n«¿Dónde están?»' },
            { shot: 'riotCrowd', text: 'Ovid Ferrer, veintidós años, pide respuestas por un megáfono. Su hermana Tessa lleva siete semanas desaparecida. Lo último que le dijo fue «haz lo que quieras».' },
            { black: true, doc: 'Señal perdida · 00:18', speed: 50, text: 'La emisión se corta dieciocho segundos.' },
            { shot: 'riotCrowd', text: 'Vuelve con otro plano. Ovid sigue en la plaza. Esa noche su madre le escribe: «Vuelve a casa». Lo lee a las cuatro de la mañana en un portal y no contesta.' },
            { shot: 'surveil', text: 'Cámara de vigilancia, catorce segundos. En el reflejo de un escaparate, detrás de un manifestante, hay una figura que no está en la imagen. Etiqueta: artefacto óptico.' },
            { shot: 'riotCrowd', text: 'En otra plaza, un hombre sostiene una pancarta: «Nuestros seres queridos no son datos». La gente corea detrás de él hasta que se hace de noche.' }
        ],
        meta: null
    },
    6: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Urgencia',
        briefingText: 'Sigues en la consola cuatro de Talok. Los disturbios llegan a las puertas. En Zhyr, de los trece que bajaron vuelven cuatro. En Prisiat, un hombre de gabardina escucha a los mineros y no interrumpe. Procesa rápido; la cola no espera. [ADVERTENCIA: anomalía en la cola de espera]',
        clock317: 'No abras. El que abre…',
        bulletin: 'Zhyr: de trece, vuelven cuatro. A la madre de Petro Ilm le llega su piedra del río en una bolsa precintada. Indemnización aceptada por defecto a los treinta días.',
        subjectCount: 7,
        meta: {
            kaminAppears: true,
            kaminPosition: 7,
            cameos: [
                { pos: 2, dialogues: ['DLG_P2_OVID'] },
                { pos: 4, dialogues: ['DLG_R_TOBI_OBRA', 'DLG_R_TOBI_RAMPA'] }
            ],
            timeMultiplier: 1.5,
            coreColorOverride: 'orange'
        }
    },
    7: {
        type: 'cinematic',
        name: 'La Tarima',
        shot: 'tarima',
        briefingText: 'AITOR aparece grabada en acero en un almacén cerrado. En Prisiat, Kamin sube a una tarima. Habla de una puerta, y de que abrirla no es gratis.',
        clock317: 'No abras. El que abre…',
        pages: [
            { black: true, doc: 'AITOR', text: 'Una plancha de acero en un almacén sellado de Prisiat. Grabado en profundidad, con el borde limpio. El registro de puerta no marca ninguna apertura.' },
            { shot: 'tarima', text: 'Kamin llevaba siete semanas en Prisiat escuchando a los mineros. Uno le habló de la factura del filtro de su hijo muerto: once créditos con cuarenta. Kamin le puso la mano en el antebrazo.' },
            { shot: 'tarima', text: 'A la semana siguiente, el hombre volvió con dos amigos. A la otra, con seis. Cuando Kamin subió a la tarima no era un desconocido. Era el que entendía.' },
            { shot: 'tarima', text: 'Las doce lámparas del pórtico parpadearon: tres, dos, cinco. Alguien dijo la palabra. Kamin no las señaló. Retomó la frase donde la había dejado, como tras un ruido de tráfico.' },
            { shot: 'tarima', text: '—En Kanatsia cobrabas por hablar.\n—Cobraba. Doce créditos por sesión.\nFue la respuesta más honesta de la noche. Por eso funcionó.' },
            { shot: 'tarima', text: '—Hay una puerta. Del otro lado está la gente que perdimos. Abrirla no es gratis: alguien tiene que pagar la diferencia.\n—¿Qué diferencia?\nNo respondió.' },
            { shot: 'tarima', text: 'Entre el público, Leina Karst no abrió la boca. Al salir se dio cuenta de que en hora y media no le había visto parpadear. Se dijo que era la luz.' },
            { black: true, doc: 'Galería siete', play: 'reports', text: 'Tres meses después se vino abajo el techo de la galería siete con veintiséis hombres dentro. Uno era su hermano, Darien. La investigación no encontró negligencia.' },
            { black: true, doc: 'Elara Voss', text: 'Un guardia le deja a Kael ropa de civil en la bandeja.\n—Si lo encuentras, dile que mi hija se llamaba Elara Voss. Tenía diez años.\nEn las traviesas, el óxido baja en cinco regueros.' }
        ],
        meta: { actChange: true, newStoryPath: 1 }
    },
    8: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'El Convencimiento',
        briefingText: 'Te han retirado la cartilla por tener un familiar en el Bastión. La mesa de admisión de la Orden necesita a alguien que sepa de colas: ahora consagras o purgas para Kamin. En dos meses son mil doscientos. En el pasillo central hay una lista: lo que sabe hacer cada uno y, debajo, a quién busca. Kamin quiere gente a la que otros sigan; sin ella, algo se rompe por dentro.',
        clock317: 'No abras. El que abre ya no…',
        bulletin: 'Sector nueve: la base abandonada vuelve a tener luz. Kanatsia: una niña escribe una palabra con letra de adulto y al día siguiente no sabe repetirla. Talok prepara una intervención sin firma.',
        subjectCount: 8,
        meta: {
            requiredInfluence: 3,
            cameos: [
                { pos: 2, dialogues: ['DLG_P3_TOREN'] },
                // Las dos preguntas que Leina recuerda al caer (cap. 15): tienen que haberse oído antes del paso 11
                { pos: 3, dialogues: ['DLG_P3_KAMIN_POR_HORA'] },
                { pos: 7, dialogues: ['DLG_P3_KAMIN_SIN_TI'] },
                { pos: 4, dialogues: ['DLG_P3_RIAN_COMA'], onDecision: { sacrifice: { rian: 'entregado' } } },
                { pos: 6, dialogues: ['DLG_R_NERA_GALERIA', 'DLG_R_NERA_COLADA'], onDecision: { sacrifice: { nera: 'entregada' } } }
            ],
            penaltyOnFail: 'sabotage',
            coreColorOverride: 'red'
        }
    },
    9: {
        type: 'cinematic',
        name: 'La Fe Ciega',
        shot: 'altar',
        briefingText: 'Bajo el hangar, Toren paga la diferencia. Leina abre el portal. Caen objetos fríos. Salen cuarenta y seis, y ninguno describe un lugar.',
        clock317: 'No abras. El que abre ya no…',
        pages: [
            { shot: 'altar', text: 'Doce metros bajo el hangar. Bajan veintiuno, siempre los mismos. Sobre el altar flota un fragmento negro. Late una vez cada diez segundos, sin deriva.' },
            { shot: 'toren', text: '—Para abrir hay que pagar la diferencia.\n—¿Qué diferencia?\n—Ya lo sabes.\nEsa tarde, Toren le había ofrecido a Leina una calada en el escalón de la puerta este.' },
            { shot: 'torenAsh', speed: 45, text: 'Toren gritó una vez, corto. Se plegó sobre sí mismo hasta ser ceniza. Un instante, la ceniza se ordenó en el aire: cinco trazos, con la misma inclinación.' },
            { black: true, doc: 'Laboratorio', text: 'Arriba, Leina y Rian llevan treinta y una horas.\n—Cierra el bucle de retorno.\n—Cerrado.\n—Dame la tercera.' },
            { shot: 'portalOpen', text: 'Se paró todo el sonido del mundo cuatro segundos. Cuando volvió, el portal ya estaba ahí. Cayeron cosas: una muñeca de trapo, una bota izquierda. Frías, con polvo negro.' },
            { shot: 'portalOpen', text: 'Al cuarto día salió gente. Una mujer miró alrededor como quien vuelve a una habitación conocida. Un hombre se arrodilló. Era su hermana. Llevaba nueve meses desaparecida.' },
            { shot: 'portalOpen', text: 'Salieron cuarenta y seis. Contestaron lo mismo con palabras distintas: que estaban esperando, que estaba tranquilo, que allí no faltaba nada.\nNinguno describió un lugar.' },
            { black: true, speed: 50, text: 'El quinto día no salió nadie. Tampoco el sexto.\nEn el Bastión nadie dijo en voz alta que la puerta sólo iba en una dirección.' }
        ],
        meta: null
    },
    10: {
        type: 'gameplay',
        mechanicType: 'DECISION',
        name: 'La Cosecha de Adeptos',
        briefingText: 'Sigues en la mesa de admisión. Kamin quiere cuerpos, no oficios: cuantos más crucen, mejor. Eidolon ha filtrado sus carpetas: hijos que no existieron. Talok corta la luz y el agua y cada medida empuja a más gente dentro. Por el arcén llega un hombre que estuvo en Zhyr.',
        clock317: 'No abras.',
        bulletin: 'Cerco, semana nueve: bombardeo de saturación sobre las tiendas del perímetro exterior. Seiscientos nueve muertos. Mañana, a la misma hora.',
        subjectCount: 15,
        meta: {
            massAdmission: true,
            cameos: [
                { pos: 2, dialogues: ['DLG_R_OVID_CAMION'], onDecision: { sacrifice: { ovid: 'entregado' } } },
                { pos: 4, dialogues: ['DLG_R_NERA_EIDOLON'], onDecision: { sacrifice: { nera: 'entregada' } } },
                { pos: 6, dialogues: ['DLG_R_TOBI_CONSOLA', 'DLG_P4_TOBI_FILA'], onDecision: { sacrifice: { tobi: 'entregado' } } },
                { pos: 9, dialogues: ['DLG_P4_SERAFIN'], onDecision: { sacrifice: { serafin: 'entregado' } } },
                { pos: 12, dialogues: ['DLG_P4_RIAN_PASARELA'] }
            ],
            coreColorOverride: 'purple'
        }
    },
    11: {
        type: 'mechanic',
        mechanicType: 'DECISION',
        name: 'El Juicio Final',
        shot: 'portal',
        briefingText: 'Talok entra en el Bastión y sus líderes no salen. Kamin está junto a la consola: «Hazla otra vez. Enséñamelo.» Cuatro comandos amplían la puerta. Los mismos cuatro, al revés, la cierran.',
        intro: [
            { title: 'Verificación', shot: 'bastion', text: 'Siete y diez de la mañana. Cuatro mil efectivos de las tres Distribuciones que quedan entran en el Bastión. Orval Drexler, la líder de Dispay y el de Itzinol van en persona.' },
            { title: 'Verificación', shot: 'portal', text: 'En el pasillo, la lista de quién busca a quién: cuatro metros, siete capas de papel. Un soldado de Dispay se para a leerla. Su sargento le da una voz.' },
            { title: 'Verificación', shot: 'portal', text: '—Ustedes nos han mentido durante ciento cuarenta años —dice Leina, con las manos en el teclado.\nKamin, de pie junto al vórtice, no hace nada.' },
            { title: 'Verificación', shot: 'portal', text: '—Necesito a alguien que quiera volver.\nAtan a un sargento un cabo de acero de veinte metros. Entra. El rollo se acaba en cuatro segundos. La radio no emite nada.' },
            { title: '', black: true, speed: 50, text: 'Tiran del cabo.\nSale entero, con el mosquetón cerrado y el extremo cortado limpio.' },
            { title: 'Verificación', shot: 'portal', text: 'La líder de Dispay dispara a Kamin. El arma gira en su mano. De la herida sale una pasta oscura. Kamin se seca de pie y sigue parpadeando cincuenta y un segundos.' },
            { title: 'Verificación', shot: 'portal', text: 'El reflejo de Orval en la placa del suelo le agarra los tobillos y tira. Es el único que grita. Al de Itzinol se le apagan los ojos como un panel. Sigue de pie nueve minutos.' },
            { title: 'Verificación', shot: 'exodus', text: 'En el patio, treinta mil personas ven salir corriendo a los soldados. Después de ciento cuarenta años, han caído. La fila se dobla esa misma tarde.' },
            { title: 'La consola', shot: 'portal', text: 'A las doce y diez Kamin está junto a la consola, sin una grieta.\n—Hazla otra vez. Enséñamelo. Por si te pasa algo.\nCuatro comandos amplían la puerta. Al revés, la cierran.' }
        ],
        meta: {
            // La consola de Leina (cap. 15): cuatro comandos; en orden amplían (caos), al revés cierran (orden).
            // `kamin`: lo que se dice antes del primer comando (`at: 0`) y tras cada comando (`at: n`).
            console: {
                commands: [
                    { id: 'potencia', label: 'POTENCIA +2', words: ['potencia', 'pot'] },
                    { id: 'campo', label: 'CAMPO ABRIR', words: ['campo'] },
                    { id: 'bucle', label: 'BUCLE RETORNO CERRAR', words: ['bucle', 'retorno'] },
                    { id: 'confirmar', label: 'CONFIRMAR ×2', words: ['confirmar', 'conf', 'ok'], double: true }
                ],
                vortex: { start: 6, caos: [7.5, 9, 10, 11], orden: [4.5, 3, 1.5, 0] },
                queue: '9.000',
                note: '11:47. Ampliación a 6 m. Ocho bajas hostiles. Sistema estable.',
                kamin: [
                    { at: 0, who: 'KAMIN', text: 'Otra vez.' },
                    { at: 0, who: 'LEINA', text: '¿Qué?' },
                    { at: 0, who: 'KAMIN', text: 'La secuencia. Hazla otra vez.' },
                    { at: 0, who: 'LEINA', text: 'Hay nueve mil personas en la fila y el borde ya está en la pasarela. Si lo abro más, no voy a poder cerrarlo.' },
                    { at: 1, who: '', text: 'Kamin se pone a su lado, no delante. Mira la pantalla, el teclado, la posición de los dedos.' },
                    { at: 1, who: 'KAMIN', text: 'Enséñamelo.' },
                    { at: 2, who: 'LEINA', text: '¿Para qué?' },
                    { at: 2, who: 'KAMIN', text: 'Por si te pasa algo.' },
                    { at: 3, who: '', text: 'Sonó razonable. Todo lo que ese hombre había dicho en once meses había sonado razonable.' }
                ],
                push: PUSH
            },
            // quote/price/echoes: la chuleta de cada sentido en la consola; cada eco sale sólo si su marca coincide (`if`).
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
                    { if: { vargas_fuerza: 'letal' }, text: 'El distrito sigue en pie.' },
                    { if: { elara_contacto: 'confia' }, text: 'Elara Voss. Tenía diez años.' }
                ]
            }
        }
    },
    12: {
        type: 'cinematic',
        name: 'Epílogo',
        shot: 'portalClose',
        briefingText: null, // Se determina según el final elegido
        meta: {
            endings: {
                orden: {
                    summary: 'El portal se cierra con Leina dentro. La fila se queda de este lado. El ciclo no se detiene.',
                    pages: [
                        { title: 'El precio', shot: 'portalClose', text: 'El vórtice se pliega con ella dentro. La aurora se apaga sobre Prisiat. Los que cruzaron no vuelven.' },
                        { title: 'El precio', black: true, text: 'Los treinta mil de la fila se quedan de este lado, con sus familias inventadas y sus galerías.' },
                        { title: 'El precio', black: true, doc: 'Reasignaciones · Talok', text: 'Los traslados a Prisiat se reanudan el lunes. Talok vuelve a firmar.\nRetorno previsto: —' },
                        { title: 'La lista', black: true, doc: 'Pasillo central', text: 'La lista se queda en la pared. Nadie tacha ningún nombre.\n{lista}' },
                        ...AFTER,
                        { title: 'El ciclo', shot: 'mirror', text: 'Cerrar la puerta no la destruye. En Zhyr emerge un segundo monolito con los símbolos invertidos. Dentro, como en ámbar, Alexia y Leina, con los ojos abiertos.' },
                        { title: 'El ciclo', black: true, doc: 'AITOR', text: 'En Prisiat la palabra sigue apareciendo, grabada en planchas de almacenes cerrados.' },
                        { title: '', black: true, clock: true, text: 'No abras. El que abre ya no…' },
                        { title: '', black: true, text: 'FIN' }
                    ]
                },
                caos: {
                    summary: 'El portal sigue abierto. Siguen cruzando. Siguen sonriendo.',
                    pages: [
                        // La pradera: cada página cambia una sola cosa y la imagen va un paso por detrás del texto (cap. 16).
                        { title: '', shot: 'meadow', sound: 'birds', music: 0.5, text: 'El otro lado era hermoso. Olía a tierra mojada y a miel silvestre.' },
                        { title: '', shot: 'meadowWalk', sound: 'birds', music: 0.5, text: 'Desde las colinas venían figuras. Padres. Hijos. Hermanos. Gente que llevaba meses o años en una foto.' },
                        { title: '', shot: 'meadowFace', sound: 'birds', music: 0.25, text: '—Llegaste tarde.\nDarien. La chaqueta del parche en el codo. La voz exacta.' },
                        { title: '', shot: 'meadowFace', sound: 'silence', music: 0.2, text: '—Yo firmé el informe.\n—Lo sé. No fue culpa tuya.' },
                        { title: '', shot: 'meadowFace', sound: 'silence', music: 0.15, speed: 120, text: 'Lo del informe no lo sabía ¦nadie.' },
                        { title: '', shot: 'meadowStill', sound: 'drone', music: 0.15, text: 'El abrazo llevaba demasiado. El pecho no latía. Vibraba.' },
                        { title: '', shot: 'meadowFlowers', sound: 'clicks', music: 0.1, text: 'Las flores no tenían pétalos.' },
                        { title: '', shot: 'meadowSky', sound: 'heart', music: 0, text: 'El cielo no era cielo.' },
                        { title: '', shot: 'meadowFar', sound: 'silence', music: 0, speed: 70, text: 'Nadie gritaba.' },
                        { title: '', shot: 'meadowSink', sound: 'drone', music: 0, corrupt: true, text: '—Tú no eres Darien.\n—Soy todo lo que recuerdas de él. ¿No es suficiente?\n—No tengas miedo. Pronto te acostumbras.' },
                        { title: '', shot: 'meadowLoop', sound: 'birds', music: 0.5, auto: 2000, text: '—Llegaste tarde.' },
                        { title: '', shot: 'meadowLoop', sound: 'birds', music: 0.5, auto: 2000, text: 'Todo está bien.' },
                        { title: '', shot: 'meadowLoop', sound: 'birds', music: 0.5, auto: 2000, text: 'Todo está bien.' },
                        { title: '', shot: 'meadowLoop', sound: 'birds', music: 0.5, auto: 2400, text: 'Todo está biem.' },
                        { title: 'Éxodo', shot: 'exodus', text: 'Doce mil cruzan el primer día. Después dejan de contar, porque el que contaba se pone en la fila. Kamin mira desde el Bastión; bajo el esternón algo late cada diez segundos.' },
                        { title: 'Éxodo', shot: 'exodus', if: { lichesth: 'fue' }, text: 'El hombre de los once créditos con cuarenta cruza con los seis de su turno. Entran de dos en dos, cogidos de la mano.' },
                        { title: 'Éxodo', shot: 'exodus', if: { marek: 'existio' }, text: 'En una cocina de Itzinol, dos personas se ponen de acuerdo en cosas que no ocurrieron. Después se ponen en la fila.' },
                        { title: 'Éxodo', shot: 'exodus', unless: { ovid: 'entregado' }, text: 'Ovid Ferrer cruza el cuarto día, a las once y veinte. Antes de entrar contesta por fin a su madre:\n«Voy a buscar a Tessa. Cuando la encuentre volvemos las dos.»\nEl terminal marca entregado.' },
                        { title: 'Éxodo', black: true, unless: { ovid: 'entregado' }, text: 'Su madre lo lee cuatro horas más tarde, en una cocina de Dispay, y sale a la calle a buscar un transporte al norte.' },
                        { title: 'Éxodo', shot: 'exodus', unless: { tobi: 'entregado' }, text: 'Tobi Arren cruza el sexto día. No busca a nadie: quiere saber quién canta en la galería vacía. Antes de entrar tira la carta de los cuatrocientos seis años. Alguien la recoge creyendo que es una lista de nombres.' },
                        { title: 'Dispay', black: true, doc: 'Emisora local', text: 'Idrís Manne emite cuatro veces al día. Lee la hora, la temperatura y los nombres que la gente deja escritos en la puerta.' },
                        { title: 'Dispay', black: true, doc: 'Emisora local · día 21', speed: 40, text: 'El día veintiuno lee la lista entera.\n{lista}\nDice que mañana volverá a la misma hora. Corta.' },
                        { title: 'Dispay', black: true, text: 'Tres meses después alguien encuentra el equipo encendido, con el micrófono abierto y la silla apartada de la mesa.' },
                        { title: 'Éxodo', shot: 'exodus', unless: { serafin: 'entregado' }, text: 'Serafín Duq no cruza. La fila pasa seis días por delante de su caja de herramientas. Si ella sale y él no está, no va a saber dónde buscarlo.' },
                        { title: 'Éxodo', black: true, unless: { serafin: 'entregado' }, text: 'El séptimo día ya no pasa nadie por delante.\nSerafín sigue sentado.' },
                        ...AFTER,
                        { title: 'El ciclo', shot: 'mirrorVoid', text: 'En Zhyr emerge un segundo monolito. Dentro, como en ámbar, Alexia y Leina, con los ojos abiertos. Sonríen. Mucho después, una nave baja a un páramo violáceo marcado con una palabra: AITOR.' },
                        { title: '', black: true, clock: true, text: 'No abras. El que abre ya no…' },
                        { title: '', black: true, text: 'FIN' }
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
