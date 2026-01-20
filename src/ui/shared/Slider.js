import { html } from '../utils/html.js';

export default function Slider({ 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    label, 
    valueLabel,
    color = "cyan" // cyan, amber
}) {
    const colorClasses = {
        cyan: "accent-cyan-600 hover:accent-cyan-400 text-cyan-700",
        amber: "accent-amber-600 hover:accent-amber-400 text-amber-700"
    };

    return html`
        <div className="flex-1 flex flex-col justify-center">
            <div className=${`flex justify-between text-[10px] mb-2 font-bold tracking-wider ${colorClasses[color].split(' ').pop()}`}>
                <span>${label}</span>
                <span>${valueLabel}</span>
            </div>
            <input 
                type="range" 
                min=${min} 
                max=${max} 
                value=${value} 
                onChange=${onChange}
                className=${`w-full h-1 bg-zinc-900 appearance-none cursor-pointer transition-colors ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}
            />
        </div>
    `;
}