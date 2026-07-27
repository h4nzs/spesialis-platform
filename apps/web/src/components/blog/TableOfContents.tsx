import { useMemo, useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  contentHtml: string;
}

/**
 * Parse HTML content and extract H2/H3 headings for Table of Contents.
 * Auto-generates anchor IDs from heading text.
 * Highlights the currently visible heading based on scroll position.
 */
export function TableOfContents({ contentHtml }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!contentHtml) return [];

    // Parse headings from HTML
    const headingRegex = /<h([23])(?:\s[^>]*)?>(.*?)<\/h\1>/gi;
    const result: TocItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(contentHtml)) !== null) {
      const level = parseInt(match[1]!, 10) as 2 | 3;
      const text = match[2]!.replace(/<[^>]*>/g, '').trim();
      if (!text) continue;

      // Generate an ID from the heading text
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      result.push({ id, text, level });
    }

    return result;
  }, [contentHtml]);

  // Observe heading positions to highlight active section on scroll
  useEffect(() => {
    if (items.length === 0) return;

    const ids = items.map((item) => item.id);

    // Inject anchor IDs into heading elements so clicking ToC works
    // TipTap renders headings without IDs, so we match by text content
    for (const item of items) {
      const headingEls = document.querySelectorAll(`h${item.level}`);
      for (const el of headingEls) {
        const text = el.textContent?.trim().toLowerCase() ?? '';
        const target = item.text.toLowerCase();
        // Match exact text or if heading text starts with target
        if (text === target) {
          if (!el.id) el.id = item.id;
          break;
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading that's above the viewport center
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0]!.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      },
    );

    // Observe heading elements by their IDs (now injected above)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    // Fallback: set first item as active if no elements observed
    if (elements.length === 0 && items.length > 0) {
      setActiveId(items[0]!.id);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Daftar Isi
      </h3>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            className={`block w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
              item.level === 3 ? 'pl-7' : ''
            } ${
              activeId === item.id
                ? 'bg-primary-50 font-medium text-primary-700'
                : 'text-text-secondary hover:bg-neutral-50 hover:text-text-primary'
            }`}
          >
            <span className="line-clamp-1">{item.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
