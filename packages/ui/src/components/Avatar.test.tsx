import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar.tsx';

describe('Avatar', () => {
  it('renders initials when no src provided', () => {
    render(<Avatar alt="John Doe" />);
    const el = screen.getByRole('img', { name: 'John Doe' });
    expect(el).toBeTruthy();
    expect(el.textContent).toBe('JD');
  });

  it('renders single initial for one-word name', () => {
    render(<Avatar alt="Admin" />);
    const el = screen.getByRole('img', { name: 'Admin' });
    expect(el.textContent).toBe('A');
  });

  it('renders explicit fallback', () => {
    render(<Avatar alt="User" fallback="PT" />);
    const el = screen.getByRole('img', { name: 'User' });
    expect(el.textContent).toBe('PT');
  });

  it('renders img when src provided', () => {
    const { container } = render(<Avatar src="/photo.jpg" alt="John" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('applies size class', () => {
    const { container } = render(<Avatar alt="User" size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-12');
  });
});
