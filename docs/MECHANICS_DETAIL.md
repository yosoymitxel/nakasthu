# NAKASTHU OS: Detalle de Mecánicas

## 1. Sistema de Verificación Biométrica
La verificación es la tarea principal del Operador. Se basa en el análisis de datos extraídos mediante el **MOD-01 (BioScan)**.

### Protocolo de Identificación
- **IDs de la Orden:** Cada ciudadano legítimo de Zhyr posee un registro neural y térmico nominal.
- **Implantes Químicos:** Los sujetos autorizados deben presentar niveles específicos de implantes químicos (registrados en `scannedData.implants`). La ausencia o exceso de estos sin justificación es motivo de alarma.
- **Sincronía Neural:** Una lectura de `neuralSync` inferior al 40% sugiere interferencia del Eidolon o posesión por sombras.

### Proceso de Validación
1.  Activar el escaneo **BIO-MÉTRICO** (Requisito mínimo para habilitar botones de decisión).
2.  Cruzar datos con el escaneo **TÉRMICO** (para detectar fluctuaciones de temperatura inhumanas).
3.  Utilizar la **SONDA NAKARA** para medir la `voidDepth` (Profundidad del Vacío); valores altos indican infiltración del culto de Kamin.

## 2. Eventos de Sabotaje y Fallos de Subsistema
El Bastión no es un entorno seguro. El **Unrest Meter** (Malestar) monitoriza la probabilidad de sabotaje.

### Tipos de Fallos
- **Apagón de Energía (Luz):** Reduce la visibilidad y bloquea el uso del BioScan. Requiere reajuste manual en el panel de control.
- **Fuga de O2:** El drenaje de oxígeno se acelera. El jugador debe cerrar válvulas virtuales mediante comandos en el **MOD-09 (Terminal)**.
- **Inestabilidad del Portal:** El Portal (MOD-11) comienza a emitir radiación de Nakara, dañando la Estabilidad del sistema.

### Minijuego de Reparación (Resonancia MOD-06)
Cuando un subsistema falla, se activa el modo de **Resonancia**. El jugador debe:
1.  Ajustar la frecuencia del osciloscopio para que coincida con la señal objetivo (`targetFrequency`).
2.  Mantener la fase alineada mediante el control de pulso.
3.  Alcanzar el 100% de sincronía para restablecer el servicio.

## 3. Consola de Emergencia (Power Grid MOD-05)
En situaciones de colapso energético, se activa el sistema de respaldo manual.

### Protocolo de Reconexión de Cables
- **Interfaz:** Un panel de 12x10 nodos donde la energía debe fluir desde el lado izquierdo (Entrada) al derecho (Salida).
- **Mecánica (Click & Drag):** El jugador debe hacer clic en un nodo de entrada y arrastrar para crear una ruta continua de nodos adyacentes hasta la salida.
- **Obstrucciones:** El panel presenta nodos "quemados" que bloquean el paso. El número de obstrucciones aumenta con la dificultad del nivel (hasta 10 nodos bloqueados).
- **Validación:** El sistema solo permite conexiones entre nodos vecinos (arriba, abajo, izquierda, derecha). Si se suelta el clic antes de llegar a la salida, la conexión se pierde y debe reiniciarse.
- **Resultado:** Una conexión exitosa restaura un +15% de energía al sistema central.

## 4. Identificación de "Sombras" (Infiltrados de Kamin)
Las Sombras son sujetos corruptos que intentan entrar en el Bastión para desestabilizarlo desde dentro.

### Pistas Sutiles en el BioScan
- **Glitch Visual:** Los sujetos sombra presentan efectos de glitch más intensos y erráticos en su visualización.
- **Historia de Corrupción:** El campo `corruptionHistory` en los datos escaneados muestra picos de inestabilidad que un humano normal no poseería.
- **Diálogo Inconsistente:** Mediante el **Enlace Neural (Interrogatorio)**, las sombras suelen emitir amenazas veladas o verdades distorsionadas sobre el "Renacimiento de Aitor".
- **Corrupción Real (`isCorrupt`):** Si un sujeto marcado como corrupto es autorizado, el Bastión sufre una penalización inmediata de -25 de Estabilidad y un aumento masivo del Malestar.
