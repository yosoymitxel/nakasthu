/**
 * E2E · Flujos jugables reales: se pulsa lo que pulsaría el jugador y se verifica
 * el efecto tanto en la UI como en el State del motor (window.state).
 */
import {
    test, expect, bootGame, SKIP_TUTORIALS, advanceCinematic, holdMonolith,
    jumpToStep, startOperations, snap, scanBiometric, openPause,
} from '../support/fixtures.mjs';

/** Procesa el sujeto actual: escaneo biométrico → decisión. Devuelve el nuevo processedCount. */
async function processSubject(page, decision = 'auto') {
    // Esperar a que el motor haya generado un sujeto NUEVO (sin decidir): leer el anterior es una carrera.
    await expect.poll(() => page.evaluate(() => Boolean(window.state.currentEntity && !window.state.currentEntity._processed)), { timeout: 15_000 }).toBe(true);
    const before = await page.evaluate(() => window.state.processedCount);
    await scanBiometric(page);
    const corrupt = await page.evaluate(() => window.state.currentEntity?.isCorrupt);
    const label = decision === 'auto' ? (corrupt ? 'SACRIFICAR' : 'AUTORIZAR') : decision;
    const btn = page.getByRole('button', { name: new RegExp(`^${label}`) });
    await expect(btn).toBeVisible({ timeout: 10_000 });
    await btn.click();
    await expect.poll(() => page.evaluate(() => window.state.processedCount), { timeout: 15_000 }).toBe(before + 1);
    return before + 1;
}

test.describe('E2E · gameplay', () => {
    test('nuevo jugador: cinemática 1 → monolito → cinemática 3 → briefing del paso 4 @responsive', async ({ page }, testInfo) => {
        await bootGame(page, SKIP_TUTORIALS);
        await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).click();
        await expect(page.locator('.cine-seq')).toHaveText('SECUENCIA 01');
        await snap(page, testInfo, 'e2e-cine-01');
        await advanceCinematic(page);

        await holdMonolith(page);
        await snap(page, testInfo, 'e2e-monolith-100');

        await expect(page.locator('.cine-title')).toHaveText('El Gran Desvío', { timeout: 15_000 });
        await advanceCinematic(page);

        await expect(page.locator('.game-modal-overlay')).toBeVisible();
        expect(await page.evaluate(() => ({ step: window.state.currentStep, max: localStorage.getItem('nakasthu_max_step') })))
            .toEqual({ step: 4, max: '4' });
    });

    test('monolito: soltar Espacio antes del 100% no completa la sincronización', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '2' });
        await jumpToStep(page, 2);
        const mechanic = page.locator('.special-mechanic-container');
        await expect(mechanic).toBeVisible();
        await page.keyboard.down('Space');
        await page.waitForTimeout(700);
        await page.keyboard.up('Space');
        await page.waitForTimeout(1500);
        await expect(mechanic).toBeVisible();
        expect(await page.evaluate(() => window.state.currentStep)).toBe(2);
    });

    test('paso 4: decisión bloqueada sin escaneo; escanear consume energía y habilita AUTORIZAR/SACRIFICAR @responsive', async ({ page }, testInfo) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);

        await expect(page.getByText(/AUTORIZACIÓN PENDIENTE DE VALIDACIÓN BIOMÉTRICA/)).toBeVisible();
        await expect(page.getByRole('button', { name: /^AUTORIZAR/ })).toHaveCount(0);
        await expect(page.getByRole('button', { name: /^SACRIFICAR/ })).toHaveCount(0);

        const energyBefore = await page.evaluate(() => window.state.energy);
        await scanBiometric(page);
        expect(await page.evaluate(() => window.state.energy)).toBeLessThan(energyBefore);

        await expect(page.getByRole('button', { name: /^AUTORIZAR/ })).toBeEnabled({ timeout: 10_000 });
        await expect(page.getByRole('button', { name: /^SACRIFICAR/ })).toBeEnabled();
        await snap(page, testInfo, 'e2e-step4-decision');
    });

    test('paso 4 completo: 10 sujetos procesados → avanza al paso 5 y desbloquea el selector', async ({ page }, testInfo) => {
        test.setTimeout(180_000);
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);

        const quota = await page.evaluate(() => window.state.quota);
        expect(quota).toBe(10);
        for (let i = 1; i <= quota; i++) {
            const n = await processSubject(page);
            expect(n).toBe(i);
            if (i < quota) await expect(page.getByText(`${i} / ${quota}`, { exact: true })).toBeVisible();
            if (i === 5) await snap(page, testInfo, 'e2e-step4-mid');
        }

        // Cierre de turno: resumen con métricas reales y CONTINUAR.
        const summary = page.locator('.game-modal-overlay');
        await expect(summary.getByRole('heading', { name: /Turno cerrado: Reconstrucción/ })).toBeVisible({ timeout: 30_000 });
        await expect(summary).toContainText('Procesados');
        await snap(page, testInfo, 'e2e-step4-summary');
        await summary.getByRole('button', { name: 'CONTINUAR' }).click();
        await expect.poll(() => page.evaluate(() => window.state.currentStep), { timeout: 30_000 }).toBe(5);
        expect(await page.evaluate(() => localStorage.getItem('nakasthu_max_step'))).toBe('5');
        await snap(page, testInfo, 'e2e-step5-reached');
    });

    test('terminal: /status responde, comando duplicado se bloquea, comando desconocido informa', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);

        const input = page.locator('#terminal-log').locator('xpath=ancestor::*[.//input][1]').locator('input[type="text"]').first();
        const term = page.locator('#terminal-log');
        await expect(input).toBeEnabled();

        await input.fill('/status');
        await input.press('Enter');
        await expect(term).toContainText('SYS_INFO:');

        await input.fill('/status');
        await input.press('Enter');
        await expect(term).toContainText('COMANDO REPETIDO DETECTADO');

        await input.fill('/esto-no-existe');
        await input.press('Enter');
        await expect(input).toHaveValue('');
        // Debe responder algo (error/ayuda), no quedarse mudo.
        await expect(term).toContainText(/esto-no-existe|DESCONOCIDO|NO RECONOCIDO|INVÁLIDO|ERROR/i);
    });

    test('pausa: congela el juego, Reanudar vuelve, Guardar escribe nakasthu_save_v1 @responsive', async ({ page }, testInfo) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);

        await openPause(page);
        expect(await page.evaluate(() => window.state.isPaused)).toBe(true);
        const energyPaused = await page.evaluate(() => window.state.energy);
        await page.waitForTimeout(2500);
        expect(await page.evaluate(() => window.state.energy), 'La energía no debe drenarse en pausa').toBe(energyPaused);
        await snap(page, testInfo, 'e2e-pause');

        await page.getByRole('button', { name: 'Reanudar Conexión' }).click();
        await expect(page.getByRole('heading', { name: 'SISTEMA EN ESPERA' })).toBeHidden();
        expect(await page.evaluate(() => window.state.isPaused)).toBe(false);

        await openPause(page);
        await page.getByRole('button', { name: 'Guardar Partida', exact: true }).click();
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('nakasthu_save_v1') || 'null'));
        expect(saved).toMatchObject({ currentStep: 4, storyPath: 0 });
        expect(saved.timestamp).toBeGreaterThan(Date.now() - 60_000);
        expect(Array.isArray(saved.unlockedModules)).toBe(true);
    });

    test('pausa → Salir al Menú: vuelve al menú y deja el motor limpio', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await openPause(page);
        await page.getByRole('button', { name: 'Salir al Menú', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
        const s = await page.evaluate(() => ({ status: window.state.gameStatus, paused: window.state.isPaused, processed: window.state.processedCount }));
        expect(s).toEqual({ status: 'START_MENU', paused: false, processed: 0 });
        // El progreso del selector sobrevive a salir al menú.
        expect(await page.evaluate(() => localStorage.getItem('nakasthu_max_step'))).toBe('4');
    });

    test('pausa → Reiniciar Nivel: reinicia contadores del paso actual', async ({ page }) => {
        test.setTimeout(90_000);
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await processSubject(page);
        expect(await page.evaluate(() => window.state.processedCount)).toBe(1);

        await openPause(page);
        await page.getByRole('button', { name: 'Reiniciar Nivel', exact: true }).click();
        await expect.poll(() => page.evaluate(() => window.state.processedCount)).toBe(0);
        expect(await page.evaluate(() => window.state.currentStep)).toBe(4);
    });

    test('tutorial primera vez: propuesta visible y "Omitir todo" persiste la preferencia', async ({ page }, testInfo) => {
        await bootGame(page, { nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await expect(page.getByText('NUEVO SISTEMA DETECTADO')).toBeVisible();
        await snap(page, testInfo, 'e2e-tutorial-offer');
        await page.getByRole('button', { name: 'OMITIR TODO EL TUTORIAL' }).click();
        await expect(page.getByText('NUEVO SISTEMA DETECTADO')).toBeHidden();
        expect(await page.evaluate(() => localStorage.getItem('nakasthu_skip_tutorials'))).toBe('true');
    });
});

test.describe('E2E · finales', () => {
    for (const [choice, text] of [
        ['EJECUTAR SENTENCIA', 'Cierras el portal. La humanidad sobrevive'],
        ['ABRAZAR EL VACÍO', 'Kamin empuja a Leina hacia la grieta'],
    ]) {
        test(`final "${choice}": epílogo propio y PROTOCOLOS COMPLETADOS @responsive`, async ({ page }, testInfo) => {
            await bootGame(page, { nakasthu_max_step: '11' });
            await jumpToStep(page, 11);
            await expect(page.getByRole('heading', { name: 'El Juicio Final', exact: true })).toBeVisible();
            await page.getByRole('button', { name: choice, exact: true }).click();

            const epi = page.locator('.cinematic-screen');
            await expect(epi.locator('.cine-title')).toHaveText('Epílogo');
            await epi.click();
            await expect(epi.locator('.cine-text')).toContainText(text);
            await epi.click();
            await expect(page.getByRole('heading', { name: 'PROTOCOLOS COMPLETADOS' })).toBeVisible();
            await snap(page, testInfo, `e2e-final-${choice.split(' ')[0].toLowerCase()}`);

            await page.getByRole('button', { name: 'Ir al Inicio' }).click();
            await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
        });
    }
});
