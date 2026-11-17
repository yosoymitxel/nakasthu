/**
 * CDN-MIRROR.MJS
 * Las librerías ya se sirven desde vendor/. Lo único de terceros que queda es decorativo
 * (modelos 3D, texturas, audio): aquí se sustituye por stubs mínimos para que los tests no
 * dependan de la red, y se registra como `stubbed` en los diagnósticos.
 * Con QA_CDN=live se desactiva y el navegador va a la red real.
 */
const JS = 'application/javascript; charset=utf-8';

// Modelo low-poly sustituto: mismo contrato `createAsset()` que polyfork.dev.
const POLYFORK_STUB = `import * as THREE from 'three';
export function createAsset(){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshStandardMaterial({color:0x333333})));return g;}`;

// PNG 1x1 transparente.
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

/**
 * Instala las rutas en el contexto. `diagnostics.stubbed` registra qué se sustituyó.
 */
export async function installCdnMirror(context, diagnostics) {
    if (process.env.QA_CDN === 'live') return;

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
