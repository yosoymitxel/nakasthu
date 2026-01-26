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
            emergencyChance: 0.05
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
                success: '[SISTEMA] SACRIFICIO COMPLETADO: ENERGÍA RECUPERADA.',
                fail: '[ALERTA] SACRIFICIO ERRÓNEO: PÉRDIDA DE ESTABILIDAD DETECTADA.'
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
            subjectSender: 'BIOMASA',
            operatorSender: 'OPERADOR',
            linkClosedMsg: 'ENLACE NEURAL CERRADO.',
            energyErrorMsg: '[ERROR] ENERGÍA INSUFICIENTE PARA ESTABLECER ENLACE.',
            noSubjectMsg: '[ERROR] NO SE DETECTA BIOMASA EN EL ÁREA DE INTERACCIÓN.',
            rejectLabel: 'SACRIFICAR',
            authorizeLabel: 'AUTORIZAR',
            overrideBlockedMsg: '>>> ERROR: PROTOCOLO DE SACRIFICIO BLOQUEADO POR KAMIN.'
        },
        bioscan: {
            title: 'BIO-SCANNER v4.02',
            repeats: 'REPEATS',
            required: 'REQUIRED',
            offline: 'MOD-01 OFFLINE',
            scanning: 'Procesando...',
            ready: 'Ready',
            insufficient: 'Insufficient Power',
            scans: {
                THERMAL: 'TÉRMICO',
                NEURAL: 'NEURAL',
                NAKARA: 'NAKARA',
                BIOMETRIC: 'BIOMÉTRICO',
                RESONANCE: 'RESONANCIA'
            }
        },
        controlPanel: {
            title: 'Centro de Control',
            status: 'Link_Active',
            manualTitle: 'OPERATIONAL_MANUAL',
            skipTutorialMsg: '[SISTEMA] INDUCCIÓN ABORTADA. PROCEDIENDO A OPERACIONES ESTÁNDAR.',
            manual: {
                objective: { label: 'OBJETIVO:', text: 'Procesar biomasa según criterios de pureza.' },
                sacrifice: { label: 'SACRIFICAR:', text: 'Elimina sujetos corruptos (+30 Energía). Error si es puro (-25 Estabilidad).' },
                authorize: { label: 'AUTORIZAR:', text: 'Permite el paso de sujetos puros (-10 Energía, +10 Estabilidad). Error si es corrupto (-30 Estabilidad).' },
                resonance: { label: 'RESONANCIA:', text: 'Mantiene la estabilidad del núcleo neural.' }
            }
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
            emergencyChance: 0.07
        },
        emergencies: {
            resonance: {
                name: 'DISONANCIA',
                module: 'MOD-06-S',
                alert: '[ALERTA] DISONANCIA DE ALMAS: EL VELO SE DESGARRRA.',
                success: '[SISTEMA] ALMAS UNIFICADAS. ESTABILIDAD RECUPERADA (+10).',
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
                warning: '>>> ADVERTENCIA: EL FLUJO DE ALMAS SE DEBILITA. LA NAKARA TIEMBLA.',
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
                success: '[SACRIFICIO] OFRENDA ACEPTADA: LAS ALMAS FLUYEN.',
                fail: '[BLASFEMIA] SACRIFICIO ERRÓNEO: LA IRA DE AITOR SE SIENTE.'
            }
        },
        operations: {
            interrogateBtn: 'INICIAR COMUNIÓN [INTERROGAR]',
            interrogateEnd: 'TERMINAR INTERROGATORIO',
            waitingSubject: 'Alma en espera de purificación...',
            pendingValidation: 'TRANSICIÓN PENDIENTE DE LECTURA DE AURA',
            scanRequired: 'SE REQUIERE REVELACIÓN',
            newSubjectMsg: 'UNA NUEVA ESENCIA HA LLEGADO AL UMBRAL.',
            anomalyMsg: '>>> ADVERTENCIA: INTERFERENCIA EN EL VELO. PRESENCIA NO DESEADA.',
            systemSender: 'NAKARA_VOX',
            subjectSender: 'ESENCIA',
            operatorSender: 'INQUISIDOR',
            linkClosedMsg: 'COMUNIÓN FINALIZADA.',
            energyErrorMsg: '[ERROR] FE INSUFICIENTE PARA ESTABLECER COMUNIÓN.',
            noSubjectMsg: '[ERROR] EL UMBRAL SE ENCUENTRA VACÍO.',
            rejectLabel: 'PURGAR',
            authorizeLabel: 'CONSAGRAR',
            overrideBlockedMsg: '>>> ERROR: EL SACRIFICIO HA SIDO INTERCEPTADO POR KAMIN.'
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
                THERMAL: 'CALOR VITAL',
                NEURAL: 'VÍNCULO',
                NAKARA: 'ESENCIA',
                BIOMETRIC: 'MARCA',
                RESONANCE: 'ARMONÍA'
            }
        },
        controlPanel: {
            title: 'Altar de Almas',
            status: 'Soul_Linked',
            manualTitle: 'DOGMA_ESPIRITUAL',
            skipTutorialMsg: '[RITUAL] INDUCCIÓN ABORTADA. PROCEDIENDO A LA COMUNIÓN.',
            manual: {
                objective: { label: 'MISIÓN:', text: 'Separar el trigo de la paja para alimentar la Nakara.' },
                sacrifice: { label: 'PURGAR:', text: 'Libera almas corruptas para alimentar el fuego (+30 Energía). Error si es devoto (-25 Estabilidad).' },
                authorize: { label: 'CONSAGRAR:', text: 'Permite la ascensión de devotos puros (-10 Energía, +10 Estabilidad). Error si es corrupto (-30 Estabilidad).' },
                resonance: { label: 'RESONANCIA:', text: 'Mantiene la armonía con el velo espiritual.' }
            }
        }
    }
};
