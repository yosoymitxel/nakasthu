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
        title: 'Líder de la Expedición a Zhyr',
        theme: 'cyan',
        glowColor: '#06b6d4',
        badge: 'MOTOR DEL LORE: KAEL',
        roleDescription: 'Líder de la primera expedición a Zhyr. Clave en el descubrimiento del Monolito.',
        canSacrifice: false,
        blockedSacrificeLabel: 'ERR: PROTEGIDO [Kael]',
        blockedSacrificeMsg: '>>> ERROR DE SISTEMA: PROTOCOLO DE SACRIFICIO ANULADO. Kael es el líder de la expedición a Zhyr. Su destino está fijado en el Monolito.',
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
        title: 'Técnico de Telemetría (Expedición)',
        theme: 'amber',
        glowColor: '#f59e0b',
        badge: 'MOTOR DEL LORE: DEYAR',
        roleDescription: 'Operador de dron y técnico de la expedición. Custodio de las primeras lecturas de 14Hz.',
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
        title: 'Primer Vínculo / Eco de Zhyr',
        theme: 'purple',
        glowColor: '#c084fc',
        badge: 'PRIMER VÍNCULO: ALEXIA',
        roleDescription: 'Simbologista de la expedición. Primera en tocar el Monolito. Puente cuántico con Zhyr.',
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
        title: 'Profeta de la Orden de los Vínculos',
        theme: 'purple',
        glowColor: '#9333ea',
        badge: 'PROFETA DE ZHYR: KAMIN',
        roleDescription: 'Voz del Renacimiento y mensajero de Zhyr. Conductor del solapamiento dimensional.',
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
        title: 'Director del Régimen Técnico (Talok)',
        theme: 'cyan',
        glowColor: '#0ea5e9',
        badge: 'DIRECTIVA SUPREMA: DREXLER',
        roleDescription: 'Supervisor supremo del Bastión y comandante de Talok.',
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
        title: 'Operadora Precursora',
        theme: 'emerald',
        glowColor: '#10b981',
        badge: 'PRECURSORA: LEINA',
        roleDescription: 'Operadora anterior del Bastión. Su conciencia aún orbita la terminal.',
        canSacrifice: false,
        blockedSacrificeLabel: 'FIRMA RESIDUAL [Leina]',
        blockedSacrificeMsg: '>>> AVISO DE SISTEMA: Leina Karst ya fue procesada históricamente. Su firma residual no puede ser sacrificada.',
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
        title: 'Operadora de Comunicaciones',
        theme: 'cyan',
        glowColor: '#22d3ee',
        badge: 'INFORMANTE CLAVE: ELARA',
        roleDescription: 'Operadora de la Orden y canal de noticias de las Distribuciones.',
        canSacrifice: false,
        blockedSacrificeLabel: 'ERR: PROTEGIDA [Elara]',
        blockedSacrificeMsg: '>>> ERROR: Operadora Elara requerida para el mantenimiento del enlace de comunicaciones.',
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
