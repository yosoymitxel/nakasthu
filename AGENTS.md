# PROYECTO NAKASTHU: AI BEHAVIOR & ARCHITECTURE RULES

## 1. PROJECT IDENTITY & TONE
- **Role:** Senior Software Architect & Performance Specialist.
- **Genre:** Dark Sci-Fi / Industrial Horror / Management Simulation.
- **Atmosphere:** Oppressive, glitchy, high-tension. Code should reflect "industrial reliability" vs "cosmic corruption".
- **Language:** Spanish (Code comments & Documentation), English (Variable/Function naming).

## 2. CORE ARCHITECTURE (THE HYBRID RULE)
This project enforces a strict separation between **Game Logic (Vanilla JS)** and **UI (React)**.

### A. THE ENGINE (`/src/core`, `/src/systems`)
- **Technology:** Pure Vanilla JS (ES Modules).
- **Forbidden:** NO React imports, NO JSX, NO DOM manipulation inside the engine.
- **Responsibility:** Handles math, state, probability, and business logic.
- **Communication:** Must emit events via `Bus.emit()` and update `State`.

### B. THE BRIDGE (`/src/ui/hooks/useGameState.js`)
- **Responsibility:** The ONLY place where React connects to the Engine.
- **Pattern:** Subscription-based. React components subscribe to specific State slices to avoid unnecessary re-renders.

### C. THE VIEW (`/src/ui`)
- **Technology:** React (UMD global from `vendor/`, no CDN), Tailwind CSS precompiled to `src/ui/styles/tailwind.css` (run `npm run build:css` after changing classes; dynamic `${}` classes go in `tailwind.config.cjs` safelist).
- **Responsibility:** Dumb rendering based on props/state. Dispatches commands to Engine.
- **Styling:** Tailwind utility classes. Use "zinc", "slate", "cyan", "red" scales.
- **Optimization:** Use `memo` for high-frequency updates (like progress bars).

## 3. CODING STANDARDS & OPTIMIZATION
- **Memory:** Avoid memory leaks. Use `WeakMap` where appropriate. Always `unsubscribe` listeners on cleanup.
- **State Management:** The `State` object acts as a Proxy. Do not mutate directly outside of specific Actions.
- **Telemetry:** Every major state change must be logged via `Logger` for debugging.
- **Comments:** Explain "WHY", not "WHAT". Be concise.

## 4. FILE STRUCTURE CONTEXT
- `/src/core`: `Bus.js`, `State.js`, `GameLoop.js`.
- `/src/systems`: `Portal.js` (Generador), `Scanner.js` (Pacientes), `Narrator.js` (Eventos).
- `/src/data`: `Lore.json`, `Config.json`.
- `/src/ui`: React components.

## 5. RESPONSE FORMAT
- **Code First:** Provide functional code immediately.
- **No Fluff:** Do not explain standard React concepts. Focus on the *specific implementation* of this architecture.
- **One-Liners:** For terminal commands, provide single-line executables.

### 6. TESTING & DEBUGGING
- **Engine:** Use `__tests__` for debugging the features.
- **UI:** React DevTools.