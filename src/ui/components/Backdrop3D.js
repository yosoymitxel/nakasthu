/**
 * BACKDROP3D.JS
 * Escena 3D del Bastión con modelos low-poly de polyfork.dev (enlazados desde su CDN).
 * Una sola escena y un solo canvas: el menú, las cinemáticas y las mecánicas piden un plano (`shot`).
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
    ['antenna-mast-0954b0', -4, 12, 0],
    // La avanzadilla ante el Monolito
    ['astronaut-explorer-323482', -1.6, 31, 2],
    ['astronaut-engineer-20b738', 0, 32, 2],
    ['astronaut-scientist-47d733', 1.6, 31, 2]
];
const MONOLITH = [0, 26];
const PORTAL = [-26, -20];
const SCALE = 3; // píxeles de pantalla por píxel renderizado

// Planos: la cámara va de `from` a `to` en `dur` s mirando a `look`; `tint` es la luz del núcleo.
const SHOTS = {
    descent: { from: [7, 2.4, 44], to: [3.5, 2, 37], look: [0, 4, 26], dur: 16, tint: 0x22d3ee },
    monolith: { from: [0, 1.2, 37], to: [0, 1.6, 34.5], look: [0, 5.5, 26], dur: 20, tint: 0x22d3ee },
    awakening: { from: [2, 5, 36], to: [16, 30, 58], look: [0, 3, 12], dur: 14, tint: 0xffffff },
    riot: { from: [-20, 1.8, 16], to: [-9, 2.4, 11], look: [0, 4.5, 0], dur: 18, tint: 0xef4444 },
    messenger: { from: [-22, 2.5, 4], to: [-17, 5, -1], look: [-12, 10, -8], dur: 18, tint: 0x9333ea },
    faith: { from: [-24, 1.6, 18], to: [-19, 2.6, 15], look: [-12, 3, 8], dur: 18, tint: 0x9333ea },
    portal: { from: [-4, 2, 2], to: [-10, 3.5, -5], look: [-26, 6, -20], dur: 20, tint: 0x9333ea }
};

export const Backdrop3D = ({ dim = false, sect = false, shot = null }) => {
    const canvasRef = useRef(null);
    const live = useRef({});
    const [ready, setReady] = useState(false);
    Object.assign(live.current, { dim, sect, shot });

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

            const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshLambertMaterial({ color: 0x1d1e26 }));
            ground.rotation.x = -Math.PI / 2;
            scene.add(ground);

            for (const [id, x, z, turns] of PARTS) {
                if (!make[id]) continue;
                const obj = make[id]();
                obj.position.set(x, 0, z);
                obj.rotation.y = turns * Math.PI / 2;
                scene.add(obj);
            }

            // Propios del juego: el Monolito y el portal no existen en ningún kit
            const monolith = new THREE.Mesh(new THREE.BoxGeometry(3, 11, 1.2), new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.35 }));
            monolith.position.set(MONOLITH[0], 5.5, MONOLITH[1]);
            scene.add(monolith);
            const monoLight = new THREE.PointLight(0x22d3ee, 30, 22);
            monoLight.position.set(MONOLITH[0], 4, MONOLITH[1] + 3);
            scene.add(monoLight);

            const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.35, 6, 14), new THREE.MeshBasicMaterial({ color: 0x9333ea }));
            ring.position.set(PORTAL[0], 6, PORTAL[1]);
            ring.rotation.y = Math.PI / 4;
            scene.add(ring);
            const voidDisc = new THREE.Mesh(new THREE.CircleGeometry(4.7, 14), new THREE.MeshBasicMaterial({ color: 0x020203, side: THREE.DoubleSide }));
            voidDisc.position.copy(ring.position);
            voidDisc.rotation.y = Math.PI / 4;
            scene.add(voidDisc);
            const ringLight = new THREE.PointLight(0x9333ea, 40, 26);
            ringLight.position.set(PORTAL[0] + 2, 6, PORTAL[1] + 2);
            scene.add(ringLight);

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
            live.current.cleanup = () => removeEventListener('resize', resize);

            let last = 0, angle = 0.6, shotName = null, shotStart = 0;
            const frame = (t) => {
                raf = requestAnimationFrame(frame);
                const { dim, sect, shot } = live.current;
                // Durante la partida basta con unos pocos fotogramas por segundo
                if (document.hidden || t - last < (dim ? 160 : 40)) return;
                const dt = t - last;
                last = t;

                const s = SHOTS[shot];
                if (shot !== shotName) { shotName = shot; shotStart = t; }
                if (s) {
                    const k = Math.min(1, (t - shotStart) / (s.dur * 1000));
                    const e = k * k * (3 - 2 * k);
                    camera.position.set(
                        s.from[0] + (s.to[0] - s.from[0]) * e,
                        s.from[1] + (s.to[1] - s.from[1]) * e + Math.sin(t * 0.0006) * 0.08,
                        s.from[2] + (s.to[2] - s.from[2]) * e
                    );
                    camera.lookAt(s.look[0], s.look[1], s.look[2]);
                } else {
                    angle += dt * 0.00004;
                    camera.position.set(Math.sin(angle) * 34, 9 + Math.sin(angle * 3) * 1.5, Math.cos(angle) * 34);
                    camera.lookAt(0, 4, 0);
                }

                core.color.set(s ? s.tint : (sect ? 0x9333ea : 0xff8c00));
                core.intensity = 50 + Math.sin(t * 0.002) * 18;
                monoLight.intensity = 24 + Math.sin(t * 0.003) * 14;
                ring.rotation.z += dt * 0.0003;
                renderer.render(scene, camera);
            };
            raf = requestAnimationFrame(frame);
            setReady(true);
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
