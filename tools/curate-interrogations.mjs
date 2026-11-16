/**
 * Cura el pool huérfano de interrogatorios:
 * - descarta 12 diálogos que repiten material del pool modular
 * - normaliza costes de energía a la escala activa (÷20)
 * - remapea lore inexistente y conserva 6 ids nuevos
 * - corrige la máquina "Eidolon" (el lore la define como humano corrupto)
 * Uso: node tools/curate-interrogations.mjs
 */
import fs from 'node:fs';

const FILE = 'src/data/dialogues/general/interrogations.json';

const DROP = new Set([
  'DLG_S1_05', 'DLG_S1_06', 'DLG_S1_08',
  'DLG_S4_06', 'DLG_S4_07', 'DLG_S4_09',
  'DLG_S7_07',
  'DLG_GEN_04', 'DLG_GEN_06', 'DLG_GEN_10', 'DLG_GEN_12', 'DLG_GEN_14',
]);

// Los seis ids nuevos se conservan; el resto apunta a una entrada existente.
const LORE_MAP = {
  LORE_ZHYR_EXP: 'LORE_ORDER_SECRETS',
  LORE_MODS: 'LORE_TECH_MODS',
  LORE_SYMBOLS: 'LORE_SYMBOLS_SHAPE',
  LORE_EIDOLON_FAIL: 'LORE_OS_AWAKENING',
  LORE_TALOK_PLAN: 'LORE_TALOK_AMBITION',
  LORE_KAMIN_SPEECH: 'LORE_SACRIFICE_TRUTH',
  LORE_VOID_DREAMS: 'LORE_THE_BEYOND',
  LORE_SECRET_MEETING: 'LORE_AITOR_NETWORK',
  LORE_FINAL_HARVEST: 'LORE_REASSIGN_TRAP',
  LORE_ASCENSION: 'LORE_ASCENSION_COMPLETE',
  LORE_OMNISCIENT_EYE: 'LORE_STALKER_IDENTITY',
  LORE_GROTESQUE_FORMS: 'LORE_ALEXIA_VISION',
};

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const before = data.dialogues.length;
const kept = data.dialogues.filter((d) => !DROP.has(d.id));
const alreadyNormalized = kept.every((d) => d.options.every((o) => o.energyCost <= 2));

for (const d of kept) {
  d.text = d.text.replaceAll('Eidolon', 'NAKASTHU');
  for (const o of d.options) {
    if (!alreadyNormalized) o.energyCost = Math.round((o.energyCost / 20) * 100) / 100;
    if (o.loreUnlock && LORE_MAP[o.loreUnlock]) o.loreUnlock = LORE_MAP[o.loreUnlock];
    if (o.consequence) o.consequence = o.consequence.replaceAll('Eidolon', 'NAKASTHU');
  }
}

data.dialogues = kept;

const loreIds = new Set();
for (const d of kept) for (const o of d.options) if (o.loreUnlock) loreIds.add(o.loreUnlock);

const loreDb = JSON.parse(fs.readFileSync('src/data/lore_database.json', 'utf8')).entries;
const NEW_LORE = new Set(['LORE_NEBOT_VOID', 'LORE_GREAT_SHIFT', 'LORE_MESSENGER', 'LORE_ORVAL_SECRET', 'LORE_SECTOR4_TRUTH', 'LORE_VOID_FRAGMENT']);
const missing = [...loreIds].filter((id) => !(id in loreDb) && !NEW_LORE.has(id));

if (missing.length) {
  console.error('Lore sin destino:', missing.join(', '));
  process.exit(1);
}

fs.writeFileSync(FILE, `${JSON.stringify(data, null, 4)}\n`);

const costs = kept.flatMap((d) => d.options.map((o) => o.energyCost)).sort((a, b) => a - b);
console.log(`Diálogos: ${before} -> ${kept.length}`);
console.log(`Opciones: ${costs.length} | energía ${costs[0]}..${costs[costs.length - 1]} | mediana ${costs[Math.floor(costs.length / 2)]}`);
console.log(`Lore ids usados: ${loreIds.size} | nuevos: ${[...loreIds].filter((id) => NEW_LORE.has(id)).length} | sin destino: ${missing.length}`);
console.log(`"Eidolon" restante: ${(JSON.stringify(data).match(/Eidolon/g) || []).length}`);
