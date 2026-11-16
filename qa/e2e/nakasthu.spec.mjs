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

  // Paso 3: avanzar hasta la primera fase de gameplay.
  cinematic = page.locator('.cinematic-screen');
  await expect(cinematic).toBeVisible();
  await cinematic.click();
  await expect(cinematic.locator('.cine-next')).toContainText('Continuar');
  await cinematic.click();

  const briefing = page.locator('.game-modal-overlay');
  await expect(briefing).toBeVisible();
  await briefing.getByRole('button', { name: 'INICIAR OPERACIONES' }).click();

  // La UI informa que las decisiones están bloqueadas hasta validar biometría.
  await expect(page.getByText(/AUTORIZACIÓN PENDIENTE DE VALIDACIÓN BIOMÉTRICA/)).toBeVisible();
  await expect(page.getByRole('button', { name: /AUTORIZAR/ })).toHaveCount(0);

  const scanButton = page.getByRole('button', { name: /^REQUERIDO 4 BIOMÉTRICO/ });
  await expect(scanButton).toBeVisible();
  await expect(scanButton).toBeEnabled();
  const energyBeforeScan = await page.evaluate(() => window.state.energy);
  await scanButton.click();

  // Confirmar el resultado en el estado real del motor, no solo en el texto de la UI.
  await expect.poll(
    () => page.evaluate(() => window.state.currentEntity?.scannedTypes?.includes('BIOMETRIC')),
    { timeout: 10_000 }
  ).toBe(true);
  const energyAfterScan = await page.evaluate(() => window.state.energy);
  expect(energyAfterScan).toBeLessThan(energyBeforeScan);

  // La validación biométrica debe habilitar la acción de autorización.
  const authorize = page.getByRole('button', { name: /AUTORIZAR/ });
  await expect(authorize).toBeVisible({ timeout: 10_000 });
  await expect(authorize).toBeEnabled();

  // Ejecutar la autorización desde el botón visible.
  await authorize.click();
  await expect.poll(() => page.evaluate(() => window.state.processedCount), { timeout: 8_000 }).toBe(1);
  await expect(page.getByText('1 / 10', { exact: true })).toBeVisible({ timeout: 8_000 });

  // Terminal: ejecutar un comando real desde su input.
  const terminalInput = page.locator('input[type="text"]').first();
  await expect(terminalInput).toBeEnabled();
  await terminalInput.fill('/status');
  await terminalInput.press('Enter');
  await expect(page.locator('#terminal-log')).toContainText('SYS_INFO:');

  // El motor bloquea comandos consecutivos duplicados.
  await terminalInput.fill('/status');
  await terminalInput.press('Enter');
  await expect(page.locator('#terminal-log')).toContainText('COMANDO REPETIDO DETECTADO');

  // Pausar y guardar desde el menú de pausa.
  await page.locator('button[title="PAUSA"]').click();
  await expect(page.getByRole('button', { name: 'Guardar Partida', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar Partida', exact: true }).click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('nakasthu_save_v1') || 'null'));
  expect(saved).not.toBeNull();
  expect(saved.currentStep).toBe(4);
  expect(saved.storyPath).toBe(0);
  expect(saved.timestamp).toBeGreaterThan(0);
  expect(Array.isArray(saved.unlockedModules)).toBe(true);

  await page.screenshot({ path: 'test-results/nakasthu-gameplay-step-04.png', fullPage: true });
});

test('final Orden: la elección se refleja en el epílogo y permite completar la historia', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('nakasthu_max_step', '11'));
  await page.reload();

  await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
  const step11 = page.getByRole('button').filter({ hasText: 'PASO_11' });
  await expect(step11).toBeEnabled();
  await step11.click();

  await expect(page.getByRole('heading', { name: 'El Juicio Final', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'EJECUTAR SENTENCIA', exact: true }).click();

  const epilogue = page.locator('.cinematic-screen');
  await expect(epilogue).toBeVisible();
  await expect(epilogue.locator('.cine-title')).toHaveText('Epílogo');
  await epilogue.click();
  await expect(epilogue.locator('.cine-text')).toContainText('Cierras el portal. La humanidad sobrevive');
  await epilogue.click();
  await expect(page.getByRole('heading', { name: 'PROTOCOLOS COMPLETADOS' })).toBeVisible();
});

test('final Caos: la elección alternativa conserva su propio epílogo', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('nakasthu_max_step', '11'));
  await page.reload();

  await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
  const step11 = page.getByRole('button').filter({ hasText: 'PASO_11' });
  await expect(step11).toBeEnabled();
  await step11.click();

  await expect(page.getByRole('heading', { name: 'El Juicio Final', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'ABRAZAR EL VACÍO', exact: true }).click();

  const epilogue = page.locator('.cinematic-screen');
  await expect(epilogue).toBeVisible();
  await expect(epilogue.locator('.cine-title')).toHaveText('Epílogo');
  await epilogue.click();
  await expect(epilogue.locator('.cine-text')).toContainText('Kamin empuja a Leina hacia la grieta');
  await epilogue.click();
  await expect(page.getByRole('heading', { name: 'PROTOCOLOS COMPLETADOS' })).toBeVisible();
});

test('persistencia: un guardado existente no ofrece reanudación desde el menú', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('nakasthu_save_v1', JSON.stringify({
    currentStep: 4,
    storyPath: 0,
    unlockedModules: [],
    timestamp: Date.now(),
  })));
  await page.reload();

  await expect(page.getByRole('button', { name: 'Iniciar Juego', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Cargar Partida|Reanudar Partida|Continuar Partida/ })).toHaveCount(0);

  // Evidencia del comportamiento actual: Iniciar Juego arranca en la secuencia 01,
  // aunque localStorage contiene un guardado del paso 04.
  await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).click();
  await expect(page.locator('.cinematic-screen')).toBeVisible();
  await expect(page.locator('.cine-seq')).toHaveText('SECUENCIA 01');
});

test('responsive gameplay: las cuatro pestañas móviles cambian el panel activo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    localStorage.setItem('nakasthu_max_step', '4');
    localStorage.setItem('nakasthu_skip_tutorials', 'true');
    localStorage.setItem('nakasthu_tutorial_seen', 'true');
  });
  await page.reload();

  await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
  const step4 = page.getByRole('button').filter({ hasText: 'PASO_04' });
  await expect(step4).toBeEnabled();
  await step4.click();

  const briefing = page.locator('.game-modal-overlay');
  await expect(briefing).toBeVisible();
  await briefing.getByRole('button', { name: 'INICIAR OPERACIONES' }).click();

  const tabs = page.locator('.mobile-tabs');
  const grid = page.locator('.main-layout-grid').first();
  await expect(tabs).toBeVisible();
  await expect(grid).toHaveAttribute('data-tab', 'mando');

  for (const [label, key] of [['Escáner', 'escaner'], ['Sistemas', 'sistemas'], ['Registro', 'registro'], ['Mando', 'mando']]) {
    await tabs.getByRole('button', { name: label, exact: true }).click();
    await expect(grid).toHaveAttribute('data-tab', key);
  }

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1);
  await page.screenshot({ path: 'test-results/nakasthu-mobile-gameplay.png', fullPage: true });
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
