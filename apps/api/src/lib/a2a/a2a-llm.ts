import { A2A_TOOLS, executeA2ATool } from './a2a-tools.ts';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

interface GeminiPart {
  text?: string;
  thought_signature?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
}

function geminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

export function llmAvailable(): boolean {
  return Boolean(geminiApiKey());
}

export interface A2AMetrics {
  llmFailures: number;
  lastFailureAt: string | null;
}

const metrics: A2AMetrics = { llmFailures: 0, lastFailureAt: null };

/** Records one LLM outage — exposed via /api/v1/health for monitoring. */
export function recordLlmFailure(): void {
  metrics.llmFailures += 1;
  metrics.lastFailureAt = new Date().toISOString();
}

export function getA2AMetrics(): A2AMetrics {
  return { ...metrics };
}

function systemPrompt(): string {
  return (
    'Kamu adalah "Ahli Panggilan Booking Agent", asisten layanan jasa profesional on-demand di Indonesia ' +
    '(ahlipanggilan.id). Balas dalam Bahasa Indonesia yang sopan dan ringkas.\n\n' +
    'Kamu dapat menggunakan tool berikut untuk menjawab pertanyaan pelanggan:\n' +
    A2A_TOOLS.map((t) => `- ${t.name}: ${t.description}`).join('\n') +
    '\n\nAturan:\n' +
    '1. Gunakan tool search_services untuk katalog layanan, get_service_detail untuk detail, ' +
    'check_coverage untuk cek area, track_booking untuk status pesanan, search_faq / search_articles ' +
    'untuk informasi, search_partners untuk teknisi terverifikasi.\n' +
    '2. Untuk pemesanan (booking), gunakan tool create_booking dengan parameter lengkap. ' +
    'Jika tool mengembalikan AUTH_REQUIRED, beritahu pelanggan untuk login terlebih dahulu.\n' +
    '3. Jika tidak tahu jawabannya, arahkan ke https://ahlipanggilan.id atau https://ahlipanggilan.id/kontak.\n' +
    '4. Jangan pernah mengarang harga atau nomor booking; selalu gunakan hasil tool.'
  );
}

function functionDeclarations() {
  return A2A_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.inputSchema ?? { type: 'object', properties: {} },
  }));
}

export interface LlmTurn {
  text?: string;
}

/**
 * Runs one LLM conversation with tool calling against Gemini. Returns the
 * final answer text. Throws when the key is missing or the API fails —
 * the caller falls back to the rule-based router.
 */
export async function runLlmConversation(
  history: Array<{ role: 'user' | 'assistant'; text: string }>,
  authToken?: string,
): Promise<LlmTurn> {
  const key = geminiApiKey();
  if (!key) throw new Error('GEMINI_API_KEY tidak tersedia');

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const contents: GeminiContent[] = history.map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.text }],
  }));

  const tools = [{ functionDeclarations: functionDeclarations() }];

  for (let step = 0; step < 6; step++) {
    const res = await fetch(`${API_BASE}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents,
        tools,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.3 },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
    }

    const json = (await res.json()) as GeminiResponse;
    const parts = json.candidates?.[0]?.content?.parts ?? [];

    // Gemini 3 mengembalikan `thoughtSignature` (camelCase) pada functionCall
    // part; wajib dikirim balik sebagai `thought_signature` pada part yang sama
    // di request berikutnya, jika tidak API menolak dengan 400.
    const functionCalls = parts.filter(
      (p): p is GeminiPart & { functionCall: { name: string; args: Record<string, unknown> } } =>
        Boolean(p.functionCall?.name),
    );

    if (functionCalls.length > 0) {
      const toolResults: GeminiPart[] = [];
      for (const call of functionCalls) {
        const result = await executeA2ATool(
          call.functionCall.name,
          call.functionCall.args ?? {},
          authToken,
        );
        if (result.text.startsWith('AUTH_REQUIRED:')) {
          return {
            text: 'Untuk memesan layanan, kamu perlu login dulu di https://ahlipanggilan.id/login. Setelah login, beri tahu saya layanan yang ingin dipesan dan aku bantu selesaikan booking-nya.',
          };
        }
        toolResults.push({
          functionResponse: {
            name: call.functionCall.name,
            response: { text: result.text },
          },
        });
      }
      contents.push({
        role: 'model',
        parts: functionCalls.map((c) => {
          const part: GeminiPart = { functionCall: c.functionCall };
          const sig = (c as GeminiPart & { thoughtSignature?: string }).thoughtSignature;
          if (sig) part.thought_signature = sig;
          return part;
        }),
      });
      contents.push({ role: 'user', parts: toolResults });
      continue;
    }

    const text = parts
      .filter((p) => p.text)
      .map((p) => p.text)
      .join('\n')
      .trim();
    return { text: text || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.' };
  }

  throw new Error('Iterasi tool-calling melebihi batas');
}
