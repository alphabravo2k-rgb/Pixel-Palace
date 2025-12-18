import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './index.css';

/**
 * App entry point.
 * Ensures the target container exists and is a valid HTMLElement before mounting 
 * to prevent silent failures in non-standard environments.
 * * Note: StrictMode is enabled to catch side-effect bugs and ensure 
 * compatibility with future React concurrent features.
 */
const container = document.getElementById('root');

if (!(container instanceof HTMLElement)) {
  throw new Error(
    "FATAL_MOUNT_ERROR: Target container 'root' was not found or is not a valid HTMLElement. " +
    "Check index.html to ensure <div id='root'></div> is correctly defined."
  );
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
