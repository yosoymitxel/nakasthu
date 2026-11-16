/**
 * Verifica la regla `exclusive` del DialogueEngine sin navegador.
 * Uso: node tools/test-exclusive.mjs
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// State.js toca localStorage y window al importarse; el motor no.
globalThis.window = {};
globalThis.localStorage = {
  _s: new Map(),
  getItem(k) { return this._s.has(k) ? this._s.get(k) : null; },
  setItem(k, v) { this._s.set(k, String(v)); },
  removeItem(k) { this._s.delete(k); },
};

const imp = (p) => import(pathToFileURL(path.join(process.cwd(), p)).href);
const { dialogueEngine } = await imp('src/systems/DialogueEngine.js');
const { state } = await imp('src/core/State.js');

const opt = (text) => ({ text, energyCost: 1, stabilityImpact: 0, consequence: `eco:${text}` });
const mount = (exclusive, options) => {
  dialogueEngine.currentDialogue = { id: 'TEST', exclusive, text: 'x', options };
  state.activeDialogue = {
    id: 'TEST', exclusive: !!exclusive, text: 'x',
    options: options.map((o) => ({ ...o, used: false })),
  };
  state.energy = 100;
  state.stability = 50;
};

// 1. Decisión exclusiva: la segunda ruta no se puede ejecutar
mount(true, [opt('A'), opt('B')]);
dialogueEngine.selectOption(0);
assert.equal(state.activeDialogue.options.filter((o) => o.used).length, 2, 'ambas rutas deben quedar cerradas');
const energyAfterFirst = state.energy;
dialogueEngine.selectOption(1);
assert.equal(state.energy, energyAfterFirst, 'la ruta descartada no debe consumir energía');

// 2. Hub normal: se pueden recorrer ambas opciones
mount(false, [opt('A'), opt('B')]);
dialogueEngine.selectOption(0);
assert.equal(state.activeDialogue.options.filter((o) => o.used).length, 1, 'el hub solo marca la elegida');
dialogueEngine.selectOption(1);
assert.equal(state.activeDialogue.options.filter((o) => o.used).length, 2, 'el hub permite la segunda');

// 3. Doble clic sobre la misma opción no vuelve a cobrar
mount(false, [opt('A'), opt('B')]);
dialogueEngine.selectOption(0);
const energyAfterClick = state.energy;
dialogueEngine.selectOption(0);
assert.equal(state.energy, energyAfterClick, 'la opción usada no debe repetirse');

// 4. Una rama conserva la exclusividad del nodo
mount(true, [{ ...opt('A'), next: [opt('A1'), opt('A2')] }, opt('B')]);
dialogueEngine.selectOption(0);
assert.equal(state.activeDialogue.exclusive, true, 'la rama hereda la regla');
assert.equal(state.activeDialogue.options.every((o) => !o.used), true, 'la rama arranca limpia');
dialogueEngine.selectOption(0);
assert.equal(state.activeDialogue.options.every((o) => o.used), true, 'la rama también cierra al elegir');

// 5. Los datos reales del manifiesto marcan las decisiones
await new Promise((r) => setTimeout(r, 200));
const riot = dialogueEngine.dialogues.find((d) => d.id === 'DLG_P2_RIOT_CHIEF');
assert.ok(riot, 'DLG_P2_RIOT_CHIEF debe estar en el manifiesto');
assert.equal(riot.exclusive, true, 'la orden de la Zona 4 debe ser exclusiva');
dialogueEngine.currentDialogue = riot;
state.activeDialogue = {
  id: riot.id, exclusive: !!riot.exclusive, text: riot.text,
  options: riot.options.map((o) => ({ ...o, used: false })),
};
state.energy = 100;
dialogueEngine.selectOption(1);
assert.equal(state.activeDialogue.options.every((o) => o.used), true, 'las dos órdenes quedan cerradas');
const energyAfterOrder = state.energy;
dialogueEngine.selectOption(0);
assert.equal(state.energy, energyAfterOrder, 'la orden descartada no cobra energía');

console.log('OK: exclusividad, hubs, doble clic y datos reales verificados.');
