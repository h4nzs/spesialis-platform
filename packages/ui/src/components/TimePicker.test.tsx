import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimePicker } from './TimePicker.tsx';

describe('TimePicker', () => {
  it('renders time input', () => {
    render(<TimePicker />);
    const input = document.querySelector('input[type="time"]');
    expect(input).toBeTruthy();
  });

  it('renders label', () => {
    render(<TimePicker label="Jam" />);
    expect(screen.getByText('Jam')).toBeTruthy();
  });

  it('renders error message', () => {
    render(<TimePicker label="Jam" error="Wajib diisi" />);
    expect(screen.getByText('Wajib diisi')).toBeTruthy();
  });
});
