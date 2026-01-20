import htm from 'https://unpkg.com/htm?module';

// Bind htm to React.createElement. 
// Assumes React is loaded globally via UMD script in index.html
export const html = htm.bind(window.React.createElement);
