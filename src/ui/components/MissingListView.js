/**
 * MISSINGLISTVIEW.JS
 * LA LISTA (MissingList.js): vista corta en el panel del archivo y la lista entera, capa por capa.
 */
import { html } from '../utils/html.js';
import { LIST_LAYERS } from '../../data/missingList.js';
import { Modal } from './Verdicts.js';

const Row = ({ e }) => html`
    <li className=${`ml-row ${e.struck ? 'struck' : ''} ${e.gone ? 'gone' : ''} ${e.mine ? 'mine' : ''}`}>
        <span className="ml-name">${e.name}</span>
        ${e.tag && html`<span className="ml-tag">${e.tag}</span>`}
        ${e.who && html`<span className="ml-who">${e.who}</span>`}
        ${e.note && html`<span className="ml-note">${e.note}</span>`}
        ${e.struck && e.strikeNote && html`<span className="ml-strike">${e.strikeNote}</span>`}
    </li>
`;

/** Lo último que se ha escrito: arriba lo más reciente. */
export const MissingListPreview = ({ list, onOpen }) => html`
    <div className="flex flex-col h-full min-h-0">
        <ul className="ml-list flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            ${list.slice(-8).reverse().map(e => html`<${Row} key=${e.id} e=${e} />`)}
        </ul>
        <button className="ml-open" onClick=${onOpen}>Leer la lista entera</button>
    </div>
`;

export const MissingListModal = ({ list, onClose }) => html`
    <${Modal} label="La lista · quién busca a quién" onClose=${onClose}>
        ${Object.entries(LIST_LAYERS).map(([step, layer]) => {
            const rows = list.filter(e => e.step === Number(step));
            if (!rows.length) return null;
            const book = rows.filter(e => !e.mine), mine = rows.filter(e => e.mine);
            return html`
                <section key=${step} className="ml-layer">
                    <h3 className="ml-where">${layer.where}</h3>
                    ${layer.kamin && html`<p className="ml-kamin">${layer.kamin}</p>`}
                    <ul className="ml-list">${book.map(e => html`<${Row} key=${e.id} e=${e} />`)}</ul>
                    ${mine.length > 0 && html`
                        <h4 className="ml-sub">De tu consola · ${mine.length}</h4>
                        <ul className="ml-list">${mine.map(e => html`<${Row} key=${e.id} e=${e} />`)}</ul>
                    `}
                </section>
            `;
        })}
    <//>
`;
