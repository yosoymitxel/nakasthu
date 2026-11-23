/**
 * INTERLUDES.JS
 * Escenas jugables dentro de una cinemática (página con `play`). Sólo datos; la lógica en systems/Interludes.js.
 */

// Cinemática 7 (cap. 7): Leina a los dieciocho años, doce informes al día. El séptimo es la galería siete.
export const REPORTS = {
    head: 'Prisiat · hace ocho años',
    intro: 'Leina Karst, dieciocho años, primer contrato en una subcontrata. Doce informes estructurales al día: lectura, sello y firma. Va con retraso.',
    seconds: 18,
    clock: 'El mensajero pasa en',
    body: 'Sostenimiento: conforme. Filtraciones: dentro de margen. Grietas en hastial: sin cambios desde la última inspección. Recomendación: continuar explotación.',
    items: [
        { where: 'Galería dos · nivel −80', day: 'Lunes, 10 de marzo' },
        { where: 'Pozo norte · nivel −120', day: 'Lunes, 10 de marzo' },
        { where: 'Galería cuatro · nivel −140', day: 'Lunes, 10 de marzo' },
        { where: 'Rampa tres · nivel −60', day: 'Martes, 11 de marzo' },
        { where: 'Galería once · nivel −180', day: 'Martes, 11 de marzo' },
        { where: 'Galería cinco · nivel −160', day: 'Martes, 11 de marzo' },
        { where: 'Galería siete · nivel −200', day: 'Martes, 11 de marzo', seven: true },
        { where: 'Galería ocho · nivel −200', day: 'Martes, 11 de marzo' },
        { where: 'Pozo sur · nivel −100', day: 'Martes, 11 de marzo' },
        { where: 'Galería tres · nivel −120', day: 'Martes, 11 de marzo' },
        { where: 'Galería nueve · nivel −220', day: 'Martes, 11 de marzo' },
        { where: 'Rampa uno · nivel −40', day: 'Martes, 11 de marzo' }
    ],
    // Cierre según lo que hizo el jugador con el séptimo
    unread: 'Lo firmó sin leerlo. Iba con retraso y todos los informes decían lo mismo.',
    read: 'El de la galería siete no decía nada raro. Lo comprobó ella después, cuando ya podía comprobarlo, y era verdad.',
    timeout: 'El mensajero se lleva la bandeja. Los que faltaban los sella el supervisor, con la firma de ella.'
};

// Paso 10 (cap. 11): el buscador público del paquete de Eidolon. `keys`: palabras que lo encuentran (sin tildes).
export const EIDOLON = {
    head: 'Proyecto Pureza · buscador público',
    intro: 'Cuatrocientos mil documentos. Alguien montó el buscador en cuatro horas; a las seis lo usaban doscientos millones de personas. Escribe un nombre.',
    suggestions: ['Marek', 'Elara Voss', 'Darien Karst', 'Kamin', 'Alexia'],
    records: [
        { keys: ['marek'], lines: ['Marek. Nueve años. Itzinol. Meningitis.', 'Ficha completa, historial médico, certificado de defunción.', 'Fotografía generada: plantilla del bloque 4-C.', 'Etiqueta: estabilizador familiar, lote 118.'] },
        { keys: ['elara', 'voss'], lines: ['Dos fichas con este nombre.', 'Voss, Elara. Treinta y un años. Operadora de conformado, Dispay. Sin lote.', 'Voss, Elara. Diez años. Talok. Carpeta de descartes.'] },
        { keys: ['darien'], lines: ['Karst, Darien. Minero, Prisiat. Fallecido.', 'Derrumbe de la galería siete: veintiséis nombres.', 'Informe estructural previo sellado por: K., L.'] },
        { keys: ['kamin'], lines: ['Kamin, A. Geólogo de campo, grado dos. Directiva.', 'Expedición a Zhyr. Fallecido en servicio hace quince años. Restos no recuperados.'] },
        { keys: ['alexia'], lines: ['Sin coincidencias.', 'Custodia, expedición a Zhyr. Tripulantes: 2.'] },
        { keys: ['leina'], lines: ['Karst, Leina. Ingeniera de sistemas, Eidolon.', 'Salida firmada con su nombre real.'] },
        { keys: ['tessa', 'ferrer', 'ovid'], lines: ['Ferrer, Tessa. Diecinueve años. Dispay. Sin lote.', 'Ferrer, Ovid. Veintidós años. Sin lote.'] },
        { keys: ['petro', 'ilm'], lines: ['Ilm, Petro. Veinte años. Zhyr. Sin lote.', 'Indemnización aceptada por defecto a los treinta días.'] },
        { keys: ['tobi', 'arren'], lines: ['Arren, Tobi. Prisiat. Sin lote.', 'Deuda con la Distribución: cuatrocientos seis años de trabajo.'] },
        { keys: ['okonjo', 'nera'], lines: ['Okonjo: tres fichas. Ninguna en lote.'] },
        { keys: ['toren'], lines: ['Sin coincidencias en lotes.', 'Una mujer y dos hijos con su apellido, mismo domicilio, misma noche.'] }
    ],
    // Cualquier otro nombre: uno de cada cuatro sale en un lote, como en el paquete
    lot: 'Una ficha en lote {lote}, plantilla {plantilla}. Etiqueta: estabilizador familiar.',
    none: 'Sin coincidencias en lotes. La persona existió.',
    mine: 'Pasó por tu mesa.',
    close: 'Cerrar el buscador'
};
