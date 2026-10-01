import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { projects } from "../src/content.mjs";

test("both views, language switch and direct links preserve context", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator(".project-card")).toHaveCount(4);
  await page.getByRole("button", { name: "Índice", exact: true }).click();
  await expect(page.locator(".projects")).toHaveAttribute(
    "data-layout",
    "index",
  );
  const tops = await page
    .locator(".project-art")
    .evaluateAll((nodes) =>
      nodes.map((n) => Math.round(n.getBoundingClientRect().top)),
    );
  expect(new Set(tops).size).toBe(1);
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/\?view=index/);
  await expect(page.locator(".projects")).toHaveAttribute(
    "data-layout",
    "index",
  );
  await page.getByRole("link", { name: "View COLORES", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/colores\//);
  await expect(page.locator("h1")).toHaveText("COLORES");
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/colores\//);
  await expect(page.locator(".project-hero img")).toHaveAttribute(
    "src",
    /colores-photo-2-/,
  );
});

test("gallery supports keyboard, focus return and ordered process", async ({
  page,
}) => {
  await page.goto("/pescadilla/");
  const cover = page.locator(".project-hero a");
  await cover.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".viewer-count")).toHaveText("01 / 08");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".viewer-count")).toHaveText("02 / 08");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".viewer-count")).toHaveText("08 / 08");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(cover).toBeFocused();
  const process = page.locator(".process-chapter").last().locator("img");
  await expect(process).toHaveCount(11);
  await expect(process.first()).toHaveAttribute(
    "alt",
    "Toile de la chaqueta, vista lateral",
  );
  await expect(process.last()).toHaveAttribute(
    "alt",
    "Prueba de la chaqueta con la capucha bajada",
  );
});

test("project chapters stay visible and preserve the reading position across languages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/feel-marni/");
  const reader = page.getByRole("navigation", { name: "Dentro del proyecto" });
  await reader.getByRole("link", { name: "Concepto", exact: true }).click();
  await expect(
    reader.getByRole("link", { name: "Concepto", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  const bounds = await page.locator("#concepto").boundingBox();
  const navBounds = await reader.boundingBox();
  expect(navBounds.y).toBe(0);
  expect(bounds.y).toBeGreaterThanOrEqual(navBounds.height);
  await reader.getByRole("link", { name: "Proceso", exact: true }).click();
  await expect(
    reader.getByRole("link", { name: "Proceso", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/feel-marni\/#proceso/);
  await expect(
    page.locator('[data-reader-link][href="#proceso"]'),
  ).toHaveAttribute("aria-current", "location");
  await page.getByRole("link", { name: "Back to index" }).click();
  await expect(page.locator(".projects")).toHaveAttribute(
    "data-layout",
    "index",
  );
});

test("contact, CV and film work without automatic video downloads", async ({
  page,
  request,
}) => {
  const videoRequests = [];
  page.on("request", (r) => {
    if (r.url().includes(".mp4")) videoRequests.push(r.url());
  });
  await page.goto("/feel-marni/");
  await expect(page.locator(".project-hero img")).toHaveAttribute(
    "src",
    /marni-photo-1-/,
  );
  await expect(page.locator(".editorial-gallery img").nth(1)).toHaveAttribute(
    "src",
    /marni-photo-3-/,
  );
  expect(videoRequests).toHaveLength(0);
  await page.locator("video").evaluate((v) => v.load());
  await page.waitForFunction(
    () => document.querySelector("video").readyState >= 2,
  );
  const video = page.locator("video");
  expect(await video.evaluate((v) => v.duration)).toBeCloseTo(76.4167, 1);
  await video.evaluate(async (v) => {
    v.muted = true;
    await v.play();
  });
  await expect
    .poll(() => video.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0);
  await video.evaluate((v) => v.pause());
  expect(
    (
      await request.get("/media/feel-marni.mp4", {
        headers: { Range: "bytes=0-1023" },
      })
    ).status(),
  ).toBe(206);
  await page.goto("/sobre-mi/");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("link", { name: /Descargar CV/ }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("Emilio-Lopez-CV.pdf");
  await expect(
    page.locator('footer a[href="mailto:e.lopezcastillejos@ied.edu"]').first(),
  ).toBeVisible();
  for (const name of ["ocaassaa", "emiliolpc_"])
    await expect(
      page.locator(`a[href="https://www.instagram.com/${name}/"]`),
    ).toHaveCount(1);
});

for (const lang of ["es", "en"]) {
  for (const slug of ["", ...projects.map((p) => p.slug), "sobre-mi"]) {
    const url = `${lang === "en" ? "/en" : ""}/${slug ? slug + "/" : ""}`;
    test(`page, accessibility and media: ${url}`, async ({ page, request }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const response = await page.goto(url);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      const images = await page.locator("main img").evaluateAll((nodes) =>
        nodes.map((n) => ({
          src: n.getAttribute("src"),
          alt: n.alt,
          width: n.width,
          height: n.height,
        })),
      );
      for (const im of images) {
        expect(im.alt).not.toBe("");
        expect(im.width).toBeGreaterThan(0);
        if (lang === "es")
          expect((await request.get(im.src)).status()).toBe(200);
      }
      expect(errors).toEqual([]);
    });
  }
}

for (const width of [320, 768, 1024, 1440]) {
  test(`responsive layout and no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/pescadilla/",
      "/manuela/",
      "/feel-marni/",
      "/colores/",
      "/sobre-mi/",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
    await page.goto("/?view=index");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    if (width === 320) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  });
}

test("core content and navigation work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:4173/");
  await page.getByRole("link", { name: "Ver Manuela", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Manuela");
  await expect(page.locator(".process-section")).toBeVisible();
  await context.close();
});

test("missing routes return a useful 404", async ({ page }) => {
  const response = await page.goto("/no-existe/");
  expect(response.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: /Volver a los proyectos/ }),
  ).toBeVisible();
});
