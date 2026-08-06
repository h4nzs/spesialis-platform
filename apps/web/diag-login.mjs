import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();

const fetches = [];
page.on('request', (r) => {
  if (r.url().includes('auth/login')) fetches.push(`REQ ${r.method()} ${r.url()}`);
});
page.on('response', (r) => {
  if (r.url().includes('auth/login')) fetches.push(`RES ${r.status()} ${r.url()}`);
});
page.on('console', (m) => {
  const t = m.text();
  if (t.includes('error') && m.type() === 'error') fetches.push(`CONSOLE-ERR ${t.slice(0, 200)}`);
});

await page.goto('http://localhost:4321/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Dump island attrs before hydration
const before = await page.evaluate(() => {
  const island = document.querySelector('astro-island');
  return island ? island.outerHTML.slice(0, 300) : 'NO ISLAND';
});
console.log('ISLAND BEFORE:\n' + before);

// Wait for hydration signal (data-astro-exec or react container)
await page.waitForFunction(
  () => {
    const el = document.querySelector('astro-island');
    return el && (el.hasAttribute('data-astro-exec') || Object.keys(el).some((k) => k.startsWith('__reactContainer')));
  },
  { timeout: 30000 },
);
console.log('HYDRATION SIGNAL DETECTED');

const after = await page.evaluate(() => {
  const island = document.querySelector('astro-island');
  return island ? island.outerHTML.slice(0, 300) : 'NO ISLAND';
});
console.log('ISLAND AFTER:\n' + after);

await page.fill('#email', 'admin@ahlipanggilan.id');
await page.fill('#password', 'password123');
await page.locator('form button[type="submit"]').click();
await page.waitForTimeout(5000);

console.log('URL AFTER CLICK:', page.url());
console.log('FETCH LOG:');
for (const f of fetches) console.log('  ' + f);

// Check for visible error text
const errText = await page.evaluate(() => document.body.innerText.slice(0, 300));
console.log('PAGE TEXT:', errText.replace(/\n+/g, ' | ').slice(0, 300));

await browser.close();
