/**
 * FIXTURES.MJS
 * `test` extendido: espejo de CDN + captura de diagnósticos (JS, consola, red) en cada prueba.
 * Política de fallo:
 *   - pageerror (excepción no controlada)            → FAIL duro.
 *   - console.error de la app                         → FAIL duro.
 *   - HTTP >= 400 o request fallida de primera parte  → FAIL duro.
 *   - Terceros (fuentes, CDN) y warnings              → se adjuntan al informe, no rompen.
 * Una prueba puede declarar errores esperados con `diagnostics.allow(/regex/)`.
 */
import { test as base, expect } from '@playwright/test';
import { installCdnMirror } from './cdn-mirror.mjs';

// Ruido del propio navegador headless (WebGL por software), no de la app.
const BROWSER_NOISE = [/GL Driver Message/, /GPU stall/, /WebGL: INVALID/, /Automatic fallback to software WebGL/];

function newDiagnostics() {
    return {
        pageErrors: [],
        consoleErrors: [],
        consoleWarnings: [],
        httpErrors: [],
        failedRequests: [],
        mirrored: [],
        stubbed: [],
        unmirrored: [],
        allowed: [],
        allow(re) { this.allowed.push(re); },
    };
}

export const test = base.extend({
    diagnostics: [async ({}, use) => { await use(newDiagnostics()); }, { scope: 'test' }],

    context: async ({ context, diagnostics }, use) => {
        await installCdnMirror(context, diagnostics);
        await use(context);
    },

    page: async ({ page, diagnostics, baseURL }, use, testInfo) => {
        const origin = new URL(baseURL).origin;
        const isFirstParty = (url) => url.startsWith(origin);

        page.on('pageerror', (err) => diagnostics.pageErrors.push(`${err.name}: ${err.message}`));
        page.on('console', (msg) => {
            const text = msg.text();
            if (BROWSER_NOISE.some((re) => re.test(text))) return;
            const loc = msg.location();
            const entry = loc?.url ? `${text}  @ ${loc.url}:${loc.lineNumber}` : text;
            if (msg.type() === 'error') diagnostics.consoleErrors.push(entry);
            else if (msg.type() === 'warning') diagnostics.consoleWarnings.push(entry);
        });
        page.on('response', (res) => {
            if (res.status() >= 400) diagnostics.httpErrors.push({ status: res.status(), url: res.url(), firstParty: isFirstParty(res.url()) });
        });
        page.on('requestfailed', (req) => {
            const errorText = req.failure()?.errorText || 'unknown';
            // Navegaciones/medios abortados por el propio navegador al cambiar de pantalla no son fallos.
            if (errorText === 'net::ERR_ABORTED' && ['media', 'image'].includes(req.resourceType())) return;
            diagnostics.failedRequests.push({ url: req.url(), error: errorText, type: req.resourceType(), firstParty: isFirstParty(req.url()) });
        });

        await use(page);

        const { allow, ...serializable } = diagnostics;
        serializable.allowed = diagnostics.allowed.map(String);
        await testInfo.attach('runtime-diagnostics', {
            body: Buffer.from(JSON.stringify(serializable, null, 2)),
            contentType: 'application/json',
        });
        if (testInfo.status !== testInfo.expectedStatus) {
            await page.screenshot({ path: testInfo.outputPath('failure.png'), fullPage: true }).catch(() => {});
        }

        const notAllowed = (s) => !diagnostics.allowed.some((re) => re.test(s));
        // Consola: las líneas "Failed to load resource" ya se cuentan en httpErrors/failedRequests.
        const appConsoleErrors = diagnostics.consoleErrors.filter((e) => !/^Failed to load resource/.test(e)).filter(notAllowed);
        expect.soft(diagnostics.pageErrors.filter(notAllowed), 'Excepciones JavaScript no controladas').toEqual([]);
        expect.soft(appConsoleErrors, 'Errores de consola de la aplicación').toEqual([]);
        expect.soft(
            diagnostics.httpErrors.filter((e) => e.firstParty).map((e) => `${e.status} ${e.url}`).filter(notAllowed),
            'Errores HTTP de primera parte',
        ).toEqual([]);
        expect.soft(
            diagnostics.failedRequests.filter((e) => e.firstParty).map((e) => `${e.error} ${e.url}`).filter(notAllowed),
            'Requests de primera parte fallidas',
        ).toEqual([]);
        expect.soft(diagnostics.unmirrored, 'Dependencias de CDN sin espejo (añadir a cdn-mirror.mjs)').toEqual([]);
    },
});

export { expect };

/* ---------------------------------------------------------------- helpers de juego */

export const MENU = ['Iniciar Juego', 'Selector de Secuencias', 'Archivo de Lore', 'Expediente', 'Configuración'];

/** Carga la app con un localStorage inicial (antes de que arranque el motor). */
export async function bootGame(page, storage = {}) {
    if (Object.keys(storage).length) {
        await page.addInitScript((entries) => {
            // Sólo en la primera carga: si no, un reload pisaría lo que el juego guardó.
            if (sessionStorage.getItem('__qa_seeded')) return;
            for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
            sessionStorage.setItem('__qa_seeded', '1');
        }, storage);
    }
    const response = await page.goto('./');
    expect(response?.status(), 'index.html debe responder 200').toBe(200);
    await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
    return response;
}

export const SKIP_TUTORIALS = { nakasthu_skip_tutorials: 'true', nakasthu_tutorial_seen: 'true' };

/** Pulsa sobre la cinemática hasta que deje de estar visible (o se alcance `maxClicks`). */
export async function advanceCinematic(page, { maxClicks = 30 } = {}) {
    const cine = page.locator('.cinematic-screen');
    await expect(cine).toBeVisible();
    for (let i = 0; i < maxClicks && await cine.isVisible(); i++) {
        await cine.click({ position: { x: 20, y: 20 } }).catch(() => {});
        await page.waitForTimeout(150);
    }
    await expect(cine).toBeHidden();
}

/** Mecánica del monolito: mantener Espacio (escritorio) o el dedo sobre el monolito (táctil) hasta 100%. */
export async function holdMonolith(page) {
    const mechanic = page.locator('.special-mechanic-container');
    await expect(mechanic).toBeVisible();
    const touch = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    const done = () => page.evaluate(() => {
        const bar = document.querySelector('.special-mechanic-container .absolute.inset-y-0.left-0');
        return window.state.currentStep !== 2 || /width: 100%/.test(bar?.getAttribute('style') || '');
    });
    const monolith = mechanic.locator('.monolith');
    if (touch) await monolith.dispatchEvent('touchstart');
    else await page.keyboard.down('Space');
    await expect.poll(done, { timeout: 15_000 }).toBe(true);
    if (touch) await monolith.dispatchEvent('touchend').catch(() => {});
    else await page.keyboard.up('Space');
}

/** Abre el selector y salta a un paso concreto (requiere nakasthu_max_step >= step). */
export async function jumpToStep(page, step) {
    await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
    const id = `PASO_${String(step).padStart(2, '0')}`;
    const btn = page.getByRole('button').filter({ hasText: id });
    await expect(btn).toBeEnabled();
    await btn.click();
}

/** Desde el briefing del paso 4 entra a operaciones. */
export async function startOperations(page) {
    const briefing = page.locator('.game-modal-overlay');
    await expect(briefing).toBeVisible();
    const btn = briefing.getByRole('button', { name: /RECIBIENDO TRANSMISIÓN|INICIAR OPERACIONES/ });
    if ((await btn.textContent().catch(() => '')).trim() !== 'INICIAR OPERACIONES') await btn.click();
    await briefing.getByRole('button', { name: 'INICIAR OPERACIONES' }).click();
    await expect(briefing).toBeHidden();
}

export async function engine(page, fn, arg) {
    return page.evaluate(fn, arg);
}

export async function noHorizontalOverflow(page) {
    const d = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
    }));
    expect(d.document, JSON.stringify(d)).toBeLessThanOrEqual(d.viewport + 1);
    expect(d.body, JSON.stringify(d)).toBeLessThanOrEqual(d.viewport + 1);
    return d;
}

/** Captura guardada en test-results y adjunta al informe con nombre legible. */
export async function snap(page, testInfo, name) {
    const path = testInfo.outputPath(`${name}.png`);
    await page.screenshot({ path, fullPage: true });
    await testInfo.attach(name, { path, contentType: 'image/png' });
}

/** En móvil los paneles viven en pestañas: activa la que contiene `locator` si no está visible. */
export async function revealOnMobile(page, locator, tab) {
    if (await locator.first().isVisible()) return;
    const tabs = page.locator('.mobile-tabs');
    if (await tabs.isVisible()) await tabs.getByRole('button', { name: tab, exact: true }).click();
    await expect(locator.first()).toBeVisible();
}

/** Lanza el escaneo biométrico desde el panel del escáner (no desde la guía de pasos). */
export async function scanBiometric(page) {
    await expect.poll(() => page.evaluate(() => Boolean(window.state.currentEntity && !window.state.currentEntity._processed)), { timeout: 15_000 }).toBe(true);
    // Botón del panel escáner (en móvil no muestra el atajo numérico); excluye la guía "1 Escanear".
    const scanBtn = page.getByRole('button', { name: /^(REQUERIDO\s*)?(\d\s*)?BIOMÉTRICO/ });
    await revealOnMobile(page, scanBtn, 'Escáner');
    await scanBtn.first().click();
    await expect.poll(() => page.evaluate(() => window.state.currentEntity?.scannedTypes?.includes('BIOMETRIC')), { timeout: 15_000 }).toBe(true);
    const tabs = page.locator('.mobile-tabs');
    if (await tabs.isVisible()) await tabs.getByRole('button', { name: 'Mando', exact: true }).click();
}

export async function openPause(page) {
    // Escritorio: botón del panel de control. Móvil: botón fijo en la barra de pestañas.
    await page.locator('button[title="PAUSA"]:visible').first().click();
    await expect(page.getByRole('heading', { name: 'SISTEMA EN ESPERA' })).toBeVisible();
}
