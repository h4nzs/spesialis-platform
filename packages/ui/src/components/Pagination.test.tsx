import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.textContent).toBe('');
  });

  it('renders page buttons', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
    const currentBtn = screen.getByText('3');
    expect(currentBtn.className).toContain('bg-primary');
    expect(currentBtn.className).toContain('text-white');
  });

  it('calls onPageChange when clicking a page', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables prev button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    const prevBtn = screen.getByLabelText('Halaman sebelumnya');
    expect(prevBtn).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    const nextBtn = screen.getByLabelText('Halaman selanjutnya');
    expect(nextBtn).toBeDisabled();
  });

  it('shows ellipsis for many pages', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />);
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThanOrEqual(1);
  });

  it('sets aria-current on active page', () => {
    render(<Pagination page={2} totalPages={5} onPageChange={() => {}} />);
    const currentBtn = screen.getByText('2');
    expect(currentBtn.getAttribute('aria-current')).toBe('page');
  });
});
