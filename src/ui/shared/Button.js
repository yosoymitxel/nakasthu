import { html } from '../utils/html.js';

export default function Button({ 
    onClick, 
    disabled = false, 
    title, 
    children, 
    className = "",
    variant = "primary" // primary, danger, ghost
}) {
    const baseStyles = "font-bold tracking-widest transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-700 disabled:hover:bg-zinc-900";
    
    const variants = {
        primary: "border-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-cyan-900/20 hover:border-cyan-500 hover:text-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
        success: "border-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-green-900/20 hover:border-green-500 hover:text-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
        danger: "border-2 border-red-900/50 bg-black text-red-700 hover:bg-red-900/30 hover:border-red-500 hover:text-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]",
        ghost: "text-zinc-500 hover:text-white"
    };

    return html`
        <button 
            onClick=${onClick}
            disabled=${disabled}
            title=${title}
            className=${`${baseStyles} ${variants[variant]} ${className}`}
        >
            ${children}
        </button>
    `;
}