export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const apiKey = process.env.WHATSAPP_API_KEY ?? '';
  const apiUrl = process.env.WHATSAPP_API_URL ?? 'https://api.fonnte.com/send';

  if (!apiKey) {
    console.warn('[WhatsApp] No API key configured — skipping send');
    return;
  }

  const target = phone.startsWith('0') ? `62${phone.slice(1)}` : phone.replace(/^\+/, '');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target, message, countryCode: '62' }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('[WhatsApp] Send failed:', response.status, body);
      return;
    }

    console.info('[WhatsApp] Message sent to:', target);
  } catch (err) {
    console.error('[WhatsApp] Failed to send message:', err);
  }
}
