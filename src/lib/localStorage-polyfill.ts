// Polyfill localStorage for server-side rendering
if (typeof window === 'undefined') {
    (global as typeof globalThis & { localStorage: Storage }).localStorage = {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
        clear: () => { },
        key: () => null,
        length: 0,
    };
}

export { };
