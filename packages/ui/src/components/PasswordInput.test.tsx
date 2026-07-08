import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from './PasswordInput.tsx';

describe('PasswordInput', () => {
  it('renders password input', () => {
    render(<PasswordInput />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeTruthy();
  });

  it('renders label', () => {
    render(<PasswordInput label="Password" />);
    expect(screen.getByText('Password')).toBeTruthy();
  });

  it('toggles visibility on button click', () => {
    render(<PasswordInput />);
    const btn = screen.getByLabelText('Tampilkan password');
    fireEvent.click(btn);
    expect(document.querySelector('input[type="text"]')).toBeTruthy();
    expect(screen.getByLabelText('Sembunyikan password')).toBeTruthy();
  });

  it('renders error', () => {
    render(<PasswordInput error="Minimal 8 karakter" />);
    expect(screen.getByText('Minimal 8 karakter')).toBeTruthy();
  });
});
