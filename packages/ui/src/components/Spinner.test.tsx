import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from './Spinner.tsx';

describe('Spinner', () => {
  it('renders with default md size', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('class')).toContain('h-6');
  });

  it('renders with sm size', () => {
    const { container } = render(<Spinner size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg!.getAttribute('class')).toContain('h-4');
  });

  it('renders with lg size', () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg!.getAttribute('class')).toContain('h-8');
  });

  it('has animate-spin class', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')!.getAttribute('class')).toContain('animate-spin');
  });
});
