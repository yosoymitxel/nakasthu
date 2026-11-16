# SISTEMA DE DIÁLOGOS Y LORE (NAKASTHU)

Este documento detalla la arquitectura y principios del sistema de narrativa reactiva de NAKASTHU.

## 1. TONO Y ESTILO
- **Industrial, Tétrico, Burocrático.**
- Evitar clichés de fantasía heroica. Esto es supervivencia en un entorno hostil y tecnológico.
- Los personajes están cansados, asustados o fanatizados.

## 2. ARQUITECTURA (Single Source of Truth)
El sistema de diálogos está desacoplado de la UI y se gestiona mediante datos centralizados:

- **src/data/entityConfig.js:** Contiene los `DIALOGUES` básicos por tipo de entidad y su probabilidad de corrupción.
- **src/data/gameConfig.js:** Centraliza los `NARRATIVE_FRAGMENTS` para briefings y eventos globales (Drexler vs Kamin).
- **src/services/EntityService.js:** Generador de sujetos que asigna diálogos coherentes con el estado de corrupción.
- **src/data/dialogues/*.json:** Conversaciones del botón INTERROGAR, por fase. `manifest.json` lista los archivos y declara la memoria narrativa (`flags`).
- **src/systems/DialogueEngine.js:** Elige el diálogo (paso, no repetidos, `requires`), aplica costes al elegir y emite `DIALOGUE_STARTED` / `DIALOGUE_OPTION_SELECTED` con `speaker`.
- **src/systems/NarrativeFlags.js:** Memoria de lo decidido. Sobrevive a `resetState()` ("Continuar Partida"); se vacía con `GAME_START`. Clave `nakasthu_flags`.

### Formato de un diálogo
```json
{
  "id": "DLG_P2_RIOT_CHIEF", "minStep": 3, "maxStep": 5,
  "requires": { "flag": "valor" },          // opcional: sólo aparece si se cumple
  "speaker": "VOZ EN LOS ALTAVOCES",       // opcional: por defecto npcTraits.id o el sujeto en cámara
  "exclusive": false,                       // opcional: sólo para charlas de pura indagación
  "npcTraits": { "id": "CMD. VARGAS", "type": "SEGURIDAD" },
  "text": "*Acción narrada.* 'Habla del sujeto'.",
  "options": [{
    "text": "Frase literal del operador.",  // o "*Acción del operador.*" completa
    "if": { "flag": "valor" },               // opcional: opción visible sólo si se cumple
    "set": { "flag": "valor" },              // opcional: lo que esta elección deja en memoria
    "energyCost": 0.5, "stabilityImpact": 5, "corruptionImpact": -5, "loreUnlock": "LORE_X",
    "consequence": "*Acción.* 'Respuesta del sujeto'.",
    "next": [ /* opciones del siguiente nodo */ ]
  }]
}
```

### Reglas de escritura (las comprueba `__tests__/dialogue_coherence.test.js`)
- **El operador habla:** cada opción es una frase completa ("Cuéntame qué viste.") o una acción completa entre asteriscos ("*Le administras un sedante.*"). Nada de comandos como "Analizar Testimonio".
- **El sujeto responde:** habla entre comillas simples y acciones entre `*asteriscos*`. Narración fuera de los asteriscos se mostraría como habla.
- **Sin contradicciones:** por defecto una respuesta cierra las alternativas. `exclusive: false` sólo cuando todas las opciones son preguntas o comentarios que no se contradicen.
- **La historia se expande, no da instrucciones:** una decisión relevante deja una marca (`set`) y un diálogo posterior la recuerda (`requires` o `if`).

### Memoria narrativa actual
| Marca | Se fija en | La leen |
|---|---|---|
| `vargas_fuerza` letal / contencion | DLG_P2_RIOT_CHIEF (pasos 3-5) | DLG_P2_ZONA4_WIDOW, DLG_P2_VARGAS_RETURN, opción de DLG_P3_DREXLER_DEBATE |
| `agua_norte` sellada / forzada | DLG_P2_SUPPLY_OFFICER (4-6) | DLG_P2_WATER_SEALED, DLG_P2_WATER_FORCED |
| `elara_contacto` confia / desconfia | DLG_P2_ELARA_FEAR (4-6) | DLG_P3_ELARA_TRUST, DLG_P3_ELARA_DISTANT |

### Verificación (`npm test`)
`__tests__/dialogue_paths.test.js` reproduce con el motor real cada camino de elecciones de cada diálogo: comprueba hablante, respuesta, que no haya callejones sin salida, que una decisión cierre sus alternativas y que cada `set` quede guardado. También valida que toda marca esté declarada, que lo leído se pueda fijar en un paso anterior y que todo lo fijado se lea en algún sitio.

## 3. MECÁNICA DE INTERROGATORIO (MOD-04)
Integrado con la mecánica de **Decisión**, los diálogos sirven como validación cualitativa:

1. **Superficial:** Saludo o queja inicial.
2. **Sospecha:** Datos técnicos o contradicciones detectables mediante escaneo.
3. **Revelación:** Lore profundo o confesión de Eidolon.

## 4. INTEGRACIÓN CON STORY PATHS
Los diálogos y etiquetas de acción cambian dinámicamente según la ruta elegida:

- **Técnico:** "Autorizar / Sacrificar" - Foco en utilidad y estabilidad.
- **Religioso:** "Consagrar / Purgar" - Foco en fe y ascensión.

## 5. SUBTEXTO Y CORRUPCIÓN
- **Mentiras del Sujeto:** Los sujetos pueden mentir. El texto puede contradecir los datos del escáner (MOD-01).
- **Inconsistencias:** Un Eidolon puede simular ser un civil, pero sus micro-expresiones (diálogo) o temperatura (escáner) lo delatarán.

## 6. REGLAS DE COHESIÓN
- Si un sujeto menciona calor, el escáner debe mostrar temperatura alta.
- Si un sujeto es sacrificado tras revelar un secreto, el hilo se marca como **PERDIDO** en el Lore Archive (MOD-03).
