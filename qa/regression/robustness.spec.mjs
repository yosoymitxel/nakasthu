/**
 * REGRESIÓN · Estados inesperados, datos corruptos, doble ejecución, teclado y recuperación.
 * Cada prueba fija un bug encontrado (o un riesgo plausible) para que no vuelva.
 */
import {
    test, expect, bootGame, SKIP_TUTORIALS, advanceCinematic, jumpToStep, startOperations, snap, scanBiometric, openPause, MENU,
} from '../support/fixtures.mjs';

const emit = (page, event, payload) => page.evaluate(async ([e, p]) => {
    const { bus } = await import('/src/core/Bus.js');
    bus.emit(e, p);
}, [event, payload]);

const scanCurrent = scanBiometric;

test.describe('REGRESIÓN · datos vacíos o inválidos en localStorage', () => {
    const CASES = [
        ['nakasthu_max_step no numérico', { nakasthu_max_step: 'abc' }],
        ['nakasthu_max_step negativo', { nakasthu_max_step: '-3' }],
        ['nakasthu_max_step fuera de rango', { nakasthu_max_step: '999' }],
        ['nakasthu_save_v1 JSON corrupto', { nakasthu_save_v1: '{corrupto' }],
        ['nakasthu_lore_v1 JSON corrupto', { nakasthu_lore_v1: '{"no":"es-array"' }],
        ['nakasthu_lore_v1 no es array', { nakasthu_lore_v1: '{"a":1}' }],
        ['logros JSON corrupto', { nakasthu_achievements: '}{' }],
        ['valores vacíos', { nakasthu_max_step: '', nakasthu_save_v1: '', nakasthu_lore_v1: '' }],
    ];
    for (const [name, storage] of CASES) {
        test(`${name}: el juego arranca y el selector sigue usable`, async ({ page }) => {
            await bootGame(page, storage);
            for (const label of MENU) await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
            const max = await page.evaluate(() => window.state.maxStepReached);
            expect(Number.isInteger(max), `maxStepReached=${max}`).toBe(true);
            expect(max).toBeGreaterThanOrEqual(1);
            expect(max).toBeLessThanOrEqual(13);
            await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
            await expect(page.getByRole('button').filter({ hasText: 'PASO_01' })).toBeEnabled();
        });
    }

    test('localStorage no disponible (modo privado estricto): el juego arranca', async ({ page }) => {
        await page.addInitScript(() => {
            const deny = () => { throw new DOMException('denied', 'SecurityError'); };
            Object.defineProperty(window, 'localStorage', { get: deny, configurable: true });
        });
        await page.goto('./');
        await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
        await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).click();
        await expect(page.locator('.cinematic-screen')).toBeVisible();
    });
});

test.describe('REGRESIÓN · doble ejecución de acciones', () => {
    test('doble clic en "Iniciar Juego" arranca una sola vez en la secuencia 01', async ({ page }) => {
        await bootGame(page, SKIP_TUTORIALS);
        await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).dblclick();
        await expect(page.locator('.cine-seq')).toHaveText('SECUENCIA 01');
        await expect(page.locator('.cinematic-screen')).toHaveCount(1);
        expect(await page.evaluate(() => window.state.currentStep)).toBe(1);
    });

    test('doble clic en AUTORIZAR procesa al sujeto una sola vez', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await scanCurrent(page);
        const btn = page.getByRole('button', { name: /^AUTORIZAR/ });
        await expect(btn).toBeVisible({ timeout: 10_000 });
        await btn.dblclick();
        await page.waitForTimeout(1500);
        expect(await page.evaluate(() => window.state.processedCount)).toBe(1);
    });

    test('ráfaga de eventos AUTHORIZE_REQUEST sobre el mismo sujeto cuenta una sola decisión', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await scanCurrent(page);
        await page.evaluate(async () => {
            const { bus } = await import('/src/core/Bus.js');
            for (let i = 0; i < 5; i++) bus.emit('AUTHORIZE_REQUEST');
        });
        await page.waitForTimeout(1500);
        expect(await page.evaluate(() => window.state.processedCount)).toBe(1);
    });

    test('decisión prematura (antes del escaneo) no bloquea al sujeto: tras escanear se puede decidir', async ({ page }) => {
        // Bug corregido: MechanicManager marcaba _processed antes de validar el escaneo.
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await expect.poll(() => page.evaluate(() => Boolean(window.state.currentEntity))).toBe(true);
        await emit(page, 'AUTHORIZE_REQUEST');
        await emit(page, 'SACRIFICE_REQUEST');
        await expect(page.locator('#terminal-log')).toContainText('IMPOSIBLE PROCEDER');
        expect(await page.evaluate(() => window.state.processedCount)).toBe(0);
        expect(await page.evaluate(() => window.state.currentEntity?._processed)).toBeFalsy();

        await scanBiometric(page);
        const btn = page.getByRole('button', { name: /^AUTORIZAR/ });
        await expect(btn).toBeVisible({ timeout: 10_000 });
        await btn.click();
        await expect.poll(() => page.evaluate(() => window.state.processedCount), { timeout: 10_000 }).toBe(1);
    });

    test('doble clic en CERRAR avanza un único paso (epílogo, no se lo salta)', async ({ page }) => {
        await bootGame(page, { nakasthu_max_step: '11' });
        await jumpToStep(page, 11);
        await expect(page.getByRole('heading', { name: 'El Juicio Final', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'CERRAR', exact: true }).dblclick();
        await expect(page.locator('.cine-title')).toHaveText('Epílogo');
        expect(await page.evaluate(() => window.state.currentStep)).toBe(12);
    });

    test('elegir final justo al cargar el paso 11 (desde el selector) no es revertido por el salto', async ({ page }) => {
        // Bug corregido: el setTimeout de jumpToStep() finalizaba el paso 11 DESPUÉS de la elección.
        await bootGame(page, { nakasthu_max_step: '11' });
        await page.getByRole('button', { name: 'Selector de Secuencias', exact: true }).click();
        await page.getByRole('button').filter({ hasText: 'PASO_11' }).click();
        await page.getByRole('button', { name: 'CERRAR', exact: true }).click({ timeout: 2_000 });
        await page.waitForTimeout(600);
        expect(await page.evaluate(() => window.state.currentStep)).toBe(12);
        await expect(page.locator('.cine-title')).toHaveText('Epílogo');
    });

    test('doble Enter en la terminal no ejecuta el comando dos veces', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        const input = page.locator('input[type="text"]').first();
        await input.fill('/status');
        await input.press('Enter');
        await input.press('Enter');
        await page.waitForTimeout(500);
        const count = await page.locator('#terminal-log').evaluate((el) => (el.innerText.match(/SYS_INFO:/g) || []).length);
        expect(count).toBe(1);
    });

    test('Guardar Partida dos veces seguidas: un único registro coherente', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        for (let i = 0; i < 2; i++) {
            await openPause(page);
            await page.getByRole('button', { name: 'Guardar Partida', exact: true }).click();
        }
        const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('nakasthu_save')));
        expect(keys).toEqual(['nakasthu_save_v1']);
    });
});

test.describe('REGRESIÓN · estados inesperados y recuperación', () => {
    test('Escape en Archivo de Lore abierto desde el menú vuelve al menú (no a un nivel vacío)', async ({ page }) => {
        await bootGame(page);
        await page.getByRole('button', { name: 'Archivo de Lore', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Archivo de Datos Zhyr' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
        expect(await page.evaluate(() => window.state.gameStatus)).toBe('START_MENU');
    });

    test('tecla L en gameplay abre el Lore y Escape regresa a la partida', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await page.locator('body').press('l');
        await expect(page.getByRole('heading', { name: 'Archivo de Datos Zhyr' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect.poll(() => page.evaluate(() => window.state.gameStatus)).toBe('PLAYING');
        expect(await page.evaluate(() => window.state.currentStep)).toBe(4);
    });

    test('salto a paso inexistente se rechaza sin romper el estado', async ({ page, diagnostics }) => {
        diagnostics.allow(/\[SEQUENCER\] Paso inválido: 99/);
        await bootGame(page);
        await page.evaluate(() => window.__NAKASTHU_SEQUENCER__.jumpToStep(99));
        const s = await page.evaluate(() => ({ status: window.state.gameStatus, step: window.state.currentStep }));
        expect(s.status).toBe('START_MENU');
        await page.getByRole('button', { name: 'Iniciar Juego', exact: true }).click();
        await expect(page.locator('.cine-seq')).toHaveText('SECUENCIA 01');
    });

    test('recarga en mitad del gameplay: vuelve al menú, conserva el progreso del selector', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await page.reload();
        await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
        expect(await page.evaluate(() => window.state.maxStepReached)).toBe(4);
        await jumpToStep(page, 4);
        await expect(page.locator('.game-modal-overlay')).toBeVisible();
    });

    test('logros y ajustes sobreviven a "Salir al Menú" y a recarga', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4', nakasthu_sound: '0' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await openPause(page);
        await page.getByRole('button', { name: 'Salir al Menú', exact: true }).click();
        await page.reload();
        expect(await page.evaluate(() => localStorage.getItem('nakasthu_max_step'))).toBe('4');
        expect(await page.evaluate(() => localStorage.getItem('nakasthu_skip_tutorials'))).toBe('true');
    });

    test('propuesta de tutorial abierta: el motor no consume energía mientras bloquea al jugador', async ({ page }) => {
        await bootGame(page, { nakasthu_max_step: '4', nakasthu_coach_done: 'true' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await expect(page.getByText('NUEVO SISTEMA DETECTADO')).toBeVisible();
        const e0 = await page.evaluate(() => window.state.energy);
        await page.waitForTimeout(3000);
        const e1 = await page.evaluate(() => window.state.energy);
        expect(e1, `energía ${e0} → ${e1} con el modal de tutorial abierto`).toBe(e0);
    });

    test('persistencia: el autoguardado permite "Continuar Partida" desde el menú tras recargar @responsive', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await page.reload();
        const resume = page.getByRole('button', { name: /Continuar Partida/ });
        await expect(resume).toBeVisible();
        await expect(resume).toContainText('Paso 04');
        await resume.click();
        await expect(page.locator('.game-modal-overlay')).toBeVisible();
        expect(await page.evaluate(() => window.state.currentStep)).toBe(4);
    });

    test('persistencia: sin guardado no aparece "Continuar Partida"', async ({ page }) => {
        await bootGame(page);
        await expect(page.getByRole('button', { name: /Continuar Partida/ })).toHaveCount(0);
    });

    test('persistencia: guardado corrupto no ofrece "Continuar Partida"', async ({ page }) => {
        await bootGame(page, { nakasthu_save_v1: '{"currentStep":"x"}' });
        await expect(page.getByRole('button', { name: /Continuar Partida/ })).toHaveCount(0);
    });
});

test.describe('REGRESIÓN · teclado y foco', () => {
    test('durante el gameplay los botones del menú oculto no reciben foco con Tab', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        const hiddenFocus = [];
        for (let i = 0; i < 60; i++) {
            await page.keyboard.press('Tab');
            const info = await page.evaluate(() => {
                const el = document.activeElement;
                return { text: (el?.innerText || '').trim().slice(0, 40), hidden: Boolean(el?.closest('.start-menu:not(.active), .death-screen:not(.active)')) };
            });
            if (info.hidden) hiddenFocus.push(info.text);
        }
        expect([...new Set(hiddenFocus)], 'Botones invisibles alcanzables por teclado').toEqual([]);
    });

    test('Enter sobre un botón oculto del menú no reinicia la partida', async ({ page }) => {
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        await page.evaluate(() => document.querySelector('.start-menu button')?.focus());
        await page.keyboard.press('Enter');
        await page.waitForTimeout(800);
        expect(await page.evaluate(() => window.state.currentStep)).toBe(4);
    });
});

test.describe('REGRESIÓN · responsive @responsive', () => {
    test('menú y modales caben en el viewport sin scroll horizontal @responsive', async ({ page }, testInfo) => {
        await bootGame(page);
        const { noHorizontalOverflow } = await import('../support/fixtures.mjs');
        await noHorizontalOverflow(page);
        await snap(page, testInfo, 'resp-menu');
        for (const label of ['Configuración', 'Expediente', 'Selector de Secuencias']) {
            await page.getByRole('button', { name: label, exact: true }).click();
            await page.waitForTimeout(400);
            await noHorizontalOverflow(page);
            await snap(page, testInfo, `resp-${label.split(' ')[0].toLowerCase()}`);
            await page.keyboard.press('Escape');
            const closeBtns = page.getByRole('button', { name: /^Cerrar$/ });
            if (await closeBtns.count()) await closeBtns.first().click().catch(() => {});
            const selectorHeading = page.getByRole('heading', { name: 'Selector de Secuencias' });
            if (await selectorHeading.isVisible()) await selectorHeading.locator('xpath=../..').getByRole('button').first().click();
            await expect(page.getByRole('button', { name: 'Iniciar Juego', exact: true })).toBeVisible();
        }
    });

    test('gameplay: navegación por pestañas en móvil y botones de decisión alcanzables @responsive', async ({ page }, testInfo) => {
        const vw = page.viewportSize().width;
        test.skip(vw > 900, 'Sólo aplica a viewport móvil');
        await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4' });
        await jumpToStep(page, 4);
        await startOperations(page);
        const tabs = page.locator('.mobile-tabs');
        const grid = page.locator('.main-layout-grid').first();
        await expect(tabs).toBeVisible();
        for (const [label, key] of [['Escáner', 'escaner'], ['Sistemas', 'sistemas'], ['Registro', 'registro'], ['Mando', 'mando']]) {
            await tabs.getByRole('button', { name: label, exact: true }).click();
            await expect(grid).toHaveAttribute('data-tab', key);
            const { noHorizontalOverflow } = await import('../support/fixtures.mjs');
            await noHorizontalOverflow(page);
            await snap(page, testInfo, `resp-tab-${key}`);
        }
        // Las pestañas pegadas al borde inferior y el documento sin scroll propio (antes sobraba una franja).
        const fit = await page.evaluate(() => ({
            tabsBottom: Math.round(document.querySelector('.mobile-tabs').getBoundingClientRect().bottom),
            inner: innerHeight,
            docScroll: document.scrollingElement.scrollHeight - innerHeight,
            bodyOverflow: getComputedStyle(document.body).overflowY,
        }));
        expect(Math.abs(fit.tabsBottom - fit.inner), JSON.stringify(fit)).toBeLessThanOrEqual(1);
        expect(fit.docScroll, JSON.stringify(fit)).toBeLessThanOrEqual(0);
        expect(fit.bodyOverflow).toBe('hidden');
        // En Mando el escaneo debe ser pulsable (no tapado por las pestañas).
        await page.getByRole('button', { name: /BIOMÉTRICO/ }).first().click({ trial: true });
    });

    test('dedo real (CDP): menú → cinemática → monolito mantenido → paso 3 @responsive', async ({ page, context }) => {
        test.skip(page.viewportSize().width > 900, 'Sólo táctil');
        await bootGame(page, SKIP_TUTORIALS);
        const cdp = await context.newCDPSession(page);
        const tap = async (loc) => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
        await tap(page.getByRole('button', { name: 'Iniciar Juego', exact: true }));
        await expect(page.locator('.cinematic-screen')).toBeVisible();
        for (let i = 0; i < 30 && await page.locator('.cinematic-screen').isVisible(); i++) { await page.touchscreen.tap(40, 200); await page.waitForTimeout(200); }
        const mono = page.locator('.special-mechanic-container .monolith');
        await expect(mono).toBeVisible();
        const b = await mono.boundingBox();
        const pt = [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }];
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt });
        await expect.poll(() => page.evaluate(() => window.state.currentStep), { timeout: 20_000 }).toBe(3);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    });

    test('tras el FIN vuelve al inicio en móvil @responsive', async ({ page }, testInfo) => {
        await bootGame(page, { nakasthu_max_step: '11' });
        await jumpToStep(page, 11);
        await expect(page.getByRole('heading', { name: 'El Juicio Final', exact: true })).toBeVisible();
        await page.getByRole('button', { name: 'CERRAR', exact: true }).click();
        const epi = page.locator('.cinematic-screen');
        await expect(epi.locator('.cine-title')).toHaveText('Epílogo');
        await advanceCinematic(page);
        await expect(page.getByRole('heading', { name: 'NAKASTHU' })).toBeVisible();
        await snap(page, testInfo, 'resp-final');
    });
});
