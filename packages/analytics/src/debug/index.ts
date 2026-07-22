// =============================================================================
// Analytics Platform — Debug Panel API
// =============================================================================
// Public API for enabling/disabling the floating debug panel.
// Also sets up the `window.__SPESIALIS_ANALYTICS_DEBUG__` global for
// console-based inspection.
// Auto-renders the React panel into DOM when enabled.
// =============================================================================

import React from 'react';
import { DebugPanel } from './panel.tsx';
import { getSnapshot, clearAllEvents, exportEvents, refreshStore } from './store.ts';
import { getConfig } from '../core/config.ts';
import type { DebugStoreSnapshot } from './store.ts';

// ── Global Browser API ─────────────────────────────────────────────
// Exposes analytics internals to the browser console.
// Access: window.__SPESIALIS_ANALYTICS_DEBUG__

declare global {
  interface Window {
    __SPESIALIS_ANALYTICS_DEBUG__?: {
      /** Current store snapshot */
      snapshot: DebugStoreSnapshot;
      /** Refresh store and get latest snapshot */
      refresh: () => DebugStoreSnapshot;
      /** Clear all debug events */
      clear: () => void;
      /** Export all events as JSON string */
      export: () => string;
      /** Current config */
      config: ReturnType<typeof getConfig>;
      /** Toggle debug panel visibility */
      togglePanel: () => void;
    };
  }
}

function setupGlobalAPI(togglePanel: () => void): void {
  if (typeof window === 'undefined') return;

  window.__SPESIALIS_ANALYTICS_DEBUG__ = {
    get snapshot() {
      return getSnapshot();
    },
    refresh: () => {
      refreshStore();
      return getSnapshot();
    },
    clear: () => {
      clearAllEvents();
    },
    export: () => {
      return exportEvents();
    },
    get config() {
      return getConfig();
    },
    togglePanel,
  };
}

// ── Panel Root Management ─────────────────────────────────────────
// Creates a DOM container and renders the React panel into it.

let panelContainer: HTMLDivElement | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let panelRoot: any = null;
let isVisible = false;

// Dynamic import for react-dom/client (tree-shakeable in production)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createRoot: ((container: Element | DocumentFragment) => any) | null = null;

async function ensureReactDOM(): Promise<boolean> {
  if (createRoot) return true;
  try {
    const reactDOM = await import('react-dom/client');
    createRoot = reactDOM.createRoot;
    return true;
  } catch {
    console.warn('[Analytics] Debug Panel requires react-dom. Install: pnpm add react-dom');
    return false;
  }
}

function createPanelContainer(): HTMLDivElement {
  const div = document.createElement('div');
  div.id = '__spesialis-analytics-debug-panel';
  div.style.all = 'initial'; // Reset host page styles
  document.body.appendChild(div);
  return div;
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Enable the floating debug panel.
 * Shows the panel immediately with keyboard shortcut (Ctrl+Shift+A).
 * Auto-renders the React component into the DOM.
 */
export async function enableDebugPanel(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (isVisible) return;
  isVisible = true;

  // Load react-dom dynamically
  const hasReactDOM = await ensureReactDOM();
  if (!hasReactDOM || !createRoot) {
    console.info(
      '%c⚡ Analytics Debug: install react-dom for interactive panel or import <DebugPanel /> manually',
      'color:#cba6f7;font-weight:bold',
    );
    return;
  }

  // Setup global console API
  setupGlobalAPI(toggleDebugPanel);

  // Create container and render panel
  if (!panelContainer) {
    panelContainer = createPanelContainer();
  }

  panelRoot = createRoot(panelContainer);
  panelRoot.render(React.createElement(DebugPanel, { initialVisible: true }));
}

/**
 * Disable the floating debug panel.
 */
export function disableDebugPanel(): void {
  if (typeof window === 'undefined') return;
  isVisible = false;

  // Unmount React root
  if (panelRoot) {
    panelRoot.unmount();
    panelRoot = null;
  }

  if (panelContainer) {
    panelContainer.remove();
    panelContainer = null;
  }

  delete window.__SPESIALIS_ANALYTICS_DEBUG__;
}

/**
 * Toggle the debug panel visibility.
 */
export function toggleDebugPanel(): void {
  if (isVisible) {
    disableDebugPanel();
  } else {
    enableDebugPanel();
  }
}

/**
 * Check if the debug panel is currently visible.
 */
export function isDebugPanelVisible(): boolean {
  return isVisible;
}

/** Export the React component for host app rendering */
export { DebugPanel };
