import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './SearchInput.tsx';

describe('SearchInput', () => {
  it('renders search input', () => {
    render(<SearchInput />);
    const input = document.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
  });

  it('renders label', () => {
    render(<SearchInput label="Cari" />);
    expect(screen.getByText('Cari')).toBeTruthy();
  });

  it('shows clear button when clearable and has value', () => {
    render(<SearchInput clearable value="AC" onChange={() => {}} />);
    expect(screen.getByLabelText('Hapus pencarian')).toBeTruthy();
  });

  it('calls onClear when clear button clicked', () => {
    const fn = vi.fn();
    render(<SearchInput clearable value="AC" onChange={() => {}} onClear={fn} />);
    fireEvent.click(screen.getByLabelText('Hapus pencarian'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('hides clear button when value is empty', () => {
    render(<SearchInput clearable value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Hapus pencarian')).toBeNull();
  });
});
