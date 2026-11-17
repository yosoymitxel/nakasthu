/**
 * LORECHARACTERSCONFIG.JS
 * Configuración centralizada de personajes "Motor del Lore" (inmunes a sacrificio).
 * Regla: Los personajes clave del libro/canon no pueden ser purgados ni sacrificados
 * como biomasa descartable; poseen animaciones especiales, opciones distintas y
 * validación prioritaria.
 */

export const LORE_CORE_CHARACTERS = {
    'KAEL': {
        loreKey: 'KAEL',
        species: 'HUMANO',
        canonicalRole: 'EXPLORADOR',
        name: 'Kael',
        title: 'Superviviente de la Expedición a Zhyr',
        theme: 'cyan',
        glowColor: '#06b6d4',
        badge: 'MOTOR DEL LORE: KAEL',
        roleDescription: 'Diecinueve años en la Custodia. Volvió de Zhyr sin Alexia. Celda de cuarentena, seis por cuatro; sueña a las 03:17.',
        canSacrifice: false,
        blockedSacrificeLabel: 'ERR: PROTEGIDO [Kael]',
        blockedSacrificeMsg: '>>> ERROR DE SISTEMA: PROTOCOLO DE SACRIFICIO ANULADO. Kael es testigo de la expedición a Zhyr. La Custodia no ha cerrado su expediente.',
        authorizeLabel: 'AUTORIZAR ENLACE [Kael]',
        authorizeSuccessMsg: '[NAKASTHU] ENLACE AUTORIZADO: Datos de la expedición de Kael sincronizados con el núcleo.',
        borderClass: 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]',
        auraColor: 'rgba(6, 182, 212, 0.25)',
        pulseClass: 'animate-pulse'
    },
    'DEYAR': {
        loreKey: 'DEYAR',
        species: 'HUMANO',
        canonicalRole: 'TÉCNICO',
        name: 'Deyar',
        title: 'Técnico de Drones (Expedición)',
        theme: 'amber',
        glowColor: '#f59e0b',
        badge: 'MOTOR DEL LORE: DEYAR',
        roleDescription: 'Técnico de la expedición. Su dron, Piedad, cayó entero junto a la piedra: los sensores se apagaron de atrás hacia delante.',
        canSacrifice: false,
        blockedSacrificeLabel: 'ERR: CUSTODIO [Deyar]',
        blockedSacrificeMsg: '>>> ERROR DE SISTEMA: PROTOCOLO DE SACRIFICIO ANULADO. Deyar almacena los registros de telemetría del primer contacto.',
        authorizeLabel: 'PRESERVAR REGISTRO [Deyar]',
        authorizeSuccessMsg: '[NAKASTHU] ENLACE AUTORIZADO: Registros de telemetría de Deyar preservados en el archivo.',
        borderClass: 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]',
        auraColor: 'rgba(245, 158, 11, 0.25)',
        pulseClass: 'animate-pulse'
    },
    'ALEXIA': {
        loreKey: 'ALEXIA',
        species: 'HUMANO',
        canonicalRole: 'SIMBOLOGISTA',
        name: 'Alexia',
        title: 'Simbóloga de la Expedición',
        theme: 'purple',
        glowColor: '#c084fc',
        badge: 'PRIMER VÍNCULO: ALEXIA',
        roleDescription: 'Simbóloga de la Custodia. Tocó la piedra el tercer día y no quedó nada. Apuntaba en papel lo que el registro no medía.',
        canSacrifice: false,
        blockedSacrificeLabel: 'INMUNIDAD CUÁNTICA',
        blockedSacrificeMsg: '>>> ANOMALÍA: INMUNIDAD CUÁNTICA. Alexia no posee biomasa corpórea sacrificable; es la interfaz entre el Monolito y el Bastión.',
        authorizeLabel: 'SINCRONIZAR VÍNCULO [Alexia]',
        authorizeSuccessMsg: '[NAKASTHU] SINCRONIZACIÓN CUÁNTICA: Frecuencia de Alexia estabilizada en el circuito neural.',
        borderClass: 'border-purple-400 shadow-[0_0_35px_rgba(192,132,252,0.45)]',
        auraColor: 'rgba(192, 132, 252, 0.3)',
        pulseClass: 'animate-pulse'
    },
    'KAMIN': {
        loreKey: 'KAMIN',
        species: 'HUMANO',
        canonicalRole: 'PROFETA',
        name: 'Kamin',
        title: 'Fundador de la Orden del Renacimiento Lumínico',
        theme: 'purple',
        glowColor: '#9333ea',
        badge: 'LA ORDEN: KAMIN',
        roleDescription: 'Predicador en Prisiat; en Kanatsia cobraba doce créditos por sesión. Funda la Orden en el Bastión. Un geólogo con su nombre murió en Zhyr hace quince años.',
        canSacrifice: false,
        blockedSacrificeLabel: 'ERR: OVERRIDE [Kamin]',
        blockedSacrificeMsg: '>>> ERROR: PROTOCOLO DE SACRIFICIO BLOQUEADO POR KAMIN. La fe no puede ser purgada.',
        authorizeLabel: 'CONSAGRAR PROFETA [Kamin]',
        authorizeSuccessMsg: '[NAKASTHU] CONSAGRACIÓN EFECTUADA: La llamada de Kamin resuena en los distritos.',
        borderClass: 'border-purple-600 shadow-[0_0_40px_rgba(147,51,234,0.5)]',
        auraColor: 'rgba(147, 51, 234, 0.35)',
        pulseClass: 'animate-pulse'
    },
    'ORVAL D.': {
        loreKey: 'ORVAL D.',
        species: 'HUMANO',
        canonicalRole: 'LÍDER',
        name: 'Orval Drexler',
        title: 'Jefe del Gobierno de Talok',
        theme: 'cyan',
        glowColor: '#0ea5e9',
        badge: 'DIRECTIVA SUPREMA: DREXLER',
        roleDescription: 'Gobierna desde Talok. Nunca sube la voz. Firma las reasignaciones y quiere saber si la piedra se puede ajustar.',
        canSacrifice: false,
        blockedSacrificeLabel: 'ACCESO DENEGADO [Drexler]',
        blockedSacrificeMsg: '>>> ALERTA DE SEGURIDAD: ACCESO DENEGADO. Intento de sacrificar al Director Drexler archivado como insubordinación crítica.',
        authorizeLabel: 'ACATAR DIRECTIVA [Drexler]',
        authorizeSuccessMsg: '[NAKASTHU] DIRECTIVA ACATADA: Autoridad técnica de Talok ratificada.',
        borderClass: 'border-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.4)]',
        auraColor: 'rgba(14, 165, 233, 0.25)',
        pulseClass: 'animate-pulse'
    },
    'LEINA': {
        loreKey: 'LEINA',
        species: 'HUMANO',
        canonicalRole: 'OPERADORA',
        name: 'Leina Karst',
        title: 'Ingeniera del Bastión',
        theme: 'emerald',
        glowColor: '#10b981',
        badge: 'INGENIERA: LEINA',
        roleDescription: 'Ingeniera, antes en mantenimiento de Eidolon. Vio AITOR en un monitor tres meses antes del tercio. Abre el portal.',
        canSacrifice: false,
        blockedSacrificeLabel: 'FIRMA RESIDUAL [Leina]',
        blockedSacrificeMsg: '>>> AVISO DE SISTEMA: Leina Karst figura como personal técnico imprescindible. Sacrificio denegado.',
        authorizeLabel: 'INTEGRAR HUELLA [Leina]',
        authorizeSuccessMsg: '[NAKASTHU] HUELLA INTEGRADA: Código de la Operadora Leina asimilado en la consola.',
        borderClass: 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]',
        auraColor: 'rgba(16, 185, 129, 0.25)',
        pulseClass: 'animate-pulse'
    },
    'ELARA': {
        loreKey: 'ELARA',
        species: 'HUMANO',
        canonicalRole: 'OPERADORA',
        name: 'Elara',
        title: 'Operadora de Conformado (Dispay)',
        theme: 'cyan',
        glowColor: '#22d3ee',
        badge: 'INFORMANTE CLAVE: ELARA',
        roleDescription: 'Treinta y un años, planta de conformado de Dispay. Cree que el tercio es un experimento de la Custodia. Deja de presentarse al turno.',
        canSacrifice: false,
        blockedSacrificeLabel: 'ERR: PROTEGIDA [Elara]',
        blockedSacrificeMsg: '>>> ERROR: Operadora Elara requerida en la planta de conformado de Dispay.',
        authorizeLabel: 'CONCEDER PASO [Elara]',
        authorizeSuccessMsg: '[NAKASTHU] ENLACE CONCEDIDO: Operadora Elara reasignada a canal seguro.',
        borderClass: 'border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)]',
        auraColor: 'rgba(34, 211, 238, 0.25)',
        pulseClass: 'animate-pulse'
    },
    'NAKASTHU': {
        loreKey: 'NAKASTHU',
        species: 'EIDOLON',
        canonicalRole: 'SISTEMA',
        name: 'NAKASTHU OS',
        title: 'Conciencia del Núcleo',
        theme: 'red',
        glowColor: '#ef4444',
        badge: 'KERNEL DEL SISTEMA: NAKASTHU',
        roleDescription: 'La propia inteligencia del sistema manifestándose en la consola.',
        canSacrifice: false,
        blockedSacrificeLabel: 'PARADOJA CRÍTICA',
        blockedSacrificeMsg: '>>> PARADOJA DEL SISTEMA: No es posible ejecutar purga sobre el entorno de ejecución activo.',
        authorizeLabel: 'UNIFICAR KERNEL',
        authorizeSuccessMsg: '[NAKASTHU] UNIFICACIÓN COMPLETADA: Operador y Sistema ahora comparten el mismo hilo de ejecución.',
        borderClass: 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]',
        auraColor: 'rgba(239, 68, 68, 0.35)',
        pulseClass: 'animate-pulse'
    }
};

/**
 * Busca si un ID o nombre corresponde a un personaje motor del lore.
 */
export const findLoreCharacter = (id, name = '') => {
    if (!id && !name) return null;
    const str = `${id || ''} ${name || ''}`.toUpperCase();

    if (str.includes('KAEL')) return LORE_CORE_CHARACTERS['KAEL'];
    if (str.includes('DEYAR')) return LORE_CORE_CHARACTERS['DEYAR'];
    if (str.includes('ALEXIA')) return LORE_CORE_CHARACTERS['ALEXIA'];
    if (str.includes('KAMIN')) return LORE_CORE_CHARACTERS['KAMIN'];
    if (str.includes('DREXLER') || str.includes('ORVAL')) return LORE_CORE_CHARACTERS['ORVAL D.'];
    if (str.includes('LEINA')) return LORE_CORE_CHARACTERS['LEINA'];
    if (str.includes('ELARA')) return LORE_CORE_CHARACTERS['ELARA'];
    if (str.includes('NAKASTHU') || str.includes('ARQUITECTO')) return LORE_CORE_CHARACTERS['NAKASTHU'];

    return null;
};
