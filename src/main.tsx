import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from '@/App';
import '@/index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

// The HTML arrives already rendered, so hydrate it. Re-rendering from scratch
// would blank the page for a frame after the first paint had already landed.
hydrateRoot(
  rootEl,
  <StrictMode>
    <App />
  </StrictMode>,
);
