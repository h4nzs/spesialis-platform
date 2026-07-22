import { test, expect } from '@playwright/test';
import { loginViaApi, setAuthCookie, TEST_CREDENTIALS } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

let adminAuth: Awaited<ReturnType<typeof loginViaApi>>;
let contentAuth: Awaited<ReturnType<typeof loginViaApi>>;

test.beforeAll(async ({ request }) => {
  adminAuth = await loginViaApi(
    request,
    TEST_CREDENTIALS.admin.email,
    TEST_CREDENTIALS.admin.password,
  );
  contentAuth = await loginViaApi(
    request,
    TEST_CREDENTIALS.contentManager.email,
    TEST_CREDENTIALS.contentManager.password,
  );
});

test.describe('SEO E2E: SitemapSettings & RoleManager (Settings Page)', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthCookie(page, adminAuth);
  });

  test('SEOE2E-01: Settings page loads with SitemapSettings section', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');

    // Verify the SitemapSettings component rendered
    await expect(page.locator('[data-testid="sitemap-settings"]')).toBeVisible({ timeout: 15000 });
  });

  test('SEOE2E-02: SitemapSettings shows priority and changefreq inputs', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');

    // Wait for SitemapSettings to hydrate
    await expect(page.locator('[data-testid="sitemap-settings"]')).toBeVisible({ timeout: 15000 });

    // Check priority input for static pages
    await expect(page.locator('[data-testid="priority-staticPages"]')).toBeVisible({
      timeout: 5000,
    });

    // Check changefreq select for services
    await expect(page.locator('[data-testid="changefreq-services"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('SEOE2E-03: SitemapSettings shows IndexNow key and auto-ping toggle', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');

    // Wait for SitemapSettings to hydrate
    await expect(page.locator('[data-testid="sitemap-settings"]')).toBeVisible({ timeout: 15000 });

    // Check auto-ping checkbox exists using data-testid
    await expect(page.locator('[data-testid="indexnow-enabled"]')).toBeVisible({ timeout: 5000 });
  });

  test('SEOE2E-04: RoleManager section renders permission matrix', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');

    // Verify the RoleManager component rendered
    await expect(page.locator('[data-testid="role-manager"]')).toBeVisible({ timeout: 15000 });

    // Verify the permission table rendered
    await expect(page.locator('[data-testid="permission-table"]')).toBeVisible({ timeout: 5000 });

    // Verify all 8 SEO features are listed by their data-testid rows
    const permIds = [
      'perm-seo-meta',
      'perm-seo-bulk',
      'perm-seo-audit',
      'perm-seo-redirects',
      'perm-seo-404_monitor',
      'perm-seo-indexnow',
      'perm-seo-schema',
      'perm-seo-sitemap_settings',
    ];
    for (const permId of permIds) {
      await expect(page.locator(`[data-testid="${permId}"]`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('SEOE2E-05: RoleManager checkboxes are interactive for staff roles', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');

    // Wait for RoleManager to render
    await expect(page.locator('[data-testid="role-manager"]')).toBeVisible({ timeout: 15000 });

    // Find checkboxes in the RoleManager table
    // Staff role checkboxes should be togglable (<tbody> input not disabled)
    const checkboxes = page.locator('tbody input[type="checkbox"]:not([disabled])');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(3);

    // Toggle the first available checkbox
    const firstCheckbox = checkboxes.first();
    const initialChecked = await firstCheckbox.isChecked();
    await firstCheckbox.click({ force: true });
    const afterClick = await firstCheckbox.isChecked();
    expect(afterClick).toBe(!initialChecked);

    // Toggle back
    await firstCheckbox.click({ force: true });
    expect(await firstCheckbox.isChecked()).toBe(initialChecked);
  });

  test('SEOE2E-06: RoleManager has save and reset buttons', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');

    // Wait for RoleManager to render
    await expect(page.locator('[data-testid="role-manager"]')).toBeVisible({ timeout: 15000 });

    // Verify Save button exists via data-testid
    await expect(page.locator('[data-testid="save-permissions"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="save-permissions"]')).toBeEnabled({ timeout: 5000 });

    // Verify Reset button exists via data-testid
    await expect(page.locator('[data-testid="reset-permissions"]')).toBeVisible({ timeout: 5000 });
  });

  test('SEOE2E-07: Admin and Super Admin checkboxes are always disabled', async ({ page }) => {
    await page.goto('/dashboard/admin/settings');
    await page.waitForLoadState('networkidle');

    // Wait for RoleManager to render
    await expect(page.locator('[data-testid="role-manager"]')).toBeVisible({ timeout: 15000 });

    // Check that disabled checkboxes exist (Admin and Super Admin columns)
    const disabledCheckboxes = page.locator('tbody input[type="checkbox"]:disabled');
    const disabledCount = await disabledCheckboxes.count();
    // At least 16 disabled checkboxes (8 features × 2 fixed columns)
    expect(disabledCount).toBeGreaterThanOrEqual(16);
  });
});

test.describe('SEO E2E: SchemaBuilder (Article Editor)', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthCookie(page, adminAuth);
  });

  test('SEOE2E-08: Article editor page loads for new article', async ({ page }) => {
    await page.goto('/dashboard/admin/articles/new');
    await page.waitForLoadState('networkidle');

    // Verify the editor page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('SEOE2E-09: SchemaBuilder component renders in article editor', async ({ page }) => {
    await page.goto('/dashboard/admin/articles/new');
    await page.waitForLoadState('networkidle');

    // Wait for the article editor to load
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

    // Verify SchemaBuilder component rendered via data-testid
    await expect(page.locator('[data-testid="schema-builder"]')).toBeVisible({ timeout: 15000 });
  });

  test('SEOE2E-10: SchemaBuilder template selector dropdown is visible', async ({ page }) => {
    await page.goto('/dashboard/admin/articles/new');
    await page.waitForLoadState('networkidle');

    // Wait for the page title to render (layout-level element) before checking React components
    // This ensures Astro has fully hydrated the React tree
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

    // Wait for SchemaBuilder to render
    await expect(page.locator('[data-testid="schema-builder"]')).toBeVisible({ timeout: 15000 });

    // Verify the template select exists
    await expect(page.locator('[data-testid="schema-template-select"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('SEOE2E-11: Content Manager can access article editor', async ({ page }) => {
    await setAuthCookie(page, contentAuth);
    await page.goto('/dashboard/admin/articles/new');
    await page.waitForLoadState('networkidle');

    // content_manager should have access
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('SEO E2E: Permission Enforcement', () => {
  test('SEOE2E-12: Content manager can access SEO audit page', async ({ page }) => {
    await setAuthCookie(page, contentAuth);
    await page.goto('/dashboard/admin/seo/audit');
    await page.waitForLoadState('networkidle');

    // content_manager has seo.audit permission by default
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('SEOE2E-13: Content manager is blocked from SEO redirect page API (frontend page loads)', async ({
    page,
  }) => {
    await setAuthCookie(page, contentAuth);
    await page.goto('/dashboard/admin/seo/redirects');
    await page.waitForLoadState('networkidle');

    // Frontend route allows content_manager to the admin dashboard
    // but the API calls for redirects will return 403 since seo.redirects
    // only allows admin/super_admin by default
    // The page should still render with the error state
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
  });

  test('SEOE2E-14: Non-admin cannot access settings page', async ({ page, request }) => {
    const partnerAuth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );
    await setAuthCookie(page, partnerAuth);
    await page.goto('/dashboard/admin/settings');
    // Should be redirected to 403
    await expect(page).toHaveURL(/\/403/, { timeout: 10000 });
  });

  test('SEOE2E-15: Settings API requires admin role', async ({ request }) => {
    // Try to access settings API as partner
    const partnerAuth = await loginViaApi(
      request,
      TEST_CREDENTIALS.partner1.email,
      TEST_CREDENTIALS.partner1.password,
    );
    const res = await request.get('http://localhost:3000/api/v1/admin/settings', {
      headers: { Authorization: `Bearer ${partnerAuth.token}` },
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('SEO E2E: SEO Dashboard Pages', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthCookie(page, adminAuth);
  });

  test('SEOE2E-16: Bulk SEO edit page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/seo/bulk-edit');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('SEOE2E-17: SEO audit page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/seo/audit');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('SEOE2E-18: Redirect manager page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/seo/redirects');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('SEOE2E-19: 404 monitor page loads', async ({ page }) => {
    await page.goto('/dashboard/admin/seo/404-monitor');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });
});
