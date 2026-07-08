import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NumberInput } from './NumberInput.tsx';

describe('NumberInput', () => {
  it('renders number input', () => {
    render(<NumberInput />);
    const input = document.querySelector('input[type="number"]');
    expect(input).toBeTruthy();
  });

  it('renders label', () => {
    render(<NumberInput label="Jumlah" />);
    expect(screen.getByText('Jumlah')).toBeTruthy();
  });

  it('renders error message', () => {
    render(<NumberInput label="Jumlah" error="Minimal 1" />);
    expect(screen.getByText('Minimal 1')).toBeTruthy();
  });
});
