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
