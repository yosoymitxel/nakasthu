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
// Entre planos se funde a negro; si comparten `place`, la cámara se desliza sin fundido. `cut` corta en seco.
const M = MEADOW;
const SHOTS = {
    // `tall`: encuadre propio en vertical (móvil), donde el subtítulo tapa la parte baja
    descent: { from: [7, 2.4, 44], to: [3.5, 2, 37], look: [0, 4, 26], tall: { from: [5, 3.6, 50], to: [2.5, 3.2, 44], look: [0, 2.4, 28] }, dur: 16, tint: 0x22d3ee, place: 'zhyr' },
    monolith: { from: [0, 1.2, 37], to: [0, 1.6, 34.5], look: [0, 5.5, 26], dur: 20, tint: 0x22d3ee, place: 'zhyr' },
    awakening: { from: [2, 5, 36], to: [16, 30, 58], look: [0, 3, 12], dur: 14, tint: 0xffffff },
    riot: { from: [-20, 1.8, 16], to: [-9, 2.4, 11], look: [0, 4.5, 0], dur: 18, tint: 0xef4444 },
    messenger: { from: [-22, 2.5, 4], to: [-17, 5, -1], look: [-12, 10, -8], dur: 18, tint: 0x9333ea },
    faith: { from: [-24, 1.6, 18], to: [-19, 2.6, 15], look: [-12, 3, 8], dur: 18, tint: 0x9333ea },
    portal: { from: [3, 2.5, -9], to: [-2, 3.2, -12], look: [-26, 6, -20], dur: 20, tint: 0x9333ea, place: 'portal' },
    // Intermedias: `flash` destella y borra a la exploradora, `vanish` apaga gente, `crowd`/`tarima`/`altar` muestran su grupo
    touch: { from: [-1, 1.6, 34], to: [-0.6, 1.9, 33], look: [0, 4, 26], dur: 12, tint: 0xffffff, flash: true, place: 'zhyr' },
    vanish: { from: [CITY[0] + 10, 6, CITY[1] + 14], to: [CITY[0] + 6, 4, CITY[1] + 8], look: [CITY[0], 1, CITY[1]], dur: 16, tint: 0x64748b, vanish: true, sky: 0x0a0c12 },
    riotCrowd: { from: [CITY[0] - 3, 3.2, CITY[1] + 16], to: [CITY[0] - 1, 2.6, CITY[1] + 12], look: [CITY[0], 1.2, CITY[1] - 2], dur: 16, tint: 0xef4444, crowd: true, sky: 0x1a0806 },
    // Cámara de vigilancia: la misma plaza desde arriba
    surveil: { from: [CITY[0] + 2, 17, CITY[1] + 8], to: [CITY[0] + 1.5, 16.5, CITY[1] + 7], look: [CITY[0], 0, CITY[1]], dur: 14, tint: 0xef4444, crowd: true, sky: 0x1a0806 },
    tarima: { from: [STAGE[0] + 3, 4.5, STAGE[1] + 17], to: [STAGE[0] + 1.5, 3.8, STAGE[1] + 13], look: [STAGE[0], 2, STAGE[1]], dur: 18, tint: 0x9333ea, tarima: true, sky: 0x0e0614 },
    altar: { from: [ALTAR[0] + 9, 4, ALTAR[1] + 9], to: [ALTAR[0] + 6, 2.5, ALTAR[1] + 6], look: [ALTAR[0], 1, ALTAR[1]], dur: 18, tint: 0xe9d5ff, altar: true, sky: 0x0b0710, place: 'altar' },
    // Toren: un hombre sale del corro hacia el fragmento; en `torenAsh` destella, la ceniza dibuja cinco trazos y cae
    toren: { from: [ALTAR[0] + 5.5, 3.6, ALTAR[1] + 6], to: [ALTAR[0] + 4.8, 3.3, ALTAR[1] + 5.2], look: [ALTAR[0] + 1, 1, ALTAR[1]], dur: 14, tint: 0xe9d5ff, altar: true, victim: 'step', sky: 0x0b0710, place: 'altar' },
    torenAsh: { from: [ALTAR[0] + 4.8, 3.3, ALTAR[1] + 5.2], to: [ALTAR[0] + 4.2, 3, ALTAR[1] + 4.6], look: [ALTAR[0] + 0.6, 1.4, ALTAR[1]], dur: 12, tint: 0xe9d5ff, altar: true, victim: 'ash', sky: 0x0b0710, place: 'altar' },
    portalOpen: { from: [-2, 3, -12], to: [-6, 3.6, -14], look: [-26, 6, -20], dur: 16, tint: 0x9333ea, opening: true, place: 'portal' },
    // Epílogo: `closing` encoge el portal, `twin` alza el segundo monolito, `queue` muestra la fila,
    // `sky` cambia cielo y niebla; la pradera vive lejos (x = MEADOW) para que la niebla oculte la base.
    portalClose: { from: [-6, 2.5, -12], to: [-10, 3, -15], look: [-26, 6, -20], dur: 14, tint: 0x22d3ee, closing: true, place: 'portal' },
    bastion: { from: [16, 20, 22], to: [9, 24, 10], look: [0, 0, 0], dur: 20, tint: 0x9333ea, sky: 0x0d0a14 },
    // La grabación del geólogo: un solo astronauta ante la piedra; en `kaminTurn` gira la cabeza a cámara
    kaminTape: { from: [3.6, 1.7, 33.4], to: [3.4, 1.7, 33.2], look: [0, 1.5, 31.5], dur: 20, tint: 0xffe2b0, tape: true, sky: 0x24180c, place: 'tape' },
    kaminTurn: { from: [3.4, 1.7, 33.2], to: [3.3, 1.7, 33.1], look: [0, 1.6, 31.8], dur: 12, tint: 0xffe2b0, tape: true, turn: true, sky: 0x24180c, place: 'tape' },
    mirror: { from: [4.5, 3, 66], to: [4.5, 4, 60], look: [4.5, 5, 26], dur: 18, tint: 0x22d3ee, twin: true, sky: 0x16303a },
    mirrorVoid: { from: [4.5, 3, 66], to: [4.5, 4, 60], look: [4.5, 5, 26], dur: 18, tint: 0x9333ea, twin: true, sky: 0x3a1450 },
    // Pradera (cap. 16): cada plano cambia una cosa. `rot` 0 paraíso, 1 flores, 2 cielo, 3 carne; `rel` dónde
    // están los familiares (lejos, andando, delante, fundidos); `still` para la respiración; `tremor` tiembla.
    meadow: { from: [M, 0.35, 6], to: [M, 1.6, 5.5], look: [M, 1.4, -20], dur: 9, tint: 0xfbbf24, meadow: true, rot: 0, rel: 'far', place: 'meadow' },
    meadowWalk: { from: [M, 1.6, 5.5], to: [M, 1.6, 5], look: [M, 1.2, -20], dur: 14, tint: 0xfbbf24, meadow: true, rot: 0, rel: 'walk', place: 'meadow' },
    meadowFace: { from: [M + 0.2, 1.6, 4.4], to: [M, 1.6, 4.1], look: [M, 1.45, 2.6], dur: 20, tint: 0xfbbf24, meadow: true, rot: 0, rel: 'near', darien: true, place: 'meadow' },
    meadowStill: { from: [M, 1.6, 4.1], to: [M, 1.6, 4.0], look: [M, 1.45, 2.6], dur: 20, tint: 0xfbbf24, meadow: true, rot: 0, rel: 'near', darien: true, still: true, tremor: true, place: 'meadow' },
    meadowFlowers: { from: [M + 0.3, 1.4, 4], to: [M + 0.4, 1.0, 3.9], look: [M + 2.2, 0, 3.2], dur: 16, tint: 0xfbbf24, meadow: true, rot: 1, rel: 'near', darien: true, still: true, tremor: true, bloom: true, place: 'meadow' },
    meadowSky: { from: [M, 1.2, 4], to: [M, 1.1, 4.2], look: [M, 40, -12], dur: 20, tint: 0xfbbf24, meadow: true, rot: 2, rel: 'near', darien: true, still: true, bloom: true, pulse: true, place: 'meadow' },
    meadowFar: { from: [M - 7, 4.5, 15], to: [M - 4, 3.4, 12], look: [M, 0.6, -6], dur: 20, tint: 0xfbbf24, meadow: true, rot: 3, rel: 'merged', still: true, bloom: true, pulse: true, sink: true, place: 'meadow' },
    meadowSink: { from: [M, 1.6, 4], to: [M, -0.6, 4], look: [M, 1.45, 2.6], dur: 9, tint: 0xfbbf24, meadow: true, rot: 3, rel: 'merged', darien: true, still: true, bloom: true, sink: true, dark: true, place: 'meadow' },
    // El bucle: el mismo fotograma de la primera página, sin fundido
    meadowLoop: { from: [M, 0.35, 6], to: [M, 1.6, 5.5], look: [M, 1.4, -20], dur: 9, tint: 0xfbbf24, meadow: true, rot: 0, rel: 'far', cut: true, place: 'meadow' },
    // La fila entra por detrás de la cámara y se pierde en el portal; la base queda fuera, a la derecha
    exodus: { from: [-19, 4.2, 9], to: [-21, 3.4, 2], look: [-25, 2.2, -18], dur: 20, tint: 0x9333ea, queue: true, sky: 0x1a0626 }
};
// Colores de la pradera por fase de `rot`: hierba, colinas, cielo
const MEADOW_COLORS = [
    [0x5d8a3a, 0x4f7d3a, 0x8fb8e8],
    [0xb8b49a, 0x4f7d3a, 0x8fb8e8],
    [0xb8b49a, 0x6f7a52, 0x5a5f8c],
    [0xb8b49a, 0xb98272, 0x5a5f8c]
];

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

            // Pradera (cap. 16): empieza verde y azul; los colores se pudren según el plano (MEADOW_COLORS)
            const meadow = new THREE.Group();
            const grassMat = new THREE.MeshLambertMaterial({ color: MEADOW_COLORS[0][0] });
            const hillMat = new THREE.MeshLambertMaterial({ color: MEADOW_COLORS[0][1], flatShading: true });
            const grass = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), grassMat);
            grass.rotation.x = -Math.PI / 2;
            grass.position.y = 0.01;
            meadow.add(grass);
            const hills = [[-20, -24, 10], [6, -30, 13], [26, -22, 9], [-34, -12, 8], [36, -8, 7]].map(([x, z, r]) => {
                const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), hillMat);
                hill.scale.y = 0.45;
                hill.position.set(x, 0, z);
                meadow.add(hill);
                return hill;
            });
            // Flores: cerradas son flores; en `bloom` se abren y se cierran cada una a su ritmo
            const FLOWERS = 420;
            const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshLambertMaterial({ color: 0xffffff }), FLOWERS);
            const flowerData = Array.from({ length: FLOWERS }, (_, i) => {
                const a = i * 2.39996, r = 0.6 + Math.sqrt(i / FLOWERS) * 13;
                flowers.setColorAt(i, new THREE.Color(i % 3 ? 0xf5f5f0 : 0xf2d060));
                return { x: Math.cos(a) * r, z: 2 + Math.sin(a) * r * 0.9, w: 0.002 + (i % 7) * 0.0007, ph: i * 1.7 };
            });
            const dummy = new THREE.Object3D();
            const placeFlowers = (t, open) => {
                flowerData.forEach((f, i) => {
                    dummy.position.set(f.x, 0.08, f.z);
                    const o = open ? 0.25 + 0.9 * Math.abs(Math.sin(t * f.w + f.ph)) : 1;
                    dummy.scale.set(1, o, 1);
                    dummy.updateMatrix();
                    flowers.setMatrixAt(i, dummy.matrix);
                });
                flowers.instanceMatrix.needsUpdate = true;
            };
            placeFlowers(0, false);
            meadow.add(flowers);
            // Parejas: el que llega (a) y el familiar (b) que baja de las colinas
            const couples = [];
            for (let i = 0; i < 14; i++) {
                const x = (i % 7) * 3.2 - 10 + (i > 6 ? 1.4 : 0), z = -4 - Math.floor(i / 7) * 5;
                const a = figure(x, z, i, Math.PI / 2), b = figure(x + 0.55, z, i + 1, -Math.PI / 2);
                meadow.add(a, b);
                couples.push({ a, b, x, z, fx: x * 1.8, fz: -34 + (i % 4) * 3 });
            }
            // Darien, a un metro de Leina
            const darien = figure(0, 2.6, 0, 0, 'commuter-381e7f');
            meadow.add(darien);
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
            const victim = figure(3.2, 0.6, 3, -Math.PI / 2);
            shrine.add(victim);
            const ash = Array.from({ length: 5 }, (_, i) => {
                const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.8, 0.07), new THREE.MeshBasicMaterial({ color: 0x050505 }));
                m.rotation.z = 0.45;
                m.position.set(-0.5 + i * 0.25, 1.5, 0.6);
                shrine.add(m);
                return m;
            });
            shrine.position.set(ALTAR[0], 0, ALTAR[1]);
            scene.add(shrine);

            // Éxodo: la fila hacia el portal
            const queue = new THREE.Group();
            const walkers = Array.from({ length: 36 }, (_, i) => { const m = figure(0, 0, i); queue.add(m); return m; });
            scene.add(queue);
            const QA = [-24, 14], QB = [PORTAL[0] + 0.5, PORTAL[1] + 4];
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
                // En vertical (móvil) el encuadre de 42° dejaba fuera a los personajes
                camera.fov = w < h ? 64 : 42;
                camera.updateProjectionMatrix();
            };
            resize();
            addEventListener('resize', resize);
            live.current.cleanup = () => removeEventListener('resize', resize);

            // Vestir a toda la gente al cargar, un grupo por tick: si no, brotaba de golpe en el primer fotograma
            for (const g of [meadow, plaza, stage, shrine, queue]) {
                dress(g);
                await new Promise(r => setTimeout(r, 0));
                if (dead) return;
            }

            const UNSET = {};
            const FADE_OUT = 260, FADE_IN = 420, SLIDE = 900;
            let last = 0, angle = 0.6, shotName = UNSET, shotStart = 0;
            let pending = false, lastDark = 0, fadeStart = 0, fadeIn = -1, slideStart = -1, snap = true, lastFilter = '';
            const slideFrom = new THREE.Vector3(), lookFrom = new THREE.Vector3(), lookNow = new THREE.Vector3();
            const target = new THREE.Vector3(), aim = new THREE.Vector3(), tmp = new THREE.Color();
            const lerpColor = (c, hex, k) => (snap ? c.setHex(hex) : c.lerp(tmp.setHex(hex), k));
            const frame = (t) => {
                raf = requestAnimationFrame(frame);
                const { dim, sect, shot } = live.current;
                // Durante la partida basta con unos pocos fotogramas por segundo
                if (document.hidden || t - last < (dim ? 160 : 40)) return;
                const dt = t - last;
                last = t;

                // Cambio de plano: funde a negro, cambia con la pantalla negra y vuelve. Mismo sitio: se desliza.
                if (!pending && shot !== shotName) {
                    const a = SHOTS[shotName], b = SHOTS[shot];
                    const near = a && b && a.place && a.place === b.place && !b.cut;
                    if (shotName === UNSET || b?.cut || near) {
                        slideStart = near ? t : -1;
                        slideFrom.copy(camera.position);
                        lookFrom.copy(lookNow);
                        shotName = shot; shotStart = t; snap = !near;
                    } else { pending = true; fadeStart = t; }
                }
                let dark = 0;
                if (pending) {
                    dark = Math.min(1, (t - fadeStart) / FADE_OUT);
                    // El primer fotograma del plano nuevo puede tardar (sitio sin dibujar aún): la vuelta empieza después
                    if (dark >= 1) { pending = false; shotName = shot; shotStart = t; fadeIn = Infinity; slideStart = -1; snap = true; }
                } else if (fadeIn === Infinity) {
                    dark = 1; fadeIn = t;
                } else if (fadeIn >= 0) {
                    // Con fotogramas lentos (móvil) no se salta de negro a imagen en uno solo
                    dark = Math.max(0, 1 - (t - fadeIn) / FADE_IN, lastDark - 0.3);
                    if (!dark) fadeIn = -1;
                }
                lastDark = dark;
                const filter = dark > 0.01 ? `brightness(${(1 - dark).toFixed(2)})` : '';
                if (filter !== lastFilter) { canvas.style.filter = filter; lastFilter = filter; }

                const s0 = SHOTS[shotName];
                const s = s0?.tall && innerWidth < innerHeight ? (s0.tallShot ||= { ...s0, ...s0.tall }) : s0;
                const k = s ? Math.min(1, (t - shotStart) / (s.dur * 1000)) : 0;
                if (s) {
                    const e = k * k * (3 - 2 * k);
                    target.set(
                        s.from[0] + (s.to[0] - s.from[0]) * e,
                        s.from[1] + (s.to[1] - s.from[1]) * e + (s.meadow ? 0 : Math.sin(t * 0.0006) * 0.08),
                        s.from[2] + (s.to[2] - s.from[2]) * e
                    );
                    aim.set(s.look[0], s.look[1], s.look[2]);
                } else {
                    angle += dt * 0.00004;
                    target.set(Math.sin(angle) * 34, 9 + Math.sin(angle * 3) * 1.5, Math.cos(angle) * 34);
                    aim.set(0, 4, 0);
                }
                if (slideStart >= 0) {
                    const b = Math.min(1, (t - slideStart) / SLIDE);
                    const be = b * b * (3 - 2 * b);
                    target.lerpVectors(slideFrom, target, be);
                    aim.lerpVectors(lookFrom, aim, be);
                    if (b >= 1) slideStart = -1;
                }
                if (s?.tremor) target.x += (Math.random() - 0.5) * 0.012, target.y += (Math.random() - 0.5) * 0.012;
                camera.position.copy(target);
                camera.lookAt(aim);
                lookNow.copy(aim);

                const beat = Math.max(0, 1 - ((t % 10000) / 600));
                const colors = s?.meadow ? MEADOW_COLORS[s.rot] : null;
                const sky = s?.dark ? 0x000000 : (colors ? colors[2] : (s?.sky ?? 0x07080c));
                lerpColor(scene.background, sky, s?.dark ? 0.03 : 0.06);
                scene.fog.color.copy(scene.background);
                if (s?.pulse) scene.fog.color.lerp(tmp.setHex(0xa0485a), beat * 0.5);
                scene.fog.near = s?.meadow ? 30 - (s.pulse ? beat * 14 : 0) : 22;
                scene.fog.far = s?.meadow ? 110 : 70;

                ring.scale.setScalar(s?.closing ? Math.max(0.02, 1 - k * 1.2) : 1);
                voidDisc.scale.copy(ring.scale);
                ringLight.intensity = s?.closing ? 40 * (1 - k) : 40;
                plaza.visible = !!(s?.vanish || s?.crowd);
                citizens.forEach((m, i) => { m.visible = !s?.vanish || i / citizens.length > k * 0.9 || i % 3 === 0; });
                fires.forEach((l, i) => { l.visible = !!s?.crowd; l.intensity = 24 + Math.sin(t * 0.02 + i * 3) * 10; });
                stage.visible = !!s?.tarima;
                shrine.visible = !!s?.altar;
                shard.rotation.y += dt * 0.0006;
                // Toren: avanza hasta el fragmento; en `torenAsh` destella, la ceniza se ordena en cinco trazos y cae
                const ashK = s?.victim === 'ash' ? k : 0;
                victim.visible = s?.victim === 'step' || (s?.victim === 'ash' && ashK < 0.14);
                victim.position.x = s?.victim === 'step' ? 3.2 - 1.7 * Math.min(1, k * 2.2) : 1.5;
                const flash = ashK > 0.12 && ashK < 0.22;
                shardLight.intensity = flash ? 320 : 10 + beat * 50;
                ash.forEach((m, i) => {
                    m.visible = ashK > 0.18 && ashK < 0.7;
                    m.position.y = 1.5 - Math.max(0, ashK - 0.42) * 6 * (1 + i * 0.15);
                });
                if (s?.opening) { ring.scale.setScalar(0.2 + Math.min(1, k * 1.5) * 0.8); voidDisc.scale.copy(ring.scale); }
                // La grabación: sólo queda uno ante la piedra
                crew.forEach(c => { c.obj.visible = s?.tape ? c.i === 1 : true; });
                if (crew[0] && !s?.tape) crew[0].obj.visible = !(s?.flash && k > 0.35);
                twin.visible = !!s?.twin;
                twin.position.y = -6 + 11.5 * Math.min(1, k * 1.4);

                meadow.visible = !!s?.meadow;
                if (meadow.visible) {
                    lerpColor(grassMat.color, colors[0], 0.03);
                    lerpColor(hillMat.color, colors[1], 0.02);
                    hills.forEach((h, i) => { h.scale.y = 0.45 + (s.rot === 3 ? Math.sin(t * 0.0009 + i) * 0.05 : 0); });
                    placeFlowers(t, !!s.bloom);
                    darien.visible = !!s.darien;
                    const walk = s.rel === 'walk' ? Math.min(1, k * 1.25) : (s.rel === 'far' ? 0 : 1);
                    couples.forEach(({ a, b, x, z, fx, fz }, i) => {
                        const gap = s.rel === 'merged' ? 0.12 : 0.55;
                        b.position.set(fx + (x + gap - fx) * walk, 0, fz + (z - fz) * walk);
                        b.rotation.y = walk < 1 ? Math.atan2(x - fx, z - fz) : -Math.PI / 2;
                        const sway = s.still ? 0 : Math.sin(t * 0.0018 + i) * 0.025;
                        const sink = s.sink ? -k * 1.2 : 0;
                        a.rotation.z = sway; b.rotation.z = -sway;
                        a.position.y = sink; b.position.y = sink;
                    });
                    darien.rotation.z = s.still ? 0 : Math.sin(t * 0.0018) * 0.02;
                }
                snap = false;

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
                    if (bones.Spine) bones.Spine.rotation.x = s?.tape ? 0 : w * 0.03;
                    if (!bones.Head) continue;
                    // En la grabación la cabeza se queda quieta y, en `kaminTurn`, gira hacia la cámara sin los hombros
                    if (s?.tape) bones.Head.rotation.y = s.turn ? -1.9 * Math.min(1, Math.max(0, (k - 0.15) / 0.35)) : 0;
                    else bones.Head.rotation.y = Math.sin(t * 0.0005 + i * 1.7) * 0.25;
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
