/**
 * KAMINREGISTER.JS
 * Registro: Kamin (MOD-08). Cómo pasa de un hombre que escucha en una taberna a convencer a todos (C.3).
 * Cada escalón se escribe solo al llegar a su paso (`step`) y, dentro de un turno, cuando la cola pasa
 * de `at` sujetos procesados. `faithful`: fieles en ese momento (null = no cambia).
 */
export const KAMIN_REGISTER = [
    { step: 6, at: 6, faithful: 1, technique: 'Escucha sin interrumpir', scene: 'Taberna de Lichesth. Un minero le cuenta la factura del filtro de su hijo muerto: once créditos con cuarenta. Kamin le pone la mano en el antebrazo.' },
    { step: 7, faithful: 7, technique: 'Nadie lo trae: lo traen', scene: 'A la semana siguiente, el minero vuelve con dos amigos. A la otra, con seis.' },
    { step: 7, faithful: 200, technique: 'No señala el prodigio', scene: 'Tarima. Las doce lámparas parpadean: tres, dos, cinco. Retoma la frase como tras un ruido de tráfico.' },
    { step: 7, faithful: 400, technique: 'Confiesa antes de que se lo saquen', scene: '«Cobraba. Doce créditos por sesión.»' },
    { step: 8, faithful: 1200, technique: 'Datos buenos, cuentas limpias', scene: 'Diagramas en la pared del hangar. Leina revisa los libros: el noventa y uno por ciento llega a donde dicen. Se siente mezquina.' },
    { step: 8, faithful: null, technique: 'Orden y rutina, no fe', scene: 'Capas, cantos, música los sábados. «Mientras canto no pienso.»' },
    { step: 8, at: 3, faithful: null, technique: 'Mide la máquina', scene: 'Te pregunta cuántas personas caben por hora.' },
    { step: 8, at: 7, faithful: null, technique: 'Mide a Leina', scene: '«¿El aparato puede funcionar sin ti?» Leina dice que sí.' },
    { step: 9, faithful: null, technique: 'Se hace vulnerable', scene: 'Cuatro días después: «Yo también perdí a alguien en Zhyr. Mi hermano. Llevaba puesta su piel».' },
    { step: 9, faithful: 6000, technique: 'Alguien paga', scene: 'Toren baja al altar. La ceniza forma cinco trazos.' },
    { step: 9, faithful: null, technique: 'La prueba', scene: 'El portal abre. Salen cuarenta y seis.' },
    { step: 10, faithful: 31000, technique: 'El enemigo le da la razón', scene: 'Eidolon: «Lo dijo hace ocho meses y os reíais».' },
    { step: 10, at: 3, faithful: null, technique: 'El embudo', scene: 'Cada medida del cerco empuja a más gente dentro. Él no tiene que hacer nada.' },
    { step: 11, faithful: null, technique: 'Los otros caen solos', scene: 'Verificación. Talok entra en el Bastión y sus líderes no salen. Treinta mil lo ven desde el patio.' },
    { step: 11, faithful: null, technique: 'Pide el conocimiento', scene: '«Hazla otra vez. Enséñamelo. Por si te pasa algo.»' },
    { step: 12, faithful: null, technique: 'Ya no habla', scene: 'Mira desde el Bastión. Dejaron de contar.' }
];
