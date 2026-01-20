/**
 * MAINLAYOUT.JS
 * Componente estructural que define la grid de 12x6.
 * Regla 1: Grid inviolable con áreas nombradas.
 */
import { html } from '../utils/html.js';

export const MainLayout = ({ children }) => {
    return html`
        <div className="main-layout-grid">
            ${children}
        </div>
    `;
};

export const ModuleWrapper = ({ area, children }) => {
    return html`
        <div className=${`mod-container mod-${area}`}>
            <div className="w-full h-full">
                ${children}
            </div>
        </div>
    `;
};
