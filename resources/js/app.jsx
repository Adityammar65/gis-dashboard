import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import 'leaflet/dist/leaflet.css';

try {
    const saved = window.localStorage.getItem('gis_theme');
    const isDark = saved === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
} catch { }

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const mod = await pages[`./Pages/${name}.jsx`]();
        return mod.default;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
