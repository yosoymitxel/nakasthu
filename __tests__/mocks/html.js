
// Mock for html utility to avoid CDN imports and React dependencies during tests
export const html = (strings, ...values) => {
    // Basic implementation of tagged template for testing
    return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
};
