# NAKASTHU OS: Especificaciones Técnicas

## 1. Arquitectura Polimórfica: GameSequencer
La progresión del juego está gestionada por el `GameSequencer`, una máquina de estados robusta que controla los 12 pasos narrativos.

### Funcionamiento del Secuenciador
- **Modularidad:** Cada paso (definido en `stepsConfig.js`) puede ser de tipo `cinematic`, `mechanic` o `gameplay`.
- **Transiciones de Estado:** El secuenciador emite eventos `STEP_CHANGE` y `STATE_CHANGE` a través del `Bus.js`, permitiendo que todos los módulos (MOD-XX) reaccionen de forma independiente.
- **Gestión de Rutas:** Soporta el cambio dinámico entre la ruta **Técnica** (Orden) y **Religiosa** (Caos) mediante la variable `storyPath`.

## 2. Estructura de Datos de Sujetos (JSON)
Los sujetos se generan dinámicamente mediante el `EntityService`. El esquema asegura que cada entidad sea única pero siga reglas de validación coherentes.

### Esquema Base de la Entidad
```json
{
  "id": "ZHR-XX",
  "type": "ROL_ASIGNADO",
  "species": "HUMANO | EIDOLON | HIBRIDO",
  "isCorrupt": boolean,
  "scannedData": {
    "temperature": number,
    "neuralSync": number,
    "implants": number,
    "corruption": number,
    "voidDepth": number
  },
  "visual": {
    "glitch": "TIPO_GLITCH",
    "seed": number
  }
}
```

### Generación de Discrepancias
El motor de generación utiliza probabilidades definidas en `entityConfig.js`. Si `isCorrupt` es verdadero, el sistema aplica modificadores a `neuralSync` y `corruption` para crear evidencias que el jugador debe detectar mediante el BioScan.

## 3. Sistema de Validación y Testing
Para asegurar la integridad de las reglas de admisión, el proyecto cuenta con una suite de tests exhaustiva en la carpeta `__tests__`.

### Componentes del Testing
- **Unit Testing:** Validación de funciones puras en `gameplayUtils.js` y `mathUtils.js`.
- **Integration Testing:** Pruebas de flujo completo entre el `GameSequencer`, el `Bus` y el `State`.
- **Validation Rules:** Los tests aseguran que:
    - Autorizar a un sujeto corrupto reste estabilidad correctamente.
    - Los sabotajes se activen solo cuando el `unrest` supera los umbrales definidos en `gameConfig.js`.
    - La cuota de sujetos se actualice tras cada decisión.

### Ejecución de Pruebas
Los desarrolladores pueden verificar nuevas reglas añadiendo casos de prueba en `__tests__/logic.test.js` o `__tests__/sequencer.test.js`. Esto garantiza que la lógica del motor (Vanilla JS) permanezca aislada de errores de renderizado de la UI (React).

## 4. Estándares de Interfaz y Diseño Visual

### A. Botones de Acción (MOD-04 Operations)
Para mantener la integridad estética "grotesca e industrial", los botones de decisión deben seguir estas reglas:
- **Dimensiones:** Altura fija de `140px` (`h-[140px]`). No deben dominar visualmente el centro para no restar importancia a los módulos periféricos.
- **Bordes:** `border-2` con colores temáticos (Zinc, Cyan para Orden; Purple para Caos). No usar bordes redondeados excesivos (`rounded-sm` como máximo).
- **Sombras:** Evitar sombras exteriores brillantes que den un aspecto "moderno". Usar sombras internas o sutiles de color negro (`shadow-[0_0_20px_rgba(0,0,0,0.5)]`).
- **Interactividad:** Escala suave al hacer clic (`active:scale-[0.98]`) y cambios de opacidad en el fondo al hacer hover.

### B. Énfasis Visual y "Cables"
El sistema NAKASTHU utiliza una jerarquía visual donde el peligro real reside en los subsistemas:
- **MOD-06 (Resonancia):** Debe ser el elemento visualmente más complejo y de mayor tamaño cuando está activo. Los osciloscopios deben ocupar un área significativa (`h-32` o superior) para enfatizar la tensión de la sincronía.
- **Conectores (Cables):** La representación visual de conexiones debe ser minimalista y técnica. Se utilizan líneas de 1px o bordes de contenedores para sugerir el flujo de datos entre módulos.
- **Colores de Estado:** El porcentaje de corrupción y otros indicadores críticos deben usar el `stepColor` del estado global para reflejar la urgencia del nivel (Celeste -> Naranja -> Rojo).
