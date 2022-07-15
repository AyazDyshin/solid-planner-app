import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';
import { SessionProvider } from "@inrupt/solid-ui-react";
import './custom.scss';

const container = document.getElementById('root');
if (!container) {
    throw new Error("error, root doesn't exist");
}
const root = createRoot(container);
root.render(
    <SessionProvider
        restorePreviousSession
    >
        <App />
    </SessionProvider>
);
