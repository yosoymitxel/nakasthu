/**
 * GAMECONFIG.JS
 * Configuración centralizada del sistema NAKASTHU.
 * Permite ajustes rápidos de balance y mecánicas.
 */

export const CONFIG = {
    ENERGY: {
        INITIAL: 100,
        MAX: 100,
        AUTHORIZE_COST: 5,
        SACRIFICE_CORRUPT_BONUS: 20,
        SACRIFICE_INOCENT_BONUS: 5,
        TICK_DRAIN: 0.5,
        ECLIPSE_DRAIN: 1.0,
        REPAIR_COST: 10
    },
    STABILITY: {
        INITIAL: 100,
        MAX: 100,
        AUTHORIZE_CORRUPT_PENALTY: 25,
        SACRIFICE_INOCENT_PENALTY: 20,
        RESONANCE_LOW_PENALTY: 0.05,
        RESONANCE_HIGH_BONUS: 0.02
    },
    SCANNER: {
        TYPES: {
            THERMAL: { id: 'THERMAL', name: 'TÉRMICO', cost: 0.5, duration: 2000 },
            NEURAL: { id: 'NEURAL', name: 'NEURAL', cost: 1, duration: 4000 },
            NAKARA: { id: 'NAKARA', name: 'SONDA NAKARA', cost: 2, duration: 6000 },
            BIOMETRIC: { id: 'BIOMETRIC', name: 'BIO-MÉTRICO', cost: 0.5, duration: 2500 },
            RESONANCE: { id: 'RESONANCE', name: 'RESONANCIA', cost: 1, duration: 5000 }
        },
        REPETITION_PENALTY: 0.5, // +50% por cada repetición
        SYNC_BONUS_MAX: 0.5,     // -50% duración con 100% sincronía
        SCAN_INTERVAL: 100       // ms entre ticks de progreso
    },
    RESONANCE: {
        SYNC_GAIN: 10,
        SYNC_LOSS: 5,
        SYNC_DECAY: 0.1,
        CRITICAL_SYNC: 90,
        LOW_SYNC: 40,
        SCAN_KEYS: ['THERMAL', 'NEURAL', 'NAKARA', 'BIOMETRIC', 'RESONANCE'],
        FREQ_MIN: 0.1,
        FREQ_MAX: 60.0
    },
    DELAYS: {
        NEXT_SUBJECT: 1500,
        TRANSITION: 2000,
        GLITCH: 300
    },
    MAX_JUDGMENT_ERRORS: 3,
    DEFAULT_QUOTA: 5,
    PORTAL: {
        INITIAL_STABILITY: 100,
        DECAY_RATE: 2,
        STABILIZE_AMOUNT: 10,
        STABILIZE_COST: 5,
        ANOMALY_THRESHOLD: 30,
        ANOMALY_CHANCE: 0.3,
        ANOMALY_DAMAGE: 15
    },
    UNREST: {
        INITIAL: 0,
        MAX: 100,
        SACRIFICE_INOCENT_INCREASE: 10,
        AUTHORIZE_CORRUPT_INCREASE: 15,
        AUTHORIZE_INOCENT_DECREASE: 5,
        SABOTAGE_INCREASE: 20,
        RIOT_THRESHOLD: 80,
        RIOT_CHANCE: 0.3,
        RIOT_DAMAGE: 10,
        LEVELS: {
            CALM: { threshold: 0, label: 'CALMA', color: '#10b981' },
            TENSION: { threshold: 40, label: 'TENSIÓN', color: '#f59e0b' },
            CRITICAL: { threshold: 80, label: 'DISTURBIOS', color: '#ef4444' }
        }
    },
    ORBITAL: {
        NORMAL_STEP: 1,
        ECLIPSE_STEP: 2,
        ECLIPSE_DURATION: 60,
        MAX_CYCLE: 100
    },
    SYSTEM: {
        ENERGY_WARNING_THRESHOLD: 20,
        STABILITY_WARNING_THRESHOLD: 20,
        OXYGEN_DRAIN: 0.05
    },
    JUDGMENT: {
        MAX_TECH: 16,
        MAX_FAITH: 20,
        WEIGHT_TECH: 0.7,
        WEIGHT_FAITH: 0.3
    },
    MODULES: {
        BIOSCAN: 'MOD-01',
        COMMS: 'MOD-05',
        RESONANCE: 'MOD-06',
        OPERATIONS: 'MOD-04',
        TERMINAL: 'MOD-09'
    },
    UI: {
        NARRATIVE_FRAGMENTS: {
            drexler: [
                '"La distracción es un lujo que no podemos permitirnos. Cada sujeto procesado es un paso hacia la estabilidad." — Orval Drexler',
                '"El monolito es la clave, y Talok lo reclamará antes que nadie. No habrá interferencias." — Orval Drexler',
                '"El caos es útil. Deja que griten, que se desahoguen. Cuando estén cansados, vendrán a nosotros." — Orval Drexler',
                '"No subestimen a Kamin. Es más que un fanático. Sabe manipular a las masas." — Orval Drexler'
            ],
            kamin: [
                '"El portal no es solo una puerta; es un espejo. Nos refleja lo que hemos ignorado." — Kamin, Mensajero de Aitor',
                '"La verdad siempre cuesta caro. Pero vale la pena pagar el precio." — Kamin',
                '"Nos han mentido durante meses. La respuesta no está en sus tecnologías vacías." — Kamin',
                '"Hay algo allí. Observándonos. El Renacimiento está cerca." — Kamin'
            ],
            sistema: [
                '>>> ALERTA: Desviación detectada en patrones neurales de la población.',
                '>>> INFORME: Protestas en aumento. Índice de estabilidad: CRÍTICO.',
                '>>> REGISTRO: Sujeto #7 presenta anomalías incompatibles con protocolo estándar.',
                '>>> ADVERTENCIA: Interferencia del Eidolon detectada en subsistema de decisiones.'
            ]
        },
        AREA_TO_MODULE: {
            'L_UPPER': 'MOD-01', // BIOSCAN
            'L_LOWER': 'MOD-02', // ANALYTICS
            'C_FOOTER': 'MOD-06', // RESONANCE
            'C_MAIN': 'MOD-04', // OPERATIONS
            'R_UPPER': 'MOD-03', // LORE_ARCHIVE
            'R_TOP': 'MOD-07', // QUOTA_TRACKER
            'R_MIDDLE_TECH': 'MOD-09', // Terminal (Técnico)
            'R_MIDDLE_SECT': 'MOD-08', // Faction System (Sectario)
            'R_BOTTOM': 'MOD-10', // UNREST_METER
            'L_BOTTOM': 'MOD-11'  // PORTAL_MONITOR
        },
        MOD_MAP: {
            'MOD-01': 'L_UPPER',   // BioScan
            'MOD-02': 'L_LOWER',   // Analytics
            'MOD-03': 'R_UPPER',   // Lore Archive
            'MOD-04': 'C_MAIN',    // Operations
            'MOD-05': 'C_MAIN',    // Comms (Integrated)
            'MOD-06': 'C_FOOTER',  // Resonance
            'MOD-07': 'R_TOP',     // Quota Tracker / Control
            'MOD-08': 'R_MIDDLE',  // Faction System (Sectario)
            'MOD-09': 'R_MIDDLE',  // Terminal (Técnico)
            'MOD-10': 'R_BOTTOM',  // Unrest Meter
            'MOD-11': 'L_BOTTOM'   // Portal Monitor
        },
        LABELS: {
            0: { // Ruta Técnico/Operador
                action1: 'Mano de Obra',
                action2: 'Filtración Química',
                action3: 'Autorizar',
                rejectLabel: 'Sacrificar',
                utilityLabel: 'Utilidad Técnica',
                themeColor: 'cyan',
                scans: {
                    THERMAL: 'TÉRMICO',
                    NEURAL: 'NEURAL',
                    NAKARA: 'SONDA NAKARA',
                    BIOMETRIC: 'BIO-MÉTRICO',
                    RESONANCE: 'RESONANCIA'
                },
                terminal: {
                    header: 'TERMINAL_STATUS: ACTIVE',
                    version: 'ZHYR_OS v4.0.1',
                    welcome: 'ZHYR_OS v4.0.1 INITIALIZED...',
                    reset: 'REINICIANDO TERMINAL... ESPERANDO NUEVA CONEXIÓN.',
                    clear: 'CONSOLE CLEARED.',
                    placeholder: 'esperando comando...',
                    paused: 'sistema pausado...',
                    tutorial: 'bloqueo de inducción activo...'
                },
                factions: {
                    order: '[ORDEN]',
                    chaos: '[CAOS]',
                    statusLabel: 'Dominancia_Actual',
                    descriptions: {
                        order: 'Las máquinas rugen con precisión técnica. La eficiencia es ley.',
                        chaos: 'El incienso nubla los sensores. La fe consume la lógica del sistema.',
                        neutral: 'El equilibrio se mantiene. Por ahora.'
                    }
                },
                operations: {
                    quotaLabel: 'QUOTA_RECOVERY',
                    errorLabel: 'ERR',
                    interrogateBtn: 'INICIAR ENLACE NEURAL [INTERROGAR]',
                    interrogateEnd: 'TERMINAR INTERROGATORIO',
                    waitingSubject: 'Sujeto en espera de interacción...',
                    pendingValidation: 'AUTORIZACIÓN PENDIENTE DE VALIDACIÓN BIOMÉTRICA',
                    scanRequired: 'SE REQUIERE ESCANEO',
                    systemSender: 'SISTEMA',
                    operatorSender: 'OPERADOR',
                    subjectSender: 'SUJETO',
                    newSubjectMsg: 'NUEVO SUJETO DETECTADO EN CÁMARA.',
                    anomalyMsg: '>>> ALERTA: ANOMALÍA EN PROTOCOLO DE DECISIÓN. OVERRIDE DETECTADO.',
                    linkClosedMsg: 'ENLACE NEURAL CERRADO.',
                    energyErrorMsg: '[CRÍTICO] Energía insuficiente para iniciar enlace.',
                    noSubjectMsg: 'ERROR: NO HAY SUJETO EN CÁMARA PARA PROCESAR.',
                    overrideBlockedMsg: 'CRITICAL_ERROR: OVERRIDE BY EIDOLON - ACCIÓN BLOQUEADA',
                    receivingMsg: 'RECIBIENDO TRANSMISIÓN...'
                },
                analytics: {
                    header: 'MOD-02: DATA_ANALYTICS',
                    probabilityLabel: 'Probabilidad_Corrupción',
                    logLabel: 'Análisis_Trazas_Log',
                    traceActive: 'NEURAL_TRACE_ACTIVE',
                    invokingTrace: 'INICIANDO_ANALÍTICA',
                    linkActive: 'ENLACE_NEURAL_ACTIVO',
                    monitoring: 'MONITORIZANDO_RESPUESTAS_VOCALES',
                    statusLabel: 'PROCESADOR:',
                    active: 'ACTIVO',
                    ready: 'LISTO',
                    warn: 'ESTABILIDAD_BAJA',
                    nominal: 'SISTEMA_NOMINAL',
                    CONSTANTS: {
                        UNSTABLE_THRESHOLD: 40,
                        PROB_CRITICAL: 70,
                        PROB_WARNING: 35,
                        TRANSITION_MS: 1500
                    },
                    results: {
                        BIOMETRIC: 'TEMP: {val}°C',
                        NEURAL: 'SYNC: {val}%',
                        THERMAL: 'HEAT_SIG: {val}λ',
                        NAKARA: 'VOID_DEPTH: {val}m',
                        RESONANCE: 'FREQ: {val}Hz',
                        DEFAULT: 'DATA_RECOVERY: SUCCESS'
                    }
                },
                controlPanel: {
                    title: 'Centro de Control',
                    status: 'Link_Active',
                    manualTitle: 'OPERATIONAL_MANUAL',
                    skipTutorialMsg: '>>> PROTOCOLO DE INDUCCIÓN ABORTADO. CONTROL MANUAL RESTABLECIDO.',
                    manual: {
                        objective: { label: 'OBJETIVO:', text: 'Procesar biomasa según criterios de pureza.' },
                        sacrifice: { label: 'SACRIFICAR:', text: 'Elimina sujetos corruptos (+30 Energía). Error si es puro (-25 Estabilidad).' },
                        authorize: { label: 'AUTORIZAR:', text: 'Permite el paso de sujetos puros (-5 Energía, +10 Estabilidad). Error si es corrupto (-30 Estabilidad).' },
                        resonance: { label: 'RESONANCIA:', text: 'Sincroniza frecuencia y fase para evitar degradación de estabilidad.' }
                    }
                },
                specialMechanic: {
                    header: 'SINCRONIZACIÓN NEURAL',
                    instruction: '[ MANTÉN ESPACIO PARA SINCRONIZAR ]',
                    complete: '[ ENLACE ESTABLECIDO ]'
                }
            },
            1: { // Ruta Religioso/Líder
                action1: 'Devoción Total',
                action2: 'Sincronía con el Aitor',
                action3: 'Consagrar',
                rejectLabel: 'Purgar',
                utilityLabel: 'Fe Acumulada',
                themeColor: 'purple',
                scans: {
                    THERMAL: 'ALIENTO ÍGNEO',
                    NEURAL: 'PULSACIÓN DEL ALMA',
                    NAKARA: 'PROFUNDIDAD DEL VACÍO',
                    BIOMETRIC: 'RASTRO DE SANGRE',
                    RESONANCE: 'RESONANCIA ETERNA'
                },
                terminal: {
                    header: 'SINTONÍA_ESPIRITUAL: ESTABLE',
                    version: 'AITOR_VOID v1.0',
                    welcome: 'CONEXIÓN CON EL VACÍO ESTABLECIDA...',
                    reset: 'PURGANDO MEMORIA... ESPERANDO REVELACIÓN.',
                    clear: 'SANTUARIO LIMPIADO.',
                    placeholder: 'susurrando al vacío...',
                    paused: 'el tiempo se detiene...',
                    tutorial: 'el ritual requiere foco...'
                },
                factions: {
                    order: '[DOGMA]',
                    chaos: '[ÉXTASIS]',
                    statusLabel: 'Sintonía_del_Alma',
                    descriptions: {
                        order: 'El Dogma prevalece. Las plegarias son unánimes y frías.',
                        chaos: 'El Éxtasis consume la razón. La carne se funde con el vacío.',
                        neutral: 'El equilibrio se mantiene. Por ahora.'
                    }
                },
                operations: {
                    quotaLabel: 'COSECHA DE ALMAS',
                    errorLabel: 'CISMA',
                    interrogateBtn: 'INICIAR COMUNIÓN ESPIRITUAL',
                    interrogateEnd: 'FINALIZAR RITO',
                    waitingSubject: 'Alma en espera de purificación...',
                    pendingValidation: 'TRANSICIÓN PENDIENTE DE LECTURA DE AURA',
                    scanRequired: 'SE REQUIERE REVELACIÓN',
                    systemSender: 'EL_VACÍO',
                    operatorSender: 'INQUISIDOR',
                    subjectSender: 'ESENCIA',
                    newSubjectMsg: 'UNA NUEVA ESENCIA HA LLEGADO AL UMBRAL.',
                    anomalyMsg: '>>> ADVERTENCIA: INTERFERENCIA EN EL VELO.',
                    linkClosedMsg: 'COMUNIÓN FINALIZADA.',
                    scanReportMsg: '[REVELACIÓN ALMICA] {name} COMPLETADA.',
                    neuralConnectionMsg: 'ESTABLECIENDO SINTONÍA ESPIRITUAL...',
                    energyErrorMsg: '[CRÍTICO] Fe insuficiente para la comunión.',
                    noSubjectMsg: 'ERROR: EL UMBRAL SE ENCUENTRA VACÍO.',
                    overrideBlockedMsg: 'VOLUNTAD DIVINA: ACCIÓN RESTRINGIDA POR EL EIDOLON',
                    receivingMsg: 'CANALIZANDO VOZ...'
                },
                analytics: {
                    header: 'ALTAR DE VISIONES',
                    probabilityLabel: 'Pureza de la Esencia',
                    logLabel: 'Emanaciones del Velo',
                    traceActive: 'VISIÓN ACTIVA',
                    invokingTrace: 'INVOCANDO TRAZA',
                    linkActive: 'VÍNCULO ESPIRITUAL',
                    monitoring: 'Sintonizando susurros del alma',
                    statusLabel: 'ESTADO:',
                    active: 'EN RITUAL',
                    ready: 'EN ESPERA',
                    warn: 'AGITACIÓN',
                    nominal: 'ARMONÍA',
                    CONSTANTS: {
                        UNSTABLE_THRESHOLD: 40,
                        PROB_CRITICAL: 75,
                        PROB_WARNING: 40,
                        TRANSITION_MS: 1500
                    },
                    results: {
                        BIOMETRIC: 'AURA: {val}%',
                        NEURAL: 'COMUNIÓN: {val}%',
                        THERMAL: 'ALIENTO: {val}λ',
                        NAKARA: 'VACÍO: {val}m',
                        RESONANCE: 'ARMONÍA: {val}Hz',
                        DEFAULT: 'GRACIA: OK'
                    }
                },
                controlPanel: {
                    title: 'Santuario de Mando',
                    status: 'Comunión_Estable',
                    manualTitle: 'CODEX_SANTUARIO',
                    skipTutorialMsg: '>>> RITUAL DE INDUCCIÓN ABORTADO. VOLUNTAD RESTABLECIDA.',
                    manual: {
                        objective: { label: 'MISIÓN:', text: 'Recuperar almas para el Aitor.' },
                        sacrifice: { label: 'PURGAR:', text: 'Elimina impuros (+30 Fe). Error si es devoto (-25 Agitación).' },
                        authorize: { label: 'CONSAGRAR:', text: 'Acepta a los elegidos (-5 Fe, +10 Agitación). Error si es impuro (-30 Agitación).' },
                        resonance: { label: 'COMUNIÓN:', text: 'Sincroniza la fe con el vacío para evitar el colapso del santuario.' }
                    }
                },
                specialMechanic: {
                    header: 'COMUNIÓN ONÍRICA',
                    instruction: '[ MANTÉN EL ALIENTO PARA EL RITUAL ]',
                    complete: '[ EL VACÍO HA RESPONDIDO ]'
                }
            }
        },


        SCAN_BORDER_COLORS: [
            'border-zinc-800/30',      // 0: Neutral
            'border-emerald-500/40',   // 1: Una vez
            'border-cyan-500/50',      // 2: Dos veces
            'border-amber-500/60',     // 3: Tres veces
            'border-red-500/70',       // 4: Cuatro veces
            'border-purple-500/80'     // 5+: Crítico
        ]
    }
};
