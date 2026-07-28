import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * Content Signals — Machine-readable content usage preferences for AI agents.
 *
 * Mirrors the directives declared in robots.txt and provides a structured
 * JSON representation of content usage policies per IETF AIPREF working group
 * (originally draft-romm-aipref-contentsignals).
 *
 * Three signal categories defined by Content Signals spec:
 * - search: whether content can be indexed for search results (with attribution)
 * - ai-input: whether content can be used as context for AI chat/retrieval
 * - ai-train: whether content can be used to train/fine-tune AI models
 *
 * Strategy: "Balanced" — Allow AI search/retrieval bots that drive traffic,
 * block AI training bots that consume content for model training.
 *
 * See: https://contentsignals.org/
 *      https://datatracker.ietf.org/doc/draft-romm-aipref/
 *      https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/
 */
export const GET: APIRoute = async () => {
  const signals = {
    $schema: 'https://contentsignals.org/schema/content-signal.json',
    updatedAt: new Date().toISOString(),
    platform: {
      name: 'Ahli Panggilan',
      website: SITE,
      description: 'On-demand professional service booking platform in Indonesia',
    },
    policy: {
      strategy: 'balanced',
      description:
        'Allow AI search/retrieval agents that drive traffic with attribution. ' +
        'Block AI training agents that consume content for model training without attribution.',
    },
    signals: {
      // Global default — applies to all user-agents unless overridden
      global: {
        'ai-train': false,
        search: true,
        'ai-input': false,
      },
      // Per-agent overrides
      agents: [
        // ── AI TRAINING BOTS — BLOCKED ──
        {
          userAgent: 'GPTBot',
          description: 'OpenAI GPT training crawler',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        {
          userAgent: 'ClaudeBot',
          description: 'Anthropic Claude training crawler',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        {
          userAgent: 'CCBot',
          description: 'Common Crawl Foundation (used by many LLM training pipelines)',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        {
          userAgent: 'FacebookBot',
          description: 'Meta AI training crawler (LLaMA models)',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        {
          userAgent: 'Meta-ExternalAgent',
          description: 'Meta AI external agent',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        {
          userAgent: 'Amazonbot',
          description: 'Amazon AI training crawler',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        {
          userAgent: 'Bytespider',
          description: 'ByteDance/TikTok AI training crawler',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        {
          userAgent: 'cohere-ai',
          description: 'Cohere AI training crawler',
          'ai-train': false,
          search: false,
          'ai-input': false,
        },
        // ── SEARCH ENGINE TRAINING OPT-OUT ──
        {
          userAgent: 'Google-Extended',
          description: 'Google AI training opt-out (indexes normally for search)',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        {
          userAgent: 'Applebot-Extended',
          description: 'Apple AI training opt-out (indexes normally for search)',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        // ── AI SEARCH/RETRIEVAL BOTS — ALLOWED ──
        {
          userAgent: 'OAI-SearchBot',
          description: 'OpenAI Search (ChatGPT search, real-time answers with attribution)',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        {
          userAgent: 'ChatGPT-User',
          description: 'ChatGPT user-triggered fetcher (live links in chat)',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        {
          userAgent: 'Claude-Web',
          description: 'Anthropic Claude web search / retrieval with attribution',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        {
          userAgent: 'anthropic-ai',
          description: 'Anthropic Claude web search / retrieval',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        {
          userAgent: 'PerplexityBot',
          description: 'Perplexity AI search & answers with attribution',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        {
          userAgent: 'DuckAssistBot',
          description: 'DuckDuckGo AI Answers with attribution',
          'ai-train': false,
          search: true,
          'ai-input': true,
        },
        // ── GENERAL SEARCH ENGINES ──
        {
          userAgent: '*',
          description: 'General search engines (Google, Bing, Yahoo, etc.)',
          'ai-train': false,
          search: true,
          'ai-input': false,
        },
      ],
    },
    // Reference to full robots.txt
    robotsTxt: `${SITE}/robots.txt`,
    // HTTP header variant (per draft-ietf-aipref-attach)
    httpHeader: 'Content-Usage',
  };

  return new Response(JSON.stringify(signals, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
