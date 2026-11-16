import { test, expect } from '@playwright/test';

const runtime = new WeakMap();

test.beforeEach(async ({ page }) => {
  const diagnostics = { pageErrors: [], consoleErrors: [], failedRequests: [] };
  runtime.set(page, diagnostics);
  page.on('pageerror', error => diagnostics.pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => diagnostics.failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText || 'unknown',
  }));

  const response = await page.goto('./');
  expect(response, 'GitHub Pages debe responder a la navegación inicial').not.toBeNull();
  expect(response.status(), 'La página publicada debe responder HTTP 200').toBe(200);
  await expect(page.locator('#root > *').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
});

test.afterEach(async ({ page }, testInfo) => {
  const diagnostics = runtime.get(page);
  if (!diagnostics) return;
  await testInfo.attach('runtime-diagnostics', {
    body: Buffer.from(JSON.stringify(diagnostics, null, 2)),
    contentType: 'application/json',
  });
  // Unhandled exceptions are hard failures. Console and request diagnostics
  // are attached even when a third-party CDN emits a non-fatal warning.
  expect(diagnostics.pageErrors, 'No deben aparecer excepciones JavaScript no controladas').toEqual([]);
});

test('smoke: aplicación montada y menú principal operativo', async ({ page }) => {
  await expect(page).toHaveTitle(/NAKASTHU/i);
  for (const label of ['Iniciar Juego', 'Selector de Secuencias', 'Archivo de Lore', 'Expediente', 'Configuración']) {
    await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
  }
  await page.screenshot({ path: 'test-results/nakasthu-menu.png', fullPage: true });
});

test('configuración: los controles de efectos y sonido cambian de estado', async ({ page }) => {
  await page.getByRole('button', { name: 'Configuración', exact: true }).click();
  const modal = page.locator('.modal-overlay').filter({
    has: page.getByRole('heading', { name: 'CONFIGURACIÓN' }),
  });
  await expect(modal).toBeVisible();
  await expect(modal.getByText('AJUSTES TÉCNICOS DEL NÚCLEO BASTIÓN.')).toBeVisible();

  const effects = modal.getByRole('button', { name: /^(Completos|Reducidos)$/ });
  await expect(effects).toBeVisible();
  const effectsBefore = (await effects.innerText()).trim();
  await effects.click();
  await expect(effects).not.toHaveText(effectsBefore);

  const sound = modal.getByRole('button', { name: /^(Activado|Silencio)$/ });
  await expect(sound).toBeVisible();
  const soundBefore = (await sound.innerText()).trim();
  await sound.click();
  await expect(sound).not.toHaveText(soundBefore);

  await modal.getByRole('button', { name: /✕/ }).click();
  await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
});

test('selector de secuencias: muestra el primer paso y bloquea los no desbloqueados', async ({ page }) => {
  await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
  const heading = page.getByRole('heading', { name: 'Selector de Secuencias' });
  await expect(heading).toBeVisible();

  const firstStep = page.getByRole('button').filter({ hasText: 'PASO_01' });
  const secondStep = page.getByRole('button').filter({ hasText: 'PASO_02' });
  await expect(firstStep).toBeEnabled();
  await expect(secondStep).toBeDisabled();

  await heading.locator('xpath=../..').getByRole('button').click();
  await expect(heading).toBeHidden();
});

test('archivo de lore: abre la pantalla y permite regresar al menú', async ({ page }) => {
  await page.getByRole('button', { name: 'Archivo de Lore', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Archivo de Datos Zhyr' })).toBeVisible();
  await expect(page.getByText('Sin datos fragmentados')).toBeVisible();
  await page.getByRole('button', { name: /Cerrar Terminal/ }).click();
  await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
});

test('expediente: abre el panel de logros y cierra correctamente', async ({ page }) => {
  await page.getByRole('button', { name: 'Expediente', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Expediente del operador' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /Logros/ })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog).toBeHidden();
});

test('flujo jugable inicial: cinemática → sincronización del monolito → siguiente secuencia', async ({ page }) => {
  await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).click();

  const cinematic = page.locator('.cinematic-screen');
  await expect(cinematic).toBeVisible();
  await expect(cinematic.getByText('SECUENCIA 01')).toBeVisible();

  // Primer clic completa el subtítulo; el segundo confirma el avance.
  await cinematic.click();
  await expect(cinematic.locator('.cine-next')).toContainText('Continuar');
  await cinematic.click();

  const mechanic = page.locator('.special-mechanic-container');
  await expect(mechanic).toBeVisible();
  const progressBar = mechanic.locator('.absolute.inset-y-0.left-0').first();
  // La barra empieza en ancho cero; se vuelve visible al sincronizar.

  // La mecánica real requiere mantener espacio; se completa mediante teclado.
  await page.keyboard.down('Space');
  await expect(progressBar).toHaveAttribute('style', /width: 100%/, { timeout: 12_000 });
  await page.keyboard.up('Space');

  await expect(page.locator('.cinematic-screen')).toBeVisible({ timeout: 12_000 });
  await expect(page.locator('.cine-title')).toHaveText('El Gran Desvío');
  await page.screenshot({ path: 'test-results/nakasthu-step-03.png', fullPage: true });
});

test('gameplay: validación biométrica → autorización → terminal → pausa y guardado', async ({ page }) => {
  // Evitar interrupciones de tutoriales para recorrer el flujo de operaciones.
  await page.evaluate(() => {
    localStorage.setItem('nakasthu_skip_tutorials', 'true');
    localStorage.setItem('nakasthu_tutorial_seen', 'true');
  });
  await page.reload();

  await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).click();

  // Paso 1: cinemática inicial.
  let cinematic = page.locator('.cinematic-screen');
  await expect(cinematic).toBeVisible();
  await cinematic.click();
  await expect(cinematic.locator('.cine-next')).toContainText('Continuar');
  await cinematic.click();

  // Paso 2: completar sincronización real del monolito manteniendo Espacio.
  const mechanic = page.locator('.special-mechanic-container');
  await expect(mechanic).toBeVisible();
  const progressBar = mechanic.locator('.absolute.inset-y-0.left-0').first();
  await page.keyboard.down('Space');
  await expect(progressBar).toHaveAttribute('style', /width: 100%/, { timeout: 12_000 });
  await page.keyboard.up('Space');

  // Paso 3: avanzar la cinemática hasta la primera fase de gameplay.
  cinematic = page.locator('.cinematic-screen');
  await expect(cinematic).toBeVisible();
  await cinematic.click();
  await expect(cinematic.locator('.cine-next')).toContainText('Continuar');
  await cinematic.click();

  const briefing = page.locator('.game-modal-overlay');
  await expect(briefing).toBeVisible();
  await briefing.getByRole('button', { name: 'INICIAR OPERACIONES' }).click();
  await expect.poll(() => page.evaluate(() => window.__NAKASTHU_STATE__?.currentStep)).toBe(4);

  // La autorización debe permanecer bloqueada hasta completar el escaneo requerido.
  const authorize = page.locator('.h-16').last().getByRole('button', { name: /AUTORIZAR/ });
  await expect(authorize).toBeDisabled();

  const scanButton = page.getByRole('button', { name: /BIOMÉTRICO/ });
  await expect(scanButton).toBeVisible();
  const energyBeforeScan = await page.evaluate(() => window.__NAKASTHU_STATE__?.energy);
  await scanButton.click();

  await expect.poll(() => page.evaluate(() => {
    const state = window.__NAKASTHU_STATE__;
    return Boolean(state?.currentEntity?.scannedTypes?.includes('BIOMETRIC') && !state.activeScan);
  }), { timeout: 10_000 }).toBe(true);
  const energyAfterScan = await page.evaluate(() => window.__NAKASTHU_STATE__?.energy);
  expect(energyAfterScan).toBeLessThan(energyBeforeScan);
  await expect(authorize).toBeEnabled();

  // La acción se ejecuta por el botón de la interfaz; el motor debe registrar exactamente un sujeto.
  await authorize.click();
  await expect.poll(() => page.evaluate(() => window.__NAKASTHU_STATE__?.processedCount), { timeout: 5_000 }).toBe(1);

  // Terminal: enviar un comando real desde el input de la consola.
  const terminalInput = page.locator('input[type="text"]').first();
  await expect(terminalInput).toBeEnabled();
  await terminalInput.fill('/status');
  await terminalInput.press('Enter');
  await expect(page.locator('#terminal-log')).toContainText('SYS_INFO:');

  // Pausa y guardado desde la interfaz.
  await page.locator('button[title="PAUSA"]').click();
  await expect.poll(() => page.evaluate(() => window.__NAKASTHU_STATE__?.isPaused)).toBe(true);
  await page.getByRole('button', { name: 'Guardar Partida', exact: true }).click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('nakasthu_save_v1') || 'null'));
  expect(saved).not.toBeNull();
  expect(saved.currentStep).toBe(4);
  expect(saved.storyPath).toBe(0);
  expect(saved.timestamp).toBeGreaterThan(0);

  await page.screenshot({ path: 'test-results/nakasthu-gameplay-step-04.png', fullPage: true });
});

test('responsive: menú usable en viewport móvil sin desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Iniciar Juego', exact: true })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
  await page.screenshot({ path: 'test-results/nakasthu-mobile-menu.png', fullPage: true });
});
