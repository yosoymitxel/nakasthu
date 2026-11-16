/**
 * PIXELPORTRAIT.JS
 * Busto píxel 16x20 enriquecido por Especie, Rol y Personajes Clave del Canon.
 * Determinista: el mismo id y rol dibuja siempre la misma apariencia.
 * Los personajes Motor del Lore (Kael, Deyar, Elara, Orval Drexler, Alexia, Kamin, Leina, NAKASTHU)
 * tienen sprites artesanales canónicos y nunca se confunden con alienígenas genéricos.
 */
import { html } from '../utils/html.js';
import { findLoreCharacter } from '../../data/loreCharactersConfig.js';

const { useRef, useEffect, memo } = (typeof React !== 'undefined' ? React : (typeof window !== 'undefined' && window.React ? window.React : { useRef: () => ({ current: null }), useEffect: () => {}, memo: (c) => c }));

const W = 16, H = 20;
const INK = '#090a10';

// Paletas de piel humana realistas (base, sombra)
const HUMAN_SKINS = [
    ['#f3d5be', '#cfa891'], // Pálido / Laboratorio
    ['#e0b596', '#b08365'], // Trigueño claro
    ['#c7926b', '#8f5c3b'], // Cálido / Ocre
    ['#ab7a54', '#704c32'], // Oliva / Mediterráneo
    ['#7f5135', '#52311d'], // Bronce profundo
    ['#543423', '#331e13']  // Umber oscuro
];

// Colores de cabello humano
const HAIR_COLORS = [
    { base: '#18181b', light: '#3f3f46' }, // Negro cuervo
    { base: '#3b271d', light: '#593c2c' }, // Castaño oscuro
    { base: '#5c3826', light: '#825338' }, // Castaño medio
    { base: '#8f3d24', light: '#ba593c' }, // Cobrizo / Caoba
    { base: '#bfa15f', light: '#ded095' }, // Rubio ceniza
    { base: '#71717a', light: '#a1a1aa' }, // Gris veterano
    { base: '#e4e4e7', light: '#ffffff' }  // Blanco / Platino
];

// Formas de híbridos / alienígenas de Zhyr
export const ALIENS = ['zhyriano', 'nakari', 'quitinoso', 'cristalino'];

const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
};

/** Determina la morfología base del sujeto considerando si es un personaje del lore */
export const morphFor = (species, seed, role = '') => {
    const lore = findLoreCharacter(seed);
    if (lore) {
        if (lore.species) return lore.species.toLowerCase();
        return 'humano';
    }
    const s = String(species || '').toUpperCase();
    if (s === 'CLON') return 'clon';
    if (s === 'HÍBRIDO') {
        const h = hash(String(seed));
        return ALIENS[h % ALIENS.length];
    }
    if (s === 'EIDOLON') {
        const h = hash(String(seed));
        return ['humano', 'clon', ...ALIENS][h % 6];
    }
    return 'humano';
};

/** Renderizado artesanal para los personajes Motor del Lore */
const drawLoreCharacter = (ctx, loreKey, r, p) => {
    const key = (loreKey || '').toUpperCase();

    if (key === 'KAEL') {
        // --- KAEL: Líder de expedición / Explorador con visor biónico ---
        // Torso: Armadura de explorador oscura con hombreras tácticas y galón cian
        r('#14171f', 2, 13, 12, 7);
        r('#232833', 2, 13, 3, 3); r('#232833', 11, 13, 3, 3); // Hombreras reforzadas
        r('#0e7490', 7, 14, 2, 2); // Insignia cian de expedición
        r('#06b6d4', 7, 16, 2, 1);
        r('#1c202a', 6, 12, 4, 2); // Cuello táctico
        r(INK, 4, 13, 1, 6); // Correa diagonal de arnés
        r(INK, 5, 15, 1, 4);

        // Cabeza / Rostro: Piel tostada por la intemperie
        r(INK, 4, 2, 8, 10); r(INK, 5, 1, 6, 1);
        r('#b8865e', 5, 4, 6, 7);
        r('#825738', 10, 5, 1, 6); r('#825738', 6, 11, 4, 1); // Sombra mandibular
        // Pelo corto militar con degradado
        r('#241f1c', 5, 2, 6, 2); r('#241f1c', 4, 3, 1, 3); r('#241f1c', 11, 3, 1, 2);
        // Cejas y cicatriz
        r('#241f1c', 5, 5, 2, 1); r('#241f1c', 8, 5, 3, 1);
        p('#e0b596', 6, 5); // Cicatriz que corta la ceja derecha
        // Ojo derecho (humano, determinado)
        p('#ffffff', 5, 6); p('#1c130e', 6, 6);
        // Ojo izquierdo: VISOR BIÓNICO CIAN DE EXPEDICIÓN
        r('#27272a', 8, 5, 3, 3); // Marco metálico
        r('#06b6d4', 8, 6, 2, 1);
        p('#a5f3fc', 9, 6); // Destello central de lente
        p('#22d3ee', 11, 6); // Conector neural en la sien
        // Boca firme y decidida
        r('#593c2c', 7, 9, 2, 1);
        return true;
    }

    if (key === 'DEYAR') {
        // --- DEYAR: Técnico de drones con gafas en la frente y antena de telemetría ---
        // Torso: Mono industrial naranja óxido y gris pizarra
        r('#1e293b', 2, 13, 12, 7);
        r('#c2410c', 4, 13, 8, 6); // Pechera naranja
        r('#f59e0b', 7, 14, 2, 3); // Indicador de telemetría
        p('#38bdf8', 5, 16); // Luz de conexión de dron
        r('#334155', 6, 12, 4, 2); // Cuello protector

        // Cabeza y rostro técnico
        r(INK, 4, 2, 8, 10); r(INK, 5, 1, 6, 1);
        r('#bf8c60', 5, 4, 6, 7); r('#875635', 10, 5, 1, 6);
        r('#291e17', 5, 2, 6, 2); // Cabello corto
        // Gafas de diagnóstico en la frente
        r(INK, 4, 3, 8, 2);
        r('#d97706', 5, 3, 2, 2); r('#d97706', 9, 3, 2, 2); // Cristales ámbar
        p('#fef08a', 5, 3); p('#fef08a', 9, 3);
        // Antena de telemetría en oído izquierdo
        r('#475569', 4, 6, 1, 2); // Auricular
        r('#94a3b8', 3, 2, 1, 4); // Antena vertical
        p('#f59e0b', 3, 1); // Led ámbar de señal
        // Ojos concentrados
        p('#ffffff', 5, 7); p('#18181b', 6, 7);
        p('#ffffff', 10, 7); p('#18181b', 9, 7);
        r('#653926', 7, 10, 2, 1);
        return true;
    }

    if (key === 'ELARA') {
        // --- ELARA: Operadora humana con ojeras profundas y bandana de fábrica ---
        // Torso: Ropa de trabajo civil azul pizarra con etiqueta de operario
        r('#1e293b', 2, 13, 12, 7);
        r('#334155', 4, 13, 8, 6);
        r('#fbbf24', 5, 16, 2, 1); // Placa de operaria de Dispay
        r('#475569', 6, 12, 4, 2);

        // Cabeza: Silueta femenina con cabello recogido y mechones sueltos
        r(INK, 3, 1, 10, 11);
        r('#1e1b18', 4, 1, 8, 3); // Cabello oscuro
        r('#1e1b18', 3, 4, 2, 5); r('#1e1b18', 11, 4, 2, 5); // Mechones laterales
        // Bandana de tela desgastada
        r('#64748b', 4, 3, 8, 1);
        // Rostro pálido y cansado
        r('#f0cca8', 5, 4, 6, 7); r('#b88a68', 10, 5, 1, 6);
        // Ojos grandes y alertas con marcadas ojeras violetas
        p('#ffffff', 5, 6); p('#1e1b18', 6, 6);
        p('#ffffff', 10, 6); p('#1e1b18', 9, 6);
        r('#7c4d5d', 5, 7, 2, 1); r('#7c4d5d', 9, 7, 2, 1); // Ojeras "tatuadas"
        // Expresión de tensión contenida
        r('#935359', 7, 9, 2, 1);
        return true;
    }

    if (key === 'ORVAL D.' || key === 'ORVAL DREXLER') {
        // --- ORVAL DREXLER: Director de la Orden en Talok (Líder militar supremo) ---
        // Torso: Abrigo negro impecable con charreteras doradas y botones de mando
        r('#09090b', 2, 13, 12, 7);
        r('#18181b', 3, 14, 10, 6);
        r('#f59e0b', 2, 13, 3, 1); r('#f59e0b', 11, 13, 3, 1); // Charreteras de oro
        p('#f59e0b', 6, 15); p('#f59e0b', 9, 15); // Botonadura doble dorada
        p('#f59e0b', 6, 17); p('#f59e0b', 9, 17);
        r('#d97706', 7, 13, 2, 1); // Broche central de Talok
        r('#09090b', 6, 12, 4, 2); // Cuello alto rígido

        // Cabeza: Pelo plateado peinado hacia atrás con elegancia gélida
        r(INK, 4, 2, 8, 10); r(INK, 5, 1, 6, 1);
        r('#e4e4e7', 4, 1, 8, 3); // Cabello plateado
        r('#71717a', 4, 4, 1, 4); r('#71717a', 11, 4, 1, 4); // Sienes grises
        // Rostro aristocrático y maduro
        r('#e5c8af', 5, 4, 6, 7); r('#9e7960', 10, 5, 1, 6);
        // Cejas arqueadas y severas
        r('#52525b', 5, 5, 2, 1); r('#52525b', 9, 5, 2, 1);
        // Ojos fríos de acero
        p('#ffffff', 5, 6); p('#0284c7', 6, 6);
        p('#ffffff', 10, 6); p('#0284c7', 9, 6);
        // Nariz y boca inflexible
        p('#9e7960', 7, 7);
        r('#573729', 7, 9, 2, 1);
        return true;
    }

    if (key === 'ALEXIA') {
        // --- ALEXIA: Simbologista del primer vínculo, afectada por resonancia cristalina ---
        // Torso: Túnica de investigación pizarra con línea de resonancia cian
        r('#0f172a', 2, 13, 12, 7);
        r('#1e293b', 4, 13, 8, 6);
        r('#06b6d4', 7, 13, 2, 7); // Costura de resonancia que brilla
        r('#334155', 6, 12, 4, 2);

        // Cabeza: Pelo oscuro que cae sobre un hombro
        r(INK, 3, 2, 10, 11);
        r('#18181b', 4, 2, 8, 3);
        r('#18181b', 3, 3, 2, 10); // Mechón largo al costado
        r('#fde2d0', 5, 4, 6, 7); // Piel pálida
        // LADO IZQUIERDO: MUTACIÓN DE CRISTAL DE RESONANCIA
        r('#22d3ee', 9, 4, 2, 6); // Vetas cristalinas
        p('#a5f3fc', 10, 3); p('#ffffff', 11, 2); // Cristal saliente en la sien
        // Ojo derecho humano
        p('#ffffff', 5, 6); p('#78350f', 6, 6);
        // Ojo izquierdo: FUSIÓN CON EL MONOLITO (Cian resplandeciente)
        r('#06b6d4', 9, 5, 2, 2);
        p('#ffffff', 9, 6); // Pupila cuántica blanca
        // Boca serena y enigmática
        r('#7c4a52', 7, 10, 2, 1);
        return true;
    }

    if (key === 'KAMIN') {
        // --- KAMIN: Profeta de la Orden de los Vínculos con capucha litúrgica púrpura ---
        // Torso: Vestidura sacerdotal púrpura real con bordado ceremonial de oro
        r('#2e1065', 2, 13, 12, 7);
        r('#3b0764', 3, 14, 10, 6);
        r('#f59e0b', 7, 13, 2, 7); // Estola dorada
        r('#c084fc', 7, 16, 2, 2); // Relicario de cuarzo violeta

        // Capucha ceremonial profunda
        r(INK, 3, 1, 10, 11);
        r('#581c87', 4, 1, 8, 2);
        r('#581c87', 3, 3, 2, 9); r('#581c87', 11, 3, 2, 9);
        r('#f59e0b', 5, 2, 6, 1); // Ribete bordado en la capucha
        // Sombra mística dentro de la capucha
        r('#1e0836', 5, 3, 6, 8);
        r('#c4b5fd', 6, 5, 4, 6); // Rostro en penumbra
        // Tercer ojo de vacío en la frente
        p('#e879f9', 7, 4); p('#ffffff', 8, 4);
        // Ojos violeta radiantes
        p('#c084fc', 6, 7); p('#581c87', 7, 7);
        p('#c084fc', 9, 7); p('#581c87', 8, 7);
        r('#6b21a8', 7, 10, 2, 1);
        return true;
    }

    if (key === 'LEINA') {
        // --- LEINA: Operadora precursora con corte bob cobrizo y diadema de enlace ---
        r('#0f172a', 2, 13, 12, 7);
        r('#1e293b', 4, 13, 8, 6);
        r('#06b6d4', 6, 13, 4, 1); // Cuello cian
        p('#10b981', 5, 15); // Medidor de frecuencia verde

        r(INK, 3, 2, 10, 10);
        r('#9a3412', 4, 2, 8, 3); // Corte bob cobrizo
        r('#9a3412', 3, 4, 2, 5); r('#9a3412', 11, 4, 2, 5);
        r('#fed7aa', 5, 4, 6, 7); r('#c27b4f', 10, 5, 1, 6);
        // Diadema con micrófono de operadora
        r('#64748b', 4, 2, 8, 1);
        r('#94a3b8', 4, 5, 1, 4); p('#94a3b8', 5, 9); p('#38bdf8', 6, 9);
        // Ojos atentos
        p('#ffffff', 5, 6); p('#3b271d', 6, 6);
        p('#ffffff', 10, 6); p('#3b271d', 9, 6);
        r('#824535', 7, 10, 2, 1);
        return true;
    }

    if (key === 'NAKASTHU') {
        // --- NAKASTHU: Núcleo de inteligencia y monolito viviente ---
        // Chasis monolítico de obsidiana con líneas de circuito y ojo central
        r('#050508', 2, 12, 12, 8);
        r('#18181b', 3, 13, 10, 7);
        // Trazas de bus de datos verdes y cian
        r('#059669', 5, 13, 1, 7); r('#0891b2', 10, 13, 1, 7);
        r('#10b981', 7, 15, 2, 4);

        // Cabeza monolítica
        r('#09090b', 4, 1, 8, 11);
        r('#1c1917', 5, 2, 6, 9);
        // Matriz de circuitos
        p('#34d399', 5, 3); p('#34d399', 10, 3);
        p('#06b6d4', 5, 9); p('#06b6d4', 10, 9);
        // Ojo óptico central ciclópeo
        r('#047857', 6, 5, 4, 3);
        r('#34d399', 7, 5, 2, 3);
        p('#ffffff', 7, 6); // Punto de brillo de sensor cuántico
        r('#ef4444', 3, 7, 10, 1); // Haz láser de escaneo rojo
        return true;
    }

    return false;
};

/** Renderizado procedimental avanzado según Especie y Rol */
const drawProcedural = (ctx, seed, morph, hooded, corrupt, role, species, r, p) => {
    let s = hash(String(seed));
    const nextRandom = () => {
        s = Math.imul(s ^ (s >>> 13), 2654435761) >>> 0;
        return (s & 0xffff) / 0xffff;
    };
    const pick = (arr) => arr[Math.floor(nextRandom() * arr.length)];

    const roleClean = String(role || '').toLowerCase();
    const isTech = roleClean.includes('técnic') || roleClean.includes('tecnic') || roleClean.includes('ingenier') || roleClean.includes('operad');
    const isDevout = roleClean.includes('devot') || roleClean.includes('sectari') || roleClean.includes('creyente') || hooded;
    const isLeader = roleClean.includes('líder') || roleClean.includes('lider') || roleClean.includes('comand') || roleClean.includes('oficial');
    const isClone = morph === 'clon' || String(species).toUpperCase() === 'CLON';
    const isAlien = ALIENS.includes(morph) || String(species).toUpperCase() === 'HÍBRIDO';

    // 1. VESTIMENTA / TORSO SEGÚN ROL
    r(INK, 3, 12, 10, 1); r(INK, 2, 13, 12, 7);

    if (isTech) {
        // Uniforme técnico: Gris grafito con franja de alta visibilidad (amarillo o cian)
        const stripeColor = pick(['#eab308', '#06b6d4', '#f97316']);
        r('#27272a', 3, 13, 10, 7);
        r(stripeColor, 6, 12, 4, 2); // Cuello llamativo
        r(stripeColor, 4, 15, 8, 1); // Franja horizontal en pecho
        r('#18181b', 4, 13, 1, 7);   // Correa de herramientas
        p('#e4e4e7', 5, 17);        // Hebilla de arnés
        p(stripeColor, 9, 14);       // Insignia de técnico
    } else if (isDevout) {
        // Túnica ceremonial: Púrpura, carmesí o índigo con bordado litúrgico
        const robeColor = pick(['#3b0764', '#4c1d95', '#7f1d1d', '#1e1b4b']);
        const trimColor = pick(['#f59e0b', '#c084fc', '#cbd5e1']);
        r(robeColor, 3, 13, 10, 7);
        r(trimColor, 7, 13, 2, 2);  // Bordado de cuello
        r(trimColor, 6, 15, 4, 1);  // Emblema sagrado
        r('#a855f7', 7, 17, 2, 2);  // Relicario de piedra
    } else if (isLeader) {
        // Abrigo de mando de la Orden: Negro militar con hombreras doradas
        r('#09090b', 3, 13, 10, 7);
        r('#f59e0b', 2, 13, 3, 1); r('#f59e0b', 11, 13, 3, 1); // Charreteras
        p('#f59e0b', 6, 15); p('#f59e0b', 9, 15);
        p('#f59e0b', 6, 17); p('#f59e0b', 9, 17);
        r('#3f3f46', 6, 12, 4, 2);
    } else if (isClone) {
        // Mono de clon estándar con número de serie
        r('#334155', 3, 13, 10, 7);
        r('#64748b', 6, 12, 4, 2);
        p('#38bdf8', 5, 16); p('#38bdf8', 7, 16); // Marcador de lote
    } else {
        // Ropa civil de obrero: Abrigo utilitario con bufanda
        const coatColor = pick(['#36453b', '#443a2b', '#1e293b', '#334155']);
        const scarfColor = pick(['#78350f', '#52525b', '#0d9488', '#b91c1c']);
        r(coatColor, 3, 13, 10, 7);
        r(scarfColor, 5, 12, 6, 3); // Bufanda envolvente
        r(scarfColor, 7, 15, 2, 4); // Caída de la bufanda
    }

    // 2. CABEZA Y RASGOS FACIALES
    if (isAlien) {
        // --- HÍBRIDOS / ESPECIES ALIENÍGENAS ---
        if (morph === 'quitinoso') {
            // Insectoide acorazado con 4 ojos rojos y mandíbulas
            const carapace = pick(['#14532d', '#1c1917', '#365314']);
            r(INK, 4, 2, 8, 9); r(INK, 5, 1, 6, 1);
            r(carapace, 5, 2, 6, 8);
            r('#16a34a', 5, 1, 6, 1); // Cresta superior verde
            r('#16a34a', 4, 3, 1, 2); r('#16a34a', 11, 3, 1, 2);
            // 4 ojos compuestos rojos
            p('#ef4444', 5, 5); p('#ef4444', 6, 6);
            p('#ef4444', 10, 5); p('#ef4444', 9, 6);
            // Placas de mandíbula
            r(INK, 6, 9, 4, 1);
            p('#15803d', 5, 9); p('#15803d', 10, 9);
        } else if (morph === 'cristalino') {
            // Silicato translúcido con cristales en la sien y ojos cian
            r(INK, 4, 2, 8, 9); r(INK, 5, 1, 6, 1);
            r('#0284c7', 5, 2, 6, 8); // Piel azul cristalina
            r('#38bdf8', 6, 3, 4, 3);
            p('#ffffff', 10, 2); p('#38bdf8', 11, 1); // Cristal saliente
            // Ojos de hendidura cian brillante
            r('#a5f3fc', 5, 6, 2, 1); r('#a5f3fc', 9, 6, 2, 1);
            r('#0369a1', 7, 9, 2, 1);
        } else if (morph === 'nakari') {
            // Piel abisal con cuernos psiónicos y ojos dorados
            r(INK, 4, 2, 8, 9); r(INK, 5, 1, 6, 1);
            r('#3b0764', 5, 2, 6, 8);
            // Cuernos psiónicos
            r('#c084fc', 3, 1, 2, 2); r('#c084fc', 11, 1, 2, 2);
            // Ojos dorados radiantes
            p('#facc15', 6, 6); p('#facc15', 9, 6);
            // Marcas rituales doradas
            p('#eab308', 6, 8); p('#eab308', 9, 8);
            r('#581c87', 7, 9, 2, 1);
        } else {
            // Zhyriano: piel gris lavanda, ojos almendrados negros con doble brillo
            r(INK, 4, 2, 8, 9); r(INK, 5, 1, 6, 1);
            r('#94a3b8', 5, 2, 6, 8);
            r('#64748b', 10, 3, 1, 7); // Sombra lateral
            // Grandes ojos alienígenas negros
            r(INK, 5, 5, 2, 3); r(INK, 9, 5, 2, 3);
            p('#ffffff', 5, 5); p('#ffffff', 9, 5); // Reflejos estelares
            p('#cbd5e1', 6, 6); p('#cbd5e1', 10, 6);
            r('#475569', 7, 10, 2, 1); // Orificio nasal/bucal
        }
    } else if (isClone) {
        // --- CLONES ---
        // Cabeza rapada, piel sintética desaturada, código de barras y puerto neural
        r(INK, 4, 2, 8, 9); r(INK, 5, 1, 6, 1);
        r('#d9d6ce', 5, 2, 6, 8); r('#a8a29e', 10, 3, 1, 7);
        // Sombra de corte al cero
        r('#78716c', 5, 2, 6, 1);
        // Código de barras en la sien
        p(INK, 5, 4); p(INK, 7, 4); p(INK, 8, 4);
        // Puerto neural cian en el cuello/oreja
        p('#06b6d4', 4, 7); p('#22d3ee', 4, 8);
        // Ojos idénticos
        p('#ffffff', 5, 6); p('#292524', 6, 6);
        p('#ffffff', 10, 6); p('#292524', 9, 6);
        r('#78716c', 7, 9, 2, 1);
    } else {
        // --- HUMANOS NATURALES ---
        const [skin, shade] = pick(HUMAN_SKINS);
        const hair = pick(HAIR_COLORS);
        const hairStyle = Math.floor(nextRandom() * 5); // 0 a 4

        // Silueta base de cabeza con orejas
        r(INK, 4, 2, 8, 10); r(INK, 5, 1, 6, 1);
        p(skin, 4, 7); p(skin, 11, 7); // Orejas
        r(skin, 5, 3, 6, 8); r(shade, 10, 4, 1, 7);

        // Cabello variado
        if (hairStyle === 0) {
            // Corto militar
            r(hair.base, 5, 2, 6, 2); r(hair.light, 6, 2, 4, 1);
        } else if (hairStyle === 1) {
            // Con flequillo caído hacia un lado
            r(hair.base, 5, 2, 6, 2); r(hair.base, 4, 3, 2, 3);
            r(hair.light, 6, 2, 3, 1);
        } else if (hairStyle === 2) {
            // Peinado hacia atrás / ejecutivo
            r(hair.base, 4, 2, 8, 2); r(hair.light, 5, 1, 6, 1);
            p(hair.base, 4, 4); p(hair.base, 11, 4);
        } else if (hairStyle === 3) {
            // Melena media con volumen a los lados
            r(hair.base, 4, 2, 8, 2);
            r(hair.base, 3, 3, 2, 5); r(hair.base, 11, 3, 2, 5);
        } else {
            // Rapado con sombra de barba
            r(hair.base, 5, 2, 6, 1);
            r(shade, 5, 9, 6, 2); // Barba de 3 días
        }

        // Cejas
        r(hair.base, 5, 5, 2, 1); r(hair.base, 9, 5, 2, 1);
        // Ojos humanos expresivos
        const eyeColor = pick(['#3b271d', '#1e3a8a', '#14532d', '#78350f', '#0f172a']);
        p('#ffffff', 5, 6); p(eyeColor, 6, 6);
        p('#ffffff', 10, 6); p(eyeColor, 9, 6);

        // ACCESORIOS SEGÚN ROL HUMANO
        if (isTech) {
            // Técnico: 50% gafas en frente / 50% monóculo biónico
            if (nextRandom() > 0.5) {
                r('#d97706', 5, 3, 2, 2); r('#d97706', 9, 3, 2, 2);
                p('#fef08a', 5, 3); p('#fef08a', 9, 3);
            } else {
                r('#06b6d4', 5, 6, 2, 1); p('#a5f3fc', 6, 6); // Ojo biónico cian
            }
        } else if (isDevout) {
            // Devoto: Pintura ritual bajo los ojos
            p('#a855f7', 6, 7); p('#a855f7', 9, 7);
        } else {
            // Ciudadano: Ojeras o detalle de fatiga
            p('#713f12', 6, 7); p('#713f12', 9, 7);
        }

        // Boca
        r(shade, 7, 9, 2, 1);
    }

    // 3. CAPUCHA LITÚRGICA SECTARIA (SI storyPath == 1 o isDevout forzado)
    if (hooded) {
        r(INK, 3, 1, 10, 2);
        r('#3b0764', 4, 1, 8, 2);
        r('#3b0764', 3, 3, 2, 9); r('#3b0764', 11, 3, 2, 9);
        r('#f59e0b', 5, 2, 6, 1);
    }

    // 4. ANOMALÍA / CORRUPCIÓN EIDOLON
    if (corrupt) {
        // Fisura de vacío: píxeles desgarrados cromáticamente
        r('#d946ef', 6, 6, 1, 2); // Magenta
        r('#06b6d4', 9, 6, 1, 2); // Cian
        p('#ffffff', 6, 6); p('#ffffff', 9, 6);
        r(INK, 4, 4, 2, 2); // Parche de vacío en la frente
        p('#38bdf8', 4, 4); // Chispa cuántica
        p('#ef4444', 7, 10); p('#ef4444', 8, 11); // Sangrado digital
    }
};

const draw = (ctx, seed, morph, hooded, corrupt, role, species, loreKey) => {
    ctx.clearRect(0, 0, W, H);
    const r = (c, x, y, w = 1, h = 1) => {
        if (!c) return;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, w, h);
    };
    const p = (c, x, y) => {
        if (!c) return;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
    };

    // 1. Si es personaje del lore, dibujar su sprite canónico
    const loreMatch = findLoreCharacter(loreKey || seed);
    if (loreMatch) {
        const drawn = drawLoreCharacter(ctx, loreMatch.loreKey || loreMatch.name, r, p);
        if (drawn) return;
    }

    // 2. Si no es lore, dibujar el sistema procedimental refinado
    drawProcedural(ctx, seed, morph, hooded, corrupt, role, species, r, p);
};

export const PixelPortrait = memo(({ 
    seed, 
    subject,
    role = '', 
    species = '', 
    morph = 'humano', 
    hooded = false, 
    corrupt = false, 
    className = '' 
}) => {
    const ref = useRef(null);

    // Extraer datos canónicos si viene el objeto subject
    const effectiveSeed = seed || subject?.id || 'ZHYR-00';
    const effectiveRole = role || subject?.type || '';
    const effectiveSpecies = species || subject?.species || '';
    const effectiveMorph = morph || morphFor(effectiveSpecies, effectiveSeed, effectiveRole);
    const effectiveCorrupt = corrupt || subject?.isCorrupt || false;
    const effectiveLoreKey = subject?.loreCore?.loreKey || effectiveSeed;

    useEffect(() => {
        const ctx = ref.current?.getContext('2d');
        if (ctx) {
            draw(ctx, effectiveSeed, effectiveMorph, hooded, effectiveCorrupt, effectiveRole, effectiveSpecies, effectiveLoreKey);
        }
    }, [effectiveSeed, effectiveMorph, hooded, effectiveCorrupt, effectiveRole, effectiveSpecies, effectiveLoreKey]);

    return html`<canvas ref=${ref} width=${W} height=${H} className=${`pixel-art ${className}`} style=${{ aspectRatio: `${W} / ${H}` }}></canvas>`;
});

PixelPortrait.displayName = 'PixelPortrait';
