import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Cada entrada del archivo tiene que poder conseguirse: hoy la única vía es loreUnlock en un diálogo.
const root = process.cwd();
const dir = join(root, 'src', 'data', 'dialogues');
const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
const unlocks = new Set();
const walk = (opts) => (opts || []).forEach(o => { if (o.loreUnlock) unlocks.add(o.loreUnlock); walk(o.next); });
manifest.files.forEach(f => JSON.parse(readFileSync(join(dir, f), 'utf8')).dialogues.forEach(d => walk(d.options)));

const ids = Object.keys(JSON.parse(readFileSync(join(root, 'src', 'data', 'lore_database.json'), 'utf8')).entries)
    .filter(k => k.startsWith('LORE_'));

describe('Archivo de lore alcanzable', () => {
    it('toda entrada se desbloquea en algún diálogo', () => {
        expect(ids.filter(id => !unlocks.has(id))).toEqual([]);
    });

    it('todo loreUnlock existe en la base', () => {
        expect([...unlocks].filter(id => !id.startsWith('CMD_') && !ids.includes(id))).toEqual([]);
    });

    it('LoreScreen y LoreArchive ordenan exactamente las entradas de la base', () => {
        for (const file of ['src/ui/screens/lore/LoreScreen.js', 'src/ui/components/LoreArchive.js']) {
            const listed = readFileSync(join(root, file), 'utf8').match(/"LORE_[A-Z0-9_]+"/g).map(s => s.slice(1, -1));
            expect(new Set(listed)).toEqual(new Set(ids));
        }
    });
});
