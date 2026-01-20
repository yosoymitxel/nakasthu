/**
 * Sistema de Diálogos y Lore - Proyecto Nakasthu
 * Reglas de escritura y estructura del sistema.
 * 
 * TONO:
 * - Industrial, Tétrico, Burocrático.
 * - Evitar clichés de fantasía heroica. Esto es supervivencia en un entorno hostil y tecnológico.
 * - Los personajes están cansados, asustados o fanatizados.
 * 
 * SUBTEXTO Y MENTIRAS:
 * - Los sujetos mienten. El texto puede contradecir al escáner.
 * - Un Eidolon puede simular ser un Civil asustado.
 * 
 * ESTRUCTURA TÉCNICA:
 * - src/data/dialoguePools.js: Diccionario de frases por arquetipo y contexto.
 * - src/data/loreThreads.js: Hilos narrativos secuenciales ("Quests" invisibles).
 * - src/systems/DialogueEngine.js: Lógica de selección y corrupción de texto.
 * 
 * MECÁNICA DE INTERROGATORIO (3 NIVELES):
 * 1. Superficial: Saludo o queja inicial.
 * 2. Sospecha: Datos técnicos o contradicciones.
 * 3. Revelación: Lore profundo, desbloqueo de hilos o confesión de Eidolon.
 * 
 * COHESIÓN:
 * - Si un sujeto menciona calor, el escáner debe mostrar temperatura alta.
 * - Si un sujeto es sacrificado tras revelar un secreto, el hilo se marca como PERDIDO.
 */
