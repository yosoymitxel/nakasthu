import { html } from '../utils/html.js';

const { Component } = window.React;

/**
 * ERROR_BOUNDARY.JS
 * Captura fallos críticos en la UI y presenta una pantalla de error temática.
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("NAKASTHU_SYSTEM_CRITICAL_ERROR:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return html`
                <div className="flex flex-col items-center justify-center h-screen h-[100dvh] w-screen bg-black text-red-600 font-mono p-10 border-4 border-red-900">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                    <h1 className="text-4xl mb-4 animate-pulse">SYSTEM_CRITICAL_FAILURE</h1>
                    <p className="text-xl mb-8 uppercase tracking-widest border-b border-red-600 pb-2">
                        El núcleo NAKASTHU ha colapsado. Corrupción de datos detectada.
                    </p>
                    <div className="bg-red-900/10 p-4 border border-red-600/30 mb-8 w-full max-w-2xl overflow-auto max-h-64 scrollbar-thin scrollbar-thumb-red-600">
                        <pre className="text-xs text-red-400 opacity-70">${this.state.error?.stack || this.state.error?.message}</pre>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick=${() => window.location.reload()}
                            className="px-6 py-2 bg-red-900/50 text-red-200 border border-red-600 font-bold hover:bg-red-600 hover:text-black transition-all uppercase text-sm"
                        >
                            Reiniciar_Núcleo
                        </button>
                        <button 
                            onClick=${() => this.setState({ hasError: false, error: null })}
                            className="px-6 py-2 border border-red-900 text-red-900 font-bold hover:border-red-600 hover:text-red-600 transition-all uppercase text-sm"
                        >
                            Ignorar_Aviso
                        </button>
                    </div>
                    <div className="mt-12 text-[10px] opacity-30 text-center uppercase tracking-[0.2em]">
                        Propiedad de la Distribución NAKASTHU. Acceso no autorizado penado con reasignación.
                    </div>
                </div>
            `;
        }

        return this.props.children;
    }
}
