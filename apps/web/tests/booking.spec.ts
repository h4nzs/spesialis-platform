import { test, expect } from '@playwright/test';

test.describe('Guest Booking — E2E-001', () => {
  test('E2E-001: Booking page loads with form fields', async ({ page }) => {
    await page.goto('/book');
    await expect(page).toHaveURL(/\/book/);
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('E2E-001: Booking form submission with valid data', async ({ page, request }) => {
    const servicesRes = await request.get('http://localhost:3000/api/v1/services?limit=1');
    const servicesData = (await servicesRes.json()) as {
      data?: Array<{ id: string; name: string; basePrice: string }>;
    };
    const serviceId = servicesData.data?.[0]?.id ?? '';

    await page.goto(`/book?serviceId=${serviceId}`);
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

    const nameInput = page
      .locator('input[name="customerName"], input[id*="name"], input[placeholder*="Nama"]')
      .first();
    const phoneInput = page
      .locator('input[name="phone"], input[id*="phone"], input[placeholder*="Telepon"]')
      .first();

    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('Budi Test');
    await phoneInput.fill('081234567890');

    const addressInput = page
      .locator('textarea[name="address"], input[name="address"], input[placeholder*="Alamat"]')
      .first();
    if (await addressInput.isVisible().catch(() => false)) {
      await addressInput.fill('Jl. Testing No. 123, Jakarta');
    }

    const cityInput = page.locator('input[name="city"], input[placeholder*="Kota"]').first();
    if (await cityInput.isVisible().catch(() => false)) {
      await cityInput.fill('Jakarta Selatan');
    }

    const dateInput = page.locator('input[type="date"], input[placeholder*="Tanggal"]').first();
    if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.fill('2026-07-15');
    }

    await page.locator('button[type="submit"]').first().click();

    await page.waitForLoadState('networkidle');
  });
});

test.describe('Guest Tracking — E2E-002', () => {
  test('E2E-002: Tracking page loads successfully', async ({ page }) => {
    await page.goto('/tracking');
    await expect(page).toHaveURL(/\/tracking/);
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('E2E-002: Tracking form accepts booking number', async ({ page }) => {
    await page.goto('/tracking');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill('SP-2026-999999');

    const submitBtn = page.locator('button[type="submit"], button:has-text("Cari")').first();
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/tracking/);
  });
});
