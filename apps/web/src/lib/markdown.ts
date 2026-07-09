/**
 * Simple Markdown Renderer
 *
 * Lightweight markdown-to-HTML conversion for CMS page content.
 * Handles the subset of markdown used in Directus cms_pages:
 * headings, paragraphs, bold, lists, line breaks.
 *
 * Not a full CommonMark implementation — only what's needed for
 * editorial content in static pages (tentang-kami, etc.).
 */

export function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line → close any open list / add spacing
    if (line.trim() === '') {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Heading 1: # Title
    const h1Match = line.match(/^# (.+)$/);
    if (h1Match) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h1 class="text-h2 font-bold text-text-primary">${escapeHtml(h1Match[1])}</h1>`);
      continue;
    }

    // Heading 2: ## Title
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(
        `<h2 class="text-h4 font-semibold text-text-primary mt-8 mb-3">${escapeHtml(h2Match[1])}</h2>`,
      );
      continue;
    }

    // Heading 3: ### Title
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(
        `<h3 class="text-h5 font-semibold text-text-primary mt-6 mb-2">${escapeHtml(h3Match[1])}</h3>`,
      );
      continue;
    }

    // List item: - item or * item
    const liMatch = line.match(/^[-*] (.+)$/);
    if (liMatch) {
      if (!inList) {
        html.push('<ul class="list-disc pl-6 space-y-2 text-text-primary leading-relaxed">');
        inList = true;
      }
      html.push(`<li>${renderInline(liMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    html.push(`<p class="text-text-primary leading-relaxed">${renderInline(line)}</p>`);
  }

  if (inList) {
    html.push('</ul>');
  }

  return html.join('\n');
}

function renderInline(text: string): string {
  // Escape HTML first to prevent XSS
  let result = escapeHtml(text);
  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Inline code: `code`
  result = result.replace(
    /`(.+?)`/g,
    '<code class="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">$1</code>',
  );
  // Links: [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary-hover underline transition-colors">$1</a>',
  );
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
