import { describe, it, expect } from 'vitest';
import { createFaqSchema, updateFaqSchema } from './faq.ts';

const validFaq = {
  question: 'Bagaimana cara booking?',
  answer: 'Anda bisa booking melalui website atau WhatsApp.',
};

describe('createFaqSchema', () => {
  it('accepts valid FAQ (minimal)', () => {
    const result = createFaqSchema.safeParse(validFaq);
    expect(result.success).toBe(true);
  });

  it('accepts with all optional fields', () => {
    const result = createFaqSchema.safeParse({
      ...validFaq,
      category: 'Booking',
      displayOrder: 1,
      isActive: 'true',
    });
    expect(result.success).toBe(true);
  });

  it('accepts isActive false', () => {
    const result = createFaqSchema.safeParse({
      ...validFaq,
      isActive: 'false',
    });
    expect(result.success).toBe(true);
  });

  it('coerces string displayOrder to number', () => {
    const result = createFaqSchema.safeParse({
      ...validFaq,
      displayOrder: '3',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty question', () => {
    const result = createFaqSchema.safeParse({ ...validFaq, question: '' });
    expect(result.success).toBe(false);
  });

  it('rejects question exceeding 500 chars', () => {
    const result = createFaqSchema.safeParse({ ...validFaq, question: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects empty answer', () => {
    const result = createFaqSchema.safeParse({ ...validFaq, answer: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid isActive value', () => {
    const result = createFaqSchema.safeParse({ ...validFaq, isActive: 'yes' });
    expect(result.success).toBe(false);
  });

  it('rejects negative displayOrder', () => {
    const result = createFaqSchema.safeParse({ ...validFaq, displayOrder: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects category exceeding 100 chars', () => {
    const result = createFaqSchema.safeParse({ ...validFaq, category: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects missing question', () => {
    const { question: _q, ...noQuestion } = validFaq;
    const result = createFaqSchema.safeParse(noQuestion);
    expect(result.success).toBe(false);
  });

  it('rejects missing answer', () => {
    const { answer: _a, ...noAnswer } = validFaq;
    const result = createFaqSchema.safeParse(noAnswer);
    expect(result.success).toBe(false);
  });
});

describe('updateFaqSchema', () => {
  it('accepts empty object (no changes)', () => {
    const result = updateFaqSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with question only', () => {
    const result = updateFaqSchema.safeParse({ question: 'Updated question?' });
    expect(result.success).toBe(true);
  });

  it('accepts nullable category', () => {
    const result = updateFaqSchema.safeParse({ category: null });
    expect(result.success).toBe(true);
  });

  it('rejects invalid isActive', () => {
    const result = updateFaqSchema.safeParse({ isActive: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects question exceeding 500 chars', () => {
    const result = updateFaqSchema.safeParse({ question: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects empty answer (min 1)', () => {
    const result = updateFaqSchema.safeParse({ answer: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative displayOrder', () => {
    const result = updateFaqSchema.safeParse({ displayOrder: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts isActive true and false', () => {
    expect(updateFaqSchema.safeParse({ isActive: 'true' }).success).toBe(true);
    expect(updateFaqSchema.safeParse({ isActive: 'false' }).success).toBe(true);
  });
});
