import { test, expect } from '@playwright/test';

/**
 * Helper: generate a unique slug for each test run
 */
function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

test.describe('Article Creation — Real User Flow', () => {
  // Clean cookies before each test to start fresh
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('Full flow: login via form → create article with TipTap → hard reload → verify blog', async ({
    page,
  }) => {
    const slug = uniqueSlug('e2e-ui');
    const title = `E2E UI Test ${Date.now()}`;

    // ─── 1. Login via form (like a real user) ────────────────────
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Wait for React LoginForm to hydrate
    await page.waitForSelector('#email', { timeout: 10000 });

    // Type credentials
    await page.fill('#email', 'admin@ahlipanggilan.id');
    await page.fill('#password', 'password123');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/dashboard\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toContainText('Dashboard Admin', { timeout: 10000 });

    // ─── 2. Navigate to article creation ─────────────────────────
    // Go directly (user would click sidebar "Artikel" → "Tulis")
    await page.goto('/dashboard/admin/articles/new');
    await page.waitForLoadState('networkidle');

    // Wait for React ArticleEditor to hydrate
    await page.waitForSelector('h1:has-text("Tulis Artikel Baru")', { timeout: 10000 });

    // ─── 3. Fill basic fields ────────────────────────────────────
    // Fill Title via getByLabel (handles htmlFor/nested/aria-label)
    await page.getByLabel('Judul').fill(title);

    // Fill Slug via getByLabel
    await page.getByLabel('Slug').fill(slug);

    // Fill Summary via placeholder
    await page
      .locator('textarea[placeholder*="Ringkasan"]')
      .fill('E2E test article created via real user interaction flow.');

    // ─── 4. Use TipTap editor via keyboard shortcuts ─────────────
    const proseMirror = page.locator('.ProseMirror');
    await expect(proseMirror).toBeVisible({ timeout: 30000 });

    // Click into the editor and type first paragraph
    await proseMirror.click();
    await page.keyboard.type(
      'AC adalah investasi penting untuk kenyamanan rumah. Dengan perawatan rutin, AC dapat bertahan lebih lama dan tetap efisien.',
      { delay: 3 },
    );

    // Create heading: newline → type heading text → apply H2 shortcut
    // TipTap StarterKit maps Ctrl+Alt+2 to Heading 2
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Bersihkan Filter Secara Rutin', { delay: 3 });
    await page.keyboard.press('Control+Alt+2');

    // Type paragraph below heading
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.keyboard.type(
      'Filter AC yang kotor membuat kinerja AC berat dan tagihan listrik membengkak. Bersihkan filter secara rutin.',
      { delay: 3 },
    );

    // Create second heading via toolbar button (alternative method)
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Periksa Freon Secara Berkala', { delay: 3 });

    // Click the H2 toolbar button to convert current line to heading
    await page.locator('button[title="Heading 2"]').click();

    // ─── 5. Fill author name and set status to Published ─────────
    await page.getByLabel('Nama Penulis').fill('E2E Tester');

    // Set status to Published via native select (use specific label association)
    await page.getByLabel('Status').selectOption('Published');

    // ─── 6. Submit the article ───────────────────────────────────
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    await submitButton.click();

    // Wait for redirect back to article list (confirms save success)
    await page.waitForURL(/\/dashboard\/admin\/articles$/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // ─── 7. Navigate to blog page and hard reload ────────────────
    await page.goto(`/blog/${slug}`);
    await page.waitForLoadState('networkidle');

    // Hard reload to simulate user refresh (catches cache issues)
    await page.reload({ waitUntil: 'networkidle' });

    // ─── 8. Verify content renders correctly ─────────────────────
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText('E2E UI Test');

    // Prose container should have rendered content
    const prose = page.locator('.prose');
    await expect(prose.first()).toBeVisible({ timeout: 10000 });

    // Should have 2 <h2> elements from our TipTap headings
    await expect(prose.locator('h2')).toHaveCount(2);
    await expect(prose.locator('h2').first()).toContainText('Bersihkan Filter Secara Rutin');
    await expect(prose.locator('h2').nth(1)).toContainText('Periksa Freon Secara Berkala');

    // No raw '##' markers anywhere
    await expect(prose).not.toContainText('##');
    // No raw HTML tags shown as text
    await expect(prose.locator('text=<h2>')).toHaveCount(0);
  });

  test('Seed article with Markdown renders headings correctly (human verifies blog)', async ({
    page,
  }) => {
    await page.goto('/blog/mengatasi-saluran-air-mampet');
    await page.waitForLoadState('networkidle');

    // Hard reload like a real user would
    await page.reload({ waitUntil: 'networkidle' });

    const h1 = page.locator('h1').first();
    const exists = (await h1.count()) > 0;

    test.skip(
      !exists,
      'Seed data not loaded — run `pnpm --filter @ahlipanggilan/api db:seed` first',
    );

    await expect(h1).toContainText('Saluran Air Mampet', { timeout: 10000 });

    // Markdown headings should convert to proper <h2>
    const prose = page.locator('.prose');
    await expect(prose.locator('h2').first()).toBeVisible({ timeout: 5000 });
    await expect(prose).not.toContainText('##');
  });
});
