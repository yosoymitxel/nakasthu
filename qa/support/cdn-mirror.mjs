/**
 * CDN-MIRROR.MJS
 * Sirve las dependencias de CDN desde node_modules (versiones fijadas en package.json).
 * POR QUÉ: los tests no deben fallar porque unpkg esté caído o porque el runner no tenga red.
 * Con QA_CDN=live se desactiva y el navegador va a la red real (útil para validar el despliegue).
 *
 * Assets decorativos de terceros (modelos 3D, texturas, audio) se sustituyen por stubs
 * mínimos y se registran como `stubbed` en los diagnósticos para que el informe lo refleje.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAILWIND_CSS } from './build-tailwind.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const nm = (p) => resolve(ROOT, 'node_modules', p);

const JS = 'application/javascript; charset=utf-8';

// Orden importa: la primera regla que coincide gana.
const LIBRARY_RULES = [
    { test: /^https:\/\/unpkg\.com\/react@18[^/]*\/umd\/react\.development\.js/, file: nm('react/umd/react.development.js') },
    { test: /^https:\/\/unpkg\.com\/react-dom@18[^/]*\/umd\/react-dom\.development\.js/, file: nm('react-dom/umd/react-dom.development.js') },
    { test: /^https:\/\/unpkg\.com\/motion@[^/]+\/dist\/motion\.js/, file: nm('motion/dist/motion.js') },
    { test: /^https:\/\/unpkg\.com\/htm(@[^/?]+)?(\?module)?$/, file: nm('htm/dist/htm.module.js') },
    { test: /^https:\/\/unpkg\.com\/zzfx@[^/]+\/ZzFX\.js/, file: nm('zzfx/ZzFX.js') },
    { test: /^https:\/\/unpkg\.com\/three@[^/]+\/build\/three\.module\.js/, file: nm('three/build/three.module.js') },
    { test: /^https:\/\/unpkg\.com\/three@[^/]+\/build\/three\.core\.js/, file: nm('three/build/three.core.js') },
    { test: /^https:\/\/unpkg\.com\/three@[^/]+\/examples\/jsm\/(.+)$/, map: (m) => nm(`three/examples/jsm/${m[1]}`) },
];

// Stub del Play CDN: expone `window.tailwind` (index.html le asigna `.config`) e inyecta el CSS precompilado.
function tailwindStub() {
    const css = existsSync(TAILWIND_CSS) ? readFileSync(TAILWIND_CSS, 'utf8') : '';
    return `window.tailwind = window.tailwind || {};
(function(){var s=document.createElement('style');s.setAttribute('data-qa','tailwind-precompiled');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);})();`;
}

// Modelo low-poly sustituto: mismo contrato `createAsset()` que polyfork.dev.
const POLYFORK_STUB = `import * as THREE from 'three';
export function createAsset(){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshStandardMaterial({color:0x333333})));return g;}`;

// PNG 1x1 transparente.
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

/**
 * Instala las rutas en el contexto. `diagnostics.mirrored` / `diagnostics.stubbed` registran qué se sirvió.
 */
export async function installCdnMirror(context, diagnostics) {
    if (process.env.QA_CDN === 'live') return;

    await context.route(/^https:\/\/(unpkg\.com|cdn\.tailwindcss\.com)\//, async (route) => {
        const url = route.request().url();
        if (url.startsWith('https://cdn.tailwindcss.com')) {
            diagnostics.mirrored.push(url);
            return route.fulfill({ status: 200, contentType: JS, body: tailwindStub() });
        }
        for (const rule of LIBRARY_RULES) {
            const m = url.match(rule.test);
            if (!m) continue;
            const file = rule.file || rule.map(m);
            if (!existsSync(file)) break;
            diagnostics.mirrored.push(url);
            return route.fulfill({
                status: 200,
                contentType: JS,
                headers: { 'access-control-allow-origin': '*' },
                body: readFileSync(file),
            });
        }
        // Dependencia de CDN no espejada: se deja fallar para que el informe la detecte.
        diagnostics.unmirrored.push(url);
        return route.abort('blockedbyclient');
    });

    await context.route(/^https:\/\/polyfork\.dev\/cdn\/.+\.mjs$/, (route) => {
        diagnostics.stubbed.push(route.request().url());
        return route.fulfill({ status: 200, contentType: JS, headers: { 'access-control-allow-origin': '*' }, body: POLYFORK_STUB });
    });
    await context.route(/^https:\/\/www\.transparenttextures\.com\//, (route) => {
        diagnostics.stubbed.push(route.request().url());
        return route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1PX });
    });
    await context.route(/^https:\/\/assets\.mixkit\.co\//, (route) => {
        diagnostics.stubbed.push(route.request().url());
        // Audio vacío: el motor de sonido debe tolerar un recurso no decodificable.
        return route.fulfill({ status: 204, body: '' });
    });
}
