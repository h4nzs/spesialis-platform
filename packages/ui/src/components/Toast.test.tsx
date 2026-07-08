import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast } from './Toast.tsx';

// Mock requestAnimationFrame to fire immediately in tests
beforeEach(() => {
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Toast', () => {
  it('renders content', async () => {
    render(<Toast>Booking berhasil</Toast>);
    await waitFor(() => expect(screen.getByText('Booking berhasil')).toBeTruthy());
  });

  it('renders with role status and aria-live', async () => {
    render(<Toast>Info</Toast>);
    await waitFor(() => {
      const el = screen.getByRole('status');
      expect(el).toBeTruthy();
      expect(el.getAttribute('aria-live')).toBe('polite');
    });
  });

  it('renders dismiss button by default', async () => {
    render(<Toast>Info</Toast>);
    await waitFor(() => expect(screen.getByLabelText('Tutup')).toBeTruthy());
  });

  it('calls onDismiss when dismiss clicked', async () => {
    const fn = vi.fn();
    render(
      <Toast dismissible onDismiss={fn}>
        Info
      </Toast>,
    );
    // Wait for toast to appear
    await waitFor(() => expect(screen.getByLabelText('Tutup')).toBeTruthy());
    // Click dismiss — fired once outside waitFor to avoid retry spam
    fireEvent.click(screen.getByLabelText('Tutup'));
    // onDismiss is called after 200ms (see handleDismiss setTimeout)
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(1), { timeout: 1000 });
  });
});
