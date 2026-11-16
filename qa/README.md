# NAKASTHU · QA en navegador (Playwright)

Pruebas reales dentro del juego: se arranca `index.html` con un servidor estático, Chromium pulsa
lo que pulsaría el jugador y cada prueba verifica el efecto en la UI **y** en el `State` del motor
(`window.state`).

## Ejecutar

```bash
npm ci && npx playwright install chromium   # una vez
npm run qa                                  # sintaxis + vitest + suite navegador + informe
npm run test:smoke                          # sólo smoke (~20 s)
npm run test:e2e                            # flujos de usuario (escritorio + Pixel 7)
npm run test:regression                     # regresión
npm run test:browser:live                   # igual, pero con los CDN reales
npm run qa:report                           # regenera test-results/QA_REPORT.md
```

Reproducir una prueba concreta: `npx playwright test --config=qa/playwright.config.mjs --project=e2e qa/e2e/gameplay.spec.mjs:77`
Con traza: `QA_TRACE=on npx playwright test ...` y `npx playwright show-trace test-results/**/trace.zip`.

## Estructura

| Carpeta | Contenido |
|---|---|
| `smoke/` | Carga inicial, módulos ES, librerías globales, motor inicializado, integridad de UI. |
| `e2e/` | Navegación de menú/modales, cinemáticas, monolito, paso 4 completo (10 sujetos), terminal, pausa/guardar/salir, tutorial, ambos finales. |
| `regression/` | localStorage corrupto/vacío/bloqueado, doble ejecución, carreras, Escape/L, recarga, foco por teclado, responsive. |
| `support/` | Fixtures (diagnósticos), espejo CDN, build de Tailwind, generador de informe. |

Proyectos: `smoke`, `e2e`, `regression` (1440×960) y `mobile` (Pixel 7, pruebas etiquetadas `@responsive`).

## Política de fallo (automática en cada prueba)

- Excepción JS no controlada → FAIL.
- `console.error` de la app → FAIL (`diagnostics.allow(/re/)` para errores esperados).
- HTTP ≥ 400 o request fallida de primera parte → FAIL.
- Terceros y warnings → se adjuntan al informe, no rompen.

## Espejo CDN

`unpkg.com` y `cdn.tailwindcss.com` se sirven desde `node_modules` (versiones fijadas en `package.json`).
Tailwind se precompila en `qa/.cache/` con la configuración inline de `index.html`.
Modelos 3D de polyfork.dev, texturas y audio se sustituyen por stubs mínimos.
`QA_CDN=live` desactiva el espejo. Si una URL de CDN nueva no tiene regla, la prueba falla con
"Dependencias de CDN sin espejo" → añadirla en `support/cdn-mirror.mjs`.

## Balance

`__tests__/balance_step4.test.js` simula miles de turnos con las fórmulas reales y exige que cada
turno jugable sea ganable (≥ 55% sólo con el escaneo obligatorio, ≥ 70–75% usando escaneos extra).
Si se toca `gameConfig.js`, `scannerUtils.js` o `stepsConfig.js`, `npm test` avisa si un nivel vuelve a ser imposible.
