import { test, expect } from "@playwright/test";

/**
 * Canlı siteye karşı yalnızca güvenli, salt-okunur kontroller.
 * Gerçek kayıt / ödeme / mesaj gönderimi yapılmaz.
 */
test.describe("itemtr2.vercel.app smoke (read-only)", () => {
  test("ana sayfa yüklenir ve başlık mevcuttur", async ({ page }) => {
    const resp = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(resp?.status(), "HTTP status").toBeLessThan(400);
    await expect(page).toHaveTitle(/ItemTR/i);
    await expect(page.locator("body")).toContainText(/Pazaryeri|Güvenli|İtemTR/i, {
      timeout: 25_000,
    });
  });

  test("giriş sayfası açılır", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /giriş yap/i })).toBeVisible();
    await expect(page.getByPlaceholder(/ornek@email.com/i)).toBeVisible();
  });

  test("kayıt sayfası açılır", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /kayıt ol/i })).toBeVisible();
  });

  test("şifremi unuttum sayfası açılır", async ({ page }) => {
    await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /şifremi unuttum/i })).toBeVisible();
  });

  test("kategori listesi açılır", async ({ page }) => {
    const resp = await page.goto("/category", { waitUntil: "domcontentloaded" });
    expect(resp?.status(), "HTTP status").toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
  });

  test("bot test ilanı detayında satış kilitli buton görünür", async ({ page }) => {
    await page.goto("/listing/BOT-TEST", { waitUntil: "domcontentloaded" });
    const locked = page.getByRole("button", { name: /ürün satışta değil/i });
    await expect(locked).toBeVisible({ timeout: 20_000 });
    await expect(locked).toBeDisabled();
    await expect(page.getByText(/bot ilanını satın alamaz/i)).toBeVisible();
  });
});
