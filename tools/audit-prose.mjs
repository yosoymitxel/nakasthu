/**
 * Audit de prosa del corpus NAKASTHU.
 * Extrae todo string "de prosa" de los JSON de diálogo y cuenta tics de escritura IA.
 * Solo lectura: no modifica nada.
 */
import fs from 'node:fs';
import path from 'node:path';

const FILES = [
  'src/data/dialogues/general/interrogations.json',
  'src/data/dialogues/general/common.json',
  'src/data/dialogues/phase1/exploration.json',
  'src/data/dialogues/phase2/crisis.json',
  'src/data/dialogues/phase3/sect.json',
  'src/data/dialogues/phase4/ascension.json',
  'src/data/lore_database.json',
  'src/data/stepsConfig.js',
  'src/data/dialoguePools.js',
];

const PROSE_KEYS = new Set(['text', 'consequence', 'briefingText', 'name', 'desc']);

function collectStrings(node, out, key = null) {
  if (typeof node === 'string') {
    if (key && PROSE_KEYS.has(key)) out.push({ key, text: node });
    return;
  }
  if (Array.isArray(node)) return node.forEach((v) => collectStrings(v, out, key));
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) collectStrings(v, out, k);
  }
}

const strings = [];
for (const f of FILES) {
  const raw = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.json')) {
    collectStrings(JSON.parse(raw), strings);
  } else {
    // Los .js se leen como texto plano: basta para contar dentro de literales
    for (const m of raw.matchAll(/'([^'\\]{25,})'/g)) {
      strings.push({ key: path.basename(f), text: m[1] });
    }
  }
}

const all = strings.map((s) => s.text).join('\n');
const count = (re) => (all.match(re) || []).length;
const perK = (re) => +((count(re) / (all.split(/\s+/).length / 1000)).toFixed(2));
const words = all.split(/\s+/).filter(Boolean).length;

const rows = [
  ['Palabras de prosa', words],
  ['Cadenas', strings.length],
  ['Em dash / en dash (— – --)', count(/[—–]|--/g)],
  ['"no es X, es Y" y variantes', count(/\bno (es|era|son|eran|fue|fueron|hay|quiere|destruye)\b[^.!?]{0,60}[,.]\s*(es|era|son|eran|fue|fueron|hay)\b/gi)],
  ['"no X, sino Y"', count(/\bno\b[^.!?]{0,60}\bsino\b/gi)],
  ['"No solo ... sino"', count(/no solo[^.!?]{0,80}sino/gi)],
  ['Vocativo "operador"', count(/\boperador\b/gi)],
  ['"absolut*"', count(/\babsolut/gi)],
  ['"perfect*"', count(/\bperfect/gi)],
  ['"infinit*"', count(/\binfinit/gi)],
  ['"etern*"', count(/\betern/gi)],
  ['"puro/pura/pureza"', count(/\bpuru|\bpureza|\bpuros|\bputo/gi)],
  ['"vacío"', count(/\bvac[ií]o/gi)],
  ['"zumbido"', count(/\bzumbido/gi)],
  ['"frecuencia"', count(/\bfrecuencia/gi)],
  ['"silencio"', count(/\bsilencio/gi)],
  ['"arena abrasiva"', count(/arena abrasiva/gi)],
  ['"como si"', count(/como si/gi)],
  ['Elipsis "..."', count(/\.\.\./g)],
  ['"algo" + elipsis', count(/\balgo[^.!?]{0,25}\.\.\./gi)],
  ['Triada "ni ... ni ..."', count(/\bni\b[^.!?]{0,40}\bni\b/gi)],
  ['Triada "sin ... sin ..."', count(/\bsin\b[^.!?]{0,30}\bsin\b/gi)],
  ['"sujeto" como sujeto', count(/\bEl sujeto\b/g)],
  ['"El Bastión"', count(/El Bastión/g)],
  ['Cierres aforísticos ("La X es Y.")', count(/\.\s*(La|El|Los|Las)\s+[a-záéíóúñ]+(\s+[a-záéíóúñ]+){0,3}\s+(es|son|está|están|se)\b/g)],
];

const w = Math.max(...rows.map(([k]) => String(k).length));
for (const [k, v] of rows) console.log(`${String(k).padEnd(w)}  ${v}`);

console.log('\n--- Repeticiones de lexema (top) ---');
const stop = new Set(('de la el en y a los las que un una del al se con por para es su sus lo como más o pero le ya sin sobre entre cuando muy sin ni te tu mi nos os esa ese esto esta este son fue ser está están hay porque qué quien cual todo toda todos todas también solo sólo ahora así donde desde hasta tras otra otro').split(/\s+/));
const freq = new Map();
for (const raw of all.toLowerCase().match(/[a-záéíóúñü]{4,}/g) || []) {
  if (stop.has(raw)) continue;
  freq.set(raw, (freq.get(raw) || 0) + 1);
}
console.log([...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${k}:${v}`).join('  '));
