/**
 * ACHIEVEMENTS.JS
 * Registro único de logros. Cada uno se otorga en un solo sitio: src/systems/Achievements.js.
 * Reglas: se consiguen jugando, sin pura suerte, nunca se pierden para siempre y dicen qué hacer
 * (salvo los secretos, que lo dicen al desbloquearse).
 */
export const ACHIEVEMENT_GROUPS = [
    { id: 'aprender', name: 'Inducción' },
    { id: 'dominar', name: 'Pericia' },
    { id: 'recorrer', name: 'Servicio' },
    { id: 'descubrir', name: 'Clasificado' }
];

export const ACHIEVEMENTS = [
    { id: 'primer_escaneo', group: 'aprender', name: 'Primera lectura', desc: 'Completa tu primer escaneo.' },
    { id: 'primer_enlace', group: 'aprender', name: 'Enlace neural', desc: 'Interroga a un sujeto.' },
    { id: 'primer_veredicto', group: 'aprender', name: 'Firma y sello', desc: 'Dicta tu primera sentencia.' },
    { id: 'crisis_resuelta', group: 'aprender', name: 'Bajo presión', desc: 'Resuelve una emergencia en la consola.' },

    { id: 'turno_limpio', group: 'dominar', name: 'Turno limpio', desc: 'Cumple una cuota sin errores de juicio.' },
    { id: 'ojo_clinico', group: 'dominar', name: 'Ojo clínico', desc: 'Dicta 8 sentencias seguidas sin error.' },
    { id: 'sin_preguntas', group: 'dominar', name: 'Sin preguntas', desc: 'Cumple una cuota sin interrogar a nadie.' },

    { id: 'rutina', group: 'recorrer', name: 'Rutina', desc: 'Procesa 25 sujetos.', stat: 'processed', goal: 25 },
    { id: 'engranaje', group: 'recorrer', name: 'Engranaje', desc: 'Procesa 100 sujetos.', stat: 'processed', goal: 100 },
    { id: 'archivista', group: 'recorrer', name: 'Archivista', desc: 'Desbloquea 10 registros del archivo.', stat: 'lore', goal: 10 },
    { id: 'final_orden', group: 'recorrer', name: 'El mundo real', desc: 'Llega al final del Orden.' },
    { id: 'final_caos', group: 'recorrer', name: 'Renacimiento', desc: 'Llega al final de la Trascendencia.' },

    { id: 'mensajero', group: 'descubrir', name: 'El mensajero', desc: 'Dejaste pasar a Kamin.', secret: true },
    { id: 'bucle', group: 'descubrir', name: 'El bucle', desc: 'Procesaste 30 sujetos en el modo infinito.', secret: true }
];
