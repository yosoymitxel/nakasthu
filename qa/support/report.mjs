/**
 * REPORT.MJS
 * Convierte test-results/results.json (reporter JSON de Playwright) en QA_REPORT.md:
 * PASS/FAIL por prueba, errores reproducibles, capturas y diagnósticos de consola/red.
 * Uso: node qa/support/report.mjs [ruta-results.json] [salida.md]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../..');
const input = resolve(process.argv[2] || resolve(ROOT, 'test-results/results.json'));
const output = resolve(process.argv[3] || resolve(ROOT, 'test-results/QA_REPORT.md'));
const results = JSON.parse(readFileSync(input, 'utf8'));
const outDir = dirname(output);

const rows = [];
(function walk(suite, trail) {
    const here = suite.title && !suite.title.endsWith('.mjs') ? [...trail, suite.title] : trail;
    for (const spec of suite.specs || []) {
        for (const t of spec.tests) {
            const last = t.results[t.results.length - 1] || {};
            const diag = (last.attachments || []).find((a) => a.name === 'runtime-diagnostics');
            let d = null;
            try { d = diag?.body ? JSON.parse(Buffer.from(diag.body, 'base64').toString()) : diag?.path ? JSON.parse(readFileSync(diag.path, 'utf8')) : null; } catch { /* sin diagnóstico */ }
            const shots = (last.attachments || []).filter((a) => a.contentType === 'image/png' && a.path).map((a) => ({ name: a.name, path: relative(outDir, a.path) }));
            const verdict = t.status === 'skipped' ? 'SKIP'
                : t.status === 'flaky' ? 'FLAKY'
                : t.status === 'expected' ? (t.expectedStatus === 'failed' ? 'FAIL CONOCIDO' : 'PASS')
                : 'FAIL';
            rows.push({
                project: t.projectName, file: spec.file, line: spec.line, suite: here.join(' › '), title: spec.title,
                verdict, duration: last.duration || 0, retries: t.results.length - 1,
                error: (last.errors || []).map((e) => (e.message || '').replace(/\u001b\[[0-9;]*m/g, '')).join('\n').trim(),
                annotations: (t.annotations || []).map((a) => `${a.type}: ${a.description || ''}`),
                d, shots,
            });
        }
    }
    for (const s of suite.suites || []) walk(s, here);
})({ suites: results.suites }, []);

const count = (v) => rows.filter((r) => r.verdict === v).length;
const icon = { PASS: '✅', FAIL: '❌', FLAKY: '⚠️', SKIP: '⏭️', 'FAIL CONOCIDO': '🟡' };
const md = [];
md.push('# Informe QA · NAKASTHU (Playwright)', '');
md.push(`Generado: ${new Date().toISOString()}  `);
md.push(`Modo CDN: \`${process.env.QA_CDN === 'live' ? 'live (red real)' : 'mirror (node_modules)'}\`  `);
md.push(`Duración total: ${(results.stats?.duration / 1000 || 0).toFixed(1)} s`, '');
md.push('| Resultado | Nº |', '|---|---|');
for (const v of ['PASS', 'FAIL', 'FLAKY', 'FAIL CONOCIDO', 'SKIP']) md.push(`| ${icon[v]} ${v} | ${count(v)} |`);
md.push('');

const byProject = [...new Set(rows.map((r) => r.project))];
for (const p of byProject) {
    md.push(`## Proyecto \`${p}\``, '', '| # | Prueba | Resultado | ms |', '|---|---|---|---|');
    rows.filter((r) => r.project === p).forEach((r, i) => {
        md.push(`| ${i + 1} | ${r.suite ? `${r.suite} › ` : ''}${r.title.replace(/\|/g, '\\|')} | ${icon[r.verdict]} ${r.verdict}${r.retries ? ` (reintentos: ${r.retries})` : ''} | ${r.duration} |`);
    });
    md.push('');
}

const failing = rows.filter((r) => ['FAIL', 'FLAKY', 'FAIL CONOCIDO'].includes(r.verdict));
md.push('## Errores reproducibles', '');
if (!failing.length) md.push('Ninguno.', '');
for (const r of failing) {
    md.push(`### ${icon[r.verdict]} [${r.project}] ${r.title}`, '');
    md.push(`Reproducir: \`npx playwright test --config=qa/playwright.config.mjs --project=${r.project} ${r.file}:${r.line}\``, '');
    if (r.annotations.length) md.push(...r.annotations.map((a) => `- ${a}`), '');
    if (r.error) md.push('```', r.error.slice(0, 2500), '```', '');
    for (const s of r.shots) md.push(`![${s.name}](${s.path})`);
    md.push('');
}

md.push('## Consola y red (agregado)', '');
const agg = (key, map = (x) => x) => {
    const m = new Map();
    for (const r of rows) for (const x of r.d?.[key] || []) { const k = map(x); m.set(k, (m.get(k) || 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
const section = (title, entries) => {
    md.push(`### ${title} (${entries.length})`, '');
    if (!entries.length) { md.push('Ninguno.', ''); return; }
    md.push('| Veces | Detalle |', '|---|---|');
    for (const [k, n] of entries.slice(0, 40)) md.push(`| ${n} | \`${String(k).replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 220)}\` |`);
    md.push('');
};
section('Excepciones JS no controladas', agg('pageErrors'));
section('console.error', agg('consoleErrors'));
section('console.warn', agg('consoleWarnings'));
section('Respuestas HTTP >= 400', agg('httpErrors', (e) => `${e.status} ${e.firstParty ? '[1ª parte]' : '[3ª parte]'} ${e.url}`));
section('Requests fallidas', agg('failedRequests', (e) => `${e.error} ${e.firstParty ? '[1ª parte]' : '[3ª parte]'} ${e.url}`));
section('Dependencias servidas por el espejo CDN', agg('mirrored', (u) => u.replace(/\?.*$/, '')));
section('Assets de terceros sustituidos por stub', agg('stubbed', (u) => new URL(u).host));

md.push('## Capturas', '');
for (const r of rows) for (const s of r.shots.filter((x) => !/failure|test-failed/.test(x.name))) md.push(`- [${r.project}] ${s.name}: ![${s.name}](${s.path})`);
md.push('');

writeFileSync(output, md.join('\n'));
console.log(`Informe: ${relative(process.cwd(), output)}  (PASS ${count('PASS')} · FAIL ${count('FAIL')} · FLAKY ${count('FLAKY')} · CONOCIDOS ${count('FAIL CONOCIDO')} · SKIP ${count('SKIP')})`);
if (count('FAIL')) process.exitCode = 1;
