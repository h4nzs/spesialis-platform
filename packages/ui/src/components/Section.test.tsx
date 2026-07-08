import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section.tsx';

describe('Section', () => {
  it('renders children', () => {
    render(
      <Section>
        <p>Konten</p>
      </Section>,
    );
    expect(screen.getByText('Konten')).toBeTruthy();
  });

  it('renders string title as h2', () => {
    render(<Section title="Layanan Kami">content</Section>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Layanan Kami');
  });

  it('renders description', () => {
    render(
      <Section title="T" description="Deskripsi layanan">
        content
      </Section>,
    );
    expect(screen.getByText('Deskripsi layanan')).toBeTruthy();
  });

  it('renders with alternate background', () => {
    const { container } = render(<Section variant="alternate">content</Section>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('bg-bg-section');
  });

  it('renders with brand background', () => {
    const { container } = render(<Section variant="brand">content</Section>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('bg-primary-900');
  });

  it('renders with small padding', () => {
    const { container } = render(<Section padding="sm">content</Section>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('py-8');
  });
});
