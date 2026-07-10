/**
 * Simple Markdown Renderer
 *
 * Lightweight markdown-to-HTML conversion for CMS page content.
 * Handles the subset of markdown used in cms_pages:
 * headings, paragraphs, bold, lists, line breaks.
 *
 * Not a full CommonMark implementation — only what's needed for
 * editorial content in static pages (tentang-kami, etc.).
 */

export function renderMarkdown(md: string): string {
  // Normalize line breaks: insert \n before heading/list markers if missing
  // Handles content stored without line breaks (single-string markdown)
  const normalized = md
    .replace(/\r\n/g, '\n')
    // Insert blank line before heading markers (##, ###, #) that appear mid-text
    .replace(/(?<=\S)\s+(?=#{1,3}\s)/g, '\n\n')
    // Insert blank line before list items (-, *) that appear mid-text
    .replace(/(?<=\S)\s+(?=[-*]\s)/g, '\n\n')
    // Insert blank line before numbered list items (1., 2., etc.) that appear mid-text
    // BUT NOT when preceded by a heading marker (## 1.) to avoid splitting headings
    .replace(/(?<=\S)(?<!#)\s+(?=\d+\.\s)/g, '\n\n');
  const lines = normalized.split('\n');
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
      html.push(`<h1>${escapeHtml(h1Match[1])}</h1>`);
      continue;
    }

    // Heading 2: ## Title
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h2>${escapeHtml(h2Match[1])}</h2>`);
      continue;
    }

    // Heading 3: ### Title
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h3>${escapeHtml(h3Match[1])}</h3>`);
      continue;
    }

    // Unordered list item: - item or * item
    const ulMatch = line.match(/^[-*] (.+)$/);
    if (ulMatch) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${renderInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list item: 1. item, 2. item, etc.
    const olMatch = line.match(/^\d+\. (.+)$/);
    if (olMatch) {
      if (!inList) {
        html.push('<ol>');
        inList = true;
      }
      html.push(`<li>${renderInline(olMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    html.push(`<p>${renderInline(line)}</p>`);
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
  // Italic: *text*
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code: `code`
  result = result.replace(/`(.+?)`/g, '<code>$1</code>');
  // Links: [text](url)
  // rel=nofollow prevents SEO spam via article content
  // Auto-add https:// if URL has no protocol
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match: string, text: string, url: string) => {
      // Preserve existing http/https/mailto/tel protocols; auto-add https:// for bare domains
      const href = url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/) ? url : `https://${url}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow">${text}</a>`;
    },
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
