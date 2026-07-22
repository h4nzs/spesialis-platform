// =============================================================================
// Tests — Session Manager
// =============================================================================

import { describe, it, expect } from 'vitest';
import { getSession, setSessionUser, clearSessionUser, resetSession } from '../core/session.ts';

describe('getSession', () => {
  it('returns a session with an id', () => {
    const session = getSession();
    expect(session.id).toBeDefined();
    expect(session.id.startsWith('ses_')).toBe(true);
  });

  it('returns a session with a start timestamp', () => {
    const session = getSession();
    expect(session.start).toBeGreaterThan(0);
    expect(session.start).toBeLessThanOrEqual(Date.now());
  });

  it('returns the same session on repeated calls', () => {
    const session1 = getSession();
    const session2 = getSession();
    expect(session1.id).toBe(session2.id);
    expect(session1.start).toBe(session2.start);
  });

  it('session has no userId by default', () => {
    const session = getSession();
    expect(session.userId).toBeUndefined();
  });
});

describe('setSessionUser', () => {
  it('sets userId on the current session', () => {
    setSessionUser('user-123');
    const session = getSession();
    expect(session.userId).toBe('user-123');
  });

  it('overwrites previous userId', () => {
    setSessionUser('user-123');
    setSessionUser('user-456');
    const session = getSession();
    expect(session.userId).toBe('user-456');
  });
});

describe('clearSessionUser', () => {
  it('clears userId from session', () => {
    setSessionUser('user-123');
    clearSessionUser();
    const session = getSession();
    expect(session.userId).toBeUndefined();
  });

  it('does not affect session id', () => {
    const session1 = getSession();
    setSessionUser('user-123');
    clearSessionUser();
    const session2 = getSession();
    expect(session2.id).toBe(session1.id);
  });
});

describe('resetSession', () => {
  it('creates a new session with different id', () => {
    const session1 = getSession();
    resetSession();
    const session2 = getSession();
    expect(session2.id).not.toBe(session1.id);
  });

  it('creates a session without previous userId', () => {
    setSessionUser('user-123');
    resetSession();
    const session = getSession();
    expect(session.userId).toBeUndefined();
  });
});
