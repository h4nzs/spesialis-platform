import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading, Display, Text } from './Typography';

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

  it('renders h5 with level prop', () => {
    render(<Heading level="h5">Widget Title</Heading>);
    const heading = screen.getByText('Widget Title');
    expect(heading.tagName).toBe('H5');
  });

  it('renders h6 with level prop', () => {
    render(<Heading level="h6">List Title</Heading>);
    const heading = screen.getByText('List Title');
    expect(heading.tagName).toBe('H6');
  });

  it('applies a className to the element', () => {
    render(<Heading>Colored</Heading>);
    expect(screen.getByText('Colored').className).toBeTruthy();
  });

  it('accepts custom className', () => {
    render(<Heading className="custom-heading">Custom</Heading>);
    expect(screen.getByText('Custom').className).toContain('custom-heading');
  });
});

describe('Display', () => {
  it('renders h1 with xl size by default', () => {
    render(<Display>Hero Title</Display>);
    const el = screen.getByText('Hero Title');
    expect(el.tagName).toBe('H1');
  });

  it('renders h2 with lg size', () => {
    render(<Display size="lg">Section Display</Display>);
    const el = screen.getByText('Section Display');
    expect(el.tagName).toBe('H2');
  });

  it('accepts as prop to override tag', () => {
    render(
      <Display size="xl" as="h2">
        Custom Tag
      </Display>,
    );
    const el = screen.getByText('Custom Tag');
    expect(el.tagName).toBe('H2');
  });

  it('accepts custom className', () => {
    render(<Display className="custom-display">Styled</Display>);
    expect(screen.getByText('Styled').className).toContain('custom-display');
  });
});

describe('Text', () => {
  it('renders paragraph by default', () => {
    render(<Text>Body text content</Text>);
    const text = screen.getByText('Body text content');
    expect(text.tagName).toBe('P');
  });

  it('renders body variant', () => {
    render(<Text variant="body">Body</Text>);
    expect(screen.getByText('Body').tagName).toBe('P');
  });

  it('renders body-lg variant', () => {
    render(<Text variant="body-lg">Large body</Text>);
    expect(screen.getByText('Large body').tagName).toBe('P');
  });

  it('renders body-sm variant', () => {
    render(<Text variant="body-sm">Small body</Text>);
    expect(screen.getByText('Small body').tagName).toBe('P');
  });

  it('renders caption as span', () => {
    render(<Text variant="caption">Metadata</Text>);
    expect(screen.getByText('Metadata').tagName).toBe('SPAN');
  });

  it('renders overline as span', () => {
    render(<Text variant="overline">CATEGORY</Text>);
    expect(screen.getByText('CATEGORY').tagName).toBe('SPAN');
  });

  it('renders lead variant', () => {
    render(<Text variant="lead">Lead paragraph</Text>);
    expect(screen.getByText('Lead paragraph').tagName).toBe('P');
  });

  it('renders code variant as span', () => {
    render(<Text variant="code">inline code</Text>);
    expect(screen.getByText('inline code').tagName).toBe('SPAN');
  });

  it('accepts as prop to override tag', () => {
    render(<Text as="div">Div text</Text>);
    expect(screen.getByText('Div text').tagName).toBe('DIV');
  });

  it('accepts custom className', () => {
    render(<Text className="custom-text">Custom</Text>);
    expect(screen.getByText('Custom').className).toContain('custom-text');
  });

  it('renders as small element', () => {
    render(<Text as="small">Small Text</Text>);
    expect(screen.getByText('Small Text').tagName).toBe('SMALL');
  });
});
