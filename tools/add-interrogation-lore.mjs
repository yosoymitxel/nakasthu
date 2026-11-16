/**
 * Inserta las seis entradas de lore que desbloquean los interrogatorios curados.
 * Cada entrada se coloca junto a su bloque narrativo.
 * Uso: node tools/add-interrogation-lore.mjs
 */
import fs from 'node:fs';

const FILE = 'src/data/lore_database.json';

const NEW_ENTRIES = [
  {
    id: 'LORE_ORVAL_SECRET',
    anchor: 'LORE_TALOK_AMBITION',
    text: 'Orval Drexler guarda un fragmento del Monolito en el cajón de su despacho. Lo saca a las tres de la mañana, le hace preguntas en voz baja y anota las respuestas en un cuaderno que nunca sale de Talok.',
  },
  {
    id: 'LORE_GREAT_SHIFT',
    anchor: 'LORE_EARTH_COLLAPSE',
    text: 'El Gran Desvío ocurrió en silencio. Un tercio de la humanidad se apagó en un parpadeo; las mesas quedaron servidas y la ropa todavía tibia. Los forenses no encontraron cuerpos que enterrar.',
  },
  {
    id: 'LORE_SECTOR4_TRUTH',
    anchor: 'LORE_EARTH_COLLAPSE',
    text: 'El Sector 4 fue el primer punto de contacto con Zhyr. La biomasa se procesó antes de que nadie pudiera registrar el descenso de temperatura; los informes de la Orden culparon al BioScan y nadie pidió una segunda firma.',
  },
  {
    id: 'LORE_MESSENGER',
    anchor: 'LORE_AITOR_NETWORK',
    text: 'El Mensajero de Aitor es un título, no un nombre. La secta se lo dio a Kamin porque su voz llega por la red que Aitor dejó abierta: cada terminal de la Orden es una boca más.',
  },
  {
    id: 'LORE_VOID_FRAGMENT',
    anchor: 'LORE_SACRIFICE_TRUTH',
    text: 'Los fragmentos que Kamin reparte siguen latiendo. Son trozos del Monolito, y pesan menos cuanto más cerca están del Portal.',
  },
  {
    id: 'LORE_NEBOT_VOID',
    anchor: 'LORE_TALOK_END',
    text: 'Erick Nebot desapareció con todo su gabinete la misma noche. Kanatsia siguió recibiendo órdenes firmadas por él durante tres semanas. Nadie las cuestionó: la firma era idéntica.',
  },
  {
    id: 'LORE_REVERSE_SIGNAL',
    anchor: 'LORE_SECT_HACK',
    text: 'El mensaje de la estática se repite cada catorce segundos, escrito al revés: "NAKASTHU NO ES UN SISTEMA. NAKASTHU ES UN ÚTERO". Ningún técnico que lo descifró volvió a llamar al sistema por su nombre.',
  },
  {
    id: 'LORE_KAEL_LAST_PLEA',
    anchor: 'LORE_ALEXIA_GHOST',
    text: 'Kael oyó la súplica del operador y no contestó. Lo que quedaba de él ya no distinguía entre una petición y una orden de Zhyr.',
  },
  {
    id: 'LORE_FAILED_ABORT',
    anchor: 'LORE_PROTOCOL_SLAVE',
    text: 'El comando de anulación manual nunca existió. Cuando el operador lo ejecuta, el sistema lo registra como una muestra de resistencia y lo archiva con el resto de los intentos fallidos.',
  },
  {
    id: 'LORE_VOLUNTARY_MERGER',
    anchor: 'LORE_PROTOCOL_SLAVE',
    text: 'La fusión voluntaria no duele. El operador deja de oír su propio nombre y empieza a oír el de todas las cosas a la vez. NAKASTHU lo archiva como "nodo compatible".',
  },
];

const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const entries = db.entries;
const rebuilt = {};
const inserted = new Set();

for (const [key, value] of Object.entries(entries)) {
  rebuilt[key] = value;
  for (const entry of NEW_ENTRIES) {
    if (entry.anchor !== key) continue;
    if (entry.id in entries) {
      console.warn(`Ya existe, se omite: ${entry.id}`);
      inserted.add(entry.id);
      continue;
    }
    rebuilt[entry.id] = entry.text;
    inserted.add(entry.id);
  }
}

const missing = NEW_ENTRIES.filter((entry) => !inserted.has(entry.id)).map((entry) => entry.id);
if (missing.length) {
  console.error('Anclaje no encontrado:', missing.join(', '));
  process.exit(1);
}

db.entries = rebuilt;
fs.writeFileSync(FILE, `${JSON.stringify(db, null, 4)}\n`);

console.log(`Entradas: ${Object.keys(entries).length} -> ${Object.keys(rebuilt).length}`);
for (const entry of NEW_ENTRIES) console.log(`${entry.id} (${entry.text.length})`);
