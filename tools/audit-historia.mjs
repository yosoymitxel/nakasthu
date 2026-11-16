import fs from 'node:fs';
const t = fs.readFileSync('docs/HistoriaCompleta.md', 'utf8');
const words = t.split(/\s+/).filter(Boolean).length;
const c = (r) => (t.match(r) || []).length;
const rows = [
  ['Palabras', words],
  ['Rayas de diálogo (—)', c(/—/g)],
  ['"Sin embargo"', c(/Sin embargo/gi)],
  ['"no ... sino"', c(/\bno (era|es|son|eran|fue|fueron)\b[^.!?]{0,70}\bsino\b/gi)],
  ['"algo más que"', c(/algo m[aá]s que/gi)],
  ['"como si"', c(/como si/gi)],
  ['"parecía"', c(/parec[ií]a/gi)],
  ['"comenzó a"', c(/comenz[oó] a/gi)],
  ['"de algún modo"', c(/de alg[uú]n modo/gi)],
  ['"sin embargo" total', c(/sin embargo/gi)],
  ['"durante"', c(/\bdurante\b/gi)],
  ['triadas "ni..ni"', c(/\bni\b[^.!?]{0,45}\bni\b/gi)],
  ['Párrafos', t.split(/\n\s*\n/).length],
];
const pad = Math.max(...rows.map((r) => r[0].length));
for (const [k, v] of rows) console.log(String(k).padEnd(pad), v);
