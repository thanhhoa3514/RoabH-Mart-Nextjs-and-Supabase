// Polyfill localStorage for server-side rendering
if (typeof window === 'undefined') {
    // @ts-ignore
    global.localStorage = {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
        clear: () => { },
        key: () => null,
        length: 0,
    };
}

export { };
