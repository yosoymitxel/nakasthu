# MECÁNICAS DE JUEGO: PROYECTO NAKASTHU

## RESUMEN
Simulador de gestión de un portal dimensional donde el jugador actúa como operador de "El Bastión". Debe equilibrar recursos técnicos (Nakasthu) y sociales (Fe/Política) mientras inspecciona sujetos para el ascenso o el sacrificio.

## 1. SISTEMAS PRINCIPALES

### A. MOTOR NAKASTHU (Gestión de Recursos)
El núcleo del juego. Simula la estabilidad física del portal.
- **Input:** Cristales de Nakasthu (obtenidos por sacrificios).
- **Variable Crítica:** `Stability` (0-100%).
    - 100-80%: Estable (Color Azul/Cian).
    - 79-40%: Inestable (Vibración de pantalla, ruido estático).
    - 39-0%: Crítico (Color Rojo, alucinaciones auditivas).
- **Mecánica de Resonancia (Osciloscopio):**
    - El jugador debe alinear su onda de frecuencia (Ámbar) con la onda objetivo del Monolito (Cian).
    - **Visualización:** Gráfico de ondas en tiempo real en la parte inferior del visor.
    - **Control:** Slider de frecuencia en el panel izquierdo.
    - **Estado:** `LOCKED` (Sincronizado) vs `DRIFTING` (Desincronizado).

### B. BIO-ESCANER (Inspección & Filtrado)
El jugador recibe sujetos en la ventanilla.
- **Herramientas:**
    1. **Rayos-X Manuales:** 
       - Por defecto, los datos de implantes están `[ENCRYPTED]`.
       - El jugador debe pulsar `[SCAN]` para revelar implantes mecánicos (ilegal para civiles).
       - *Coste Visual:* La pantalla de la silueta se invierte y escanea en verde.
    2. **Test de Turing / Diálogo:** Detecta *Eidolons* (IAs disfrazadas) mediante inconsistencias en el texto.
    3. **Lector de Pulso/Temp:** Detecta anomalías fisiológicas (ej: Temp 0°C = Eidolon).
- **Acciones:**
    - `[AUTHORIZE]`: El sujeto cruza. (Sube Fe, Baja Estabilidad levemente).
    - `[SACRIFICE]`: El sujeto es procesado como combustible. (Sube Nakasthu, Baja Humanidad/Fe).
    - `[PURGE]`: El sujeto es eliminado/despedido. (Sube Ops, Neutro).

### C. TERMINAL DE COMANDOS (CLI)
Interfaz de línea de comandos para operaciones avanzadas y mantenimiento.
- **Ubicación:** Panel inferior derecho.
- **Funcionalidad:**
    - `sys.status`: Reporte detallado de sistemas.
    - `net.decrypt <id>`: Desencriptar entradas del Diario (Lore).
    - `sys.fix_audio`: Reiniciar el driver de audio si hay glitches persistentes.
    - `override <code`: Códigos secretos para saltarse restricciones.

### D. LA CORRUPCIÓN (Sistema de Horror)
A medida que la `Stability` baja o el tiempo avanza:
- La UI empieza a fallar (glitches CSS).
- Textos de los botones cambian momentáneamente (ej: "GUARDAR" se convierte en "MATAR").
- Aparecen sombras en el escáner que no están en la cámara visual.

## 2. ECONOMÍA DEL JUEGO
| Recurso | Se gana con... | Se gasta en... | Consecuencia de Agotamiento |
| :--- | :--- | :--- | :--- |
| **Nakasthu** | Sacrificios | Mantener Portal abierto | Cierre del Portal (Game Over) |
| **Fe (Kamin)** | Aprobar fieles | Ignorar protocolos | Motín de la secta |
| **Ops (Orden)**| Purgas/Reportes | Comprar mejoras (Futuro) | Despido/Ejecución |
