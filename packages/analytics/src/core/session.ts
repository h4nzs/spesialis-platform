// =============================================================================
// Analytics Platform — Session Manager
// =============================================================================
// Generates and manages session IDs for analytics events.
// Session persists for the browser tab lifetime.
// =============================================================================

export interface Session {
  /** Unique session ID */
  id: string;

  /** Session start timestamp */
  start: number;

  /** Authenticated user ID (if logged in) */
  userId?: string;
}

// Session is module-scoped — persists for the page lifetime
let currentSession: Session | null = null;

/**
 * Get or create the current analytics session.
 */
export function getSession(): Session {
  if (!currentSession) {
    currentSession = createSession();
  }
  return currentSession;
}

/**
 * Set the authenticated user ID for the current session.
 * Call after login/signup.
 */
export function setSessionUser(userId: string): void {
  const session = getSession();
  session.userId = userId;
}

/**
 * Clear the user ID (logout).
 * Keeps the session ID for analytics continuity.
 */
export function clearSessionUser(): void {
  const session = getSession();
  session.userId = undefined;
}

/**
 * Reset the session entirely (new visit).
 */
export function resetSession(): void {
  currentSession = createSession();
}

function createSession(): Session {
  const id = generateSessionId();
  return {
    id,
    start: Date.now(),
  };
}

function generateSessionId(): string {
  // Combines timestamp with random bytes for uniqueness
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  const random2 = Math.random().toString(36).slice(2, 6);
  return `ses_${timestamp}${random}${random2}`;
}
