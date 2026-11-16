import { defineConfig, devices } from '@playwright/test';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Raíz del repo: el servidor estático debe servir index.html, no qa/.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.QA_PORT || 4173);
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}/`;

export default defineConfig({
    testDir: '.',
    testMatch: ['smoke/**/*.spec.mjs', 'e2e/**/*.spec.mjs', 'regression/**/*.spec.mjs'],
    outputDir: resolve(ROOT, 'test-results'),
    globalSetup: './support/build-tailwind.mjs',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 2 : 4,
    timeout: 60_000,
    expect: { timeout: 12_000 },
    reporter: [
        ['list'],
        ['html', { outputFolder: resolve(ROOT, 'playwright-report'), open: 'never' }],
        ['json', { outputFile: resolve(ROOT, 'test-results/results.json') }],
    ],
    webServer: process.env.BASE_URL ? undefined : {
        command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
        url: BASE_URL,
        cwd: ROOT,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
        stdout: 'ignore',
        stderr: 'ignore',
    },
    use: {
        baseURL: BASE_URL,
        headless: true,
        screenshot: 'only-on-failure',
        trace: process.env.QA_TRACE || 'off',
        actionTimeout: 12_000,
    },
    projects: [
        { name: 'smoke', testMatch: 'smoke/**/*.spec.mjs', use: { viewport: { width: 1440, height: 960 } } },
        { name: 'e2e', testMatch: 'e2e/**/*.spec.mjs', use: { viewport: { width: 1440, height: 960 } } },
        { name: 'regression', testMatch: 'regression/**/*.spec.mjs', use: { viewport: { width: 1440, height: 960 } } },
        // Responsive: mismas pruebas marcadas @responsive en un móvil real emulado.
        { name: 'mobile', grep: /@responsive/, testMatch: ['e2e/**/*.spec.mjs', 'regression/**/*.spec.mjs'], use: { ...devices['Pixel 7'] } },
        // Móvil chico: el peor caso de ancho para la consola de mando.
        { name: 'mobile-sm', grep: /@responsive/, testMatch: 'regression/ops-layout.spec.mjs', use: { ...devices['Galaxy S8'] } },
    ],
});
