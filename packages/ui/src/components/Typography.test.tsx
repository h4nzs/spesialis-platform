import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading, Text } from './Typography';

describe('Heading', () => {
  it('renders h2 by default', () => {
    render(<Heading>Section Title</Heading>);
    const heading = screen.getByText('Section Title');
    expect(heading.tagName).toBe('H2');
  });

  it('renders h1 with level prop', () => {
    render(<Heading level="h1">Page Title</Heading>);
    const heading = screen.getByText('Page Title');
    expect(heading.tagName).toBe('H1');
  });

  it('renders h3 with level prop', () => {
    render(<Heading level="h3">Sub Section</Heading>);
    const heading = screen.getByText('Sub Section');
    expect(heading.tagName).toBe('H3');
  });

  it('renders h4 with level prop', () => {
    render(<Heading level="h4">Card Title</Heading>);
    const heading = screen.getByText('Card Title');
    expect(heading.tagName).toBe('H4');
  });

  it('applies heading text color', () => {
    render(<Heading>Colored</Heading>);
    expect(screen.getByText('Colored').className).toContain('text-text');
  });

  it('accepts custom className', () => {
    render(<Heading className="custom-heading">Custom</Heading>);
    expect(screen.getByText('Custom').className).toContain('custom-heading');
  });
});

describe('Text', () => {
  it('renders paragraph text', () => {
    render(<Text>Body text content</Text>);
    const text = screen.getByText('Body text content');
    expect(text.tagName).toBe('P');
  });

  it('applies muted text color', () => {
    render(<Text>Muted</Text>);
    expect(screen.getByText('Muted').className).toContain('text-text-muted');
  });

  it('applies leading class', () => {
    render(<Text>Leading</Text>);
    expect(screen.getByText('Leading').className).toContain('leading-relaxed');
  });

  it('accepts custom className', () => {
    render(<Text className="custom-text">Custom</Text>);
    expect(screen.getByText('Custom').className).toContain('custom-text');
  });
});
