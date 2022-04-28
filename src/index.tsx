import { createRoot } from 'react-dom/client';
import App from './App';
import { SessionProvider } from "@inrupt/solid-ui-react";

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <SessionProvider
    restorePreviousSession>
        <App />
    </SessionProvider>
);
