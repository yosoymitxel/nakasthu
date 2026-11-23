/**
 * PATHCONFIGS.JS
 * Configuración específica para las rutas de Operario y Sectario.
 * Permite desvincular mecánicas que visualmente deben ser distintas.
 */

export const PATH_CONFIGS = {
    0: { // OPERARIO (Técnico)
        name: 'OPERARIO',
        theme: {
            primary: 'cyan',
            secondary: 'zinc',
            accent: 'amber',
            emergency: 'red'
        },
        thresholds: {
            energyWarning: 20,
            stabilityWarning: 20,
            oxygenEmergency: 40,
            resonanceEmergency: 30,
            energyEmergency: 25,
            oxygenDrain: 0.05,
            emergencyChance: 0.05,
            spontaneousEmergencyChance: 0.03
        },
        emergencies: {
            resonance: {
                name: 'RESONANCIA',
                module: 'MOD-06-R',
                alert: '[ALERTA] INESTABILIDAD DE NÚCLEO: RESONANCIA DESVIADA.',
                success: '[SISTEMA] RESONANCIA SINCRONIZADA. ESTABILIDAD RECUPERADA (+10).',
                action: 'SINCRONIZAR'
            },
            oxygen: {
                name: 'PROTOCOLO O2',
                module: 'MOD-02',
                alert: '[ALERTA] FALLO DE VENTILACIÓN: NIVEL DE O2 DESCENDIENDO.',
                success: '[SISTEMA] FLUJO DE O2 ESTABILIZADO POR 10S.',
                action: 'REINICIAR_FLUJO',
                labels: ['V-1', 'V-2', 'V-3', 'V-4'],
                status: ['CRÍTICO', 'ESTABLE']
            },
            energy: {
                name: 'POWER GRID',
                module: 'MOD-05',
                alert: '[ALERTA] COLAPSO DE RED: RECONEXIÓN DE GRID REQUERIDA.',
                warning: '>>> WARNING: CRITICAL_POWER_LEVEL - SISTEMAS DE SOPORTE AL LÍMITE.',
                success: '[SISTEMA] GRID DE ENERGÍA REESTABLECIDO (+15%)',
                action: 'RECONECTAR',
                status: ['DOWN', 'NOMINAL']
            },
            stability: {
                warning: '>>> ALERTA: INESTABILIDAD NEURAL CRÍTICA - BASTIÓN COMPROMETIDO.'
            }
        },
        decisions: {
            authorize: {
                success: '[SISTEMA] AUTORIZACIÓN COMPLETADA: ENTIDAD PURA PROCESADA.',
                fail: '[ALERTA] AUTORIZACIÓN FALLIDA: ENTIDAD CORRUPTA DETECTADA.'
            },
            sacrifice: {
                success: '[SISTEMA] REASIGNACIÓN FIRMADA: ENERGÍA RECUPERADA. RETORNO PREVISTO: —',
                fail: '[ALERTA] REASIGNACIÓN ERRÓNEA: SUJETO APTO ENVIADO A PRISIAT.'
            }
        },
        operations: {
            interrogateBtn: 'INICIAR ENLACE NEURAL [INTERROGAR]',
            interrogateEnd: 'TERMINAR INTERROGATORIO',
            waitingSubject: 'Sujeto en espera de interacción...',
            pendingValidation: 'AUTORIZACIÓN PENDIENTE DE VALIDACIÓN BIOMÉTRICA',
            scanRequired: 'SE REQUIERE ESCANEO',
            newSubjectMsg: 'NUEVO SUJETO DETECTADO EN CÁMARA.',
            anomalyMsg: '>>> ALERTA: ANOMALÍA EN PROTOCOLO DE DECISIÓN. OVERRIDE DETECTADO.',
            systemSender: 'NAKASTHU_OS',
            subjectSender: 'SUJETO',
            operatorSender: 'OPERADOR',
            linkClosedMsg: 'ENLACE NEURAL CERRADO.',
            energyErrorMsg: '[ERROR] ENERGÍA INSUFICIENTE PARA ESTABLECER ENLACE.',
            noSubjectMsg: '[ERROR] NO HAY SUJETO EN CÁMARA.',
            rejectLabel: 'REASIGNAR A PRISIAT',
            authorizeLabel: 'AUTORIZAR',
            overrideBlockedMsg: '>>> ERROR: REASIGNACIÓN BLOQUEADA POR KAMIN.',
            overrideLabel: 'ERR: OVERRIDE',
            errorLabel: 'FALLOS',
            quotaLabel: 'CUOTA_DIARIA',
            statLabels: {
                energy: 'E',
                stability: 'S'
            },
            viewLabels: {
                portal: 'ORBITAL',
                subject: 'LIVE_FEED'
            }
        },
        specialMechanic: {
            header: 'SINCRONIZACIÓN NEURAL',
            instruction: 'MANTÉN PULSADO EL MONOLITO (O ESPACIO) PARA SINCRONIZAR',
            complete: 'SINCRONIZACIÓN COMPLETADA',
            statusSyncing: 'SINCRONIZANDO...',
            statusComplete: 'SINCRONIZADO',
            statusWaiting: 'EN ESPERA'
        },
        bioscan: {
            title: 'BIOSCANNER_UNIT',
            repeats: 'REPETICIONES',
            required: 'REQUERIDO',
            offline: 'OFFLINE',
            scanning: 'Escaneando...',
            ready: 'Listo',
            insufficient: 'Energía Insuficiente',
            scans: {
                THERMAL: 'TÉRMICO',
                NEURAL: 'NEURAL',
                NAKARA: 'SONDA_NAKARA',
                BIOMETRIC: 'BIOMÉTRICO',
                RESONANCE: 'RESONANCIA'
            }
        },
        controlPanel: {
            title: 'Centro de Control',
            status: 'Link_Active',
            quotaLabel: 'QUOTA_SYS',
            manualTitle: 'MANUAL DE OPERACIONES NAKASTHU',
            manualQuote: '"La eficiencia es el único bastión contra el Caos de Kamin. No dude. No sienta. Solo procese."',
            skipTutorialMsg: '[SISTEMA] INDUCCIÓN ABORTADA. PROCEDIENDO a OPERACIONES ESTÁNDAR.',
            manual: {
                objective: { label: 'PROTOCOLO:', text: 'Consola cuatro de reasignación de Talok. Evalúe a cada sujeto: se queda a reconstruir o baja a las galerías de Prisiat.' },
                sacrifice: { label: 'REASIGNAR A PRISIAT:', text: 'Baja al sujeto a las galerías de Prisiat; su cuota alimenta la consola (+30 Energía). Retorno previsto: ninguno. Reasignar a alguien sano: -25 Estabilidad.' },
                authorize: { label: 'AUTORIZAR:', text: 'Permite el paso de sujetos puros (+10 Estabilidad, -10 Energía). Error en sujeto corrupto: -30 Estabilidad.' },
                resonance: { label: 'RESONANCIA:', text: 'Sincronice frecuencia y fase con el Monolito para evitar el colapso del núcleo neural y recuperar estabilidad.' },
                scanning: { label: 'BIO-SCAN (MOD-01):', text: 'Inspección obligatoria. Use Térmico, Neural, Nakara, Biométrico y Resonancia para detectar anomalías.' },
                resources: { label: 'SISTEMAS:', text: 'Energía (Combustible), Estabilidad (Integridad del Bastión) y Oxígeno (Soporte Vital). Si uno llega a 0, la misión termina.' },
                economy: { label: 'ECONOMÍA:', text: 'Cada reasignación paga la energía de la consola. Las autorizaciones la consumen pero mantienen la paz social.' }
            }
        },
        layout: {
            lockedLabel: 'Locked_Access',
            utilityLabel: 'UTILIDAD'
        },
        factions: {
            order: 'ORDEN',
            chaos: 'CAOS',
            statusLabel: 'EQUILIBRIO_IDEOLÓGICO',
            descriptions: {
                neutral_status: 'EN_EQUILIBRIO',
                order: 'La estructura de Nakasthu prevalece. La eficiencia técnica es absoluta.',
                chaos: 'La influencia de Kamin se filtra por las grietas. La entropía aumenta.',
                neutral: 'Balance operativo nominal. Sin desviaciones ideológicas detectadas.'
            }
        },
        analytics: {
            invokingTrace: 'INVOCANDO_TRAZA',
            monitoring: 'MONITOREO',
            linkActive: 'ENLACE_ACTIVO',
            statusLabel: 'ESTADO',
            results: {
                BIOMETRIC: 'Firma Biométrica: {val}',
                NEURAL: 'Sincronía Neural: {val}%',
                THERMAL: 'Firma Térmica: {val}°C',
                NAKARA: 'Profundidad Nakara: {val}',
                RESONANCE: 'Frecuencia de Resonancia: {val}Hz',
                DEFAULT: 'Dato capturado: {val}'
            },
            CONSTANTS: {
                UNSTABLE_THRESHOLD: 30,
                PROB_CRITICAL: 75,
                PROB_WARNING: 50
            }
        },
        terminal: {
            header: 'ZHYR_OS TERMINAL v2.04',
            version: 'BUILD_88.4',
            welcome: 'ZHYR_OS v2.0.4 - SISTEMA DE CONTROL DE BASTIÓN ONLINE. ESCRIBA /HELP PARA COMANDOS.',
            placeholder: 'Ingrese comando...',
            paused: 'SISTEMA EN PAUSA...',
            tutorial: 'MODO INDUCCIÓN ACTIVO...',
            clear: 'TERMINAL LIMPIA.',
            reset: 'SESIÓN TERMINADA. REINICIANDO ENTORNO...'
        }
    },
    1: { // SECTARIO (Religioso)
        name: 'SECTARIO',
        theme: {
            primary: 'purple',
            secondary: 'slate',
            accent: 'red',
            emergency: 'purple'
        },
        thresholds: {
            energyWarning: 25,
            stabilityWarning: 30,
            oxygenEmergency: 50,
            resonanceEmergency: 40,
            energyEmergency: 30,
            oxygenDrain: 0.08,
            emergencyChance: 0.07,
            spontaneousEmergencyChance: 0.03
        },
        emergencies: {
            resonance: {
                name: 'DISONANCIA DEL VELO',
                module: 'MOD-06-S',
                alert: '[ALERTA] DISONANCIA DEL VELO: LAS ALMAS SUSURRAN.',
                success: '[SISTEMA] EL VELO SE HA ESTABILIZADO. (+10).',
                action: 'UNIFICAR'
            },
            oxygen: {
                name: 'RITUAL DE PURIFICACIÓN',
                module: 'MOD-02-S',
                alert: '[ALERTA] EL VELO SE DESVANECE: REQUIERE SACRIFICIO DE AIRE.',
                success: '[SISTEMA] EL VELO SE HA FORTALECIDO. (+10S)',
                action: 'INVOCAR_ALIENTO',
                labels: ['ALIENTO', 'SANGRE', 'CENIZA', 'VELO'],
                status: ['PROFANO', 'SAGRADO']
            },
            energy: {
                name: 'CANAL DE ALMAS',
                module: 'MOD-05-S',
                alert: '[ALERTA] CANALIZACIÓN INTERRUMPIDA: LAS ALMAS SE ESCAPAN.',
                success: '[SISTEMA] CANAL DE ALMAS RECONECTADO (+15%)',
                action: 'CANALIZAR',
                status: ['RUPTURA', 'FLUIDO']
            },
            stability: {
                warning: '>>> ALERTA: DISONANCIA ESPIRITUAL DETECTADA - EL VELO ESTÁ EN PELIGRO.'
            }
        },
        decisions: {
            authorize: {
                success: '[RITUAL] ALMA ACEPTADA: LA NAKARA SE FORTALECE.',
                fail: '[PROFANACIÓN] ALMA IMPURA DETECTADA: EL VELO SE DESGARRA.'
            },
            sacrifice: {
                success: '[ENTREGA] DIFERENCIA PAGADA: EL ALTAR SE ENCIENDE.',
                fail: '[BLASFEMIA] ENTREGA ERRÓNEA: LA PUERTA NO LO ACEPTA.'
            }
        },
        operations: {
            interrogateBtn: 'INICIAR COMUNIÓN ESPIRITUAL',
            interrogateEnd: 'FINALIZAR RITO',
            waitingSubject: 'Alma en espera de purificación...',
            pendingValidation: 'TRANSICIÓN PENDIENTE DE LECTURA DE AURA',
            scanRequired: 'SE REQUIERE REVELACIÓN',
            newSubjectMsg: 'UNA NUEVA ESENCIA HA LLEGADO AL UMBRAL.',
            anomalyMsg: '>>> ADVERTENCIA: INTERFERENCIA EN EL VELO. PRESENCIA NO DESEADA.',
            systemSender: 'EL_VACÍO',
            subjectSender: 'ESENCIA',
            operatorSender: 'INQUISIDOR',
            linkClosedMsg: 'COMUNIÓN FINALIZADA.',
            energyErrorMsg: '[ERROR] FE INSUFICIENTE PARA ESTABLECER COMUNIÓN.',
            noSubjectMsg: '[ERROR] EL UMBRAL SE ENCUENTRA VACÍO.',
            rejectLabel: 'ENTREGAR',
            authorizeLabel: 'CONSAGRAR',
            overrideBlockedMsg: '>>> ERROR: LA ENTREGA HA SIDO INTERCEPTADA POR KAMIN.',
            overrideLabel: 'VELO: INTERFERENCIA',
            errorLabel: 'PROFANO',
            quotaLabel: 'COSECHA',
            statLabels: {
                energy: 'F',
                stability: 'P'
            },
            viewLabels: {
                portal: 'VELO_ASTRAL',
                subject: 'VISIÓN_MORTAL'
            }
        },
        specialMechanic: {
            header: 'COMUNIÓN ONÍRICA',
            instruction: 'MANTENGA [ESPACIO] PARA COMULGAR',
            complete: 'ASCENSIÓN COMPLETADA',
            statusSyncing: 'COMULGANDO...',
            statusComplete: 'ASCENSIÓN',
            statusWaiting: 'EN ESPERA'
        },
        bioscan: {
            title: 'ALTAR DE EXAMEN v4.02',
            repeats: 'RITUALES',
            required: 'SAGRADO',
            offline: 'ALTAR PROFANADO',
            scanning: 'Transmutando...',
            ready: 'Listo',
            insufficient: 'Falta Ofrenda',
            scans: {
                THERMAL: 'ALIENTO ÍGNEO',
                NEURAL: 'PULSACIÓN DEL ALMA',
                NAKARA: 'PROFUNDIDAD DEL VACÍO',
                BIOMETRIC: 'RASTRO DE SANGRE',
                RESONANCE: 'RESONANCIA ETERNA'
            }
        },
        controlPanel: {
            title: 'Altar de Almas',
            status: 'Soul_Linked',
            quotaLabel: 'COSECHA',
            manualTitle: 'DOGMA DE LA NAKARA',
            manualQuote: '"La fe es el único velo contra la mentira de Drexler. No cuestione. No dude. Solo purifique."',
            skipTutorialMsg: '[RITUAL] INDUCCIÓN ABORTADA. PROCEDIENDO A LA COMUNIÓN.',
            manual: {
                objective: { label: 'DOGMA:', text: 'Separar el trigo de la paja. El nakara revela la verdad a través del Altar de Examen.' },
                sacrifice: { label: 'ENTREGAR:', text: 'Baja al sujeto a la cámara del hangar: paga la diferencia y alimenta el altar (+30 Energía). Entregar a un devoto puro: -25 Estabilidad.' },
                authorize: { label: 'CONSAGRAR:', text: 'Permite la ascensión de devotos puros (+10 Estabilidad, -10 Energía). Error en corrupto: -30 Estabilidad.' },
                resonance: { label: 'ARMONÍA:', text: 'Unifique las almas en disonancia con la vibración del Velo para recuperar la paz espiritual.' },
                scanning: { label: 'REVELACIÓN (MOD-01):', text: 'Rito de examen obligatorio. Use los cinco ritos para detectar la mancha de Kamin.' },
                resources: { label: 'ESENCIAS:', text: 'Fe (Energía), Paz (Estabilidad) y Aliento (Oxígeno). El vacío aguarda si alguno se extingue.' },
                economy: { label: 'OFRENDA:', text: 'Lo que se entrega bajo el hangar alimenta el Altar de Examen. La consagración purifica el Bastión.' }
            }
        },
        layout: {
            lockedLabel: 'Velo_Cerrado',
            utilityLabel: 'PUREZA'
        },
        factions: {
            order: 'DOGMA',
            chaos: 'ENTROPÍA',
            statusLabel: 'ARMONÍA_ESPIRITUAL',
            descriptions: {
                neutral_status: 'VACÍO_PRIMORDIAL',
                order: 'El Dogma de Nakasthu se impone. La fe es inquebrantable.',
                chaos: 'La Entropía de Kamin corroe el espíritu. El Velo se debilita.',
                neutral: 'Equilibrio en el vacío. Las almas aguardan su destino.'
            }
        },
        analytics: {
            invokingTrace: 'INVOCANDO_REVELACIÓN',
            monitoring: 'CONTEMPLACIÓN',
            linkActive: 'COMUNIÓN_ACTIVA',
            statusLabel: 'VOLUNTAD',
            results: {
                BIOMETRIC: 'Rastro de Sangre: {val}',
                NEURAL: 'Pulsación del Alma: {val}%',
                THERMAL: 'Aliento Ígneo: {val}°C',
                NAKARA: 'Profundidad del Vacío: {val}',
                RESONANCE: 'Resonancia Eterna: {val}Hz',
                DEFAULT: 'Esencia capturada: {val}'
            },
            CONSTANTS: {
                UNSTABLE_THRESHOLD: 40,
                PROB_CRITICAL: 80,
                PROB_WARNING: 60
            }
        },
        terminal: {
            header: '† ALTAR DE SUSURROS †',
            version: 'AETHER_v4',
            welcome: 'EL VELO SE ABRE. LAS ALMAS SUSURRAN TU NOMBRE. ENTONA /HELP PARA RITOS.',
            placeholder: 'Entona tu plegaria...',
            paused: 'EL TIEMPO SE DETIENE...',
            tutorial: 'LA ILUMINACIÓN REQUIERE PACIENCIA...',
            clear: 'EL UMBRAL HA SIDO PURIFICADO.',
            reset: 'LA COMUNIÓN HA TERMINADO. EL VACÍO AGUARDA...'
        }
    }
};
