import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { projects } from "../src/content.mjs";

test("the career timeline alternates around a central line and reveals on scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/sobre-mi/");
  const items = page.locator(".timeline-item");
  await expect(items).toHaveCount(4);
  await expect(items.first()).toHaveClass(/is-pending/);
  await expect(page.locator(".timeline-year")).toHaveText(["2022—2023", "2023—", "2023—2025", "2024"]);
  const timeline = await page.locator(".career-timeline").boundingBox();
  const center = timeline.x + timeline.width / 2;
  const cv = page.locator(".timeline-cv");
  await expect(cv.getByRole("link", { name: /Descargar CV/ })).toHaveAttribute("download", "");
  const cvBox = await cv.boundingBox();
  expect(cvBox.y).toBeGreaterThanOrEqual(timeline.y + timeline.height);
  await expect(page.locator(".biography .bio-label")).toHaveCount(0);
  for (let i = 0; i < 4; i++) {
    await items.nth(i).scrollIntoViewIfNeeded();
    await expect(items.nth(i)).not.toHaveClass(/is-pending/);
    await expect(items.nth(i).locator(".timeline-content")).toHaveCSS("opacity", "1");
    const box = await items.nth(i).locator(".timeline-content").boundingBox();
    if (i % 2) expect(box.x).toBeGreaterThan(center);
    else expect(box.x + box.width).toBeLessThan(center);
  }
});

test("the career timeline remains readable without motion or JavaScript", async ({ browser }) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("http://localhost:4173/en/sobre-mi/");
    await expect(page.locator(".timeline-item.is-pending")).toHaveCount(0);
    await expect(page.locator(".timeline-content")).toHaveCount(4);
    await expect(page.locator(".timeline-content").first()).toHaveCSS("opacity", "1");
    await context.close();
  }
});

test("the home cover fills the hero and advances automatically without controls", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const slides = page.locator(".home-slide:not([data-repeat])");
  await expect(slides).toHaveCount(6);
    const sources = await slides.locator("img").evaluateAll(images => images.map(image => image.getAttribute("src")));
    expect(sources).toEqual([1, 7, 2, 5, 8, 6].map(id => `/media/home-cover-${String(id).padStart(3, "0")}.webp`));
  await expect(page.locator(".home-cover button")).toHaveCount(0);
  const hero = await page.locator(".home-cover").boundingBox();
  const image = await slides.first().locator("img").boundingBox();
  expect(image).toEqual(hero);
  await expect(slides.first().locator("img")).toHaveCSS("object-fit", "cover");
  const title = await page.locator("#home-title").boundingBox();
  expect(title.y).toBeGreaterThanOrEqual(hero.y);
  expect(title.y + title.height).toBeLessThanOrEqual(hero.y + hero.height);
  const repeatedSources = await page.locator("[data-repeat] img").evaluateAll(images => images.map(image => image.getAttribute("src")));
  expect(repeatedSources).toEqual(sources);
  for (let i = 1; i <= 12; i++) {
    await page.clock.fastForward(4500);
    expect(await page.locator(".home-slides").evaluate(el => el.style.transform)).toBe(`translateX(-${(i % 6 || 6) * 100}%)`);
    await page.clock.runFor(900);
    await expect(slides.nth(i % 6)).toHaveAttribute("aria-hidden", "false");
  }
});

test("the home cover respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/en/");
  await page.clock.fastForward(10000);
  await expect(page.locator(".home-slide").first()).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator(".home-slides")).toHaveCSS("transition-duration", "0s");
});

test("archive photos lead to project descriptions across languages", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".archive-piece")).toHaveCount(20);
  await expect(page.locator(".archive-field")).toHaveCount(1);
  for (const project of projects) {
    const images = page.locator(
      `.archive-piece[data-project="${project.slug}"] img`,
    );
    await expect(images).toHaveCount(5);
    const links = page.locator(`.archive-piece[data-project="${project.slug}"]`);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("href", `/${project.slug}/#concepto`);
    }
    expect(
      new Set(
        await images.evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("src")),
        ),
      ).size,
    ).toBe(5);
  }
  await expect(
    page.locator(".image-archive figcaption, .archive-filters"),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\//);
  await page
    .getByRole("link", { name: "View COLORES — image 3", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/colores\/#concepto/);
  const target = page.locator("#concepto");
  await expect(target).toBeInViewport();
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/colores\/#concepto/);
  await expect(target).toBeInViewport();
  await page.goto("/colores/");
  await expect(page.locator("#editorial img").first()).toHaveAttribute(
    "src",
    /colores-photo-2-/,
  );
});

test("the dispersed home reacts to the pointer and keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const piece = page.locator(".archive-piece").first();
  await piece.hover();
  await expect(piece).toHaveCSS("filter", "none");
  const other = page.locator(".archive-piece").nth(1);
  await expect(other).toHaveCSS("filter", "blur(4px)");
  await expect(other).toHaveCSS("opacity", "0.55");
  await page.locator(".site-header .wordmark").hover();
  await expect(other).toHaveCSS("filter", "none");
  await expect(other).toHaveCSS("opacity", "1");
  await piece.hover();
  await expect
    .poll(() =>
      piece
        .locator(".archive-label")
        .evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe("1");
  await page.mouse.move(1200, 800);
  await expect
    .poll(() =>
      page
        .locator(".archive-piece")
        .nth(1)
        .evaluate((el) => el.style.getPropertyValue("--px")),
    )
    .not.toBe("");
  await piece.focus();
  await expect(piece).toBeFocused();
});

test("reduced motion keeps the dispersed home still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.mouse.move(1200, 800);
  await page.waitForTimeout(200);
  expect(
    await page
      .locator(".archive-piece")
      .nth(1)
      .evaluate((el) => el.style.getPropertyValue("--px")),
  ).toBe("");
});

test("vertical reading works with buttons, keyboard, wheel and direct photo links", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pescadilla/");
  const counter = page.locator(".rail-counter");
  const position = () => page.evaluate(() => Math.round(window.scrollY));
  await expect(page.locator("[data-rail-prev]")).toBeDisabled();
  await expect(counter).toHaveText("01 / 09");
  await page.locator("[data-rail-next]").click();
  await expect.poll(position).toBeGreaterThan(100);
  await expect(counter).toHaveText("02 / 09");
  await page.keyboard.press("Home");
  await expect(counter).toHaveText("01 / 09");
  await page.keyboard.press("ArrowDown");
  await expect.poll(position).toBeGreaterThan(100);
  await page.keyboard.press("End");
  await expect(page.locator("[data-rail-next]")).toBeDisabled();
  await expect(page.locator("#siguiente")).toBeInViewport();
  await expect(counter).toHaveText("09 / 09");
  await page.keyboard.press("Home");
  await expect(counter).toHaveText("01 / 09");
  await page.mouse.move(700, 500);
  await page.mouse.wheel(0, 1200);
  await expect.poll(position).toBeGreaterThan(100);
  await page.goto("/pescadilla/#photo-pescadilla-photo-7");
  await expect(page.locator("#photo-pescadilla-photo-7")).toBeInViewport();
});

test("mobile visitors scroll the vertical gallery and read expanded notes", async ({
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
    const position = () => page.evaluate(() => Math.round(window.scrollY));
    await expect(page.locator(".rail-image").first()).toBeInViewport();
    const session = await context.newCDPSession(page);
    const swipe = async (x, from, to) => {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y: from }],
      });
      for (let step = 1; step <= 10; step++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y: from + ((to - from) * step) / 10 }],
        });
        await page.waitForTimeout(20);
      }
      await session.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    };
    await swipe(195, 700, 200);
    await expect.poll(position).toBeGreaterThan(100);
    await page.goto("http://localhost:4173/pescadilla/#concepto");
    const note = page.locator("#concepto");
    await expect(note).toBeInViewport();
    await note.locator("summary").tap();
    await expect(note.locator("details")).toHaveAttribute("open", "");
  } finally {
    await context.close();
  }
});

test("only Pescadilla uses the shrimp lightbox background", async ({ page }) => {
  for (const project of projects) {
    await page.goto(`/${project.slug}/`);
    await page.locator("#editorial [data-gallery]").first().focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const background = await dialog.evaluate(
      (el) => getComputedStyle(el).backgroundImage,
    );
    if (project.slug === "pescadilla") {
      expect(background).toContain("lightbox-backdrop.webp");
    } else {
      expect(background).toBe("none");
    }
  }
});

test("gallery supports keyboard and focus return", async ({ page }) => {
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
});

test("project introductions have the title left, concept right and photos below", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const project of projects) {
    await page.goto(`/${project.slug}/`);
    const identity = await page.locator(".project-identity").boundingBox();
    const concept = await page.locator(".project-concept").boundingBox();
    const photo = await page.locator(".rail-image").first().boundingBox();
    expect(identity.x + identity.width).toBeLessThan(concept.x);
    expect(Math.abs(identity.y - concept.y)).toBeLessThan(2);
    expect(photo.y).toBeGreaterThanOrEqual(
      Math.max(identity.y + identity.height, concept.y + concept.height),
    );
  }
});

test("the concept and its credits read at the top across languages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/feel-marni/#concepto");
  const concept = page.locator("#concepto");
  await expect(concept).toBeInViewport();
  await expect(concept.locator(".credits")).not.toBeVisible();
  await concept.locator("summary").click();
  await expect(concept.locator("details")).toHaveAttribute("open", "");
  await expect(concept.locator(".credits")).toContainText("Luda Pellat");
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/feel-marni\/#concepto/);
  await expect(page.locator("#concepto")).toBeInViewport();
  await page.getByRole("link", { name: "Index", exact: true }).click();
  await expect(page.locator(".archive-piece")).toHaveCount(20);
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
    page.locator("footer a[href*='mail.google.com']").first(),
  ).toHaveAttribute(
    "href",
    "https://mail.google.com/mail/?view=cm&fs=1&to=e.lopezcastillejos@ied.edu",
  );
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
      await expect(
        page.locator('#proceso, [href$="#proceso"], .persona-studio'),
      ).toHaveCount(0);
      if (projects.some((project) => project.slug === slug)) {
        await expect(page.locator("main img")).toHaveCount(8);
        await expect(page.locator('[data-gallery^="process-"]')).toHaveCount(0);
      }
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
    await page.goto("/");
    await expect(page.locator(".archive-piece")).toHaveCount(20);
    const boxes = await page.locator(".archive-piece").evaluateAll((nodes) =>
      nodes.map((node) => {
        const { left, top, width, height } = node.getBoundingClientRect();
        return { left, top, width, height };
      }),
    );
    for (const box of boxes) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      expect(box.left).toBeGreaterThanOrEqual(0);
    }
    if (width === 320) {
      const lastPhoto = page.locator(".archive-piece").last();
      await lastPhoto.focus();
      await expect(lastPhoto).toBeInViewport();
    }
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
  await expect(page.locator("#editorial img")).toHaveCount(8);
  await context.close();
});

test("missing routes return a useful 404", async ({ page }) => {
  const response = await page.goto("/no-existe/");
  expect(response.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: /Volver a los proyectos/ }),
  ).toBeVisible();
});
