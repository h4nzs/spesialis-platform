import { useEffect } from 'react';
import { registerWebMCPTools } from '../lib/webmcp.ts';

/**
 * WebMCPProvider — Registers AI agent tools via navigator.modelContext.
 *
 * This component mounts a script that calls registerWebMCPTools() to expose
 * platform capabilities to AI agents (Google Chrome's built-in AI, etc.).
 *
 * Usage: Include once in the root layout. It automatically degrades
 * when the browser doesn't support WebMCP.
 */
export function WebMCPProvider() {
  useEffect(() => {
    registerWebMCPTools();
  }, []);

  // Invisible — no UI rendered
  return null;
}
