import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { projects } from "../src/content.mjs";

test("archive has five distinct photos per project and preserves filters across languages", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".archive-image")).toHaveCount(20);
  for (const project of projects) {
    const images = page.locator(
      `.archive-image[data-project="${project.slug}"] img`,
    );
    await expect(images).toHaveCount(5);
    expect(
      new Set(
        await images.evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("src")),
        ),
      ).size,
    ).toBe(5);
  }
  await page.getByRole("button", { name: "COLORES", exact: true }).click();
  await expect(page.locator(".archive-image:visible")).toHaveCount(5);
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/\?project=colores/);
  await expect(page.locator(".archive-image:visible")).toHaveCount(5);
  await page
    .getByRole("link", { name: "View COLORES — image 3", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/colores\/#photo-colores-photo-3/);
  const target = page.locator("#photo-colores-photo-3");
  await expect(target).toBeInViewport();
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/colores\/#photo-colores-photo-3/);
  await expect(target).toBeInViewport();
  await page.goto("/colores/");
  await expect(page.locator("#editorial img").first()).toHaveAttribute(
    "src",
    /colores-photo-2-/,
  );
});

test("horizontal reading works with buttons, keyboard, wheel and direct photo links", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pescadilla/");
  const track = page.locator(".exhibition-track");
  const left = () => track.evaluate((e) => e.scrollLeft);
  await expect(page.locator("[data-rail-prev]")).toBeDisabled();
  await page.locator("[data-rail-next]").click();
  await expect.poll(left).toBeGreaterThan(100);
  await expect(page.locator(".rail-counter")).toHaveText("02 / 29");
  await track.focus();
  await page.keyboard.press("Home");
  await expect.poll(left).toBe(0);
  await page.keyboard.press("ArrowRight");
  await expect.poll(left).toBeGreaterThan(100);
  await page.keyboard.press("End");
  await expect(page.locator("[data-rail-next]")).toBeDisabled();
  await expect(page.locator("#siguiente")).toBeInViewport();
  await expect(page.locator(".rail-counter")).toHaveText("29 / 29");
  await page.keyboard.press("Home");
  await expect.poll(left).toBe(0);
  const bounds = await track.boundingBox();
  await page.mouse.move(bounds.x + 100, bounds.y + 100);
  await page.mouse.wheel(0, 500);
  await expect.poll(left).toBeGreaterThan(100);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.goto("/pescadilla/#photo-pescadilla-photo-7");
  await expect(page.locator("#photo-pescadilla-photo-7")).toBeInViewport();
});

test("mobile visitors can swipe the gallery and scroll expanded notes", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await page.goto("http://localhost:4173/pescadilla/");
    const track = page.locator(".exhibition-track");
    const session = await context.newCDPSession(page);
    const swipe = async (x1, y1, x2, y2) => {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: x1, y: y1 }],
      });
      for (let step = 1; step <= 10; step++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            {
              x: x1 + ((x2 - x1) * step) / 10,
              y: y1 + ((y2 - y1) * step) / 10,
            },
          ],
        });
        await page.waitForTimeout(20);
      }
      await session.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    };
    const bounds = await track.boundingBox();
    await swipe(330, bounds.y + 140, 60, bounds.y + 140);
    await expect
      .poll(() => track.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(100);
    await page.goto("http://localhost:4173/pescadilla/#concepto");
    const note = page.locator("#concepto");
    await expect(note).toBeInViewport();
    await note.locator("summary").tap();
    const box = await note.boundingBox();
    const before = await note.evaluate((el) => el.scrollTop);
    await swipe(box.x + 100, box.y + box.height - 40, box.x + 100, box.y + 70);
    await expect
      .poll(() => note.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(before);
    await expect(note).toBeInViewport({ ratio: 0.9 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  } finally {
    await context.close();
  }
});

test("gallery supports keyboard, focus return and ordered process", async ({
  page,
}) => {
  await page.goto("/pescadilla/");
  const cover = page.locator("#editorial [data-gallery]").first();
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
  const process = page.locator(".rail-process").last().locator("img");
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

test("lateral concept, credits and process stay accessible across languages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/feel-marni/");
  const nav = page.getByRole("navigation", { name: "Dentro del proyecto" });
  await nav.getByRole("link", { name: "Concepto", exact: true }).click();
  await expect(page.locator("#concepto")).toBeInViewport();
  await expect(
    nav.getByRole("link", { name: "Concepto", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  await page.locator("#concepto summary").click();
  await expect(page.locator("#concepto details")).toHaveAttribute("open", "");
  await expect(page.locator("#concepto .credits")).toContainText("Luda Pellat");
  await nav.getByRole("link", { name: "Proceso", exact: true }).click();
  await expect(page.locator("#proceso-1")).toBeInViewport();
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/feel-marni\/#proceso/);
  await expect(page.locator("#proceso-1")).toBeInViewport();
  await expect(
    page.locator('[data-rail-link][href="#proceso"]'),
  ).toHaveAttribute("aria-current", "location");
  await page.getByRole("link", { name: "Index", exact: true }).click();
  await expect(page.locator(".archive-image")).toHaveCount(20);
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
  await expect(page.locator("#editorial img").first()).toHaveAttribute(
    "src",
    /marni-photo-1-/,
  );
  await expect(page.locator("#editorial img").nth(2)).toHaveAttribute(
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
  await page
    .getByRole("link", { name: "Ver Manuela — imagen 1", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Manuela");
  await expect(page.locator("#proceso")).toBeVisible();
  await context.close();
});

test("missing routes return a useful 404", async ({ page }) => {
  const response = await page.goto("/no-existe/");
  expect(response.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: /Volver a los proyectos/ }),
  ).toBeVisible();
});
