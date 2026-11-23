/**
 * CHECK-REGISTRY.MJS
 * Avisa de lo que quedó a medias en los registros de datos. Una línea si todo va bien;
 * código 1 y la lista si no. Uso: node tools/check-registry.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window ??= globalThis; // algunos módulos de datos exponen depuración en window

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const srcText = (() => {
    const out = [];
    const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(m?js)$/.test(f) && out.push(readFileSync(p, 'utf8')); } };
    walk(join(ROOT, 'src'));
    return out.join('\n');
})();

const problems = [];
const { STEPS_CONFIG } = await import('../src/data/stepsConfig.js');
const { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } = await import('../src/data/achievements.js');

// 1. Pasos: tipo conocido, plano 3D existente, cuota en los jugables.
const shots = new Set([...read('src/ui/components/Backdrop3D.js').matchAll(/^\s{4}(\w+): \{ from:/gm)].map((m) => m[1]));
const ids = Object.keys(STEPS_CONFIG).map(Number).sort((a, b) => a - b);
ids.forEach((id, i) => { if (id !== i + 1) problems.push(`stepsConfig: hueco en la numeración (falta ${i + 1})`); });
for (const [id, c] of Object.entries(STEPS_CONFIG)) {
    if (!['cinematic', 'mechanic', 'gameplay'].includes(c.type)) problems.push(`paso ${id}: tipo desconocido "${c.type}"`);
    if (!c.name) problems.push(`paso ${id}: sin nombre`);
    if (c.shot && !shots.has(c.shot)) problems.push(`paso ${id}: plano 3D "${c.shot}" no existe en Backdrop3D`);
    if (c.type === 'gameplay' && !(c.subjectCount > 0)) problems.push(`paso ${id}: gameplay sin subjectCount`);
    if (c.meta?.requiredTechnicians && c.meta.requiredTechnicians > c.subjectCount) problems.push(`paso ${id}: pide más técnicos que sujetos`);
}

// 2. Logros: grupo válido y alguien los otorga (award('id') o por estadística).
const groups = new Set(ACHIEVEMENT_GROUPS.map((g) => g.id));
for (const a of ACHIEVEMENTS) {
    if (!groups.has(a.group)) problems.push(`logro ${a.id}: grupo "${a.group}" inexistente`);
    const awarded = a.stat || new RegExp(`award\\(['"]${a.id}['"]\\)|['"]${a.id}['"]\\s*:`).test(srcText) || srcText.includes(`'${a.id}'`) && /final_/.test(a.id);
    if (!awarded) problems.push(`logro ${a.id}: nadie lo otorga`);
}

// 3. Tutoriales: cada módulo apunta a un contenido existente.
const tutoText = read('src/systems/TutorialController.js');
for (const m of read('src/systems/ModuleRegistry.js').matchAll(/tutorial: '(\w+)'/g)) {
    if (!new RegExp(`'${m[1]}'\]|\b${m[1]}\s*:`).test(tutoText)) problems.push(`tutorial ${m[1]}: sin contenido en TutorialController`);
}

// 4. Lore: el orden narrativo sólo nombra entradas que existen.
const lore = JSON.parse(read('src/data/lore_database.json')).entries || {};
for (const m of read('src/ui/screens/lore/LoreScreen.js').matchAll(/"(LORE_[A-Z0-9_]+)"/g)) {
    if (!lore[m[1]]) problems.push(`lore ${m[1]}: en NARRATIVE_ORDER pero no en lore_database.json`);
}

// 5. Recurrentes: cada posición apunta a diálogos que existen, marcados `cameo` y válidos en ese paso.
const manifest = JSON.parse(read('src/data/dialogues/manifest.json'));
const dialogues = manifest.files.flatMap((f) => JSON.parse(read(`src/data/dialogues/${f}`)).dialogues);
for (const [id, c] of Object.entries(STEPS_CONFIG)) {
    for (const cameo of c.meta?.cameos || []) {
        if (!(cameo.pos >= 1 && cameo.pos <= c.subjectCount) || cameo.pos === c.meta.kaminPosition) problems.push(`paso ${id}: recurrente en posición ${cameo.pos} imposible u ocupada`);
        for (const did of cameo.dialogues || []) {
            const d = dialogues.find((x) => x.id === did);
            if (!d) problems.push(`paso ${id}: recurrente ${did} no existe`);
            else if (!d.cameo || Number(id) < (d.minStep || 1) || Number(id) > (d.maxStep || 12)) problems.push(`paso ${id}: ${did} sin cameo o fuera de su paso`);
        }
    }
}
const placed = new Set(Object.values(STEPS_CONFIG).flatMap((c) => (c.meta?.cameos || []).flatMap((x) => x.dialogues)));
for (const d of dialogues) if (d.cameo && !placed.has(d.id)) problems.push(`diálogo ${d.id}: cameo sin posición en ningún paso`);

if (problems.length) {
    console.error(`❌ check-registry: ${problems.length} problema(s)\n - ${problems.join('\n - ')}`);
    process.exit(1);
}
console.log(`✅ check-registry: ${ids.length} pasos, ${ACHIEVEMENTS.length} logros, ${Object.keys(lore).length} entradas de lore OK`);
