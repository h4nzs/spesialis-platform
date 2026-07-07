import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading, Text } from './Typography';

describe('Heading', () => {
  it('renders h2 by default', () => {
    render(<Heading>Title</Heading>);
    const el = screen.getByText('Title');
    expect(el.tagName).toBe('H2');
  });

  it('renders h1 level', () => {
    render(<Heading level="h1">H1 Title</Heading>);
    const el = screen.getByText('H1 Title');
    expect(el.tagName).toBe('H1');
  });

  it('renders h2 level', () => {
    render(<Heading level="h2">H2 Title</Heading>);
    expect(screen.getByText('H2 Title').tagName).toBe('H2');
  });

  it('renders h3 level', () => {
    render(<Heading level="h3">H3 Title</Heading>);
    expect(screen.getByText('H3 Title').tagName).toBe('H3');
  });

  it('renders h4 level', () => {
    render(<Heading level="h4">H4 Title</Heading>);
    expect(screen.getByText('H4 Title').tagName).toBe('H4');
  });

  it('has font-bold for h1', () => {
    render(<Heading level="h1">Bold</Heading>);
    expect(screen.getByText('Bold').className).toContain('font-bold');
  });

  it('has font-semibold for h2', () => {
    render(<Heading level="h2">Semi</Heading>);
    expect(screen.getByText('Semi').className).toContain('font-semibold');
  });

  it('accepts additional className', () => {
    render(<Heading className="custom-h">Custom</Heading>);
    expect(screen.getByText('Custom').className).toContain('custom-h');
  });
});

describe('Text', () => {
  it('renders paragraph by default', () => {
    render(<Text>Paragraph</Text>);
    const el = screen.getByText('Paragraph');
    expect(el.tagName).toBe('P');
  });

  it('has text-muted color', () => {
    render(<Text>Muted</Text>);
    expect(screen.getByText('Muted').className).toContain('text-text-muted');
  });

  it('accepts additional className', () => {
    render(<Text className="custom-text">Custom</Text>);
    expect(screen.getByText('Custom').className).toContain('custom-text');
  });
});
