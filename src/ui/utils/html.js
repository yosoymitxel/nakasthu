import htm from 'https://unpkg.com/htm@3.1.1?module';

// Bind htm to React.createElement. 
// Assumes React is loaded globally via UMD script in index.html
export const html = (typeof htm !== 'undefined' && htm && typeof window !== 'undefined' && window.React)
    ? htm.bind(window.React.createElement)
    : (strings, ...values) => strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
