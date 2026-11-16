/**
 * REGRESIÓN · Consola de mando con datos extremos: IDs y títulos largos, personajes del lore,
 * ruta sectaria, cuotas de dos/tres cifras o infinitas y márgenes de error altos.
 * Nada debe salirse de los recuadros del sujeto y de la cuota, ni en móvil ni en escritorio.
 */
import { test, expect, bootGame, SKIP_TUTORIALS, jumpToStep, startOperations, snap } from '../support/fixtures.mjs';

const VARIANTS = [
    { name: 'base', patch: {} },
    { name: 'cuota-2-cifras', patch: { quota: 15, processedCount: 14, maxErrors: 5, judgmentErrors: 4 } },
    { name: 'cuota-infinita-3-cifras', patch: { quota: Infinity, processedCount: 123, maxErrors: 3, judgmentErrors: 2 } },
    { name: 'sectario-24-almas', patch: { storyPath: 1, quota: 24, processedCount: 23, maxErrors: 8, judgmentErrors: 7 } },
    { name: 'id-y-tipo-largos', entity: { id: 'NYX-99', type: 'infiltrado', scannedData: { neuralSync: 100 } } },
    { name: 'lore-orval', entity: { id: 'ORVAL-DREXLER', name: 'Orval Drexler', type: 'técnico', scannedData: { neuralSync: 100 } } },
];

// Elementos con texto o caja visible que se salen de su recuadro (tolerancia 1 px).
const overflowIn = (page, selector) => page.evaluate((sel) => {
    const box = document.querySelector(sel);
    if (!box || getComputedStyle(box).display === 'none') return { missing: true, out: [] };
    const b = box.getBoundingClientRect();
    const out = [];
    for (const el of box.querySelectorAll('span, div, button, kbd')) {
        if (!el.textContent.trim() || el.children.length > 3) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const cs = getComputedStyle(el);
        // Recortar con "…" vale si el texto completo queda en un title (accesible al pasar/mantener).
        const ellipsisOk = cs.textOverflow === 'ellipsis' && (el.title || el.closest('[title]'));
        const clipped = el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible' && !ellipsisOk;
        if (r.left < b.left - 1 || r.right > b.right + 1 || clipped) {
            out.push(`${el.textContent.trim().slice(0, 30)} [${Math.round(r.left - b.left)}..${Math.round(r.right - b.left)} de ${Math.round(b.width)}]`);
        }
    }
    return { missing: false, out };
}, selector);

test.describe('REGRESIÓN · consola de mando con datos extremos @responsive', () => {
    for (const v of VARIANTS) {
        test(`${v.name}: sujeto y cuota sin desbordes @responsive`, async ({ page }, testInfo) => {
            await bootGame(page, { ...SKIP_TUTORIALS, nakasthu_max_step: '4', nakasthu_coach_done: 'true' });
            await jumpToStep(page, 4);
            await startOperations(page);
            await expect.poll(() => page.evaluate(() => Boolean(window.state.currentEntity))).toBe(true);
            await page.evaluate(({ patch, entity }) => {
                const s = window.state;
                s.startBatch();
                for (const [k, val] of Object.entries(patch || {})) s[k] = val;
                if (entity) s.currentEntity = { ...s.currentEntity, ...entity, scannedData: { ...s.currentEntity.scannedData, ...(entity.scannedData || {}) } };
                s.endBatch();
            }, { patch: v.patch, entity: v.entity });
            await page.waitForTimeout(400);

            const mobile = page.viewportSize().width <= 820;
            const orbitalVisible = await page.locator('.ops-orbital').isVisible();
            expect(orbitalVisible, 'El orbital sólo en escritorio').toBe(!mobile);

            for (const sel of ['.ops-subject', '.ops-quota']) {
                const { missing, out } = await overflowIn(page, sel);
                expect(missing, `${sel} debe existir`).toBe(false);
                expect(out, `${sel} desbordado`).toEqual([]);
            }
            await page.locator('.ops-quota').screenshot({ path: testInfo.outputPath(`quota-${v.name}.png`) });
            if (v.name === 'base') await snap(page, testInfo, `ops-${mobile ? 'movil' : 'escritorio'}`);
        });
    }
});
