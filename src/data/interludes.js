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
