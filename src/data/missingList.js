/**
 * MISSINGLIST.JS
 * LA LISTA del pasillo central: quién busca a quién (cap. 13, «cuatro metros, siete capas de papel»).
 * Cada paso jugable pega una capa con nombres del libro; los que el operador procesa entran con nombre.
 *
 * Entrada de libro: `name` (a quién buscan), `who` (quién busca), `note` opcional.
 * `strike`: se tacha al llegar a `at` (paso o final 'caos' / 'orden'), salvo si `unless` coincide.
 * `later`: a partir del paso `at` la línea cambia de nota y queda apagada (quien buscaba ya no viene).
 * `kamin`: lo que ha crecido la Orden cuando se pega la capa (C.3).
 */

export const LIST_LAYERS = {
    4: {
        where: 'Capa 1 · Puertas de Kanatsia',
        kamin: null,
        entries: [
            { id: 'OKONJO', name: 'El marido de Nera Okonjo', who: 'Lo busca Nera Okonjo. Bloque veintitrés, sector cuatro.', note: 'Las zapatillas seguían colocadas junto a la cama.', strike: { at: 'caos', unless: { nera: 'entregada' }, note: 'Nera cruzó a buscarlo con una vecina, de dos en dos.' } },
            { id: 'VOSS_31', name: 'Elara Voss, 31', who: 'La busca su padre. Llamó todos los domingos durante siete meses.', note: 'Operadora de conformado, Dispay. Dejó de presentarse. Nadie preguntó.' }
        ]
    },
    6: {
        where: 'Capa 2 · Plaza de Dispay, por detrás de la pancarta',
        kamin: 'La Orden: siete. Kamin escucha a los mineros de Prisiat y no interrumpe.',
        entries: [
            { id: 'TESSA', name: 'Tessa Ferrer, 19', who: 'La busca Ovid, su hermano.', note: 'Lo último que él le dijo fue «haz lo que quieras».', strike: { at: 'caos', unless: { ovid: 'entregado' }, note: 'Ovid cruzó el cuarto día, a las once y veinte, a buscarla.' } },
            { id: 'PETRO', name: 'Petro Ilm, 20', who: 'Lo busca su madre.', note: 'Zhyr. Le devolvieron su piedra del río en una bolsa precintada. Indemnización aceptada por defecto.' }
        ]
    },
    8: {
        where: 'Capa 3 · Pasillo central del Bastión',
        kamin: 'La Orden: mil doscientos. Cuentas limpias, cantos los sábados.',
        entries: [
            { id: 'TOREN', name: 'La mujer de Toren y sus dos hijos', who: 'Los busca Toren. La misma noche, la misma casa. Él estaba de guardia.', later: { at: 10, note: 'Toren ya no viene a mirar.' } },
            { id: 'COMA', name: 'Coma, perra vieja', who: 'La busca Rian Telles, dos días por todo el recinto.', note: 'Debajo de la mesa del laboratorio sigue el cuenco lleno.', later: { at: 10, note: 'Rian ya no la nombra.' } },
            { id: 'VOSS_10', name: 'Elara Voss, 10', who: 'La busca su padre, guardia de cuarentena.', note: 'Se lo pidió a Kael al dejarle salir: «Si lo encuentras, dile que mi hija se llamaba Elara».' }
        ]
    },
    10: {
        where: 'Capa 4 · Cuatro metros, siete capas de papel',
        kamin: 'La Orden: treinta y una mil. «Lo dijo hace ocho meses y os reíais.»',
        entries: [
            { id: 'DUQ', name: 'La mujer de Serafín Duq', who: 'La espera Serafín, sentado en una caja de herramientas.', note: 'Tiene la chaqueta de ella doblada en el regazo, por si sale con frío.' },
            { id: 'MAREK', name: 'Marek, 9', who: 'Lo busca un matrimonio de Itzinol.', note: 'Eidolon: estabilizador familiar, lote 118.' },
            { id: 'ALEXIA', name: 'Alexia', who: 'Abajo del todo, casi a ras de suelo. Letra de Kael.', note: 'Nadie la había buscado nunca: nadie sabía que había desaparecido.' }
        ]
    }
};

// Lo que pasa con quien el operador procesa, por paso y decisión. Sin entrada: no va a la lista.
export const LIST_FATES = {
    4: { sacrifice: { note: 'A Prisiat. Retorno previsto: —' } },
    6: { sacrifice: { note: 'A Prisiat. Retorno previsto: —' } },
    8: { sacrifice: { note: 'Bajó al hangar. No subió.' } },
    10: { sacrifice: { note: 'Bajó al hangar. No subió.' }, authorize: { note: 'Cruzó.', struck: true } }
};

// Una línea por turno en el parte de cierre; {n} = procesados de este turno que entraron en la lista.
export const LIST_TURN_LINES = {
    4: 'Esta consola: {n} a Prisiat. Retorno previsto: —.',
    6: 'Esta consola: {n} a Prisiat. Retorno previsto: —.',
    8: 'Bajaron al hangar desde tu mesa: {n}.',
    10: 'Cruzaron desde tu mesa: {n}.'
};

// Gente que el operador procesa: nombre, edad y de dónde viene (sin género: las notas no concuerdan).
export const LIST_NAMES = {
    first: ['Ilse', 'Bruno', 'Amaia', 'Teo', 'Yara', 'Odile', 'Ismael', 'Lina', 'Jonás', 'Sabra', 'Héctor', 'Noor', 'Adela', 'Kiro', 'Wen', 'Iria', 'Dámaso', 'Luz', 'Anselm', 'Pía', 'Eneko', 'Rut', 'Casimir', 'Zaida', 'Olmo', 'Vera', 'Gael', 'Tamsin', 'Ulises', 'Mirta'],
    last: ['Moreau', 'Vance', 'Okafor', 'Sarre', 'Benet', 'Kowal', 'Duarte', 'Halvorsen', 'Ferro', 'Lindqvist', 'Abara', 'Quiles', 'Mendel', 'Arrieta', 'Soma', 'Tarn', 'Vidal', 'Kessler', 'Ndiaye', 'Roca', 'Hale', 'Ibarra', 'Lusk', 'Ostrova'],
    from: ['Kanatsia', 'Dispay', 'Itzinol', 'Prisiat', 'Xionis', 'Talok'],
    age: [18, 71]
};

// Informe de Serin Voke (cap. 12): lo que el monitor de flujo cuenta en el paso 10.
export const CROSSING = { cross: 412, arrive: 9000 };
