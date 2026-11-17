/**
 * SMOKE: ¿arranca el Bastión? Carga inicial, módulos, errores JS/HTTP e integridad de UI.
 * Debe ser rápido (< 10 s por prueba) y bloquear cualquier despliegue si falla.
 */
import { test, expect, bootGame, MENU, snap, noHorizontalOverflow } from '../support/fixtures.mjs';

test.describe('SMOKE · carga inicial', () => {
    test('index.html responde 200, título correcto y React monta #root', async ({ page }, testInfo) => {
        const res = await bootGame(page);
        expect(res.headers()['content-type']).toMatch(/text\/html/);
        await expect(page).toHaveTitle(/NAKASTHU/);
        expect(await page.locator('#root > *').count()).toBeGreaterThan(0);
        await snap(page, testInfo, 'smoke-menu');
    });

    test('todos los módulos ES de primera parte cargan con 200', async ({ page, baseURL }) => {
        const modules = [];
        page.on('response', (r) => {
            if (r.url().startsWith(baseURL) && r.request().resourceType() === 'script') modules.push({ url: r.url(), status: r.status() });
        });
        await bootGame(page);
        await page.waitForLoadState('networkidle');
        expect(modules.length, 'Se esperan módulos de src/ cargados').toBeGreaterThan(20);
        expect(modules.filter((m) => m.status !== 200 && m.status !== 304)).toEqual([]);
    });

    test('librerías globales disponibles (React, ReactDOM, Motion)', async ({ page }) => {
        await bootGame(page);
        const libs = await page.evaluate(() => ({
            react: window.React?.version,
            reactDom: typeof window.ReactDOM?.createRoot,
            motion: typeof window.Motion?.animate,
        }));
        expect(libs.react).toMatch(/^18\./);
        expect(libs.reactDom).toBe('function');
        expect(libs.motion).toBe('function');
    });

    test('motor expuesto e inicializado (state, sistemas, secuenciador)', async ({ page }) => {
        await bootGame(page);
        const engine = await page.evaluate(() => ({
            hasState: typeof window.state === 'object' && window.state !== null,
            systems: Object.keys(window.__SYSTEMS__ || {}).length,
            sequencer: typeof window.__NAKASTHU_SEQUENCER__?.jumpToStep,
            energy: window.state?.energy,
            maxStep: window.state?.maxStepReached,
        }));
        expect(engine.hasState).toBe(true);
        expect(engine.systems).toBeGreaterThan(0);
        expect(engine.sequencer).toBe('function');
        expect(engine.energy).toBeGreaterThan(0);
        expect(engine.maxStep).toBe(1);
    });
});

test.describe('SMOKE · integridad de interfaz', () => {
    test('menú principal: 5 acciones visibles y habilitadas', async ({ page }) => {
        await bootGame(page);
        for (const label of MENU) {
            const btn = page.getByRole('button', { name: label, exact: true });
            await expect(btn, label).toBeVisible();
            await expect(btn, label).toBeEnabled();
        }
    });

    test('pantalla de Game Over no visible ni interactuable en el arranque', async ({ page }) => {
        await bootGame(page);
        // El overlay vive en el DOM desde el arranque (para el fundido): debe ser invisible,
        // no capturar clics y quedar fuera del árbol de accesibilidad.
        const overlay = page.locator('.death-screen');
        await expect(overlay).not.toHaveClass(/active/);
        await expect(overlay).toHaveCSS('opacity', '0');
        await expect(overlay).toHaveCSS('pointer-events', 'none');
        await expect(overlay).toHaveAttribute('aria-hidden', 'true');
        await expect(page.getByRole('heading', { name: 'BASTIÓN COMPROMETIDO' })).toHaveCount(0);
    });

    test('Tailwind aplica estilos (fondo oscuro, fuente monoespaciada)', async ({ page }) => {
        await bootGame(page);
        const style = await page.evaluate(() => {
            const b = getComputedStyle(document.body);
            return { bg: b.backgroundColor, font: b.fontFamily };
        });
        expect(style.bg).not.toBe('rgba(0, 0, 0, 0)');
        expect(style.font).toMatch(/JetBrains Mono|monospace/i);
    });

    test('sin desbordamiento horizontal en escritorio', async ({ page }) => {
        await bootGame(page);
        await noHorizontalOverflow(page);
    });
});
