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
// Gente de los planos intermedios y del epílogo; se viste al mostrarse su grupo por primera vez
const PEOPLE = ['city-commuter-52a53f', 'commuter-381e7f', 'grandmother-in-a-rebozo-4d5190', 'student-in-a-hoodie-7c8223', 'salaryman-commuter-4170c1', 'neighborhood-child-8cc5ac', 'villager-40255c'];
const CULTIST = 'hooded-cultist-8a488f';
const MONOLITH = [0, 26];
const PORTAL = [-26, -20];
const MEADOW = 300;
const CITY = [44, 34];   // plaza de Dispay
const STAGE = [-44, 34]; // tarima de Prisiat
const ALTAR = [44, -34]; // altar bajo el hangar
const SCALE = 3; // píxeles de pantalla por píxel renderizado

// Planos: la cámara va de `from` a `to` en `dur` s mirando a `look`; `tint` es la luz del núcleo.
const SHOTS = {
    descent: { from: [7, 2.4, 44], to: [3.5, 2, 37], look: [0, 4, 26], dur: 16, tint: 0x22d3ee },
    monolith: { from: [0, 1.2, 37], to: [0, 1.6, 34.5], look: [0, 5.5, 26], dur: 20, tint: 0x22d3ee },
    awakening: { from: [2, 5, 36], to: [16, 30, 58], look: [0, 3, 12], dur: 14, tint: 0xffffff },
    riot: { from: [-20, 1.8, 16], to: [-9, 2.4, 11], look: [0, 4.5, 0], dur: 18, tint: 0xef4444 },
    messenger: { from: [-22, 2.5, 4], to: [-17, 5, -1], look: [-12, 10, -8], dur: 18, tint: 0x9333ea },
    faith: { from: [-24, 1.6, 18], to: [-19, 2.6, 15], look: [-12, 3, 8], dur: 18, tint: 0x9333ea },
    portal: { from: [-4, 2, 2], to: [-10, 3.5, -5], look: [-26, 6, -20], dur: 20, tint: 0x9333ea },
    // Intermedias: `flash` destella y borra a la exploradora, `vanish` apaga gente, `crowd`/`tarima`/`altar` muestran su grupo
    touch: { from: [-1, 1.6, 34], to: [-0.6, 1.9, 33], look: [0, 4, 26], dur: 12, tint: 0xffffff, flash: true },
    vanish: { from: [CITY[0] + 10, 6, CITY[1] + 14], to: [CITY[0] + 6, 4, CITY[1] + 8], look: [CITY[0], 1, CITY[1]], dur: 16, tint: 0x64748b, vanish: true, sky: 0x0a0c12 },
    riotCrowd: { from: [CITY[0] - 3, 3.2, CITY[1] + 16], to: [CITY[0] - 1, 2.6, CITY[1] + 12], look: [CITY[0], 1.2, CITY[1] - 2], dur: 16, tint: 0xef4444, crowd: true, sky: 0x1a0806 },
    tarima: { from: [STAGE[0] + 3, 4.5, STAGE[1] + 17], to: [STAGE[0] + 1.5, 3.8, STAGE[1] + 13], look: [STAGE[0], 2, STAGE[1]], dur: 18, tint: 0x9333ea, tarima: true, sky: 0x0e0614 },
    altar: { from: [ALTAR[0] + 9, 4, ALTAR[1] + 9], to: [ALTAR[0] + 6, 2.5, ALTAR[1] + 6], look: [ALTAR[0], 1, ALTAR[1]], dur: 18, tint: 0xe9d5ff, altar: true, sky: 0x0b0710 },
    portalOpen: { from: [-12, 3, -4], to: [-16, 4.5, -9], look: [-26, 6, -20], dur: 16, tint: 0x9333ea, opening: true },
    // Epílogo: `closing` encoge el portal, `twin` alza el segundo monolito, `queue` muestra la fila,
    // `sky` cambia cielo y niebla; la pradera vive lejos (x = MEADOW) para que la niebla oculte la base.
    portalClose: { from: [-6, 2.5, 4], to: [-9, 3, -2], look: [-26, 6, -20], dur: 14, tint: 0x22d3ee, closing: true },
    bastion: { from: [16, 20, 22], to: [9, 24, 10], look: [0, 0, 0], dur: 20, tint: 0x9333ea, sky: 0x0d0a14 },
    mirror: { from: [4.5, 3, 66], to: [4.5, 4, 60], look: [4.5, 5, 26], dur: 18, tint: 0x22d3ee, twin: true, sky: 0x16303a },
    mirrorVoid: { from: [4.5, 3, 66], to: [4.5, 4, 60], look: [4.5, 5, 26], dur: 18, tint: 0x9333ea, twin: true, sky: 0x3a1450 },
    meadow: { from: [MEADOW - 6, 3.5, 26], to: [MEADOW - 2, 2.6, 16], look: [MEADOW, 3, -10], dur: 20, tint: 0xfbbf24, sky: 0xd9b46a },
    meadowClose: { from: [MEADOW + 3, 1.8, 8], to: [MEADOW + 1, 1.5, 4], look: [MEADOW - 1, 1, 0], dur: 20, tint: 0xfbbf24, sky: 0xd9b46a, sink: true },
    exodus: { from: [14, 7, 24], to: [4, 4, 10], look: [-26, 5, -20], dur: 20, tint: 0x9333ea, queue: true, sky: 0x1a0626 }
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
            const mods = await Promise.allSettled([...new Set([...PARTS.map(p => p[0]), ...PEOPLE, CULTIST])].map(id => import(`${CDN}${id}.mjs`).then(m => [id, m.createAsset])));
            const make = Object.fromEntries(mods.filter(m => m.status === 'fulfilled').map(m => m.value));
            if (dead || !Object.keys(make).length) return;

            renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x07080c);
            scene.fog = new THREE.Fog(0x07080c, 22, 70);

            const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshLambertMaterial({ color: 0x1d1e26 }));
            ground.rotation.x = -Math.PI / 2;
            scene.add(ground);

            // Los personajes llegan en pose T: se les bajan los brazos y cada uno toma una postura
            const crew = [];
            const pose = (obj, i) => {
                const bones = {};
                obj.traverse(o => { if (o.isBone) bones[o.name] = o; });
                const set = (name, x, y, z) => bones[name]?.rotation.set(x, y, z);
                set('LeftArm', 0, 0, -1.25); set('RightArm', 0, 0, 1.25);
                set('LeftForeArm', 0, -0.25, 0); set('RightForeArm', 0, 0.25, 0);
                if (i === 0) { set('RightArm', 0, 1.1, 0.35); set('RightForeArm', 0, 0.5, 0); } // tiende la mano al Monolito
                if (i === 1) { set('LeftArm', 0, -0.9, -0.9); set('LeftForeArm', 0, -1.5, 0); } // consulta el escáner
                if (i === 2) set('Head', -0.25, 0, 0); // mira hacia arriba
                return { bones, i, obj };
            };
            for (const [id, x, z, turns] of PARTS) {
                if (!make[id]) continue;
                const obj = make[id]();
                obj.position.set(x, 0, z);
                obj.rotation.y = turns * Math.PI / 2;
                scene.add(obj);
                if (id.startsWith('astronaut')) crew.push(pose(obj, crew.length));
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

            const twin = monolith.clone();
            twin.position.x += 9;
            scene.add(twin);

            const flesh = new THREE.MeshLambertMaterial({ color: 0xb98272, flatShading: true });
            const fallback = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.1, 2, 6), new THREE.MeshLambertMaterial({ color: 0xc99a7c }));
            fallback.position.y = 0.85;
            const figure = (x, z, i, turn = 0, id = PEOPLE[i % PEOPLE.length], opts) => {
                const holder = new THREE.Group();
                holder.position.set(x, 0, z);
                holder.rotation.y = turn;
                holder.userData.person = { id, opts };
                return holder;
            };
            const dress = (group) => {
                group.userData.dressed = true;
                group.traverse(h => {
                    const p = h.userData.person;
                    if (!p || h.children.length) return;
                    if (!make[p.id]) return h.add(fallback.clone());
                    const obj = make[p.id](p.opts);
                    pose(obj, -1);
                    h.add(obj);
                });
            };

            // Pradera dorada: colinas de carne y gente fundiéndose en parejas
            const meadow = new THREE.Group();
            const grass = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshLambertMaterial({ color: 0xb59a3c }));
            grass.rotation.x = -Math.PI / 2;
            grass.position.y = 0.01;
            meadow.add(grass);
            [[-20, -24, 10], [6, -30, 13], [26, -22, 9], [-34, -12, 8], [36, -8, 7]].forEach(([x, z, r]) => {
                const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), flesh);
                hill.scale.y = 0.45;
                hill.position.set(x, 0, z);
                meadow.add(hill);
            });
            const sinkers = [];
            for (let i = 0; i < 14; i++) {
                const x = (i % 7) * 3.2 - 10 + (i > 6 ? 1.4 : 0), z = -4 - Math.floor(i / 7) * 5;
                const a = figure(x, z, i, Math.PI / 2), b = figure(x + 0.55, z, i + 1, -Math.PI / 2);
                meadow.add(a, b);
                sinkers.push(a, b);
            }
            meadow.position.x = MEADOW;
            scene.add(meadow);

            // Plaza: gente que desaparece (vanish) o protesta con fuego (crowd)
            const plaza = new THREE.Group();
            const citizens = Array.from({ length: 28 }, (_, i) => {
                const m = figure(((i * 7) % 13) - 6 + Math.sin(i) * 0.6, ((i * 5) % 11) - 5, i, Math.sin(i * 1.3) * 0.5);
                plaza.add(m);
                return m;
            });
            const fires = [[-3, -3], [4, -2]].map(([x, z]) => {
                const l = new THREE.PointLight(0xff5a1f, 30, 14);
                l.position.set(x, 1, z);
                plaza.add(l);
                return l;
            });
            plaza.position.set(CITY[0], 0, CITY[1]);
            scene.add(plaza);

            // Tarima: un hombre de gabardina sobre una plataforma y la gente mirándolo
            const stage = new THREE.Group();
            const deck = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 3), new THREE.MeshLambertMaterial({ color: 0x3f3a36 }));
            deck.position.y = 0.6;
            const preacher = figure(0, 0, 4);
            preacher.position.y = 1.2;
            stage.add(deck, preacher);
            for (let i = 0; i < 18; i++) stage.add(figure(((i % 6) - 2.5) * 1.4, 4 + Math.floor(i / 6) * 1.7, i, Math.PI));
            const stageLight = new THREE.PointLight(0x9333ea, 25, 12);
            stageLight.position.set(0, 4, 1);
            stage.add(stageLight);
            stage.position.set(STAGE[0], 0, STAGE[1]);
            scene.add(stage);

            // Altar: capas blancas en corro alrededor de un fragmento de nakara que late
            const shrine = new THREE.Group();
            for (let i = 0; i < 10; i++) {
                const a = (i / 10) * Math.PI * 2;
                shrine.add(figure(Math.cos(a) * 3.2, Math.sin(a) * 3.2, i, -Math.PI / 2 - a, CULTIST, { hue: 'bone' }));
            }
            const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
            shard.position.y = 1.3;
            const shardLight = new THREE.PointLight(0xa855f7, 20, 10);
            shardLight.position.y = 1.6;
            shrine.add(shard, shardLight);
            shrine.position.set(ALTAR[0], 0, ALTAR[1]);
            scene.add(shrine);

            // Éxodo: la fila hacia el portal
            const queue = new THREE.Group();
            const walkers = Array.from({ length: 36 }, (_, i) => { const m = figure(0, 0, i); queue.add(m); return m; });
            scene.add(queue);
            const QA = [0, 4], QB = [PORTAL[0] + 3, PORTAL[1] + 3];
            walkers.forEach(m => { m.rotation.y = Math.atan2(QB[0] - QA[0], QB[1] - QA[1]); });

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

                const k = s ? Math.min(1, (t - shotStart) / (s.dur * 1000)) : 0;
                const sky = s?.sky ?? 0x07080c;
                scene.background.setHex(sky);
                scene.fog.color.setHex(sky);
                ring.scale.setScalar(s?.closing ? Math.max(0.02, 1 - k * 1.2) : 1);
                voidDisc.scale.copy(ring.scale);
                ringLight.intensity = s?.closing ? 40 * (1 - k) : 40;
                plaza.visible = !!(s?.vanish || s?.crowd);
                citizens.forEach((m, i) => { m.visible = !s?.vanish || i / citizens.length > k * 0.9 || i % 3 === 0; });
                fires.forEach((l, i) => { l.visible = !!s?.crowd; l.intensity = 24 + Math.sin(t * 0.02 + i * 3) * 10; });
                stage.visible = !!s?.tarima;
                shrine.visible = !!s?.altar;
                const beat = Math.max(0, 1 - ((t % 10000) / 600));
                shard.rotation.y += dt * 0.0006;
                shardLight.intensity = 10 + beat * 50;
                if (s?.opening) ring.scale.setScalar(0.2 + Math.min(1, k * 1.5) * 0.8);
                if (crew[0]) crew[0].obj.visible = !(s?.flash && k > 0.35);
                for (const g of [meadow, plaza, stage, shrine, queue]) if (g.visible && !g.userData.dressed) dress(g);
                twin.visible = !!s?.twin;
                twin.position.y = -6 + 11.5 * Math.min(1, k * 1.4);
                meadow.visible = !!s?.sky && shot.startsWith('meadow');
                for (const m of sinkers) m.position.y = s?.sink ? -k * 1.2 : 0;
                queue.visible = !!s?.queue;
                if (queue.visible) walkers.forEach((m, i) => {
                    const f = ((i / walkers.length) + t * 0.00002) % 1;
                    m.position.set(QA[0] + (QB[0] - QA[0]) * f + (i % 2) * 0.8, 0, QA[1] + (QB[1] - QA[1]) * f);
                });

                core.color.set(s ? s.tint : (sect ? 0x9333ea : 0xff8c00));
                core.intensity = 50 + Math.sin(t * 0.002) * 18;
                monoLight.intensity = s?.flash && k > 0.3 && k < 0.4 ? 400 : 24 + Math.sin(t * 0.003) * 14;
                ring.rotation.z += dt * 0.0003;
                for (const { bones, i } of crew) {
                    const w = Math.sin(t * 0.0012 + i * 2.1);
                    if (bones.Spine) bones.Spine.rotation.x = w * 0.03;
                    if (bones.Head) bones.Head.rotation.y = Math.sin(t * 0.0005 + i * 1.7) * 0.25;
                }
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
