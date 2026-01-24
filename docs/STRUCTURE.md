# ESTRUCTURA DEL PROYECTO (ESM Native)

## Arquitectura
Este proyecto utiliza una arquitectura **Híbrida ESM-Native**:
- **Core (Vanilla JS)**: Lógica pura en `/src/core` y `/src/systems`. Compatible con navegador y tests sin transpilación.
- **UI (React + htm)**: Componentes React escritos con `htm` (Hyperscript Tagged Markup) para evitar el paso de compilación (No Babel, No Webpack).

## Directorios
- `/src/core`: Motor lógico puro (Bus, State, GameLoop).
- `/src/services`: Gestores de lógica compleja (MechanicManager).
- `/src/systems`: Subsistemas de juego (Scanner, Portal, etc.).
- `/src/data`: Configuración centralizada (gameConfig.js) y datos narrativos.
- `/src/utils`: Utilidades puras independientes del framework (math, text, probability).
- `/src/ui/components`: Componentes visuales usando `html` tagged templates.
- `/src/ui/utils`: Utilidades de UI (binding de htm con React).
- `/src/ui/hooks`: Hooks de conexión con el estado global.

## Flujo de Datos
1. `GameLoop` emite tick.
2. `Systems` actualizan lógica y modifican `State`.
3. `State` (Proxy) detecta cambios y emite eventos via `Bus`.
4. `useGameState` (Hook) recibe evento y actualiza componentes React.
5. `Components` renderizan la nueva vista de forma reactiva.

## Ejecución (Desarrollo)
No se requiere `npm install` ni `npm run build` para ejecutar el juego.
Simplemente sirve el archivo `index.html` con cualquier servidor estático capaz de servir módulos ES.

Ejemplo con VS Code:
1. Instalar extensión "Live Server".
2. Click derecho en `index.html` -> "Open with Live Server".

## Testing
El proyecto incluye un setup mínimo para tests unitarios del Core.
- Framework: **Vitest** + **Happy-DOM**
- Configuración: `package.json` (solo devDependencies)
- Ejecutar tests: `npm test`

Nota: Los tests se ejecutan sobre los archivos fuente nativos `.js`.
