/**
 * TUTORIALPROPOSAL.JS
 * Vista de la propuesta de tutorial que describe TutorialController (sin JSX en el motor).
 */
import { html } from '../utils/html.js';

export const tutorialProposalContent = (modal) => html`
    <div className="space-y-4">
        <p className="text-emerald-400 font-bold text-lg">${modal.moduleName}</p>
        <p className="text-zinc-300">Se ha instalado un nuevo módulo en su terminal.</p>
        <p className="text-zinc-400 text-sm">¿Desea ejecutar el protocolo de instrucción?</p>
    </div>
`;

export const tutorialProposalFooter = (modal) => html`
    <div className="w-full">
        <div className="flex gap-2 w-full">
            <button
                onClick=${modal.onStart}
                className="flex-1 py-2 bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase tracking-widest text-xs"
            >
                INICIAR INSTRUCCIÓN
            </button>
            <button
                onClick=${modal.onSkip}
                className="flex-1 py-2 bg-zinc-900 border border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all uppercase tracking-widest text-xs"
            >
                OMITIR
            </button>
        </div>
        <button
            onClick=${modal.onSkipAll}
            className="w-full py-2 border border-red-900/40 text-red-500/60 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-red-900/10 hover:text-red-400 transition-all mt-2"
        >
            OMITIR TODO EL TUTORIAL
        </button>
    </div>
`;
