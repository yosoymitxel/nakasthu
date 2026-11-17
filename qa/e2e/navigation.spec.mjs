/**
 * E2E · Navegación entre secciones del menú y modales.
 * Cada prueba vuelve al menú para garantizar que la salida también funciona.
 */
import { test, expect, bootGame, snap } from '../support/fixtures.mjs';

const home = (page) => expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();

test.describe('E2E · navegación', () => {
    test('Configuración: toggles de efectos y sonido cambian y persisten tras recarga', async ({ page }, testInfo) => {
        await bootGame(page);
        await page.getByRole('button', { name: 'Configuración', exact: true }).click();
        const modal = page.locator('.modal-overlay').filter({ has: page.getByRole('heading', { name: 'CONFIGURACIÓN' }) });
        await expect(modal).toBeVisible();

        const effects = modal.getByRole('button', { name: /^(Completos|Reducidos)$/ });
        const sound = modal.getByRole('button', { name: /^(Activado|Silencio)$/ });
        const effectsBefore = (await effects.textContent()).trim();
        const soundBefore = (await sound.textContent()).trim();
        await effects.click();
        await sound.click();
        await expect(effects).not.toHaveText(effectsBefore);
        await expect(sound).not.toHaveText(soundBefore);
        const effectsAfter = (await effects.textContent()).trim();
        const soundAfter = (await sound.textContent()).trim();
        await snap(page, testInfo, 'e2e-config');

        await modal.getByRole('button', { name: 'Cerrar', exact: true }).first().click();
        await home(page);

        await page.reload();
        await page.getByRole('button', { name: 'Configuración', exact: true }).click();
        await expect(modal.getByRole('button', { name: effectsAfter, exact: true })).toBeVisible();
        await expect(modal.getByRole('button', { name: soundAfter, exact: true })).toBeVisible();
    });

    test('Configuración: Escape cierra el modal', async ({ page }) => {
        await bootGame(page);
        await page.getByRole('button', { name: 'Configuración', exact: true }).click();
        const heading = page.getByRole('heading', { name: 'CONFIGURACIÓN' });
        await expect(heading).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(heading).toBeHidden();
    });

    test('Selector de secuencias: paso 1 libre, resto bloqueado, cierre vuelve al menú @responsive', async ({ page }, testInfo) => {
        await bootGame(page);
        await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
        const heading = page.getByRole('heading', { name: 'Selector de Secuencias' });
        await expect(heading).toBeVisible();
        await expect(page.getByRole('button').filter({ hasText: 'PASO_01' })).toBeEnabled();
        for (const n of ['02', '04', '11', '12']) {
            await expect(page.getByRole('button').filter({ hasText: `PASO_${n}` })).toBeDisabled();
        }
        await snap(page, testInfo, 'e2e-selector');
        await heading.locator('xpath=../..').getByRole('button').first().click();
        await expect(heading).toBeHidden();
        await home(page);
    });

    test('Selector de secuencias: con progreso guardado desbloquea hasta el máximo alcanzado', async ({ page }) => {
        await bootGame(page, { nakasthu_max_step: '6' });
        await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
        for (const n of ['01', '02', '03', '04', '05', '06']) {
            await expect(page.getByRole('button').filter({ hasText: `PASO_${n}` }), `PASO_${n}`).toBeEnabled();
        }
        await expect(page.getByRole('button').filter({ hasText: 'PASO_07' })).toBeDisabled();
    });

    test('Archivo de Lore: vacío al inicio y "Cerrar" vuelve al menú @responsive', async ({ page }, testInfo) => {
        await bootGame(page);
        await page.getByRole('button', { name: 'Archivo de Lore', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Archivo de Datos Zhyr' })).toBeVisible();
        await expect(page.getByText('Sin datos fragmentados')).toBeVisible();
        await snap(page, testInfo, 'e2e-lore');
        await page.getByRole('button', { name: /^Cerrar/ }).click();
        await home(page);
    });

    test('Expediente: diálogo accesible con logros, cierre con botón @responsive', async ({ page }, testInfo) => {
        await bootGame(page);
        await page.getByRole('button', { name: 'Expediente', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Expediente del operador' });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('heading', { name: /Logros/ })).toBeVisible();
        await snap(page, testInfo, 'e2e-expediente');
        await dialog.getByRole('button', { name: 'Cerrar' }).click();
        await expect(dialog).toBeHidden();
        await home(page);
    });

    test('Abrir y cerrar todas las secciones en cadena no deja overlays residuales', async ({ page }) => {
        await bootGame(page);
        for (let round = 0; round < 2; round++) {
            await page.getByRole('button', { name: 'Configuración', exact: true }).click();
            await page.keyboard.press('Escape');
            await page.getByRole('button', { name: 'Expediente', exact: true }).click();
            await page.getByRole('dialog', { name: 'Expediente del operador' }).getByRole('button', { name: 'Cerrar' }).click();
            await page.getByRole('button', { name: 'Archivo de Lore', exact: true }).click();
            await page.getByRole('button', { name: /^Cerrar/ }).click();
        }
        await home(page);
        await expect(page.locator('.modal-overlay')).toHaveCount(0);
        // El botón principal debe seguir recibiendo el clic (nada encima).
        await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).click({ trial: true });
    });
});
