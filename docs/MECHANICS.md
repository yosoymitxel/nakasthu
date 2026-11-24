# MECÁNICAS DE JUEGO: PROYECTO NAKASTHU

## RESUMEN
Simulador de gestión de un portal dimensional donde el jugador actúa como operador de "El Bastión". Debe equilibrar recursos técnicos (Nakasthu) y sociales (Fe/Política) mientras inspecciona sujetos para el ascenso o el sacrificio.

## 1. SISTEMAS PRINCIPALES

### A. MOTOR DE LÓGICA POLIMÓRFICA (MechanicManager)
Centraliza el comportamiento de los roles del jugador (Técnico vs. Religioso) en un solo motor.
- **Ruta Técnico/Operador:** Enfocado en eficiencia, utilidad técnica y filtración química.
- **Ruta Religioso/Líder:** Enfocado en devoción, sincronía espiritual y consagración.
- **Mecánicas Únicas:** El sistema permite inyectar nuevas mecánicas (SYNC, DECISION, etc.) mediante configuración JSON sin alterar el núcleo.

### B. MOTOR NAKASTHU (Gestión de Recursos)
El núcleo del juego. Simula la estabilidad física del portal.
- **Input:** Cristales de Nakasthu (obtenidos por sacrificios).
- **Variable Crítica:** `Stability` (0-100%).
- **Mecánica de Resonancia (Osciloscopio):**
    - El jugador debe alinear su onda de frecuencia con la onda objetivo del Monolito.
    - **Visualización:** Gráfico de ondas en tiempo real (MOD-06).
    - **Control:** Sliders de frecuencia y fase.
    - **Impacto:** La desincronía drena estabilidad; la sincronía perfecta la recupera.

### C. BIO-ESCANER (Inspección & Filtrado)
Módulo MOD-01 para la inspección de sujetos.
- **Tipos de Escaneo:** Térmico, Neural, Nakara, Biométrico y Resonancia.
- **Bloqueo de Acción:** No se puede autorizar o sacrificar sin haber realizado el escaneo requerido por el sistema en ese momento.
- **Detección de Corrupción:** El jugador debe identificar sujetos corruptos basándose en los resultados de los escaneos y diálogos.

### D. TERMINAL DE COMANDOS (CLI)
Interfaz de línea de comandos para operaciones avanzadas.
- **Acciones:** Notificaciones de sistema, alertas de error y logs de procesamiento.
- **Integración:** El terminal responde a las acciones del jugador con feedback narrativo y técnico detallado.

## 2. ECONOMÍA DEL JUEGO
| Recurso | Se gana con... | Se gasta en... | Consecuencia de Agotamiento |
| :--- | :--- | :--- | :--- |
| **Energía** | Sacrificios corruptos | Autorizaciones / Escaneos | Apagado del sistema (Game Over) |
| **Estabilidad**| Sincronía / Decisiones correctas | Desincronía / Errores | Colapso neural (Game Over) |
| **Paz Social** | Decisiones morales | Incidentes / Sabotajes | Disturbios / Motín |
| **Cuota** | Procesar sujetos | Tiempo (Ticks) | Fracaso de misión |

### Lo que pesa entre turnos (`src/utils/pressureUtils.js`)
- **Horas de turno** (`state.shiftHours`, `CONFIG.FATIGUE`): cada turno jugable suma `meta.shiftHours` (4: 10, 6: 14, 8: 12, 10: 16) y una hora por cada 90 s jugados (tope +4). No se reinician con el paso; el selector y «Continuar» parten de la suma base. Desde 24 h la energía del turno empieza 10 más abajo; desde 36 h los mensajes de Coms tardan el doble y AUTORIZAR/REASIGNAR piden dos pulsaciones («OTRA VEZ»). Se ven en la barra de objetivo («TURNO 38 H») y en el resumen de turno.
- **Paso 6** (`meta.timeMultiplier`): la energía se gasta 1,5 veces más rápido.
- **Paso 10** (`meta.massAdmission`): consagrar no gasta energía. `meta.siege`: cada 3 sujetos, un parte del cerco en Coms; los cinco primeros suben la cuota en 1 y acortan la espera entre sujetos. Los recurrentes con `returned` salen del portal: escáneres nominales, ninguna decisión es error, su primera línea siempre dice lo mismo con otras palabras. El resumen cuenta «Devueltos: N. Describieron un lugar: 0».
- **Registro: Kamin** (`src/data/kaminRegister.js`, panel MOD-08 y terminal): un escalón por técnica, con los fieles de cada momento; se escribe solo al llegar a su paso o a su posición de la cola. En el paso 10 cada parte del cerco suma sus llegadas.
- Balance: `__tests__/balance_step4.test.js` simula cada turno con toda la presión (≥ 70 % de turnos ganados).

## 3. SINGLE SOURCE OF TRUTH (Arquitectura)
Todas las constantes de balance (tiempos, costes, probabilidades) están centralizadas en `gameConfig.js`. Los componentes de UI son "tontos" y solo representan el estado gestionado por el Core y los Services.
