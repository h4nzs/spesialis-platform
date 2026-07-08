import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhoneInput } from './PhoneInput.tsx';

describe('PhoneInput', () => {
  it('renders tel input', () => {
    render(<PhoneInput />);
    const input = document.querySelector('input[type="tel"]');
    expect(input).toBeTruthy();
  });

  it('renders +62 prefix', () => {
    render(<PhoneInput />);
    expect(screen.getByText('+62')).toBeTruthy();
  });

  it('renders label', () => {
    render(<PhoneInput label="No. HP" />);
    expect(screen.getByText('No. HP')).toBeTruthy();
  });

  it('renders error', () => {
    render(<PhoneInput error="Nomor tidak valid" />);
    expect(screen.getByText('Nomor tidak valid')).toBeTruthy();
  });
});
