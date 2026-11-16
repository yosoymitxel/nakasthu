import fs from 'node:fs';

const FILES = [
  'src/data/dialogues/general/interrogations.json',
  'src/data/dialogues/general/common.json',
  'src/data/dialogues/phase1/exploration.json',
  'src/data/dialogues/phase2/crisis.json',
  'src/data/dialogues/phase3/sect.json',
  'src/data/dialogues/phase4/ascension.json',
];

const manifest = JSON.parse(fs.readFileSync('src/data/dialogues/manifest.json', 'utf8'));
const active = new Set(manifest.files.map((f) => `src/data/dialogues/${f}`));

const rows = [];
for (const f of FILES) {
  const { dialogues } = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const d of dialogues) {
    if (d.options.length < 2) continue;
    rows.push({
      file: f.split('/').pop(),
      id: d.id,
      exclusive: !!d.exclusive,
      loaded: active.has(f),
      opts: d.options.map((o) => (o.next ? '[cadena] ' : '') + o.text),
      hasNext: d.options.some((o) => o.next),
    });
  }
}
for (const r of rows) {
  const tags = [r.exclusive ? 'EXCLUSIVA' : 'hub', r.loaded ? 'activo' : 'HUÉRFANO'].join(' · ');
  console.log(`\n${r.file}  ${r.id}  (${tags})`);
  r.opts.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
}
console.log(`\nTotal con 2+ opciones raíz: ${rows.length}`);
console.log(`Exclusivas: ${rows.filter((r) => r.exclusive).length} · Hubs: ${rows.filter((r) => !r.exclusive).length}`);
console.log(`Exclusivas activas: ${rows.filter((r) => r.exclusive && r.loaded).length}`);
console.log(`Exclusivas huérfanas: ${rows.filter((r) => r.exclusive && !r.loaded).map((r) => r.id).join(', ')}`);
