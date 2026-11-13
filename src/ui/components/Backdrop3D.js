/**
 * BACKDROP3D.JS
 * Fondo 3D del Bastión con modelos low-poly de polyfork.dev (enlazados desde su CDN).
 * Se dibuja a un tercio de resolución y se amplía sin suavizar para casar con el píxel art.
 * Si three o los modelos no cargan (sin red), no se monta nada y queda el fondo plano.
 */
import { html } from '../utils/html.js';

const { useRef, useEffect, useState } = React;

const CDN = 'https://polyfork.dev/cdn/';
// Kit "Space Base": misma paleta y escala, rejilla de 4 m. [id, x, z, giro en cuartos de vuelta]
const PARTS = [
    ['reactor-block-13fe72', 0, 0, 0],
    ['observation-tower-69b692', -12, -8, 0],
    ['command-center-e65850', 12, -4, 3],
    ['habitat-dome-8d3499', -12, 8, 1],
    ['fuel-tank-3a0111', 8, 8, 0],
    ['fuel-tank-3a0111', 12, 8, 0],
    ['comms-dish-7b129a', 4, -12, 2],
    ['antenna-mast-0954b0', -4, 12, 0]
];
const SCALE = 3; // píxeles de pantalla por píxel renderizado

export const Backdrop3D = ({ dim = false, sect = false }) => {
    const canvasRef = useRef(null);
    const live = useRef({ dim, sect });
    const [ready, setReady] = useState(false);
    live.current = { dim, sect };

    useEffect(() => {
        let dead = false, raf = 0, renderer = null;
        const canvas = canvasRef.current;

        (async () => {
            const THREE = await import('three');
            const mods = await Promise.allSettled([...new Set(PARTS.map(p => p[0]))].map(id => import(`${CDN}${id}.mjs`).then(m => [id, m.createAsset])));
            const make = Object.fromEntries(mods.filter(m => m.status === 'fulfilled').map(m => m.value));
            if (dead || !Object.keys(make).length) return;

            renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x07080c);
            scene.fog = new THREE.Fog(0x07080c, 22, 70);

            const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({ color: 0x1d1e26 }));
            ground.rotation.x = -Math.PI / 2;
            scene.add(ground);

            for (const [id, x, z, turns] of PARTS) {
                if (!make[id]) continue;
                const obj = make[id]();
                obj.position.set(x, 0, z);
                obj.rotation.y = turns * Math.PI / 2;
                scene.add(obj);
            }

            scene.add(new THREE.HemisphereLight(0x8fa4c4, 0x16120f, 1.4));
            const rim = new THREE.DirectionalLight(0x6e9eaa, 1.1);
            rim.position.set(-20, 30, 10);
            scene.add(rim);
            const core = new THREE.PointLight(0xff8c00, 60, 40);
            core.position.set(0, 9, 0);
            scene.add(core);

            const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 200);
            const resize = () => {
                const w = Math.max(1, Math.round(innerWidth / SCALE)), h = Math.max(1, Math.round(innerHeight / SCALE));
                renderer.setSize(w, h, false);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            };
            resize();
            addEventListener('resize', resize);

            let last = 0, angle = 0.6;
            const frame = (t) => {
                raf = requestAnimationFrame(frame);
                const { dim, sect } = live.current;
                // Durante la partida basta con unos pocos fotogramas por segundo
                if (document.hidden || t - last < (dim ? 160 : 40)) return;
                angle += (t - last) * 0.00004;
                last = t;
                camera.position.set(Math.sin(angle) * 34, 9 + Math.sin(angle * 3) * 1.5, Math.cos(angle) * 34);
                camera.lookAt(0, 4, 0);
                core.color.set(sect ? 0x9333ea : 0xff8c00);
                core.intensity = 50 + Math.sin(t * 0.002) * 18;
                renderer.render(scene, camera);
            };
            raf = requestAnimationFrame(frame);
            setReady(true);
            live.current.cleanup = () => removeEventListener('resize', resize);
        })().catch(() => { /* sin red o sin WebGL: se queda el fondo plano */ });

        return () => {
            dead = true;
            cancelAnimationFrame(raf);
            live.current.cleanup?.();
            renderer?.dispose();
        };
    }, []);

    return html`<canvas ref=${canvasRef} className=${`backdrop-3d ${ready ? 'ready' : ''} ${dim ? 'dim' : ''}`}></canvas>`;
};
