# Nakasthu QA

## Local execution

The smoke and end-to-end tests use the published GitHub Pages build by default.

```bash
npm ci
npm install --no-save @playwright/test
npx playwright install chromium
BASE_URL=https://yosoymitxel.github.io/nakasthu/ npx playwright test --config=qa/playwright.config.mjs
```

Run the existing unit and syntax suite separately:

```bash
npm test
```

## Browser coverage

- Initial app mount and main menu.
- Settings toggles (sound and visual effects).
- Sequence selector and locked-step behavior.
- Lore archive and achievements panel.
- Cinematic progression and the actual hold-to-sync monolith interaction.
- Step 4 gameplay: required biometric scan, decision gating, authorization, quota increment, terminal commands, pause and save.
- Both end branches (Orden and Caos).
- Desktop and mobile navigation tabs, plus horizontal overflow checks.
- Runtime JavaScript exceptions fail the run. Console errors and failed requests are attached to the Playwright HTML report for review.

## Known functional gap

The pause menu writes `nakasthu_save_v1` to localStorage, but the start menu currently has no load/resume control. The persistence manager exposes a `loadGame()` method, but the tested player flow cannot resume a saved step. The E2E suite records this current behavior explicitly; saving is not equivalent to restoring a session.
