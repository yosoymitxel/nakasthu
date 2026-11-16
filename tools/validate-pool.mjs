/**
 * Valida el pool completo cargado por el manifiesto:
 * ids únicos, lore existente, costes en escala y estructura mínima.
 * Uso: node tools/validate-pool.mjs
 */
import fs from 'node:fs';

const BASE = 'src/data/dialogues';
const manifest = JSON.parse(fs.readFileSync(`${BASE}/manifest.json`, 'utf8'));
const lore = JSON.parse(fs.readFileSync('src/data/lore_database.json', 'utf8')).entries;

const dialogues = [];
const errors = [];
const ids = new Set();

for (const file of manifest.files) {
  const data = JSON.parse(fs.readFileSync(`${BASE}/${file}`, 'utf8'));
  if (!Array.isArray(data.dialogues)) {
    errors.push(`${file}: falta el array dialogues`);
    continue;
  }
  for (const d of data.dialogues) {
    if (!d.id) errors.push(`${file}: diálogo sin id`);
    if (ids.has(d.id)) errors.push(`id duplicado: ${d.id}`);
    ids.add(d.id);
    if (!d.text) errors.push(`${d.id}: sin texto`);
    if (!Array.isArray(d.options) || d.options.length === 0) errors.push(`${d.id}: sin opciones`);
    const walk = (options, path) => {
      for (const [i, o] of options.entries()) {
        if (!o.text) errors.push(`${d.id}.${path}${i}: opción sin texto`);
        if (typeof o.energyCost !== 'number') errors.push(`${d.id}.${path}${i}: energyCost inválido`);
        else if (o.energyCost < 0 || o.energyCost > 2) errors.push(`${d.id}.${path}${i}: energyCost ${o.energyCost} fuera de escala`);
        if (o.loreUnlock && !(o.loreUnlock in lore)) errors.push(`${d.id}.${path}${i}: lore inexistente ${o.loreUnlock}`);
        if (o.next) walk(o.next, `${path}${i}.next.`);
      }
    };
    walk(d.options, 'options.');
    dialogues.push({ ...d, _file: file });
  }
}

const costs = dialogues.flatMap((d) => d.options.map((o) => o.energyCost)).sort((a, b) => a - b);
const exclusives = dialogues.filter((d) => d.exclusive);
const multi = dialogues.filter((d) => d.options.length > 1);

console.log(`Archivos: ${manifest.files.length}`);
console.log(`Diálogos: ${dialogues.length}`);
console.log(`Opciones raíz: ${costs.length} | energía ${costs[0]}..${costs[costs.length - 1]} | mediana ${costs[Math.floor(costs.length / 2)]}`);
console.log(`Con 2+ opciones: ${multi.length} | exclusivas: ${exclusives.length}`);
console.log(`Lore: ${Object.keys(lore).filter((k) => !k.startsWith('---')).length} entradas`);
if (errors.length) {
  console.error(`\nErrores (${errors.length}):`);
  errors.forEach((e) => console.error(`  ${e}`));
  process.exit(1);
}
console.log('\nOK: pool válido.');
